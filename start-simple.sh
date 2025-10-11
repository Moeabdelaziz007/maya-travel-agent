#!/bin/bash
# Ultra-simple startup - just what you need

echo "🚀 Starting Amrikyy on your laptop..."
echo ""

cd "$(dirname "$0")"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Install Node.js first: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Start backend
echo ""
echo "🔧 Starting backend..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Started!"
echo ""
echo "🌐 Open: http://localhost:3000"
echo ""
echo "🛑 Stop with: Ctrl+C"
echo ""

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '🛑 Stopped'" EXIT

# Keep running
wait
