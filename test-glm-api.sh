#!/bin/bash

##############################################################################
# Test Z.ai GLM-4.6 API Connection
# Quick test script to verify your API key and connection
##############################################################################

set -e

echo "========================================"
echo "Testing Z.ai GLM-4.6 API Connection"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if API key is provided
if [ -z "$1" ]; then
    if [ -z "$ANTHROPIC_AUTH_TOKEN" ]; then
        print_error "No API key provided"
        echo ""
        echo "Usage: ./test-glm-api.sh YOUR_API_KEY"
        echo "   OR: Set ANTHROPIC_AUTH_TOKEN environment variable"
        exit 1
    else
        API_KEY="$ANTHROPIC_AUTH_TOKEN"
        print_info "Using API key from ANTHROPIC_AUTH_TOKEN"
    fi
else
    API_KEY="$1"
    print_info "Using API key from command line argument"
fi

echo ""
print_info "API Key: ${API_KEY:0:20}..."
echo ""

# Test the API
print_info "Sending test request to GLM-4.6..."
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST https://api.z.ai/api/anthropic/v1/messages \
    -H "x-api-key: $API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d '{
      "model": "glm-4.6",
      "max_tokens": 100,
      "messages": [{"role": "user", "content": "Write a simple hello world function in Python"}]
    }')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "========================================"
echo "Test Results"
echo "========================================"
echo ""

if [ "$http_code" = "200" ]; then
    print_success "Connection successful! (HTTP 200)"
    echo ""
    print_success "GLM-4.6 is responding correctly"
    echo ""
    echo "Response preview:"
    echo "---"
    echo "$body" | jq -r '.content[0].text // .content // .' 2>/dev/null || echo "$body"
    echo "---"
    echo ""
    print_success "Your Z.ai API key is working!"
    print_success "Your GLM Coding Plan quota is active"
else
    print_error "Connection failed (HTTP $http_code)"
    echo ""
    echo "Error details:"
    echo "---"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo "---"
    echo ""
    echo "Common issues:"
    echo "  • Invalid API key"
    echo "  • Quota exhausted (Lite: ~120 prompts/5hrs)"
    echo "  • Subscription inactive"
    echo "  • Network connectivity"
    echo ""
    echo "Check your subscription at: https://api.z.ai"
    exit 1
fi

echo ""
echo "========================================"
print_success "Test completed successfully!"
echo "========================================"
echo ""
echo "You can now use GLM-4.6 in Cursor IDE!"
echo ""

