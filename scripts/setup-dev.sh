#!/bin/bash

# Maya Travel Agent - Development Environment Setup Script
# Version: 1.0.0
# Description: Automated setup for development environment

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

# Prerequisites check
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version $NODE_VERSION is too old. Please use Node.js v18 or higher."
        exit 1
    fi
    log_success "Node.js $(node -v) is installed"

    # Check npm
    if ! command_exists npm; then
        log_error "npm is not installed. Please install npm."
        exit 1
    fi
    log_success "npm $(npm -v) is installed"

    # Check Git
    if ! command_exists git; then
        log_error "Git is not installed. Please install Git."
        exit 1
    fi
    log_success "Git $(git --version) is installed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    # Install root dependencies
    if [ -f "package.json" ]; then
        log_info "Installing root dependencies..."
        npm install
        log_success "Root dependencies installed"
    fi

    # Install frontend dependencies
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        log_info "Installing frontend dependencies..."
        cd frontend
        npm install --legacy-peer-deps
        cd ..
        log_success "Frontend dependencies installed"
    fi

    # Install backend dependencies
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        log_info "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        log_success "Backend dependencies installed"
    fi
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment files..."

    # Frontend environment
    if [ -f "frontend/env.example" ] && [ ! -f "frontend/.env.local" ]; then
        cp frontend/env.example frontend/.env.local
        log_success "Created frontend/.env.local from env.example"
        log_warning "Please update frontend/.env.local with your actual API keys and configuration"
    fi

    # Backend environment
    if [ -f "backend/env.example" ] && [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        log_success "Created backend/.env from env.example"
        log_warning "Please update backend/.env with your actual API keys and configuration"
    fi

    # Supabase config
    if [ -d "supabase" ] && [ -f "supabase/config.toml" ]; then
        log_info "Supabase configuration found"
    fi
}

# Setup Git hooks
setup_git_hooks() {
    log_info "Setting up Git hooks..."

    if [ -f "package.json" ]; then
        # Initialize husky if available
        if npm list husky >/dev/null 2>&1; then
            npm run prepare
            log_success "Git hooks initialized"
        else
            log_warning "Husky not found. Git hooks not initialized."
        fi
    fi
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."

    # Check if frontend can build
    if [ -d "frontend" ]; then
        cd frontend
        log_info "Checking frontend build..."
        npm run type-check
        log_success "Frontend type checking passed"
        cd ..
    fi

    # Check if backend can start
    if [ -d "backend" ]; then
        cd backend
        log_info "Checking backend configuration..."
        if [ -f "server.js" ]; then
            log_success "Backend server.js found"
        fi
        cd ..
    fi
}

# Create development shortcuts
create_dev_shortcuts() {
    log_info "Creating development shortcuts..."

    # Create start script if it doesn't exist
    if [ ! -f "start-dev.sh" ]; then
        cat > start-dev.sh << 'EOF'
#!/bin/bash
# Maya Travel Agent - Quick Development Start Script

echo "🚀 Starting Maya Travel Agent development servers..."
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:5000"
echo "📚 API Docs: http://localhost:5000/api/health"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
fi

# Start development servers
npm run dev
EOF
        chmod +x start-dev.sh
        log_success "Created start-dev.sh script"
    fi

    # Create stop script
    if [ ! -f "stop-dev.sh" ]; then
        cat > stop-dev.sh << 'EOF'
#!/bin/bash
# Maya Travel Agent - Stop Development Servers Script

echo "🛑 Stopping Maya Travel Agent development servers..."

# Kill processes on common ports
PORTS=(3000 5000 5173 8000)

for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Killing process on port $port"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

echo "✅ All development servers stopped"
EOF
        chmod +x stop-dev.sh
        log_success "Created stop-dev.sh script"
    fi
}

# Main execution
main() {
    echo "🏗️ Maya Travel Agent - Development Environment Setup"
    echo "=================================================="

    check_prerequisites
    install_dependencies
    setup_environment
    setup_git_hooks
    verify_installation
    create_dev_shortcuts

    echo ""
    echo "🎉 Development environment setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update environment files with your API keys:"
    echo "   - frontend/.env.local"
    echo "   - backend/.env"
    echo ""
    echo "2. Start development servers:"
    echo "   ./start-dev.sh"
    echo "   OR"
    echo "   npm run dev"
    echo ""
    echo "3. Open your browser:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo ""
    echo "4. Run tests:"
    echo "   cd frontend && npm run test"
    echo ""
    echo "5. Check code quality:"
    echo "   npm run check-quality"
    echo ""
    echo "📚 For more information, see PROJECT-WORKFLOW-GUIDE.md"
}

# Run main function
main "$@"