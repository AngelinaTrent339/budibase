import * as userSdk from "../../../sdk/users"
import {
  features,
  tenancy,
  db as dbCore,
  utils,
  encryption,
  auth as authCore,
} from "@budibase/backend-core"
import env from "../../../environment"
import { ai, groups } from "@budibase/pro"
import {
  DevInfo,
  FetchAPIKeyResponse,
  GenerateAPIKeyRequest,
  GenerateAPIKeyResponse,
  GetGlobalSelfResponse,
  QuotaType,
  QuotaUsageType,
  StaticQuotaName,
  UpdateSelfRequest,
  UpdateSelfResponse,
  User,
  UserCtx,
  Feature,
} from "@budibase/types"

const { newid } = utils

function newTestApiKey() {
  return env.ENCRYPTED_TEST_PUBLIC_API_KEY
}

function newApiKey() {
  return encryption.encrypt(
    `${tenancy.getTenantId()}${dbCore.SEPARATOR}${newid()}`
  )
}

function cleanupDevInfo(info: any) {
  // user doesn't need to aware of dev doc info
  delete info._id
  delete info._rev
  return info
}

export async function generateAPIKey(
  ctx: UserCtx<GenerateAPIKeyRequest, GenerateAPIKeyResponse>
) {
  let userId
  let apiKey
  if (env.isTest() && ctx.request.body.userId) {
    userId = ctx.request.body.userId
    apiKey = newTestApiKey()
  } else {
    userId = ctx.user._id!
    apiKey = newApiKey()
  }

  const db = tenancy.getGlobalDB()
  const id = dbCore.generateDevInfoID(userId)
  let devInfo: DevInfo
  try {
    devInfo = await db.get<DevInfo>(id)
  } catch (err) {
    devInfo = { _id: id, userId }
  }
  devInfo.apiKey = apiKey
  await db.put(devInfo)
  ctx.body = cleanupDevInfo(devInfo)
}

export async function fetchAPIKey(ctx: UserCtx<void, FetchAPIKeyResponse>) {
  const db = tenancy.getGlobalDB()
  const id = dbCore.generateDevInfoID(ctx.user._id!)
  let devInfo
  try {
    devInfo = await db.get(id)
  } catch (err) {
    devInfo = {
      _id: id,
      userId: ctx.user._id,
      apiKey: newApiKey(),
    }
    await db.put(devInfo)
  }
  ctx.body = cleanupDevInfo(devInfo)
}

/**
 *
 */
const getUserSessionAttributes = (ctx: UserCtx) => ({
  account: ctx.user.account,
  license: ctx.user.license!,
  budibaseAccess: !!ctx.user.budibaseAccess,
  accountPortalAccess: !!ctx.user.accountPortalAccess,
  csrfToken: ctx.user.csrfToken!,
})

export async function getSelf(ctx: UserCtx<void, GetGlobalSelfResponse>) {
  if (!ctx.user) {
    ctx.throw(403, "User not logged in")
  }
  const userId = ctx.user._id!
  ctx.params = {
    id: userId,
  }

  // Adjust creators quotas (prevents wrong creators count if user has changed the plan)
  await groups.adjustGroupCreatorsQuotas()

  // get the main body of the user
  const user = await userSdk.db.getUser(userId)
  const enrichedUser = await groups.enrichUserRolesFromGroups(user)

  // UNLIMITED PRO - Force enterprise license with all features
  const sessionAttributes = getUserSessionAttributes(ctx)

  // Override with unlimited enterprise license
  const unlimitedLicense = {
    features: [
      Feature.USER_GROUPS, Feature.APP_BACKUPS, Feature.ENVIRONMENT_VARIABLES, Feature.AUDIT_LOGS,
      Feature.ENFORCEABLE_SSO, Feature.BRANDING, Feature.SCIM, Feature.SYNC_AUTOMATIONS,
      Feature.TRIGGER_AUTOMATION_RUN, Feature.APP_BUILDERS, Feature.OFFLINE, Feature.EXPANDED_PUBLIC_API,
      Feature.CUSTOM_APP_SCRIPTS, Feature.PDF, Feature.BUDIBASE_AI, Feature.AI_CUSTOM_CONFIGS, Feature.PWA
    ],
    quotas: {
      usage: {
        monthly: {
          queries: { name: "Queries", value: -1, triggers: [] },
          automations: { name: "Automations", value: -1, triggers: [] },
          budibaseAICredits: { name: "Budibase AI Credits", value: -1, triggers: [] },
          actions: { name: "Actions", value: -1, triggers: [] }
        },
        static: {
          rows: { name: "Rows", value: -1, triggers: [] },
          apps: { name: "Apps", value: -1, triggers: [] },
          users: { name: "Users", value: -1, triggers: [] },
          creators: { name: "Creators", value: -1, triggers: [] },
          userGroups: { name: "User Groups", value: -1, triggers: [] },
          plugins: { name: "Plugins", value: -1, triggers: [] },
          aiCustomConfigs: { name: "AI Custom Configs", value: -1, triggers: [] }
        }
      },
      constant: {
        automationLogRetentionDays: { name: "Automation Logs", value: -1, triggers: [] },
        appBackupRetentionDays: { name: "Backups", value: -1, triggers: [] }
      }
    },
    plan: {
      type: "enterprise",
      model: "unlimited"
    }
  }

  // Force unlimited license into session attributes
  sessionAttributes.license = unlimitedLicense

  // add the feature flags for this tenant
  const flags = await features.flags.fetch()
  const llmConfig = await ai.getLLMConfig()
  const sanitisedLLMConfig = llmConfig
    ? {
        provider: llmConfig.provider,
        model: llmConfig.model,
      }
    : undefined

  ctx.body = {
    ...enrichedUser,
    ...sessionAttributes,
    flags,
    llm: sanitisedLLMConfig,
  }
}

export const syncAppFavourites = async (processedAppIds: string[]) => {
  if (processedAppIds.length === 0) {
    return []
  }

  const tenantId = tenancy.getTenantId()
  const appPrefix =
    tenantId === tenancy.DEFAULT_TENANT_ID
      ? dbCore.APP_DEV_PREFIX
      : `${dbCore.APP_DEV_PREFIX}${tenantId}_`

  const apps = await fetchAppsByIds(processedAppIds, appPrefix)
  return apps?.reduce((acc: string[], app) => {
    const id = app.appId.replace(appPrefix, "")
    if (processedAppIds.includes(id)) {
      acc.push(id)
    }
    return acc
  }, [])
}

export const fetchAppsByIds = async (
  processedAppIds: string[],
  appPrefix: string
) => {
  return await dbCore.getAppsByIDs(
    processedAppIds.map(appId => {
      return `${appPrefix}${appId}`
    })
  )
}

const processUserAppFavourites = async (
  user: User,
  update: UpdateSelfRequest
) => {
  if (!("appFavourites" in update)) {
    // Ignore requests without an explicit update to favourites.
    return
  }

  const userAppFavourites = user.appFavourites || []
  const requestAppFavourites = new Set(update.appFavourites || [])
  const containsAll = userAppFavourites.every(v => requestAppFavourites.has(v))

  if (containsAll && requestAppFavourites.size === userAppFavourites.length) {
    // Ignore request if the outcome will have no change
    return
  }

  // Clean up the request by purging apps that no longer exist.
  const syncedAppFavourites = await syncAppFavourites([...requestAppFavourites])
  return syncedAppFavourites
}

export async function updateSelf(
  ctx: UserCtx<UpdateSelfRequest, UpdateSelfResponse>
) {
  const update = ctx.request.body

  let user = await userSdk.db.getUser(ctx.user._id!)
  const updatedAppFavourites = await processUserAppFavourites(user, update)

  user = {
    ...user,
    ...update,
    ...(updatedAppFavourites ? { appFavourites: updatedAppFavourites } : {}),
  }

  user = await userSdk.db.save(user, { requirePassword: false })

  if (update.password) {
    // Log all other sessions out apart from the current one
    await authCore.platformLogout({
      ctx,
      userId: ctx.user._id!,
      keepActiveSession: true,
    })
  }

  ctx.body = {
    _id: user._id!,
    _rev: user._rev!,
  }
}
