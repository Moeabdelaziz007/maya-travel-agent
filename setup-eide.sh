#!/bin/bash

# EIDE Setup Script for Maya AI Travel Assistant Project
# This script sets up the environment for EIDE (Embedded IDE) development

echo "=== EIDE Setup for Maya AI Travel Assistant ==="
echo

# Check if .NET is installed
echo "Checking .NET installation..."
if command -v dotnet &> /dev/null; then
    echo "✓ .NET is installed: $(dotnet --version)"
    echo "Available runtimes:"
    dotnet --list-runtimes
else
    echo "✗ .NET is not installed. Please install .NET 6 or later."
    exit 1
fi

echo

# Check Node.js installation
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "✓ Node.js is installed: $(node --version)"
else
    echo "✗ Node.js is not installed. Please install Node.js 18.x or later."
    exit 1
fi

echo

# Check npm installation
echo "Checking npm installation..."
if command -v npm &> /dev/null; then
    echo "✓ npm is installed: $(npm --version)"
else
    echo "✗ npm is not installed. Please install npm."
    exit 1
fi

echo

# Install project dependencies
echo "Installing project dependencies..."
if [ -f "package.json" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo

# Create EIDE configuration if it doesn't exist
if [ ! -f ".eide/eide.json" ]; then
    echo "Creating EIDE configuration..."
    mkdir -p .eide
    cat > .eide/eide.json << 'EOF'
{
  "version": "2.0.0",
  "projectName": "Maya AI Travel Assistant",
  "projectType": "nodejs",
  "description": "Advanced Telegram Bot with AI Integration for Travel Planning",
  "language": "typescript",
  "runtime": {
    "type": "node",
    "version": "18.x"
  },
  "build": {
    "type": "npm",
    "scripts": {
      "dev": "npm run dev",
      "build": "npm run build", 
      "start": "npm start"
    }
  },
  "debug": {
    "type": "node",
    "port": 9229
  },
  "extensions": {
    "recommended": [
      "ms-vscode.vscode-typescript-next",
      "bradlc.vscode-tailwindcss",
      "esbenp.prettier-vscode",
      "ms-vscode.vscode-json"
    ]
  },
  "workspace": {
    "folders": [
      {
        "name": "Frontend",
        "path": "./frontend"
      },
      {
        "name": "Backend",
        "path": "./backend"
      }
    ]
  }
}
EOF
    echo "✓ EIDE configuration created"
fi

echo

# Create VS Code workspace file
if [ ! -f "maya-ai-travel-assistant.code-workspace" ]; then
    echo "Creating VS Code workspace file..."
    cat > maya-ai-travel-assistant.code-workspace << 'EOF'
{
  "folders": [
    {
      "name": "Root",
      "path": "."
    },
    {
      "name": "Frontend", 
      "path": "./frontend"
    },
    {
      "name": "Backend",
      "path": "./backend"
    }
  ],
  "settings": {
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "files.exclude": {
      "**/node_modules": true,
      "**/dist": true,
      "**/.git": true
    }
  },
  "extensions": {
    "recommendations": [
      "ms-vscode.vscode-typescript-next",
      "bradlc.vscode-tailwindcss",
      "esbenp.prettier-vscode", 
      "ms-vscode.vscode-json",
      "ms-vscode.vscode-eslint"
    ]
  }
}
EOF
    echo "✓ VS Code workspace file created"
fi

echo

# Create .vscode directory with recommended settings
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-eslint"
  ]
}
EOF

echo "✓ VS Code configuration created"

echo
echo "=== EIDE Setup Complete ==="
echo
echo "Next steps:"
echo "1. Open VS Code in this directory"
echo "2. Install the recommended extensions when prompted"
echo "3. Open the workspace file: maya-ai-travel-assistant.code-workspace"
echo "4. EIDE should now work with .NET 8 runtime (compatible with .NET 6)"
echo
echo "To start development:"
echo "  Frontend: cd frontend && npm run dev"
echo "  Backend:  cd backend && npm start"
echo