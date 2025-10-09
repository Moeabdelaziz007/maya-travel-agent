#!/bin/bash

# Maya Travel Agent - Deployment Script
# Version: 1.0.0
# Description: Automated deployment to Vercel and Supabase

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."

    # Check Vercel CLI
    if ! command_exists vercel; then
        log_error "Vercel CLI is not installed. Please install it first:"
        log_error "npm install -g vercel"
        exit 1
    fi
    log_success "Vercel CLI is installed"

    # Check Supabase CLI
    if ! command_exists supabase; then
        log_warning "Supabase CLI is not installed. Install it for full deployment:"
        log_warning "npm install -g supabase"
    else
        log_success "Supabase CLI is installed"
    fi

    # Check if we're in git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository. Please run this from the project root."
        exit 1
    fi
    log_success "Git repository detected"

    # Check if we're on main branch
    BRANCH=$(git branch --show-current)
    if [ "$BRANCH" != "main" ]; then
        log_warning "Currently on branch: $BRANCH"
        read -p "Deploy from current branch? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Switch to main branch and try again"
            exit 1
        fi
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check if all tests pass
    log_info "Running tests..."
    if ! npm run test >/dev/null 2>&1; then
        log_error "Tests failed. Please fix them before deploying."
        exit 1
    fi
    log_success "All tests passed"

    # Check if code builds
    log_info "Building project..."
    if ! npm run build >/dev/null 2>&1; then
        log_error "Build failed. Please fix build errors before deploying."
        exit 1
    fi
    log_success "Build successful"

    # Check if required environment variables are set
    log_info "Checking environment variables..."
    if [ ! -f "frontend/.env.local" ]; then
        log_error "Frontend environment file not found. Please run setup script first."
        exit 1
    fi

    if [ ! -f "backend/.env" ]; then
        log_error "Backend environment file not found. Please run setup script first."
        exit 1
    fi
    log_success "Environment files found"
}

# Deploy frontend to Vercel
deploy_frontend() {
    log_info "Deploying frontend to Vercel..."

    cd frontend

    # Check if Vercel is already linked
    if [ ! -d ".vercel" ]; then
        log_warning "Project not linked to Vercel. Please link it first:"
        log_warning "cd frontend && vercel link"
        exit 1
    fi

    # Deploy to production
    log_info "Deploying to production..."
    DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*\.vercel\.app' | tail -n1)

    if [ -z "$DEPLOY_URL" ]; then
        log_error "Failed to extract deployment URL from Vercel output"
        log_error "Vercel output: $DEPLOY_OUTPUT"
        exit 1
    fi

    log_success "Frontend deployed successfully"
    echo "🌐 Frontend URL: $DEPLOY_URL"

    cd ..
}

# Deploy Supabase functions
deploy_supabase_functions() {
    log_info "Deploying Supabase Edge Functions..."

    # Check if Supabase CLI is available
    if ! command_exists supabase; then
        log_warning "Supabase CLI not available. Skipping function deployment."
        return 0
    fi

    # Check if Supabase is linked
    if [ ! -f "supabase/config.toml" ]; then
        log_warning "Supabase not configured. Skipping function deployment."
        return 0
    fi

    # Deploy all functions
    cd supabase
    supabase functions deploy --project-ref $SUPABASE_PROJECT_ID
    cd ..

    log_success "Supabase functions deployed"
}

# Post-deployment verification
post_deployment_verification() {
    log_info "Running post-deployment verification..."

    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    sleep 10

    # Check if frontend is accessible
    if [ ! -z "$DEPLOY_URL" ]; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" 2>/dev/null || echo "000")

        if [ "$HTTP_STATUS" = "200" ]; then
            log_success "Frontend is accessible at $DEPLOY_URL"
        else
            log_warning "Frontend returned HTTP status: $HTTP_STATUS"
            log_warning "The deployment might still be initializing. Check the URL in a few minutes."
        fi
    fi

    # Check if backend API is accessible (if deployed)
    if [ ! -z "$BACKEND_URL" ]; then
        API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" 2>/dev/null || echo "000")

        if [ "$API_STATUS" = "200" ]; then
            log_success "Backend API is accessible at $BACKEND_URL"
        else
            log_warning "Backend API returned HTTP status: $API_STATUS"
        fi
    fi
}

# Create deployment summary
create_deployment_summary() {
    cat > deployment-summary.txt << EOF
🚀 Maya Travel Agent - Deployment Summary
==========================================

Deployment Date: $(date)
Git Branch: $(git branch --show-current)
Git Commit: $(git rev-parse --short HEAD)

Frontend URL: ${DEPLOY_URL:-Not deployed}
Backend URL: ${BACKEND_URL:-Not deployed}

Environment: Production
Status: ✅ Deployed Successfully

Next Steps:
1. Verify the deployment at the URLs above
2. Test key features (auth, trip planning, AI chat)
3. Update DNS records if using custom domain
4. Monitor logs for any issues

📚 For troubleshooting, see PROJECT-WORKFLOW-GUIDE.md
EOF

    log_success "Deployment summary created: deployment-summary.txt"
}

# Main deployment function
main() {
    echo "🚀 Maya Travel Agent - Automated Deployment"
    echo "=========================================="

    # Get deployment type from arguments
    DEPLOYMENT_TYPE=${1:-full}

    log_info "Deployment type: $DEPLOYMENT_TYPE"

    check_prerequisites
    pre_deployment_checks

    case $DEPLOYMENT_TYPE in
        "frontend")
            deploy_frontend
            ;;
        "supabase")
            deploy_supabase_functions
            ;;
        "full")
            deploy_frontend
            deploy_supabase_functions
            ;;
        *)
            log_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            log_error "Usage: $0 [frontend|supabase|full]"
            exit 1
            ;;
    esac

    post_deployment_verification
    create_deployment_summary

    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Summary:"
    cat deployment-summary.txt
    echo ""
    echo "🔗 Access your application:"
    if [ ! -z "$DEPLOY_URL" ]; then
        echo "   Frontend: $DEPLOY_URL"
    fi
    if [ ! -z "$BACKEND_URL" ]; then
        echo "   Backend API: $BACKEND_URL"
    fi
}

# Handle script arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Maya Travel Agent - Deployment Script"
        echo ""
        echo "Usage: $0 [DEPLOYMENT_TYPE]"
        echo ""
        echo "Deployment Types:"
        echo "  frontend  - Deploy only frontend to Vercel"
        echo "  supabase  - Deploy only Supabase Edge Functions"
        echo "  full      - Deploy everything (default)"
        echo ""
        echo "Examples:"
        echo "  $0              # Full deployment"
        echo "  $0 frontend     # Frontend only"
        echo "  $0 supabase     # Functions only"
        echo ""
        echo "Environment Variables Required:"
        echo "  VERCEL_TOKEN        - Vercel authentication token"
        echo "  SUPABASE_PROJECT_ID - Supabase project reference"
        echo ""
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac