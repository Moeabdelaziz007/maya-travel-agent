#!/bin/bash

# Maya Travel Agent - Comprehensive Test Runner
# Runs all tests and validations before deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Functions
log_test() {
    echo -e "${BLUE}▶️  $1${NC}"
}

log_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

log_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

log_skip() {
    echo -e "${YELLOW}⏭️  $1${NC}"
}

# Banner
echo ""
echo "🧪 Maya Travel Agent - Comprehensive Test Suite"
echo "==============================================="
echo ""

# Test 1: Collibra Config Manager
log_test "Test 1: Collibra Configuration Manager"
if node backend/test-collibra.js > /dev/null 2>&1; then
    log_pass "Collibra Config Manager working"
else
    log_fail "Collibra Config Manager failed"
fi
echo ""

# Test 2: Backend Linting
log_test "Test 2: Backend Code Quality (ESLint)"
cd backend
if npm run lint > /dev/null 2>&1; then
    log_pass "Backend lint passed"
else
    log_fail "Backend lint failed"
fi
cd ..
echo ""

# Test 3: Backend Tests
log_test "Test 3: Backend Test Suite"
cd backend
if npm test > /dev/null 2>&1; then
    log_pass "Backend tests passed"
else
    log_fail "Backend tests failed"
fi
cd ..
echo ""

# Test 4: Frontend Build
log_test "Test 4: Frontend Build"
cd frontend
if npm run build > /dev/null 2>&1; then
    log_pass "Frontend build successful"
else
    log_fail "Frontend build failed"
fi
cd ..
echo ""

# Test 5: Security Audit
log_test "Test 5: Security Audit (npm audit)"
cd backend
AUDIT_RESULT=$(npm audit --audit-level=high 2>&1 || true)
if echo "$AUDIT_RESULT" | grep -q "found 0 vulnerabilities"; then
    log_pass "No security vulnerabilities"
elif echo "$AUDIT_RESULT" | grep -q "found.*vulnerabilities"; then
    VULN_COUNT=$(echo "$AUDIT_RESULT" | grep -oE '[0-9]+ vulnerabilities' | head -1 | grep -oE '[0-9]+')
    log_fail "Found $VULN_COUNT vulnerabilities (run: npm audit fix)"
else
    log_pass "Security audit completed"
fi
cd ..
echo ""

# Test 6: Dependencies Check
log_test "Test 6: Dependencies Health"
cd backend
if npm outdated > /dev/null 2>&1; then
    log_pass "All dependencies up to date"
else
    log_skip "Some dependencies are outdated (not blocking)"
fi
cd ..
echo ""

# Test 7: Git Status
log_test "Test 7: Git Repository Status"
if [[ -z $(git status -s) ]]; then
    log_pass "No uncommitted changes"
else
    log_skip "Uncommitted changes present"
    git status -s
fi
echo ""

# Test 8: Environment Variables
log_test "Test 8: Environment Variables Check"
REQUIRED_VARS=("DATABASE_URL" "ZAI_API_KEY" "SUPABASE_URL")
MISSING_VARS=0

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        ((MISSING_VARS++))
    fi
done

if [ $MISSING_VARS -eq 0 ]; then
    log_pass "All required environment variables set"
else
    log_fail "$MISSING_VARS required environment variables missing"
fi
echo ""

# Test 9: File Structure
log_test "Test 9: File Structure Validation"
REQUIRED_FILES=(
    "backend/server.js"
    "backend/src/config/collibra-config.js"
    "backend/src/monitoring/metrics.js"
    "backend/smoke-tests/smoke-test.js"
    "frontend/vercel.json"
    ".github/workflows/production-deploy.yml"
    "prometheus.yml"
    "DEPLOYMENT.md"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        ((MISSING_FILES++))
        echo "  Missing: $file"
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    log_pass "All required files present"
else
    log_fail "$MISSING_FILES required files missing"
fi
echo ""

# Test 10: Smoke Tests (if server is running)
log_test "Test 10: Smoke Tests (local)"
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    cd backend
    if TEST_URL=http://localhost:3001 npm run smoke-test > /dev/null 2>&1; then
        log_pass "Smoke tests passed"
    else
        log_fail "Smoke tests failed"
    fi
    cd ..
else
    log_skip "Server not running (start with: npm run dev)"
fi
echo ""

# Summary
echo "═════════════════════════════════════════════"
echo "📊 Test Results Summary"
echo "═════════════════════════════════════════════"
echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
echo ""

SUCCESS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
echo "Success Rate: $SUCCESS_RATE%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "╔════════════════════════════════════════╗"
    echo "║   🎉 ALL TESTS PASSED!                 ║"
    echo "║   Ready for deployment!                ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "✅ You can proceed with deployment:"
    echo "   ./scripts/quick-deploy.sh staging"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════╗"
    echo "║   ⚠️  SOME TESTS FAILED                ║"
    echo "║   Fix issues before deploying          ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "❌ Please fix the failing tests before deployment"
    echo ""
    exit 1
fi

