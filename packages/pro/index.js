// Mock @budibase/pro package - Unlimited Pro Features
const ALL_FEATURES = [
  "USER_GROUPS",
  "APP_BACKUPS", 
  "ENVIRONMENT_VARIABLES",
  "AUDIT_LOGS",
  "ENFORCEABLE_SSO",
  "BRANDING",
  "SCIM",
  "SYNC_AUTOMATIONS",
  "TRIGGER_AUTOMATION_RUN",
  "APP_BUILDERS",
  "OFFLINE",
  "EXPANDED_PUBLIC_API",
  "CUSTOM_APP_SCRIPTS",
  "PDF",
  "BUDIBASE_AI",
  "AI_CUSTOM_CONFIGS",
  "PWA"
]

// Mock license - Enterprise Unlimited
const UNLIMITED_LICENSE = {
  features: ALL_FEATURES,
  plan: { type: "enterprise", model: "unlimited" },
  quotas: {
    usage: {
      monthly: { queries: { value: -1 }, automations: { value: -1 } },
      static: { apps: { value: -1 }, rows: { value: -1 }, users: { value: -1 } }
    }
  }
}

// Export all pro functions
module.exports = {
  licensing: {
    cache: {
      getCachedLicense: () => UNLIMITED_LICENSE,
      refresh: async () => UNLIMITED_LICENSE
    }
  },
  features: {
    isBrandingEnabled: async () => true,
    isUserGroupsEnabled: async () => true,
    isEnvironmentVariableEnabled: async () => true,
    isAuditLogsEnabled: async () => true,
    isSSOEnforced: async () => false,
    isSCIMEnabled: async () => true,
    isAutomationSyncEnabled: async () => true,
    isAppBuildersEnabled: async () => true,
    isOfflineEnabled: async () => true,
    isExpandedPublicApiEnabled: async () => true,
    isCustomAppScriptsEnabled: async () => true,
    isPDFEnabled: async () => true,
    isBudibaseAIEnabled: async () => true,
    isPWAEnabled: async () => true
  },
  quotas: {
    getQuotaUsage: async () => ({ usage: 0 }),
    isExceeded: async () => false
  }
} 