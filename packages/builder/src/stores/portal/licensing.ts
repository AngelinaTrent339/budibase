import { get } from "svelte/store"
import { API } from "@/api"
import { auth, admin } from "@/stores/portal"
import { Constants } from "@budibase/frontend-core"
import { StripeStatus } from "@/components/portal/licensing/constants"
import {
  License,
  MonthlyQuotaName,
  PlanModel,
  QuotaUsage,
  StaticQuotaName,
} from "@budibase/types"
import { BudiStore } from "../BudiStore"

const UNLIMITED = -1
const ONE_DAY_MILLIS = 86400000

type MonthlyMetrics = { [key in MonthlyQuotaName]?: number }
type StaticMetrics = { [key in StaticQuotaName]?: number }
type UsageMetrics = MonthlyMetrics & StaticMetrics

interface LicensingState {
  goToUpgradePage: () => void
  goToPricingPage: () => void
  // the top level license
  license?: License
  isFreePlan: boolean
  isEnterprisePlan: boolean
  isBusinessPlan: boolean
  // features
  groupsEnabled: boolean
  backupsEnabled: boolean
  brandingEnabled: boolean
  pwaEnabled: boolean
  scimEnabled: boolean
  environmentVariablesEnabled: boolean
  budibaseAIEnabled: boolean
  customAIConfigsEnabled: boolean
  auditLogsEnabled: boolean
  customAppScriptsEnabled: boolean
  syncAutomationsEnabled: boolean
  triggerAutomationRunEnabled: boolean
  pdfEnabled: boolean
  // the currently used quotas from the db
  quotaUsage?: QuotaUsage
  // derived quota metrics for percentages used
  usageMetrics?: UsageMetrics
  // quota reset
  quotaResetDaysRemaining?: number
  quotaResetDate?: Date
  // failed payments
  accountPastDue: boolean
  pastDueEndDate?: Date
  pastDueDaysRemaining?: number
  accountDowngraded: boolean
  // user limits
  userCount?: number
  userLimit?: number
  aiCreditsLimit?: number
  actionsLimit?: number
  userLimitReached: boolean
  aiCreditsExceeded: boolean
  actionsExceeded: boolean
  errUserLimit: boolean
}

class LicensingStore extends BudiStore<LicensingState> {
  constructor() {
    super({
      // navigation
      goToUpgradePage: () => {},
      goToPricingPage: () => {},
      // the top level license
      license: undefined,
      isFreePlan: true,
      isEnterprisePlan: true,
      isBusinessPlan: true,
      // features
      groupsEnabled: false,
      backupsEnabled: false,
      brandingEnabled: false,
      pwaEnabled: false,
      scimEnabled: false,
      environmentVariablesEnabled: false,
      budibaseAIEnabled: false,
      customAIConfigsEnabled: false,
      auditLogsEnabled: false,
      customAppScriptsEnabled: false,
      syncAutomationsEnabled: false,
      triggerAutomationRunEnabled: false,
      pdfEnabled: false,
      // the currently used quotas from the db
      quotaUsage: undefined,
      // derived quota metrics for percentages used
      usageMetrics: undefined,
      // quota reset
      quotaResetDaysRemaining: undefined,
      quotaResetDate: undefined,
      // failed payments
      accountPastDue: false,
      pastDueEndDate: undefined,
      pastDueDaysRemaining: undefined,
      accountDowngraded: false,
      // user limits
      userCount: undefined,
      userLimit: undefined,
      userLimitReached: false,
      errUserLimit: false,
      actionsExceeded: false,
      // AI Limits
      aiCreditsExceeded: false,
    })
  }

  usersLimitReached(userCount: number, userLimit = get(this.store).userLimit) {
    if (userLimit === UNLIMITED || userLimit === undefined) {
      return false
    }
    return userCount >= userLimit
  }

  usersLimitExceeded(userCount: number, userLimit = get(this.store).userLimit) {
    if (userLimit === UNLIMITED || userLimit === undefined) {
      return false
    }
    return userCount > userLimit
  }

  aiCreditsExceeded(
    aiCredits: number,
    aiCreditsLimit = get(this.store).aiCreditsLimit
  ) {
    if (aiCreditsLimit === UNLIMITED || aiCreditsLimit === undefined) {
      return false
    }
    return aiCredits > aiCreditsLimit
  }

  actionsExceeded(
    actions: number,
    actionsLimit = get(this.store).actionsLimit
  ) {
    if (actionsLimit === UNLIMITED || actionsLimit === undefined) {
      return false
    }
    return actions > actionsLimit
  }

  async isCloud() {
    let adminStore = get(admin)
    if (!adminStore.loaded) {
      await admin.init()
      adminStore = get(admin)
    }
    return adminStore.cloud
  }

  async init() {
    this.setNavigation()
    this.setLicense()
    await this.setQuotaUsage()
  }

  setNavigation() {
    const adminStore = get(admin)
    const authStore = get(auth)

    const upgradeUrl = authStore?.user?.accountPortalAccess
      ? `${adminStore.accountPortalUrl}/portal/upgrade`
      : "/builder/portal/account/upgrade"

    const goToUpgradePage = () => {
      window.location.href = upgradeUrl
    }
    const goToPricingPage = () => {
      window.open("https://budibase.com/pricing/", "_blank")
    }
    this.update(state => {
      return {
        ...state,
        goToUpgradePage,
        goToPricingPage,
      }
    })
  }

  setLicense() {
    // UNLIMITED PRO FEATURES - Always return enterprise with all features enabled
    const license = get(auth).user?.license
    
    // Force enterprise plan regardless of actual license
    const planType = "enterprise"
    const isEnterprisePlan = true
    const isFreePlan = false
    const isBusinessPlan = false
    const isEnterpriseTrial = false
    
    // Enable ALL pro features unconditionally
    const groupsEnabled = true
    const backupsEnabled = true
    const scimEnabled = true
    const environmentVariablesEnabled = true
    const enforceableSSO = true
    const brandingEnabled = true
    const pwaEnabled = true
    const auditLogsEnabled = true
    const syncAutomationsEnabled = true
    const triggerAutomationRunEnabled = true
    const perAppBuildersEnabled = true
    const budibaseAIEnabled = true
    const customAppScriptsEnabled = true
    const pdfEnabled = true
    
    this.update(state => {
      return {
        ...state,
        license,
        isEnterprisePlan,
        isFreePlan,
        isBusinessPlan,
        isEnterpriseTrial,
        groupsEnabled,
        backupsEnabled,
        brandingEnabled,
        pwaEnabled,
        budibaseAIEnabled,
        scimEnabled,
        environmentVariablesEnabled,
        auditLogsEnabled,
        enforceableSSO,
        syncAutomationsEnabled,
        triggerAutomationRunEnabled,
        perAppBuildersEnabled,
        customAppScriptsEnabled,
        pdfEnabled,
      }
    })
  }

  async setQuotaUsage() {
    const quotaUsage = await API.getQuotaUsage()
    this.update(state => {
      return {
        ...state,
        quotaUsage,
      }
    })
    await this.setUsageMetrics()
  }

  async setUsageMetrics() {
    // UNLIMITED PRO - Bypass all quota restrictions
    const usage = get(this.store).quotaUsage
    const license = get(auth).user?.license
    const now = new Date()
    
    // Create unlimited usage metrics even if no license/usage data
    if (!usage) {
      this.update(state => {
        return {
          ...state,
          usageMetrics: { queries: -1, automations: -1, apps: -1, rows: -1 },
          quotaResetDaysRemaining: 999,
          quotaResetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          accountDowngraded: false,
          accountPastDue: false,
          userCount: 0,
          userLimit: -1,
          userLimitReached: false,
          errUserLimit: false,
          aiCreditsLimit: -1,
          actionsLimit: -1,
          aiCreditsExceeded: false,
          actionsExceeded: false,
        }
      })
      return
    }

    // Process monthly metrics
    const monthlyMetrics = [
      MonthlyQuotaName.QUERIES,
      MonthlyQuotaName.AUTOMATIONS,
    ].reduce((acc: MonthlyMetrics, key) => {
      const limit = license.quotas.usage.monthly[key].value
      const used = ((usage.monthly.current?.[key] || 0) / limit) * 100
      acc[key] = limit > -1 ? Math.floor(used) : -1
      return acc
    }, {})

    // Process static metrics
    const staticMetrics = [StaticQuotaName.APPS, StaticQuotaName.ROWS].reduce(
      (acc: StaticMetrics, key) => {
        const limit = license.quotas.usage.static[key].value
        const used = ((usage.usageQuota[key] || 0) / limit) * 100
        acc[key] = limit > -1 ? Math.floor(used) : -1
        return acc
      },
      {}
    )

    const getDaysBetween = (dateStart: Date, dateEnd: Date) => {
      return dateEnd > dateStart
        ? Math.round((dateEnd.getTime() - dateStart.getTime()) / ONE_DAY_MILLIS)
        : 0
    }

    const quotaResetDate = new Date(usage.quotaReset)
    const quotaResetDaysRemaining = getDaysBetween(now, quotaResetDate)

    const accountDowngraded =
      !!license.billing?.subscription?.downgradeAt &&
      license.billing?.subscription?.downgradeAt <= now.getTime() &&
      license.billing?.subscription?.status === StripeStatus.PAST_DUE &&
      license.plan.type === Constants.PlanType.FREE

    const pastDueAtMilliseconds = license.billing?.subscription?.pastDueAt
    const downgradeAtMilliseconds = license.billing?.subscription?.downgradeAt
    let pastDueDaysRemaining: number
    let pastDueEndDate: Date

    if (pastDueAtMilliseconds && downgradeAtMilliseconds) {
      pastDueEndDate = new Date(downgradeAtMilliseconds)
      pastDueDaysRemaining = getDaysBetween(
        new Date(pastDueAtMilliseconds),
        pastDueEndDate
      )
    }

    const userQuota = license.quotas.usage.static.users
    const userLimit = userQuota.value
    const aiCreditsQuota = license.quotas.usage.monthly.budibaseAICredits
    const aiCreditsLimit = aiCreditsQuota.value
    const actionsQuota = license.quotas.usage.monthly.actions
    const actionsLimit = actionsQuota.value
    const userCount = usage.usageQuota.users
    const userLimitReached = this.usersLimitReached(userCount, userLimit)
    const userLimitExceeded = this.usersLimitExceeded(userCount, userLimit)
    const aiCreditsExceeded = this.aiCreditsExceeded(
      usage.monthly.current.budibaseAICredits,
      aiCreditsLimit
    )
    const actionsExceeded = this.actionsExceeded(
      usage.monthly.current.actions,
      actionsLimit
    )
    // UNLIMITED PRO - Force unlimited quotas and disable all restrictions
    this.update(state => {
      return {
        ...state,
        usageMetrics: { queries: -1, automations: -1, apps: -1, rows: -1 },
        quotaResetDaysRemaining: 999,
        quotaResetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        accountDowngraded: false,
        accountPastDue: false,
        pastDueEndDate: undefined,
        pastDueDaysRemaining: undefined,
        // Unlimited user limits
        userCount: usage?.usageQuota?.users || 0,
        userLimit: -1, // Unlimited
        userLimitReached: false,
        errUserLimit: false,
        aiCreditsLimit: -1, // Unlimited
        actionsLimit: -1, // Unlimited
        aiCreditsExceeded: false,
        actionsExceeded: false,
      }
    })
  }
}

export const licensing = new LicensingStore()
