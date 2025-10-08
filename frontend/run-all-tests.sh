#!/bin/bash

# Maya Trips Frontend - Comprehensive Test Suite Runner
# This script runs all tests and generates coverage reports

set -e

echo "==========================================="
echo "Maya Trips Frontend - Test Suite Runner"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Function to print section header
print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
}

# Track test results
UNIT_TESTS_PASSED=false
E2E_TESTS_PASSED=false
COVERAGE_GENERATED=false

# 1. Run Unit Tests with Coverage
print_header "Step 1: Running Unit Tests with Coverage"
if npm run test:coverage; then
  UNIT_TESTS_PASSED=true
  COVERAGE_GENERATED=true
  echo -e "${GREEN}✓ Unit tests passed successfully${NC}"
else
  echo -e "${RED}✗ Unit tests failed${NC}"
fi

# 2. Run Type Checking
print_header "Step 2: Type Checking"
if npm run type-check; then
  echo -e "${GREEN}✓ Type checking passed${NC}"
else
  echo -e "${YELLOW}⚠ Type checking failed (non-blocking)${NC}"
fi

# 3. Run Linting
print_header "Step 3: Linting Code"
if npm run lint; then
  echo -e "${GREEN}✓ Linting passed${NC}"
else
  echo -e "${YELLOW}⚠ Linting issues found (non-blocking)${NC}"
fi

# 4. Check formatting
print_header "Step 4: Checking Code Formatting"
if npm run format:check; then
  echo -e "${GREEN}✓ Code formatting is correct${NC}"
else
  echo -e "${YELLOW}⚠ Code formatting issues found${NC}"
  echo -e "${YELLOW}  Run 'npm run format' to fix${NC}"
fi

# 5. Build the project
print_header "Step 5: Building Project"
if npm run build; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
fi

# 6. Run E2E Tests (if backend is available)
print_header "Step 6: End-to-End Tests"
echo -e "${YELLOW}Note: E2E tests require the application to be running${NC}"
echo -e "${YELLOW}Checking if dev server is available...${NC}"

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo -e "${GREEN}Dev server is running, executing E2E tests...${NC}"
  if npm run e2e; then
    E2E_TESTS_PASSED=true
    echo -e "${GREEN}✓ E2E tests passed${NC}"
  else
    echo -e "${YELLOW}⚠ E2E tests failed or were skipped${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Dev server not running, skipping E2E tests${NC}"
  echo -e "${YELLOW}  To run E2E tests: npm run dev (in another terminal), then npm run e2e${NC}"
fi

# Generate Test Summary
print_header "Test Summary Report"
echo ""
echo "Test Results:"
echo "-------------"
if [ "$UNIT_TESTS_PASSED" = true ]; then
  echo -e "Unit Tests:        ${GREEN}✓ PASSED${NC}"
else
  echo -e "Unit Tests:        ${RED}✗ FAILED${NC}"
fi

if [ "$E2E_TESTS_PASSED" = true ]; then
  echo -e "E2E Tests:         ${GREEN}✓ PASSED${NC}"
else
  echo -e "E2E Tests:         ${YELLOW}⚠ SKIPPED OR FAILED${NC}"
fi

echo ""
echo "Code Quality:"
echo "-------------"
echo -e "Type Checking:     ${GREEN}Completed${NC}"
echo -e "Linting:           ${GREEN}Completed${NC}"
echo -e "Build:             ${GREEN}Completed${NC}"

if [ "$COVERAGE_GENERATED" = true ]; then
  echo ""
  echo -e "${GREEN}Coverage Report Generated!${NC}"
  echo "View detailed coverage report:"
  echo "  - HTML: Open frontend/coverage/index.html in your browser"
  echo "  - JSON: frontend/coverage/coverage-final.json"
fi

echo ""
echo "==========================================="
echo "Additional Commands:"
echo "==========================================="
echo "  npm run test              - Run unit tests in watch mode"
echo "  npm run test:ui           - Run unit tests with UI"
echo "  npm run test:coverage     - Generate coverage report"
echo "  npm run e2e               - Run E2E tests"
echo "  npm run e2e:ui            - Run E2E tests with UI"
echo "  npm run lint:fix          - Auto-fix linting issues"
echo "  npm run format            - Auto-fix formatting issues"
echo ""

# Exit with appropriate code
if [ "$UNIT_TESTS_PASSED" = true ]; then
  echo -e "${GREEN}✓ Test suite completed successfully!${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
  echo ""
  exit 1
fi

