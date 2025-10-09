#!/bin/bash

# Start All Services - Frontend, Backend, and AI Tools
echo "🚀 Starting Maya Travel Agent - All Services"
echo "============================================="

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill 0
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: frontend or backend directory not found. Please run this script from the project root."
    exit 1
fi

# Create logs directory
mkdir -p logs

echo "📋 Starting services in background..."
echo "====================================="

# Start backend in background
echo "🌐 Starting backend server..."
./start-backend.sh > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait a moment for backend to initialize
sleep 3

# Start frontend in background
echo "🌍 Starting frontend server..."
./start-frontend.sh > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait a moment for frontend to initialize
sleep 2

echo ""
echo "🎉 All services started successfully!"
echo "====================================="
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Backend:  http://localhost:8000"
echo ""
echo "📊 Service Status:"
echo "   Backend log:  logs/backend.log"
echo "   Frontend log: logs/frontend.log"
echo ""
echo "💡 Useful commands:"
echo "   View backend logs:  tail -f logs/backend.log"
echo "   View frontend logs: tail -f logs/frontend.log"
echo "   Stop all services: Ctrl+C"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for background processes
wait