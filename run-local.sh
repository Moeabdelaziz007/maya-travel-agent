#!/bin/bash
# Simple local development script - no Docker

echo "🚀 Starting Amrikyy locally on your laptop..."
echo ""

cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. You have: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🎯 Starting services..."
echo ""

# Start backend in background
echo "🔧 Starting backend on http://localhost:5000"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment
sleep 3

# Start frontend in background
echo "🎨 Starting frontend on http://localhost:3000"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "🌐 Open your browser to: http://localhost:3000"
echo ""
echo "📊 Backend API: http://localhost:5000"
echo "📊 Backend Health: http://localhost:5000/health"
echo ""
echo "🛑 To stop: Ctrl+C or run 'pkill -f \"npm run dev\"'"
echo ""
echo "📝 Logs:"
echo "   Frontend: tail -f frontend.log"
echo "   Backend: tail -f backend.log"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID 2>/dev/null; kill $FRONTEND_PID 2>/dev/null; echo '✅ Stopped'; exit 0" INT

# Keep running
wait
