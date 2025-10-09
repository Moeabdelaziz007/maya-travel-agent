#!/bin/bash

# Start Frontend Development Server
echo "🚀 Starting Maya Travel Agent Frontend..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Check if .env exists
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env not found. Copying from example..."
    cp frontend/env.example frontend/.env 2>/dev/null || echo "⚠️  frontend/env.example not found. Please create frontend/.env manually."
fi

# Start the development server
echo "🌐 Starting frontend development server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

cd frontend
npm run dev