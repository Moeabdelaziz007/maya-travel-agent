#!/bin/bash

# WhatsApp Business API Test Script
# This script helps you test your WhatsApp integration

echo "🧪 WhatsApp Business API Test Suite"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Start it with: npm run dev${NC}"
    exit 1
fi
echo ""

# Test 1: Health Check
echo "🏥 Test 1: WhatsApp Health Check"
echo "--------------------------------"
response=$(curl -s http://localhost:5000/api/whatsapp/health)
echo "$response" | jq '.'

if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    if [ "$(echo "$response" | jq -r '.success')" = "true" ]; then
        echo -e "${GREEN}✅ WhatsApp is configured and healthy${NC}"
    else
        echo -e "${RED}❌ WhatsApp is not configured properly${NC}"
        echo ""
        echo "Please check your .env file for these variables:"
        echo "  - WHATSAPP_ACCESS_TOKEN"
        echo "  - WHATSAPP_PHONE_NUMBER_ID"
        echo "  - WHATSAPP_BUSINESS_ACCOUNT_ID"
        echo ""
        echo "See WHATSAPP_SETUP_GUIDE.md for setup instructions"
        exit 1
    fi
else
    echo -e "${RED}❌ Could not parse health check response${NC}"
    exit 1
fi
echo ""

# Test 2: Send Test Message (optional)
echo "📤 Test 2: Send Test Message"
echo "---------------------------"
read -p "Enter phone number to test (with country code, no +): " phone_number

if [ -z "$phone_number" ]; then
    echo -e "${YELLOW}⏭️  Skipped (no phone number provided)${NC}"
else
    echo "Sending test message to $phone_number..."
    response=$(curl -s -X POST http://localhost:5000/api/whatsapp/test \
        -H "Content-Type: application/json" \
        -d "{\"to\":\"$phone_number\",\"message\":\"🧪 This is a test message from Maya! 🌍\"}")
    
    echo "$response" | jq '.'
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        if [ "$(echo "$response" | jq -r '.success')" = "true" ]; then
            echo -e "${GREEN}✅ Message sent successfully!${NC}"
            echo "Message ID: $(echo "$response" | jq -r '.messageId')"
        else
            echo -e "${RED}❌ Failed to send message${NC}"
            echo "Error: $(echo "$response" | jq -r '.error')"
        fi
    fi
fi
echo ""

# Test 3: AI Integration Check
echo "🤖 Test 3: AI Integration Check"
echo "-------------------------------"
ai_response=$(curl -s http://localhost:5000/api/ai/health)
echo "$ai_response" | jq '.'

if echo "$ai_response" | jq -e '.success' > /dev/null 2>&1; then
    if [ "$(echo "$ai_response" | jq -r '.success')" = "true" ]; then
        echo -e "${GREEN}✅ AI integration is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  AI may not be fully configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not check AI status${NC}"
fi
echo ""

# Test 4: Performance Stats
echo "📊 Test 4: Performance Statistics"
echo "--------------------------------"
perf_response=$(curl -s http://localhost:5000/api/ai/performance)

if echo "$perf_response" | jq -e '.success' > /dev/null 2>&1; then
    echo "Cache Stats:"
    echo "$perf_response" | jq '.performance.cache'
    echo ""
    echo "FlashAttention:"
    echo "$perf_response" | jq '.performance.flashAttention | {enabled, version, blockSize}'
    echo -e "${GREEN}✅ Performance monitoring active${NC}"
else
    echo -e "${YELLOW}⚠️  Performance stats not available${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Tests completed!"
echo ""
echo "Next steps:"
echo "1. Send a message to your WhatsApp Business number"
echo "2. Type: /start"
echo "3. Chat with Maya!"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: WHATSAPP_SETUP_GUIDE.md"
echo "   - AI Features: AI_FEATURES_QUICK_START.md"
echo ""
echo "🔍 Troubleshooting:"
echo "   - View logs: Check your terminal running 'npm run dev'"
echo "   - Health check: curl http://localhost:5000/api/whatsapp/health"
echo ""
