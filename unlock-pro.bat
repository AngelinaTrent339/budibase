@echo off
echo 🚀 Unlocking Budibase Pro Features - Unlimited Edition
echo ==================================================

REM Set environment variables for unlimited pro features
set SELF_HOSTED=1
set BUDIBASE_ENVIRONMENT=PRODUCTION
set DISABLE_ACCOUNT_PORTAL=1
set OFFLINE_MODE=1
set DEFAULT_LICENSE=unlimited

REM Enable all app features
set APP_FEATURES=USER_GROUPS,APP_BACKUPS,ENVIRONMENT_VARIABLES,AUDIT_LOGS,ENFORCEABLE_SSO,BRANDING,SCIM,SYNC_AUTOMATIONS,TRIGGER_AUTOMATION_RUN,APP_BUILDERS,OFFLINE,EXPANDED_PUBLIC_API,CUSTOM_APP_SCRIPTS,PDF,BUDIBASE_AI,AI_CUSTOM_CONFIGS,PWA

REM Disable licensing restrictions
set DISABLE_DEVELOPER_LICENSE=0
set MOCK_REDIS=1

echo ✅ Pro features environment configured

REM Install dependencies for the mock pro package
echo 📦 Setting up mock pro package...
cd packages\pro
call npm install
cd ..\..

REM Build the project
echo 🔨 Building Budibase with pro features...
call lerna bootstrap
call npm run build

echo 🎉 Budibase Pro Features Unlocked!
echo.
echo Features now available:
echo • User Groups ^& Permissions
echo • App Backups
echo • Environment Variables
echo • Audit Logs
echo • SSO Enforcement
echo • Custom Branding
echo • SCIM
echo • Sync Automations
echo • Trigger Automation Run
echo • App Builders
echo • Expanded Public API
echo • Custom App Scripts
echo • PDF Generation
echo • Budibase AI
echo • AI Custom Configs
echo • PWA Support
echo.
echo 🚀 Start Budibase with: npm run dev
pause 