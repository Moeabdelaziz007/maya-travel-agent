#!/bin/bash

# Maya Travel Agent - GitHub Secrets Setup Helper
# This script helps you set up GitHub secrets for CI/CD

echo "🔐 Maya Travel Agent - GitHub Secrets Setup"
echo "==========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "📦 Install it with: brew install gh"
    echo "🔗 Or visit: https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "🔑 Please login to GitHub first:"
    gh auth login
fi

echo "📝 This script will help you set GitHub secrets for:"
echo "   - Railway deployment"
echo "   - Vercel deployment"
echo "   - Collibra config management"
echo "   - API keys for testing"
echo ""
echo "⚠️  You'll need to have these values ready"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    
    echo ""
    echo "📌 $secret_name"
    echo "   Description: $secret_description"
    read -sp "   Enter value (hidden): " secret_value
    echo ""
    
    if [ -n "$secret_value" ]; then
        gh secret set "$secret_name" --body "$secret_value"
        echo "   ✅ Set successfully!"
    else
        echo "   ⏭️  Skipped"
    fi
}

echo ""
echo "=== Railway Deployment ==="
set_secret "RAILWAY_TOKEN" "Railway API token from https://railway.app/account/tokens"
set_secret "RAILWAY_SERVICE_BACKEND_STAGING" "Railway service ID for staging backend"
set_secret "RAILWAY_SERVICE_BACKEND_PROD" "Railway service ID for production backend"

echo ""
echo "=== Vercel Deployment ==="
set_secret "VERCEL_TOKEN" "Vercel API token from https://vercel.com/account/tokens"
set_secret "VERCEL_ORG_ID" "Vercel organization ID"
set_secret "VERCEL_PROJECT_ID" "Vercel project ID"

echo ""
echo "=== Collibra Configuration ==="
set_secret "COLLIBRA_API_KEY" "Collibra API key for config management"

echo ""
echo "=== Testing ==="
set_secret "STAGING_API_KEY" "API key for staging smoke tests"
set_secret "PRODUCTION_API_KEY" "API key for production smoke tests"

echo ""
echo "=== Notifications ==="
set_secret "TELEGRAM_WEBHOOK_URL" "Telegram webhook URL for deployment notifications"

echo ""
echo "✅ GitHub Secrets setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify secrets at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/secrets/actions"
echo "   2. Configure Collibra (see DEPLOYMENT.md)"
echo "   3. Test deployment pipeline"
echo ""

