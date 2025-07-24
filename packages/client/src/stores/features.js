import { derived } from "svelte/store"
import { appStore } from "./app"
import { authStore } from "./auth"
import { Constants } from "@budibase/frontend-core"
import { Feature } from "@budibase/types"

const createFeaturesStore = () => {
  return derived([authStore, appStore], ([$authStore, $appStore]) => {
    const getUserLicense = () => {
      const user = $authStore
      if (user) {
        return user.license
      }
    }

    const getAppLicenseType = () => {
      const appDef = $appStore
      if (appDef?.licenseType) {
        return appDef.licenseType
      }
    }

    // UNLIMITED PRO FEATURES - Always return enterprise level features
    const isFreePlan = () => {
      return false // Never show as free plan
    }

    const license = getUserLicense()

    return {
      logoEnabled: false, // Disable free plan branding
      aiEnabled: true, // Always enable AI features
      pwaEnabled: true, // Always enable PWA
      // Add all other pro features
      groupsEnabled: true,
      backupsEnabled: true,
      brandingEnabled: true,
      scimEnabled: true,
      environmentVariablesEnabled: true,
      auditLogsEnabled: true,
      syncAutomationsEnabled: true,
      triggerAutomationRunEnabled: true,
      appBuildersEnabled: true,
      customAppScriptsEnabled: true,
      pdfEnabled: true,
    }
  })
}

export const featuresStore = createFeaturesStore()
