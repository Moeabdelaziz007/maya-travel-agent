#!/bin/bash

echo "🧪 Testing Amrikyy Auth Pages"
echo "================================"
echo ""

# Set Vercel URL or use local
if [ -z "$VERCEL_URL" ]; then
  echo "📍 Testing locally at http://localhost:5000"
  export VERCEL_URL="http://localhost:5000"
else
  echo "📍 Testing Vercel deployment at $VERCEL_URL"
fi

echo ""
echo "🚀 Running Playwright E2E tests..."
echo ""

cd frontend

# Install Playwright if needed
if ! command -v playwright &> /dev/null; then
  echo "📦 Installing Playwright..."
  npx playwright install
fi

# Run the auth page tests
npx playwright test tests/e2e/auth-pages.spec.ts --reporter=list

echo ""
echo "✅ Tests complete!"

