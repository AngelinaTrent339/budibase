#!/bin/bash

echo "🚀 Unlocking Budibase Pro Features - Unlimited Edition"
echo "=================================================="

# Set environment variables for unlimited pro features
export SELF_HOSTED=1
export BUDIBASE_ENVIRONMENT=PRODUCTION
export DISABLE_ACCOUNT_PORTAL=1
export OFFLINE_MODE=1
export DEFAULT_LICENSE=unlimited

# Enable all app features
export APP_FEATURES="USER_GROUPS,APP_BACKUPS,ENVIRONMENT_VARIABLES,AUDIT_LOGS,ENFORCEABLE_SSO,BRANDING,SCIM,SYNC_AUTOMATIONS,TRIGGER_AUTOMATION_RUN,APP_BUILDERS,OFFLINE,EXPANDED_PUBLIC_API,CUSTOM_APP_SCRIPTS,PDF,BUDIBASE_AI,AI_CUSTOM_CONFIGS,PWA"

# Disable licensing restrictions
export DISABLE_DEVELOPER_LICENSE=0
export MOCK_REDIS=1

echo "✅ Pro features environment configured"

# Install dependencies for the mock pro package
echo "📦 Setting up mock pro package..."
cd packages/pro
npm install
cd ../..

# Build the project
echo "🔨 Building Budibase with pro features..."
lerna bootstrap
npm run build

echo "🎉 Budibase Pro Features Unlocked!"
echo ""
echo "Features now available:"
echo "• User Groups & Permissions"
echo "• App Backups"
echo "• Environment Variables"
echo "• Audit Logs"
echo "• SSO Enforcement"
echo "• Custom Branding"
echo "• SCIM"
echo "• Sync Automations"
echo "• Trigger Automation Run"
echo "• App Builders"
echo "• Expanded Public API"
echo "• Custom App Scripts"
echo "• PDF Generation"
echo "• Budibase AI"
echo "• AI Custom Configs"
echo "• PWA Support"
echo ""
echo "🚀 Start Budibase with: npm run dev" 