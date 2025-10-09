# EIDE Setup for Maya AI Travel Assistant

## Overview
This project has been configured to work with EIDE (Embedded IDE) for embedded development. The setup includes .NET 8 runtime (compatible with .NET 6) and proper project configuration.

## Prerequisites Installed
- ✅ .NET 8.0.120 (Runtime + SDK)
- ✅ Node.js v22.20.0
- ✅ npm v10.9.3

## Project Structure
```
/workspace/
├── .eide/
│   └── eide.json                 # EIDE configuration
├── .vscode/
│   ├── settings.json            # VS Code settings
│   └── extensions.json          # Recommended extensions
├── maya-ai-travel-assistant.code-workspace  # VS Code workspace
├── frontend/                    # React/TypeScript frontend
├── backend/                     # Node.js backend
└── setup-eide.sh               # Setup script
```

## EIDE Configuration
The project is configured with:
- **Project Type**: Node.js with TypeScript
- **Runtime**: Node.js 18.x
- **Build System**: npm
- **Debug Port**: 9229
- **Language**: TypeScript

## Getting Started

### 1. Open in VS Code
```bash
code maya-ai-travel-assistant.code-workspace
```

### 2. Install Recommended Extensions
VS Code will prompt you to install recommended extensions:
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- JSON Language Features
- ESLint

### 3. Start Development

#### Frontend Development
```bash
cd frontend
npm run dev
```

#### Backend Development
```bash
cd backend
npm start
```

## EIDE Features Available
- **IntelliSense**: Full TypeScript support
- **Debugging**: Node.js debugging with breakpoints
- **Code Formatting**: Automatic formatting with Prettier
- **Linting**: ESLint integration
- **Multi-root Workspace**: Separate folders for frontend and backend

## Troubleshooting

### .NET Runtime Issues
If you encounter .NET runtime issues:
```bash
# Check installed runtimes
dotnet --list-runtimes

# Verify .NET installation
dotnet --version
```

### Node.js Issues
If you encounter Node.js issues:
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Reinstall dependencies
npm install
```

### EIDE Configuration
To modify EIDE settings, edit `.eide/eide.json`:
```json
{
  "version": "2.0.0",
  "projectName": "Maya AI Travel Assistant",
  "projectType": "nodejs",
  "language": "typescript",
  "runtime": {
    "type": "node",
    "version": "18.x"
  }
}
```

## Development Commands

### Full Project Setup
```bash
./setup-eide.sh
```

### Frontend Commands
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Commands
```bash
cd backend
npm start        # Start production server
npm run dev      # Start development server (if available)
```

## Project Dependencies
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Telegram Bot API, AI Integration
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe, PayPal integration

## Support
For EIDE-specific issues, refer to the EIDE documentation or check the project's VS Code configuration files in the `.vscode/` directory.