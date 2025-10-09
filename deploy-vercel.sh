#!/bin/bash

# 🚀 Maya Travel Agent - Quick Vercel Deployment Script
# This script deploys your frontend to Vercel (like Lovable)

set -e  # Exit on error

echo "🚀 Maya Travel Agent - Vercel Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi

# Navigate to frontend
cd frontend

echo ""
echo -e "${BLUE}📦 Step 1: Building frontend locally to verify...${NC}"
npm run build
echo -e "${GREEN}✅ Build successful${NC}"

echo ""
echo -e "${BLUE}🔐 Step 2: Logging in to Vercel...${NC}"
vercel login

echo ""
echo -e "${BLUE}🚀 Step 3: Deploying to Vercel...${NC}"
echo ""
echo -e "${YELLOW}You'll be asked a few questions:${NC}"
echo "  1. Set up and deploy? → ${GREEN}Y${NC}"
echo "  2. Which scope? → Choose your account"
echo "  3. Link to existing project? → ${GREEN}N${NC} (first time) or ${GREEN}Y${NC} (redeploying)"
echo "  4. Project name? → ${GREEN}maya-travel-agent-frontend${NC}"
echo "  5. Directory? → ${GREEN}./ ${NC}"
echo "  6. Override settings? → ${GREEN}Y${NC}"
echo "  7. Build Command? → ${GREEN}npm run build${NC}"
echo "  8. Output Directory? → ${GREEN}dist${NC}"
echo "  9. Install Command? → ${GREEN}npm install --legacy-peer-deps${NC}"
echo ""

# Deploy to production
vercel --prod

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ${YELLOW}Add Environment Variables to Vercel:${NC}"
echo "   Go to: https://vercel.com → Your Project → Settings → Environment Variables"
echo ""
echo "   Required variables:"
echo "   • VITE_SUPABASE_URL=https://komahmavsulpkawmhqhk.supabase.co"
echo "   • VITE_SUPABASE_ANON_KEY=eyJhbGc...(your anon key)"
echo "   • VITE_SITE_URL=(your Vercel URL)"
echo ""
echo "2. ${YELLOW}Update Supabase Auth URLs:${NC}"
echo "   Go to: https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/auth/url-configuration"
echo "   Add your Vercel URL to Redirect URLs"
echo ""
echo "3. ${YELLOW}Run Database Migrations:${NC}"
echo "   See: VERCEL-DEPLOYMENT-FINAL.md (Step 3)"
echo ""
echo "4. ${YELLOW}Redeploy after adding env vars:${NC}"
echo "   vercel --prod"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Your app is now live!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "For detailed instructions, see:"
echo "  📄 VERCEL-DEPLOYMENT-FINAL.md"
echo ""

