#!/bin/bash
# System Cleanup Script to Free Up Resources

echo "🧹 Cleaning up system resources..."
echo ""

# Kill processes on common development ports
echo "1️⃣ Killing processes on common ports..."
lsof -ti:3000,3001,5000,5001,8000,8080,4000,4001 2>/dev/null | xargs kill -9 2>/dev/null || echo "  ✓ No processes found on development ports"

# Find and kill orphaned node dev servers (not MCP or Cursor extensions)
echo ""
echo "2️⃣ Checking for orphaned Node dev servers..."
ORPHANED=$(ps aux | grep -E 'vite|webpack-dev-server|react-scripts start' | grep -v grep | awk '{print $2}')
if [ ! -z "$ORPHANED" ]; then
    echo "  Found orphaned dev servers:"
    echo "$ORPHANED" | xargs kill -9 2>/dev/null
    echo "  ✓ Killed orphaned dev servers"
else
    echo "  ✓ No orphaned dev servers found"
fi

# Clean npm cache
echo ""
echo "3️⃣ Cleaning npm cache..."
npm cache clean --force > /dev/null 2>&1
echo "  ✓ npm cache cleaned"

# Check disk space
echo ""
echo "4️⃣ Checking disk space..."
df -h / | tail -1

# Show memory usage
echo ""
echo "5️⃣ Memory usage:"
top -l 1 -s 0 | grep PhysMem

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "💡 To fix Git warning in home directory:"
echo "   cd /Users/cryptojoker710"
echo "   git status  # Review changes"
echo "   git add .   # Stage changes (if you want to keep them)"
echo "   git reset --hard  # OR discard all changes (CAREFUL!)"

