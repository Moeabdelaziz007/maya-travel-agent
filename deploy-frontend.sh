#!/bin/bash
# Frontend Deployment Script for Vercel

set -e

echo "🚀 Deploying Amrikyy Frontend to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to project root
cd "$(dirname "$0")"

echo "📦 Building frontend locally to verify..."
cd frontend
npm ci
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    echo ""
    echo "📤 Deploying to Vercel..."
    cd ..
    
    # Deploy to production
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "⚠️  Don't forget to set these environment variables in Vercel Dashboard:"
    echo "   - VITE_API_BASE_URL (your Railway backend URL)"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo ""
    echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
else
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

