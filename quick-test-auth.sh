#!/bin/bash

echo "🚀 Quick Auth Pages Test"
echo "========================"
echo ""

# Set your Vercel URL here
VERCEL_URL="${VERCEL_URL:-https://your-app.vercel.app}"

echo "Testing: $VERCEL_URL"
echo ""

# Test Login Page
echo "📄 Testing Login Page..."
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL/login.html")
if [ "$LOGIN_STATUS" == "200" ]; then
  echo "✅ Login page is accessible (HTTP $LOGIN_STATUS)"
  
  # Check for key content
  LOGIN_CONTENT=$(curl -s "$VERCEL_URL/login.html")
  if echo "$LOGIN_CONTENT" | grep -q "Welcome to Amrikyy"; then
    echo "✅ Login page content is correct"
  else
    echo "❌ Login page content is missing"
  fi
else
  echo "❌ Login page failed (HTTP $LOGIN_STATUS)"
fi

echo ""

# Test Signup Page
echo "📄 Testing Signup Page..."
SIGNUP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL/signup.html")
if [ "$SIGNUP_STATUS" == "200" ]; then
  echo "✅ Signup page is accessible (HTTP $SIGNUP_STATUS)"
  
  # Check for key content
  SIGNUP_CONTENT=$(curl -s "$VERCEL_URL/signup.html")
  if echo "$SIGNUP_CONTENT" | grep -q "Join Amrikyy"; then
    echo "✅ Signup page content is correct"
  else
    echo "❌ Signup page content is missing"
  fi
else
  echo "❌ Signup page failed (HTTP $SIGNUP_STATUS)"
fi

echo ""

# Test key features
echo "🔍 Checking page features..."

# Check for Tailwind CSS
if echo "$LOGIN_CONTENT" | grep -q "tailwindcss"; then
  echo "✅ Tailwind CSS loaded"
else
  echo "❌ Tailwind CSS not found"
fi

# Check for Feather Icons
if echo "$LOGIN_CONTENT" | grep -q "feather"; then
  echo "✅ Feather Icons loaded"
else
  echo "❌ Feather Icons not found"
fi

# Check for Unsplash images
if echo "$LOGIN_CONTENT" | grep -q "unsplash"; then
  echo "✅ Background images configured"
else
  echo "❌ Background images not found"
fi

# Check for AI Avatar
if echo "$LOGIN_CONTENT" | grep -q "dicebear"; then
  echo "✅ AI Avatar loaded"
else
  echo "❌ AI Avatar not found"
fi

echo ""
echo "✨ Test Summary Complete!"

