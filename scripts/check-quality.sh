#!/bin/bash

# Maya Travel Agent - Code Quality Check Script
# Version: 1.0.0
# Description: Automated code quality checks for the entire project

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

# Global variables
FAILED_CHECKS=0
PASSED_CHECKS=0

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Run check with logging
run_check() {
    local check_name="$1"
    local command="$2"
    local error_message="${3:-Check failed}"

    log_info "Running $check_name..."

    if eval "$command" >/dev/null 2>&1; then
        log_success "$check_name passed"
        ((PASSED_CHECKS++))
        return 0
    else
        log_error "$check_name failed: $error_message"
        ((FAILED_CHECKS++))
        return 1
    fi
}

# Check Node.js version
check_node_version() {
    log_info "Checking Node.js version..."

    if ! command_exists node; then
        log_error "Node.js is not installed"
        return 1
    fi

    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version $NODE_VERSION is too old. Please use Node.js v18 or higher."
        return 1
    fi

    log_success "Node.js $(node -v) is compatible"
}

# Check npm version
check_npm_version() {
    log_info "Checking npm version..."

    if ! command_exists npm; then
        log_error "npm is not installed"
        return 1
    fi

    NPM_VERSION=$(npm -v | cut -d '.' -f 1)
    if [ "$NPM_VERSION" -lt 8 ]; then
        log_warning "npm version $(npm -v) is old. Consider upgrading to npm v8 or higher."
    fi

    log_success "npm $(npm -v) is available"
}

# Check Git repository
check_git_repository() {
    log_info "Checking Git repository..."

    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        return 1
    fi

    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Working directory has uncommitted changes"
    fi

    log_success "Git repository is valid"
}

# Check frontend type safety
check_frontend_types() {
    log_info "Checking frontend TypeScript types..."

    if [ ! -d "frontend" ]; then
        log_warning "Frontend directory not found"
        return 0
    fi

    cd frontend

    run_check "TypeScript compilation" "npm run type-check" "TypeScript compilation failed"

    cd ..
}

# Check frontend linting
check_frontend_linting() {
    log_info "Checking frontend code linting..."

    if [ ! -d "frontend" ]; then
        log_warning "Frontend directory not found"
        return 0
    fi

    cd frontend

    run_check "ESLint" "npm run lint" "Linting issues found"

    cd ..
}

# Check frontend formatting
check_frontend_formatting() {
    log_info "Checking frontend code formatting..."

    if [ ! -d "frontend" ]; then
        log_warning "Frontend directory not found"
        return 0
    fi

    cd frontend

    run_check "Prettier formatting" "npm run format:check" "Formatting issues found"

    cd ..
}

# Check frontend tests
check_frontend_tests() {
    log_info "Checking frontend tests..."

    if [ ! -d "frontend" ]; then
        log_warning "Frontend directory not found"
        return 0
    fi

    cd frontend

    run_check "Unit tests" "npm run test" "Some tests are failing"

    cd ..
}

# Check frontend build
check_frontend_build() {
    log_info "Checking frontend build..."

    if [ ! -d "frontend" ]; then
        log_warning "Frontend directory not found"
        return 0
    fi

    cd frontend

    run_check "Production build" "npm run build" "Build failed"

    cd ..
}

# Check backend linting
check_backend_linting() {
    log_info "Checking backend code linting..."

    if [ ! -d "backend" ]; then
        log_warning "Backend directory not found"
        return 0
    fi

    cd backend

    if [ -f "package.json" ]; then
        run_check "Backend linting" "npm run lint" "Backend linting issues found"
    else
        log_warning "Backend package.json not found"
    fi

    cd ..
}

# Check backend tests
check_backend_tests() {
    log_info "Checking backend tests..."

    if [ ! -d "backend" ]; then
        log_warning "Backend directory not found"
        return 0
    fi

    cd backend

    if [ -f "package.json" ]; then
        run_check "Backend tests" "npm run test" "Backend tests are failing"
    else
        log_warning "Backend package.json not found"
    fi

    cd ..
}

# Check backend build
check_backend_build() {
    log_info "Checking backend build..."

    if [ ! -d "backend" ]; then
        log_warning "Backend directory not found"
        return 0
    fi

    cd backend

    if [ -f "package.json" ]; then
        run_check "Backend build" "npm run build" "Backend build failed"
    else
        log_warning "Backend package.json not found"
    fi

    cd ..
}

# Check dependency vulnerabilities
check_security_audit() {
    log_info "Checking security vulnerabilities..."

    # Check root dependencies
    if [ -f "package.json" ]; then
        run_check "Root dependencies audit" "npm audit --audit-level high" "High severity vulnerabilities found"
    fi

    # Check frontend dependencies
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        cd frontend
        run_check "Frontend dependencies audit" "npm audit --audit-level high" "High severity vulnerabilities found in frontend"
        cd ..
    fi

    # Check backend dependencies
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        cd backend
        run_check "Backend dependencies audit" "npm audit --audit-level high" "High severity vulnerabilities found in backend"
        cd ..
    fi
}

# Check for outdated dependencies
check_outdated_dependencies() {
    log_info "Checking for outdated dependencies..."

    if command_exists npm; then
        # Check root
        if [ -f "package.json" ]; then
            OUTDATED=$(npm outdated 2>/dev/null | wc -l)
            if [ "$OUTDATED" -gt 0 ]; then
                log_warning "Found $OUTDATED outdated root dependencies"
            else
                log_success "All root dependencies are up to date"
            fi
        fi

        # Check frontend
        if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
            cd frontend
            OUTDATED=$(npm outdated 2>/dev/null | wc -l)
            if [ "$OUTDATED" -gt 0 ]; then
                log_warning "Found $OUTDATED outdated frontend dependencies"
            else
                log_success "All frontend dependencies are up to date"
            fi
            cd ..
        fi

        # Check backend
        if [ -d "backend" ] && [ -f "backend/package.json" ]; then
            cd backend
            OUTDATED=$(npm outdated 2>/dev/null | wc -l)
            if [ "$OUTDATED" -gt 0 ]; then
                log_warning "Found $OUTDATED outdated backend dependencies"
            else
                log_success "All backend dependencies are up to date"
            fi
            cd ..
        fi
    fi
}

# Check bundle size (if build exists)
check_bundle_size() {
    log_info "Checking bundle size..."

    if [ -d "frontend/dist" ]; then
        BUNDLE_SIZE=$(du -sb frontend/dist | cut -f1)
        BUNDLE_SIZE_MB=$((BUNDLE_SIZE / 1024 / 1024))

        if [ "$BUNDLE_SIZE_MB" -gt 5 ]; then
            log_warning "Bundle size is $BUNDLE_SIZE_MB MB (larger than recommended 5MB)"
        else
            log_success "Bundle size is $BUNDLE_SIZE_MB MB"
        fi
    else
        log_warning "No build found. Run 'npm run build' first to check bundle size."
    fi
}

# Check for TODO comments
check_todo_comments() {
    log_info "Checking for TODO comments..."

    TODO_COUNT=$(find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | xargs grep -l "TODO\|FIXME\|HACK" 2>/dev/null | wc -l)

    if [ "$TODO_COUNT" -gt 0 ]; then
        log_warning "Found $TODO_COUNT files with TODO/FIXME/HACK comments"
    else
        log_success "No TODO/FIXME/HACK comments found"
    fi
}

# Check for console.log statements in production code
check_console_logs() {
    log_info "Checking for console.log statements..."

    CONSOLE_COUNT=$(find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v ".test." | grep -v ".spec." | xargs grep -l "console\.log" 2>/dev/null | wc -l)

    if [ "$CONSOLE_COUNT" -gt 0 ]; then
        log_warning "Found $CONSOLE_COUNT files with console.log statements"
    else
        log_success "No console.log statements found in production code"
    fi
}

# Generate quality report
generate_report() {
    echo ""
    echo "📊 Code Quality Report"
    echo "======================"
    echo "✅ Passed checks: $PASSED_CHECKS"
    echo "❌ Failed checks: $FAILED_CHECKS"
    echo "📈 Success rate: $(echo "scale=1; $PASSED_CHECKS * 100 / ($PASSED_CHECKS + $FAILED_CHECKS)" | bc -l)%"

    if [ $FAILED_CHECKS -eq 0 ]; then
        log_success "All quality checks passed! 🎉"
        echo ""
        echo "🚀 Your code is ready for deployment!"
    else
        log_error "Some quality checks failed. Please fix the issues above."
        echo ""
        echo "🔧 Common fixes:"
        echo "   - Run 'npm run lint:fix' to fix linting issues"
        echo "   - Run 'npm run format' to fix formatting"
        echo "   - Update outdated dependencies: 'npm update'"
        echo "   - Remove console.log statements from production code"
        echo "   - Address TODO/FIXME comments"
        return 1
    fi
}

# Main function
main() {
    echo "🔍 Maya Travel Agent - Code Quality Check"
    echo "=========================================="

    # Basic checks
    check_node_version
    check_npm_version
    check_git_repository

    # Frontend checks
    check_frontend_types
    check_frontend_linting
    check_frontend_formatting
    check_frontend_tests
    check_frontend_build

    # Backend checks
    check_backend_linting
    check_backend_tests
    check_backend_build

    # Security and maintenance
    check_security_audit
    check_outdated_dependencies
    check_bundle_size
    check_todo_comments
    check_console_logs

    # Generate report
    generate_report
}

# Handle script arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Maya Travel Agent - Code Quality Check"
        echo ""
        echo "Usage: $0 [CHECK_TYPE]"
        echo ""
        echo "Check Types:"
        echo "  (none)     - Run all quality checks"
        echo "  frontend   - Run only frontend checks"
        echo "  backend    - Run only backend checks"
        echo "  security   - Run only security checks"
        echo "  help       - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0              # Run all checks"
        echo "  $0 frontend     # Check only frontend"
        echo "  $0 security     # Check only security"
        echo ""
        exit 0
        ;;
    "frontend")
        check_frontend_types
        check_frontend_linting
        check_frontend_formatting
        check_frontend_tests
        check_frontend_build
        ;;
    "backend")
        check_backend_linting
        check_backend_tests
        check_backend_build
        ;;
    "security")
        check_security_audit
        check_outdated_dependencies
        ;;
    *)
        main
        ;;
esac