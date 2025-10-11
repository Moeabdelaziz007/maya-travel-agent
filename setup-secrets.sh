#!/bin/bash
# Quick Secrets Setup Script for Amrikyy Production Deployment

set -e

echo "🔐 Amrikyy Travel Agent - Production Secrets Setup"
echo "===================================================="
echo ""

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 This script will help you set up all production secrets${NC}"
echo ""

# Check if Railway and Vercel CLIs are installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Both CLIs are installed${NC}"
echo ""

# Create .env.production template if it doesn't exist
if [ ! -f ".env.production.template" ]; then
    cat > .env.production.template << 'EOF'
# ==============================================
# AMRIKYY PRODUCTION SECRETS TEMPLATE
# ==============================================

# Core Configuration
NODE_ENV=production
PORT=5000
APP_NAME="Amrikyy Travel Agent"
FRONTEND_URL=https://your-app.vercel.app

# Database (Supabase)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Redis (Upstash)
REDIS_URL=
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=true

# AI Services
ZAI_API_KEY=
VLLM_BASE_URL=http://localhost:8000/v1
VLLM_MODEL=THUDM/glm-4v-9b

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

# Payments
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Travel APIs
AMADEUS_API_KEY=
AMADEUS_API_SECRET=

# Security
SESSION_SECRET=
JWT_SECRET=

# Monitoring
SENTRY_DSN=
EOF
    echo -e "${GREEN}✅ Created .env.production.template${NC}"
fi

echo ""
echo -e "${YELLOW}Choose deployment action:${NC}"
echo "1. Set up Railway backend secrets"
echo "2. Set up Vercel frontend secrets"
echo "3. Deploy backend to Railway"
echo "4. Deploy frontend to Vercel"
echo "5. Set up all webhooks"
echo "6. Full deployment (all of the above)"
echo "7. View deployment URLs"
echo "8. Run health checks"
echo "9. Exit"
echo ""

read -p "Enter your choice (1-9): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚂 Setting up Railway backend secrets${NC}"
        echo ""
        
        cd backend
        
        # Check if linked to Railway project
        if ! railway status &> /dev/null; then
            echo -e "${YELLOW}No Railway project linked. Let's link one...${NC}"
            railway link
        fi
        
        echo ""
        echo "Enter your secrets (or press Enter to skip):"
        echo ""
        
        # Core secrets
        read -p "SUPABASE_URL: " supabase_url
        if [ ! -z "$supabase_url" ]; then
            railway variables set SUPABASE_URL="$supabase_url"
        fi
        
        read -p "SUPABASE_ANON_KEY: " supabase_anon
        if [ ! -z "$supabase_anon" ]; then
            railway variables set SUPABASE_ANON_KEY="$supabase_anon"
        fi
        
        read -p "TELEGRAM_BOT_TOKEN: " telegram_token
        if [ ! -z "$telegram_token" ]; then
            railway variables set TELEGRAM_BOT_TOKEN="$telegram_token"
        fi
        
        read -p "STRIPE_SECRET_KEY: " stripe_key
        if [ ! -z "$stripe_key" ]; then
            railway variables set STRIPE_SECRET_KEY="$stripe_key"
        fi
        
        # Generate session secrets if needed
        echo ""
        echo -e "${BLUE}Generating session secrets...${NC}"
        session_secret=$(openssl rand -base64 32)
        jwt_secret=$(openssl rand -base64 32)
        
        railway variables set SESSION_SECRET="$session_secret"
        railway variables set JWT_SECRET="$jwt_secret"
        railway variables set NODE_ENV=production
        railway variables set PORT=5000
        
        echo -e "${GREEN}✅ Railway secrets configured${NC}"
        cd ..
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}🎨 Setting up Vercel frontend secrets${NC}"
        echo ""
        
        cd frontend
        
        # Check if linked to Vercel project
        if ! vercel whoami &> /dev/null; then
            echo -e "${YELLOW}Not logged in to Vercel. Please login...${NC}"
            vercel login
        fi
        
        echo ""
        read -p "Enter your Railway backend URL (e.g., https://your-app.up.railway.app): " backend_url
        
        if [ ! -z "$backend_url" ]; then
            vercel env add VITE_API_URL production <<< "$backend_url/api"
        fi
        
        read -p "Enter SUPABASE_URL: " supabase_url
        if [ ! -z "$supabase_url" ]; then
            vercel env add VITE_SUPABASE_URL production <<< "$supabase_url"
        fi
        
        read -p "Enter SUPABASE_ANON_KEY: " supabase_anon
        if [ ! -z "$supabase_anon" ]; then
            vercel env add VITE_SUPABASE_ANON_KEY production <<< "$supabase_anon"
        fi
        
        read -p "Enter TELEGRAM_BOT_TOKEN: " telegram_token
        if [ ! -z "$telegram_token" ]; then
            vercel env add VITE_TELEGRAM_BOT_TOKEN production <<< "$telegram_token"
        fi
        
        echo -e "${GREEN}✅ Vercel secrets configured${NC}"
        cd ..
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}🚀 Deploying backend to Railway${NC}"
        echo ""
        
        cd backend
        railway up
        
        echo ""
        echo -e "${GREEN}✅ Backend deployed to Railway${NC}"
        railway status
        cd ..
        ;;
        
    4)
        echo ""
        echo -e "${BLUE}🚀 Deploying frontend to Vercel${NC}"
        echo ""
        
        cd frontend
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
        cd ..
        ;;
        
    5)
        echo ""
        echo -e "${BLUE}🔗 Setting up webhooks${NC}"
        echo ""
        
        read -p "Enter your Railway backend URL: " backend_url
        read -p "Enter your Telegram bot token: " telegram_token
        
        if [ ! -z "$telegram_token" ] && [ ! -z "$backend_url" ]; then
            echo "Setting Telegram webhook..."
            curl -X POST "https://api.telegram.org/bot$telegram_token/setWebhook" \
                -H "Content-Type: application/json" \
                -d "{\"url\": \"$backend_url/api/telegram/webhook\"}"
            
            echo ""
            echo -e "${GREEN}✅ Telegram webhook configured${NC}"
        fi
        
        echo ""
        echo "Configure Stripe webhook manually:"
        echo "1. Go to https://dashboard.stripe.com/webhooks"
        echo "2. Add endpoint: $backend_url/api/payment/webhook"
        echo "3. Select events: payment_intent.succeeded, checkout.session.completed"
        echo "4. Copy webhook secret to Railway secrets"
        ;;
        
    6)
        echo ""
        echo -e "${BLUE}🚀 Full deployment starting...${NC}"
        echo ""
        
        # Run all steps
        $0 <<< "1"
        $0 <<< "2"
        $0 <<< "3"
        $0 <<< "4"
        $0 <<< "5"
        
        echo ""
        echo -e "${GREEN}✅✅✅ Full deployment complete! ✅✅✅${NC}"
        ;;
        
    7)
        echo ""
        echo -e "${BLUE}📊 Deployment URLs:${NC}"
        echo ""
        
        echo "Backend (Railway):"
        cd backend
        railway status 2>/dev/null || echo "Not deployed yet"
        cd ..
        
        echo ""
        echo "Frontend (Vercel):"
        cd frontend
        vercel ls 2>/dev/null || echo "Not deployed yet"
        cd ..
        ;;
        
    8)
        echo ""
        echo -e "${BLUE}🏥 Running health checks${NC}"
        echo ""
        
        read -p "Enter your backend URL: " backend_url
        
        if [ ! -z "$backend_url" ]; then
            echo "Testing basic health..."
            curl -s "$backend_url/health" | jq '.' || echo "Failed"
            
            echo ""
            echo "Testing enhanced AI health..."
            curl -s "$backend_url/api/enhanced-ai/health" | jq '.' || echo "Not available"
            
            echo ""
            echo "Testing quantum service..."
            curl -s "$backend_url/api/quantum/health" | jq '.' || echo "Not available"
            
            echo ""
            echo "Testing vLLM service..."
            curl -s "$backend_url/api/vllm/health" | jq '.' || echo "Not available"
        fi
        ;;
        
    9)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Done!${NC}"
echo ""
echo "📚 For more details, see: PRODUCTION_SECRETS.md"
echo "🆘 Need help? Check the troubleshooting section"
echo ""
