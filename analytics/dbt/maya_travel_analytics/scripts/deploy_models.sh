#!/bin/bash

# Amrikyy Travel Agent dbt Models Deployment Script
# This script automates the deployment of analytics models

set -e  # Exit on any error

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"
LOG_FILE="$PROJECT_DIR/logs/deploy_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    log "ERROR: $1"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}$1${NC}"
    log "SUCCESS: $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}Warning: $1${NC}"
    log "WARNING: $1"
}

# Check if environment file exists
check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        error_exit "Environment file not found: $ENV_FILE"
    fi

    # Load environment variables
    source "$ENV_FILE"

    # Validate required environment variables
    if [[ -z "$DB_HOST" || -z "$DB_USER" || -z "$DB_PASSWORD" ]]; then
        error_exit "Required database environment variables not set"
    fi

    success "Environment configuration validated"
}

# Install dbt dependencies
install_dependencies() {
    log "Installing dbt dependencies..."
    cd "$PROJECT_DIR"

    if ! dbt deps; then
        error_exit "Failed to install dbt dependencies"
    fi

    success "Dependencies installed successfully"
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    cd "$PROJECT_DIR"

    if ! dbt debug --target dev; then
        error_exit "Database connection test failed"
    fi

    success "Database connection test passed"
}

# Run data quality tests
run_tests() {
    log "Running data quality tests..."
    cd "$PROJECT_DIR"

    if ! dbt test --target dev; then
        warning "Some data quality tests failed. Check logs for details."
        return 1
    fi

    success "All data quality tests passed"
}

# Deploy models
deploy_models() {
    local target=${1:-dev}
    log "Deploying models to $target environment..."
    cd "$PROJECT_DIR"

    # Run models in dependency order
    if ! dbt run --target "$target" --models staging; then
        error_exit "Failed to deploy staging models"
    fi

    if ! dbt run --target "$target" --models intermediate; then
        error_exit "Failed to deploy intermediate models"
    fi

    if ! dbt run --target "$target" --models marts; then
        error_exit "Failed to deploy mart models"
    fi

    success "All models deployed successfully to $target"
}

# Generate documentation
generate_docs() {
    log "Generating model documentation..."
    cd "$PROJECT_DIR"

    if ! dbt docs generate --target dev; then
        warning "Failed to generate documentation"
    else
        success "Documentation generated successfully"
    fi
}

# Main deployment process
main() {
    log "Starting Amrikyy Travel Agent dbt models deployment..."

    # Pre-deployment checks
    check_env_file
    install_dependencies
    test_connection

    # Run tests before deployment
    if ! run_tests; then
        warning "Tests failed, but continuing with deployment..."
    fi

    # Deploy models
    deploy_models "dev"

    # Generate documentation
    generate_docs

    success "Deployment completed successfully!"
    log "Deployment log saved to: $LOG_FILE"
    echo "View deployment log: $LOG_FILE"
}

# Handle script arguments
case "${1:-}" in
    "test")
        check_env_file
        test_connection
        run_tests
        ;;
    "deploy")
        main
        ;;
    "docs")
        check_env_file
        cd "$PROJECT_DIR"
        dbt docs generate && dbt docs serve
        ;;
    *)
        echo "Usage: $0 {test|deploy|docs}"
        echo "  test   - Run tests only"
        echo "  deploy - Full deployment (default)"
        echo "  docs   - Generate and serve documentation"
        exit 1
        ;;
esac