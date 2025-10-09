#!/bin/bash

# Start Backend API Server
echo "🚀 Starting Maya Travel Agent Backend..."
echo "========================================="

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found. Please run this script from the project root."
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🐍 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies if requirements.txt exists
if [ -f "backend/requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r backend/requirements.txt
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Copying from example..."
    cp backend/env.example backend/.env 2>/dev/null || echo "⚠️  backend/env.example not found. Please create backend/.env manually."
fi

# Install Node.js dependencies for backend if package.json exists
if [ -f "backend/package.json" ]; then
    echo "📦 Installing backend Node.js dependencies..."
    cd backend
    npm install
    cd ..
fi

# Create logs directory
mkdir -p logs

# Start the backend server
echo "🌐 Starting backend API server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

cd backend
python app.py