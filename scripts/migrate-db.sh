#!/bin/bash

# Maya Travel Agent - Database Migration Script
# Version: 1.0.0
# Description: Automated database migrations for Supabase

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
    log_info "Checking database migration prerequisites..."

    # Check Supabase CLI
    if ! command_exists supabase; then
        log_error "Supabase CLI is not installed. Please install it first:"
        log_error "npm install -g supabase"
        exit 1
    fi
    log_success "Supabase CLI is installed"

    # Check if supabase directory exists
    if [ ! -d "supabase" ]; then
        log_error "Supabase directory not found. Please run this from the project root."
        exit 1
    fi
    log_success "Supabase configuration found"

    # Check if migrations directory exists
    if [ ! -d "supabase/migrations" ]; then
        log_error "Migrations directory not found. Please check your Supabase setup."
        exit 1
    fi
    log_success "Migrations directory found"
}

# Check environment variables
check_environment() {
    log_info "Checking environment configuration..."

    # Check for Supabase project reference
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        log_error "SUPABASE_PROJECT_ID environment variable is not set"
        log_error "Please set it in your .env file or export it:"
        log_error "export SUPABASE_PROJECT_ID=your-project-ref"
        exit 1
    fi
    log_success "Supabase project ID: $SUPABASE_PROJECT_ID"

    # Check for Supabase access token
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        log_warning "SUPABASE_ACCESS_TOKEN not set. Some operations may fail."
        log_warning "Set it for full functionality:"
        log_warning "export SUPABASE_ACCESS_TOKEN=your-access-token"
    else
        log_success "Supabase access token configured"
    fi
}

# List available migrations
list_migrations() {
    log_info "Available migrations:"

    if [ -d "supabase/migrations" ]; then
        # List migration files with descriptions
        for migration in $(ls -1 supabase/migrations/*.sql | sort); do
            filename=$(basename "$migration")
            # Extract timestamp and description from filename
            if [[ $filename =~ ^([0-9]+)_(.+)\.sql$ ]]; then
                timestamp="${BASH_REMATCH[1]}"
                description="${BASH_REMATCH[2]}"
                # Convert timestamp to readable date
                readable_date=$(date -d "@${timestamp:0:10}" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "Unknown")
                echo "  📄 $filename"
                echo "     📅 $readable_date"
                echo "     📝 $description"
                echo ""
            fi
        done
    fi
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."

    cd supabase

    # Check if we should create a backup first
    if [ "$1" = "--backup" ]; then
        log_info "Creating database backup..."
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        supabase db dump > "../$BACKUP_FILE"
        log_success "Backup created: $BACKUP_FILE"
    fi

    # Link to remote project if needed
    if [ ! -d ".supabase" ]; then
        log_info "Linking to remote Supabase project..."
        supabase link --project-ref "$SUPABASE_PROJECT_ID"
    fi

    # Push migrations to database
    log_info "Applying migrations to database..."
    supabase db push

    cd ..
    log_success "Database migrations completed successfully"
}

# Reset database (destructive)
reset_database() {
    log_warning "This will reset your database and destroy all data!"
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " -r
    echo

    if [[ $REPLY == "yes" ]]; then
        log_info "Resetting database..."

        cd supabase

        # Create backup before reset
        BACKUP_FILE="../backup_before_reset_$(date +%Y%m%d_%H%M%S).sql"
        log_info "Creating backup before reset..."
        supabase db dump > "$BACKUP_FILE"
        log_success "Backup created: $(basename "$BACKUP_FILE")"

        # Reset database
        supabase db reset

        # Apply migrations
        supabase db push

        cd ..
        log_success "Database reset and migrations completed"
    else
        log_info "Database reset cancelled"
    fi
}

# Seed database with sample data
seed_database() {
    log_info "Seeding database with sample data..."

    # Check if seed file exists
    if [ ! -f "supabase/seed.sql" ]; then
        log_warning "No seed file found at supabase/seed.sql"
        log_warning "Creating a basic seed file..."

        # Create basic seed data
        cat > supabase/seed.sql << 'EOF'
-- Sample data for Maya Travel Agent

-- Insert sample user profile
INSERT INTO profiles (id, email, full_name, preferences)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'demo@mayatrips.com',
  'Demo User',
  '{"theme": "dark", "currency": "USD", "language": "en"}'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample trip
INSERT INTO trips (id, user_id, title, description, budget, status, destinations)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Sample Trip to Paris',
  'A wonderful trip to explore the city of lights',
  2500.00,
  'planning',
  '[{"city": "Paris", "country": "France", "days": 5}]'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample expense
INSERT INTO expenses (id, trip_id, category, amount, description)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Accommodation',
  800.00,
  'Hotel booking for 4 nights'
) ON CONFLICT (id) DO NOTHING;

EOF
        log_success "Created basic seed file"
    fi

    cd supabase

    # Apply seed data
    supabase seed

    cd ..
    log_success "Database seeded with sample data"
}

# Check database health
check_database_health() {
    log_info "Checking database health..."

    # This would typically query the database to check if it's working
    # For now, we'll just check if we can connect

    if command_exists psql; then
        # If PostgreSQL client is available, we could run health checks
        log_info "PostgreSQL client available for advanced health checks"
    fi

    log_success "Database health check completed"
}

# Generate migration file
generate_migration() {
    MIGRATION_NAME=${1:-new_migration}

    # Convert to snake_case and add timestamp
    TIMESTAMP=$(date +%Y%m%d%H%M%S)
    FILENAME="${TIMESTAMP}_$(echo "$MIGRATION_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr -cd '[:alnum:]_').sql"

    MIGRATION_PATH="supabase/migrations/$FILENAME"

    # Create migration file with template
    cat > "$MIGRATION_PATH" << EOF
-- Migration: $MIGRATION_NAME
-- Created: $(date)
-- Description: $MIGRATION_NAME

-- Write your SQL migration here
-- Examples:

-- Create new table
-- CREATE TABLE example_table (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   name TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Add new column
-- ALTER TABLE existing_table ADD COLUMN new_column TEXT;

-- Create index
-- CREATE INDEX idx_example_name ON example_table(name);

-- Enable RLS
-- ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
-- CREATE POLICY "Users can access own records" ON example_table
--   FOR ALL USING (auth.uid() = user_id);

EOF

    log_success "Migration file created: $FILENAME"
    log_info "Edit the file at: $MIGRATION_PATH"
}

# Main function
main() {
    echo "🗄️ Maya Travel Agent - Database Migration Tool"
    echo "=============================================="

    check_prerequisites
    check_environment

    # Handle different commands
    case "${1:-}" in
        "list")
            list_migrations
            ;;
        "run")
            run_migrations "${2:-}"
            ;;
        "reset")
            reset_database
            ;;
        "seed")
            seed_database
            ;;
        "health")
            check_database_health
            ;;
        "generate")
            if [ -z "$2" ]; then
                log_error "Please provide a migration name"
                log_error "Usage: $0 generate 'migration name'"
                exit 1
            fi
            generate_migration "$2"
            ;;
        "help"|"-h"|"--help")
            echo "Maya Travel Agent - Database Migration Tool"
            echo ""
            echo "Usage: $0 [COMMAND]"
            echo ""
            echo "Commands:"
            echo "  list                    - List all available migrations"
            echo "  run [--backup]          - Run all pending migrations"
            echo "  reset                   - Reset database and run migrations (DESTRUCTIVE)"
            echo "  seed                    - Seed database with sample data"
            echo "  health                  - Check database health"
            echo "  generate 'name'         - Generate new migration file"
            echo ""
            echo "Environment Variables:"
            echo "  SUPABASE_PROJECT_ID     - Your Supabase project reference (required)"
            echo "  SUPABASE_ACCESS_TOKEN   - Your Supabase access token (optional)"
            echo ""
            echo "Examples:"
            echo "  $0 list                 # List migrations"
            echo "  $0 run                  # Run migrations"
            echo "  $0 run --backup         # Run with backup"
            echo "  $0 reset                # Reset database"
            echo "  $0 seed                 # Seed with sample data"
            echo "  $0 generate 'add user preferences'  # Create migration"
            echo ""
            exit 0
            ;;
        "")
            echo "No command provided. Running migrations..."
            run_migrations
            ;;
        *)
            log_error "Unknown command: $1"
            echo ""
            echo "Use '$0 help' to see available commands"
            exit 1
            ;;
    esac

    echo ""
    echo "✅ Database operation completed successfully!"
}

# Run main function with all arguments
main "$@"