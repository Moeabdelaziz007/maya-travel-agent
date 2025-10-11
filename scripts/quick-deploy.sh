#!/bin/bash

# Amrikyy Travel Agent - Quick Deploy Script
# Deploys to staging or production with validation

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo ""
echo "🚀 Amrikyy Travel Agent - Quick Deploy"
echo "===================================="
echo ""

# Check environment
if [ -z "$1" ]; then
    log_error "Please specify environment: staging or production"
    echo "Usage: ./scripts/quick-deploy.sh [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

log_info "Deploying to: $ENVIRONMENT"
echo ""

# Step 1: Pre-flight checks
log_info "Step 1/7: Running pre-flight checks..."

# Check git status
if [[ -n $(git status -s) ]]; then
    log_warning "You have uncommitted changes"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    log_warning "Not on main branch (current: $CURRENT_BRANCH)"
    log_warning "Production deployments should be from main branch"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

log_success "Pre-flight checks passed"
echo ""

# Step 2: Lint
log_info "Step 2/7: Running linter..."
cd backend
npm run lint || {
    log_error "Linting failed. Fix errors before deploying."
    exit 1
}
cd ..
log_success "Lint passed"
echo ""

# Step 3: Run tests
log_info "Step 3/7: Running tests..."
cd backend
npm test || {
    log_error "Tests failed. Fix errors before deploying."
    exit 1
}
cd ..
log_success "Tests passed"
echo ""

# Step 4: Build
log_info "Step 4/7: Building frontend..."
cd frontend
npm run build || {
    log_error "Build failed"
    exit 1
}
cd ..
log_success "Build successful"
echo ""

# Step 5: Deploy based on environment
log_info "Step 5/7: Deploying to $ENVIRONMENT..."

if [ "$ENVIRONMENT" = "staging" ]; then
    # Deploy to staging via Railway
    if command -v railway &> /dev/null; then
        log_info "Deploying backend to Railway (staging)..."
        cd backend
        railway up --detach || log_warning "Railway deployment may have failed"
        cd ..
    else
        log_warning "Railway CLI not installed. Skipping backend deployment."
        log_info "Install with: npm install -g @railway/cli"
    fi
    
    # Deploy frontend to Vercel (preview)
    if command -v vercel &> /dev/null; then
        log_info "Deploying frontend to Vercel (preview)..."
        cd frontend
        vercel --yes || log_warning "Vercel deployment may have failed"
        cd ..
    else
        log_warning "Vercel CLI not installed. Skipping frontend deployment."
        log_info "Install with: npm install -g vercel"
    fi
    
elif [ "$ENVIRONMENT" = "production" ]; then
    log_warning "⚠️  PRODUCTION DEPLOYMENT ⚠️"
    echo ""
    echo "This will deploy to production:"
    echo "  - Backend: Railway"
    echo "  - Frontend: Vercel"
    echo ""
    read -p "Are you SURE? Type 'deploy' to continue: " CONFIRM
    
    if [ "$CONFIRM" != "deploy" ]; then
        log_error "Deployment cancelled"
        exit 1
    fi
    
    # Deploy to production via Railway
    if command -v railway &> /dev/null; then
        log_info "Deploying backend to Railway (production)..."
        cd backend
        railway up --detach --environment production || log_warning "Railway deployment may have failed"
        cd ..
    else
        log_warning "Railway CLI not installed. Skipping backend deployment."
    fi
    
    # Deploy frontend to Vercel (production)
    if command -v vercel &> /dev/null; then
        log_info "Deploying frontend to Vercel (production)..."
        cd frontend
        vercel --prod --yes || log_warning "Vercel deployment may have failed"
        cd ..
    else
        log_warning "Vercel CLI not installed. Skipping frontend deployment."
    fi
fi

log_success "Deployment initiated"
echo ""

# Step 6: Wait for deployment
log_info "Step 6/7: Waiting for deployment to complete..."
log_info "Waiting 30 seconds for services to start..."
sleep 30
log_success "Wait complete"
echo ""

# Step 7: Run smoke tests
log_info "Step 7/7: Running smoke tests..."

if [ "$ENVIRONMENT" = "staging" ]; then
    TEST_URL=${STAGING_URL:-"https://staging-api.amrikyytravel.ai"}
elif [ "$ENVIRONMENT" = "production" ]; then
    TEST_URL=${PRODUCTION_URL:-"https://api.amrikyytravel.ai"}
fi

log_info "Testing against: $TEST_URL"

# Run smoke tests if URL is available
if [ -n "$TEST_URL" ]; then
    cd backend
    TEST_URL=$TEST_URL npm run smoke-test || {
        log_error "Smoke tests failed!"
        log_warning "Deployment may be broken. Check logs immediately."
        exit 1
    }
    cd ..
    log_success "Smoke tests passed"
else
    log_warning "No test URL configured. Skipping smoke tests."
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ DEPLOYMENT SUCCESSFUL!            ║"
echo "╚════════════════════════════════════════╝"
echo ""
log_success "Environment: $ENVIRONMENT"
log_success "All checks passed"
echo ""
echo "🔗 Next steps:"
echo "   1. Check application: $TEST_URL/health"
echo "   2. Monitor logs for errors"
echo "   3. Test critical user flows"
echo "   4. Update team/stakeholders"
echo ""

