#!/bin/bash

# Maya Travel Bot - Claude Code Setup Script
# This script sets up Claude Code with Z.ai GLM-4.6

echo "🚀 Setting up Claude Code with Z.ai GLM-4.6..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Install Claude Code
echo -e "${BLUE}📦 Installing Claude Code...${NC}"
npm install -g @anthropic-ai/claude-code

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Claude Code installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Installation failed. Try with sudo:${NC}"
    echo "sudo npm install -g @anthropic-ai/claude-code"
    exit 1
fi

echo ""

# Set environment variables
echo -e "${BLUE}🔧 Setting up environment variables...${NC}"

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    SHELL_RC="$HOME/.zshrc"
    if [ ! -f "$SHELL_RC" ]; then
        SHELL_RC="$HOME/.bash_profile"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    SHELL_RC="$HOME/.bashrc"
else
    # Windows (Git Bash)
    SHELL_RC="$HOME/.bashrc"
fi

# Add environment variables
echo "" >> "$SHELL_RC"
echo "# Z.ai Claude Code Configuration" >> "$SHELL_RC"
echo "export ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic" >> "$SHELL_RC"
echo "export ANTHROPIC_AUTH_TOKEN=4e4ab4737d0b4f0ca810ae233d4cbad3.BY1p4wRAwHCezeMh" >> "$SHELL_RC"

# Also set for current session
export ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic
export ANTHROPIC_AUTH_TOKEN=4e4ab4737d0b4f0ca810ae233d4cbad3.BY1p4wRAwHCezeMh

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo -e "   Added to: ${SHELL_RC}"
echo ""

# Test configuration
echo -e "${BLUE}🧪 Testing configuration...${NC}"
if [ -n "$ANTHROPIC_AUTH_TOKEN" ]; then
    echo -e "${GREEN}✅ API Key is set${NC}"
else
    echo -e "${YELLOW}⚠️  API Key not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Restart your terminal or run: source $SHELL_RC"
echo "2. Navigate to your project: cd /path/to/maya-travel-agent"
echo "3. Start Claude Code: claude"
echo "4. Try a command: 'أضف ميزة جديدة للبوت'"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "- Z.ai Docs: https://docs.z.ai/devpack/tool/claude"
echo "- Project Guide: ZAI_CODING_TOOLS_GUIDE.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
