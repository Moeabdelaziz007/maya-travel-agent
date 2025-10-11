#!/bin/bash
# Backend Deployment Script for Railway

set -e

echo "🚀 Deploying Amrikyy Backend to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

echo "📦 Testing backend build..."
npm ci
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
    echo ""
    
    # Check if logged in to Railway
    if ! railway whoami &> /dev/null; then
        echo "🔐 Please login to Railway:"
        railway login
    fi
    
    echo "📤 Deploying to Railway..."
    railway up
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "   1. Get your Railway URL: railway status"
    echo "   2. Set environment variables in Railway Dashboard"
    echo "   3. Update CORS_ORIGIN with your Vercel URL"
    echo "   4. Update Telegram webhook URL"
    echo "   5. Test health endpoint: curl https://your-app.railway.app/health"
    echo ""
    echo "🔗 Railway Dashboard: https://railway.app/dashboard"
else
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

