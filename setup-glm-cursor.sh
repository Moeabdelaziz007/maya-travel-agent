#!/bin/bash

##############################################################################
# GLM-4.6 Cursor IDE Setup Script
# Configures Z.ai GLM-4.6 integration for Cursor IDE on macOS
##############################################################################

set -e

echo "========================================"
echo "GLM-4.6 Cursor IDE Setup"
echo "========================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only"
    exit 1
fi

print_success "Running on macOS"
echo ""

# Step 1: Get API Key
echo "Step 1: Z.ai API Key Configuration"
echo "-----------------------------------"
echo ""

# Check if API key already exists in environment
if [ -n "$ANTHROPIC_AUTH_TOKEN" ]; then
    print_warning "ANTHROPIC_AUTH_TOKEN already set in environment"
    echo "Current value: ${ANTHROPIC_AUTH_TOKEN:0:20}..."
    read -p "Do you want to use this key? (y/n): " use_existing
    if [[ "$use_existing" =~ ^[Yy]$ ]]; then
        ZAI_API_KEY="$ANTHROPIC_AUTH_TOKEN"
    fi
fi

# If no key set or user chose not to use existing
if [ -z "$ZAI_API_KEY" ]; then
    echo "Please enter your Z.ai API key:"
    echo "(Get it from: https://api.z.ai)"
    read -p "API Key: " ZAI_API_KEY
    
    if [ -z "$ZAI_API_KEY" ]; then
        print_error "API key cannot be empty"
        exit 1
    fi
fi

print_success "API key configured"
echo ""

# Step 2: Backup existing .zshrc
echo "Step 2: Backup Configuration"
echo "-----------------------------"
echo ""

if [ -f ~/.zshrc ]; then
    BACKUP_FILE=~/.zshrc.backup.$(date +%Y%m%d_%H%M%S)
    cp ~/.zshrc "$BACKUP_FILE"
    print_success "Created backup: $BACKUP_FILE"
else
    print_warning "No existing .zshrc found, will create new one"
fi
echo ""

# Step 3: Add configuration to .zshrc
echo "Step 3: Configure Environment Variables"
echo "----------------------------------------"
echo ""

# Check if configuration already exists
if grep -q "Z.ai GLM-4.6 Configuration for Cursor IDE" ~/.zshrc 2>/dev/null; then
    print_warning "Configuration already exists in .zshrc"
    read -p "Do you want to update it? (y/n): " update_config
    if [[ "$update_config" =~ ^[Yy]$ ]]; then
        # Remove old configuration
        sed -i '' '/# Z.ai GLM-4.6 Configuration for Cursor IDE/,/^$/d' ~/.zshrc
        print_success "Removed old configuration"
    else
        print_warning "Skipping configuration update"
        exit 0
    fi
fi

# Add new configuration
cat >> ~/.zshrc << EOF

# Z.ai GLM-4.6 Configuration for Cursor IDE
# Added by setup-glm-cursor.sh on $(date)
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"
export ANTHROPIC_MODEL="glm-4.6"
export ANTHROPIC_SMALL_FAST_MODEL="glm-4.5-Air"
export ANTHROPIC_API_KEY="$ZAI_API_KEY"

EOF

print_success "Added configuration to ~/.zshrc"
echo ""

# Step 4: Source the configuration
echo "Step 4: Apply Configuration"
echo "---------------------------"
echo ""

source ~/.zshrc
print_success "Configuration loaded"
echo ""

# Step 5: Verify configuration
echo "Step 5: Verify Configuration"
echo "----------------------------"
echo ""

echo "Checking environment variables:"
if [ -n "$ANTHROPIC_BASE_URL" ]; then
    print_success "ANTHROPIC_BASE_URL: $ANTHROPIC_BASE_URL"
else
    print_error "ANTHROPIC_BASE_URL not set"
fi

if [ -n "$ANTHROPIC_AUTH_TOKEN" ]; then
    print_success "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:0:20}..."
else
    print_error "ANTHROPIC_AUTH_TOKEN not set"
fi

if [ -n "$ANTHROPIC_MODEL" ]; then
    print_success "ANTHROPIC_MODEL: $ANTHROPIC_MODEL"
else
    print_error "ANTHROPIC_MODEL not set"
fi

if [ -n "$ANTHROPIC_SMALL_FAST_MODEL" ]; then
    print_success "ANTHROPIC_SMALL_FAST_MODEL: $ANTHROPIC_SMALL_FAST_MODEL"
else
    print_error "ANTHROPIC_SMALL_FAST_MODEL not set"
fi

echo ""

# Step 6: Test API connectivity (optional)
echo "Step 6: Test API Connection (Optional)"
echo "--------------------------------------"
echo ""

read -p "Do you want to test the API connection? (y/n): " test_api
if [[ "$test_api" =~ ^[Yy]$ ]]; then
    echo "Testing API connection..."
    
    response=$(curl -s -w "\n%{http_code}" -X POST https://api.z.ai/api/anthropic/v1/messages \
        -H "x-api-key: $ZAI_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -H "content-type: application/json" \
        -d '{
          "model": "glm-4.6",
          "max_tokens": 50,
          "messages": [{"role": "user", "content": "Say hello"}]
        }')
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "API connection successful!"
        echo "Response preview:"
        echo "$body" | head -n 5
    else
        print_error "API connection failed (HTTP $http_code)"
        echo "Response:"
        echo "$body"
    fi
else
    print_warning "Skipped API test"
fi

echo ""

# Step 7: Instructions
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. ${YELLOW}Restart Cursor IDE completely${NC}"
echo "   - Quit Cursor (Cmd+Q)"
echo "   - Reopen from Applications"
echo ""
echo "2. ${YELLOW}Test the integration${NC}"
echo "   - Open any code file"
echo "   - Use Cmd+K for inline editing"
echo "   - Use Cmd+L for AI chat"
echo "   - Use Cmd+I for Composer mode"
echo ""
echo "3. ${YELLOW}Monitor your usage${NC}"
echo "   - Visit: https://api.z.ai"
echo "   - Check your quota (Lite Plan: ~120 prompts/5hrs)"
echo ""
echo "For detailed documentation, see:"
echo "  ${GREEN}GLM-4.6-CURSOR-SETUP.md${NC}"
echo ""
echo "========================================"
echo ""

# Ask if user wants to restart Cursor now
read -p "Do you want to restart Cursor now? (y/n): " restart_cursor
if [[ "$restart_cursor" =~ ^[Yy]$ ]]; then
    echo "Restarting Cursor..."
    pkill -9 Cursor 2>/dev/null || print_warning "Cursor not running"
    sleep 2
    open -a Cursor
    print_success "Cursor restarted"
else
    print_warning "Please restart Cursor manually to apply changes"
fi

echo ""
print_success "Setup script completed successfully!"

