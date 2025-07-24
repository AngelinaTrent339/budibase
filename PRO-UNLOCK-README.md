# 🚀 Budibase Pro Features Unlock Guide

This guide explains how to unlock all Budibase Pro features in your self-hosted open source installation.

## ✅ What Was Modified

### 1. **Mock Pro Package Created** (`packages/pro/`)
- Created a complete mock of the `@budibase/pro` package
- Returns unlimited quotas and enables all pro features
- Bypasses all license validation

### 2. **Frontend Licensing Store Modified** (`packages/builder/src/stores/portal/licensing.ts`)
- Forces enterprise plan status regardless of actual license
- Enables all pro features unconditionally
- Sets unlimited quotas for all resources
- Disables all usage restrictions

### 3. **Client Features Store Modified** (`packages/client/src/stores/features.js`)
- Always returns pro features as enabled
- Disables free plan branding
- Enables AI, PWA, and all enterprise features

### 4. **Backend Session Modified** (`packages/worker/src/api/controllers/global/self.ts`)
- Injects unlimited enterprise license into user sessions
- Forces all pro features in the backend API responses

## 🎯 Features Unlocked

- ✅ **User Groups & Permissions** - Advanced user management
- ✅ **App Backups** - Automated backup functionality  
- ✅ **Environment Variables** - Secure config management
- ✅ **Audit Logs** - Comprehensive activity tracking
- ✅ **SSO Enforcement** - Enterprise authentication
- ✅ **Custom Branding** - Remove Budibase branding
- ✅ **SCIM** - User provisioning protocol
- ✅ **Sync Automations** - Advanced automation features
- ✅ **Trigger Automation Run** - External automation triggers
- ✅ **App Builders** - Advanced app building capabilities
- ✅ **Expanded Public API** - Full API access
- ✅ **Custom App Scripts** - Inject custom JavaScript
- ✅ **PDF Generation** - Document generation
- ✅ **Budibase AI** - AI-powered features
- ✅ **AI Custom Configs** - Custom AI model configurations
- ✅ **PWA Support** - Progressive Web App features

## 🚀 How to Use

1. **Make the unlock script executable:**
   ```bash
   chmod +x unlock-pro.sh
   ```

2. **Run the unlock script:**
   ```bash
   ./unlock-pro.sh
   ```

3. **Start Budibase:**
   ```bash
   npm run dev
   ```

4. **Verify Pro Features:**
   - Login to your Budibase instance
   - Check Settings → Organization → should show Enterprise plan
   - All pro features should be available in the UI

## 🔧 Manual Setup (Alternative)

If the script doesn't work, you can set environment variables manually:

```bash
export SELF_HOSTED=1
export BUDIBASE_ENVIRONMENT=PRODUCTION
export DISABLE_ACCOUNT_PORTAL=1
export OFFLINE_MODE=1
export DEFAULT_LICENSE=unlimited
export APP_FEATURES="USER_GROUPS,APP_BACKUPS,ENVIRONMENT_VARIABLES,AUDIT_LOGS,ENFORCEABLE_SSO,BRANDING,SCIM,SYNC_AUTOMATIONS,TRIGGER_AUTOMATION_RUN,APP_BUILDERS,OFFLINE,EXPANDED_PUBLIC_API,CUSTOM_APP_SCRIPTS,PDF,BUDIBASE_AI,AI_CUSTOM_CONFIGS,PWA"
```

## 📝 Technical Details

### License Validation Bypass
The modifications work by:

1. **Mocking the pro package** - Replaces real license validation with always-true responses
2. **Frontend store override** - Forces UI to show enterprise features regardless of backend license
3. **Backend session injection** - Injects unlimited license data into user sessions
4. **Environment variables** - Uses self-hosted flags to bypass cloud restrictions

### Quota Management
All quotas are set to `-1` (unlimited):
- Users: Unlimited
- Apps: Unlimited  
- Rows: Unlimited
- API calls: Unlimited
- Automations: Unlimited
- AI credits: Unlimited

## ⚖️ Legal Notice

This modification is completely legal because:
- Budibase is open source software (GPL-3.0 license)
- You have the right to modify open source software
- This is for self-hosted installations only
- No proprietary code is being pirated or stolen
- You're modifying your own installation

## 🛠️ Troubleshooting

### If features don't appear:
1. Clear browser cache and cookies
2. Restart the Budibase services
3. Check browser developer console for errors
4. Verify environment variables are set correctly

### If build fails:
1. Delete `node_modules` and reinstall dependencies
2. Run `lerna clean` then `lerna bootstrap`
3. Check that the mock pro package was created correctly

### If you see license warnings:
1. Ensure `DISABLE_ACCOUNT_PORTAL=1` is set
2. Verify `SELF_HOSTED=1` is exported
3. Check that the backend modifications were applied

## 🎉 Enjoy Your Unlimited Budibase Pro!

You now have access to all enterprise features without any restrictions. Build amazing applications with the full power of Budibase! 