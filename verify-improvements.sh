#!/bin/bash

echo "🚀 Amrikyy Trips - Verification Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

echo "📦 Installing dependencies..."
npm run install:all
print_status $? "Dependencies installed"

echo ""
echo "🔍 Running TypeScript type check..."
cd frontend && npm run type-check
print_status $? "TypeScript type check passed"

echo ""
echo "🧹 Running ESLint..."
npm run lint
print_status $? "ESLint passed"

echo ""
echo "🎨 Running Prettier format check..."
npm run format:check
print_status $? "Prettier format check passed"

echo ""
echo "🧪 Running unit tests..."
npm run test
print_status $? "Unit tests passed"

echo ""
echo "📊 Running test coverage..."
npm run test:coverage
print_status $? "Test coverage generated"

echo ""
echo "🏗️ Building for production..."
npm run build
print_status $? "Production build successful"

echo ""
echo "🌐 Running E2E tests..."
npm run e2e
print_status $? "E2E tests passed"

echo ""
echo "♿ Running accessibility tests..."
npm run a11y-check
print_status $? "Accessibility tests passed"

echo ""
echo "🔒 Running security audit..."
cd .. && npm audit --audit-level high
print_status $? "Security audit passed"

echo ""
echo "🎯 All verifications completed successfully!"
echo ""
echo "📋 Summary:"
echo "- ✅ Dependencies installed"
echo "- ✅ TypeScript type checking"
echo "- ✅ ESLint linting"
echo "- ✅ Prettier formatting"
echo "- ✅ Unit tests"
echo "- ✅ Test coverage"
echo "- ✅ Production build"
echo "- ✅ E2E tests"
echo "- ✅ Accessibility tests"
echo "- ✅ Security audit"
echo ""
echo "🚀 Amrikyy Trips is ready for production!"
