#!/bin/bash

# Maya Travel Agent - Local Development Setup
# This script sets up the development environment locally without Docker

set -e

echo "🚀 Setting up Maya Travel Agent - Local Development Environment"
echo "================================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    echo "   Visit: https://python.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_NODE="18.0.0"
if ! [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"
echo "✅ Python version: $(python3 --version)"

# Create virtual environment for Python
echo "🐍 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
echo "📦 Installing Python dependencies..."
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt
else
    echo "⚠️  backend/requirements.txt not found, installing basic dependencies..."
    pip install fastapi uvicorn python-multipart aiofiles jinja2
fi

# Install Node.js dependencies for frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install Node.js dependencies for backend (if any)
echo "📦 Installing backend Node.js dependencies..."
cd backend
if [ -f "package.json" ]; then
    npm install
fi
cd ..

# Create environment files
echo "🔧 Setting up environment files..."

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    cp frontend/env.example frontend/.env 2>/dev/null || echo "⚠️  frontend/env.example not found"
fi

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env 2>/dev/null || echo "⚠️  backend/env.example not found"
fi

# Create logs directory
mkdir -p logs

# Setup complete
echo ""
echo "🎉 Local development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables in frontend/.env and backend/.env"
echo "2. Run 'npm run dev' in frontend/ directory to start the frontend"
echo "3. Run 'python app.py' in backend/ directory to start the backend"
echo "4. Or use the convenience scripts:"
echo "   - ./start-frontend.sh"
echo "   - ./start-backend.sh"
echo "   - ./start-all.sh"
echo ""
echo "🔗 Useful commands:"
echo "- Frontend: cd frontend && npm run dev"
echo "- Backend: cd backend && python app.py"
echo "- Tests: cd frontend && npm test"
echo "- Lint: cd frontend && npm run lint"
echo ""
echo "📚 Documentation:"
echo "- README.md for project overview"
echo "- frontend/README.md for frontend setup"
echo "- backend/README.md for backend setup"
