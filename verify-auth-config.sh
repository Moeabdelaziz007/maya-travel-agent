#!/bin/bash

##############################################################################
# Maya Trips - Auth Configuration Verification Script
# Checks if auth redirects are properly configured for production
##############################################################################

set -e

echo "========================================"
echo "Maya Trips Auth Configuration Checker"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "frontend/src/lib/auth.ts" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo "Checking frontend authentication configuration..."
echo ""

# Check 1: Verify auth.ts has getSiteUrl function
echo "1. Checking auth.ts for getSiteUrl function..."
if grep -q "const getSiteUrl" frontend/src/lib/auth.ts; then
    print_success "getSiteUrl function found in auth.ts"
else
    print_error "getSiteUrl function NOT found in auth.ts"
    echo "   Please update frontend/src/lib/auth.ts with the getSiteUrl helper"
fi

# Check 2: Verify redirects use getSiteUrl
echo "2. Checking if auth redirects use getSiteUrl()..."
if grep -q "emailRedirectTo: \`\${getSiteUrl()}" frontend/src/lib/auth.ts && \
   grep -q "redirectTo: \`\${getSiteUrl()}" frontend/src/lib/auth.ts; then
    print_success "Auth redirects properly use getSiteUrl()"
else
    print_warning "Some redirects may still use window.location.origin"
    echo "   Check frontend/src/lib/auth.ts and update all redirects"
fi

# Check 3: Check for environment file templates
echo "3. Checking environment file templates..."
if [ -f "frontend/env.example" ]; then
    if grep -q "VITE_SITE_URL" frontend/env.example; then
        print_success "VITE_SITE_URL found in env.example"
    else
        print_warning "VITE_SITE_URL not in env.example"
    fi
else
    print_error "frontend/env.example not found"
fi

if [ -f "frontend/env.production.example" ]; then
    print_success "Production environment template exists"
    if grep -q "maya-travel-agent.lovable.app" frontend/env.production.example; then
        print_success "Production URL correctly set in template"
    fi
else
    print_warning "frontend/env.production.example not found"
fi

# Check 4: Look for actual .env files (don't read them for security)
echo "4. Checking for environment files..."
if [ -f "frontend/.env" ]; then
    print_info "frontend/.env exists (check if VITE_SITE_URL is set)"
else
    print_warning "frontend/.env not found (create from env.example)"
fi

if [ -f "frontend/.env.production" ]; then
    print_info "frontend/.env.production exists"
else
    print_warning "frontend/.env.production not found (recommended for deployment)"
fi

# Check 5: Backend CORS configuration
echo "5. Checking backend CORS configuration..."
if [ -f "backend/env.example" ]; then
    if grep -q "CORS_ORIGIN" backend/env.example; then
        print_success "CORS_ORIGIN configuration found in backend"
    else
        print_warning "CORS_ORIGIN not configured in backend"
    fi
else
    print_warning "backend/env.example not found"
fi

echo ""
echo "========================================"
echo "Configuration Status Summary"
echo "========================================"
echo ""

# Production readiness check
echo "Production Deployment Checklist:"
echo ""
echo "Frontend (Lovable):"
echo "  [ ] Set VITE_SUPABASE_URL in Lovable env vars"
echo "  [ ] Set VITE_SUPABASE_ANON_KEY in Lovable env vars"
echo "  [ ] Set VITE_SITE_URL=https://maya-travel-agent.lovable.app"
echo ""
echo "Supabase Dashboard:"
echo "  [ ] Site URL: https://maya-travel-agent.lovable.app"
echo "  [ ] Redirect URLs include production URLs"
echo "  [ ] Email template customized (optional)"
echo ""
echo "Testing:"
echo "  [ ] Test magic link signup"
echo "  [ ] Test password reset"
echo "  [ ] Test OAuth (if enabled)"
echo ""

print_info "For detailed instructions, see:"
echo "  • SUPABASE-REDIRECT-FIX.md"
echo "  • LOVABLE-DEPLOYMENT-GUIDE.md"
echo ""

echo "========================================"
print_success "Configuration check complete!"
echo "========================================"
echo ""

