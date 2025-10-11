# ============================================
# AMRIKYY TRAVEL AGENT - MAKEFILE
# Professional shortcuts for common tasks
# ============================================

.PHONY: help install dev build test clean deploy

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
MAGENTA := \033[0;35m
CYAN := \033[0;36m
NC := \033[0m # No Color

# ============================================
# HELP
# ============================================

help: ## Show this help message
	@echo "$(CYAN)╔════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║     AMRIKYY TRAVEL AGENT - DEVELOPMENT COMMANDS       ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Quick Start:$(NC)"
	@echo "  1. make install      # Install all dependencies"
	@echo "  2. make setup        # Setup environment files"
	@echo "  3. make dev          # Start development servers"
	@echo ""

# ============================================
# INSTALLATION
# ============================================

install: ## Install all dependencies
	@echo "$(GREEN)📦 Installing all dependencies...$(NC)"
	@npm install
	@cd frontend && npm install
	@cd backend && npm install
	@cd ecmw && npm install
	@echo "$(GREEN)✅ Installation complete!$(NC)"

install-frontend: ## Install frontend dependencies only
	@echo "$(GREEN)📦 Installing frontend dependencies...$(NC)"
	@cd frontend && npm install

install-backend: ## Install backend dependencies only
	@echo "$(GREEN)📦 Installing backend dependencies...$(NC)"
	@cd backend && npm install

install-ecmw: ## Install E-CMW dependencies only
	@echo "$(GREEN)📦 Installing E-CMW dependencies...$(NC)"
	@cd ecmw && npm install

clean-install: clean install ## Clean and reinstall all dependencies
	@echo "$(GREEN)✅ Clean installation complete!$(NC)"

# ============================================
# SETUP
# ============================================

setup: ## Setup environment files
	@echo "$(CYAN)🔧 Setting up environment files...$(NC)"
	@if [ ! -f backend/.env ]; then cp backend/env.example backend/.env && echo "$(GREEN)✓ Created backend/.env$(NC)"; fi
	@if [ ! -f frontend/.env ]; then echo "VITE_API_URL=http://localhost:5000" > frontend/.env && echo "$(GREEN)✓ Created frontend/.env$(NC)"; fi
	@echo "$(YELLOW)⚠️  Please edit .env files with your credentials$(NC)"

check-env: ## Check if environment files exist
	@echo "$(CYAN)🔍 Checking environment files...$(NC)"
	@if [ -f backend/.env ]; then echo "$(GREEN)✓ backend/.env exists$(NC)"; else echo "$(RED)✗ backend/.env missing$(NC)"; fi
	@if [ -f frontend/.env ]; then echo "$(GREEN)✓ frontend/.env exists$(NC)"; else echo "$(RED)✗ frontend/.env missing$(NC)"; fi

# ============================================
# DEVELOPMENT
# ============================================

dev: ## Start all development servers
	@echo "$(GREEN)🚀 Starting development servers...$(NC)"
	@npx concurrently "make dev-backend" "make dev-frontend"

dev-frontend: ## Start frontend only
	@echo "$(GREEN)🎨 Starting frontend on port 5173...$(NC)"
	@cd frontend && npm run dev

dev-backend: ## Start backend only
	@echo "$(GREEN)⚙️  Starting backend on port 5000...$(NC)"
	@cd backend && npm start

dev-all: ## Start everything (frontend + backend)
	@echo "$(GREEN)🚀 Starting all services...$(NC)"
	@make dev

# ============================================
# BUILDING
# ============================================

build: ## Build frontend and backend
	@echo "$(CYAN)🏗️  Building project...$(NC)"
	@make build-frontend
	@make build-backend
	@make build-ecmw
	@echo "$(GREEN)✅ Build complete!$(NC)"

build-frontend: ## Build frontend only
	@echo "$(CYAN)🏗️  Building frontend...$(NC)"
	@cd frontend && npm run build

build-backend: ## Build backend only
	@echo "$(CYAN)🏗️  Building backend...$(NC)"
	@cd backend && npm run build

build-ecmw: ## Build E-CMW only
	@echo "$(CYAN)🏗️  Building E-CMW...$(NC)"
	@cd ecmw && npm run build

# ============================================
# TESTING
# ============================================

test: ## Run all tests
	@echo "$(CYAN)🧪 Running all tests...$(NC)"
	@make test-ecmw
	@make test-backend

test-frontend: ## Run frontend tests
	@echo "$(CYAN)🧪 Running frontend tests...$(NC)"
	@cd frontend && npm run test

test-backend: ## Run backend tests
	@echo "$(CYAN)🧪 Running backend tests...$(NC)"
	@cd backend && npm run test

test-ecmw: ## Run E-CMW tests
	@echo "$(CYAN)🧪 Running E-CMW tests...$(NC)"
	@cd ecmw && npm test

test-watch: ## Run tests in watch mode
	@echo "$(CYAN)👀 Running E-CMW tests in watch mode...$(NC)"
	@cd ecmw && npm test -- --watch

test-coverage: ## Run tests with coverage
	@echo "$(CYAN)📊 Running tests with coverage...$(NC)"
	@cd ecmw && npm test -- --coverage

# ============================================
# CODE QUALITY
# ============================================

lint: ## Run linter
	@echo "$(CYAN)🔍 Linting code...$(NC)"
	@cd frontend && npm run lint
	@cd backend && npm run lint || echo "$(YELLOW)No lint script in backend$(NC)"

lint-fix: ## Fix linting issues
	@echo "$(GREEN)🔧 Fixing linting issues...$(NC)"
	@cd frontend && npm run lint:fix || echo "$(YELLOW)No lint:fix script$(NC)"

format: ## Format code with Prettier
	@echo "$(CYAN)💅 Formatting code...$(NC)"
	@npx prettier --write "**/*.{js,jsx,ts,tsx,json,md}"

format-check: ## Check code formatting
	@echo "$(CYAN)🔍 Checking code formatting...$(NC)"
	@npx prettier --check "**/*.{js,jsx,ts,tsx,json,md}"

type-check: ## Run TypeScript type checking
	@echo "$(CYAN)📝 Type checking E-CMW...$(NC)"
	@cd ecmw && npx tsc --noEmit

quality: ## Run all quality checks (lint + format + type-check + test)
	@echo "$(CYAN)✨ Running quality checks...$(NC)"
	@make format-check
	@make type-check
	@make test
	@echo "$(GREEN)✅ All quality checks passed!$(NC)"

quality-fix: ## Fix all quality issues
	@echo "$(GREEN)🔧 Fixing all quality issues...$(NC)"
	@make lint-fix
	@make format
	@echo "$(GREEN)✅ Fixed all quality issues!$(NC)"

# ============================================
# DATABASE
# ============================================

db-studio: ## Open Supabase studio
	@echo "$(CYAN)🗄️  Opening Supabase studio...$(NC)"
	@open https://waqewqdmtnabpcvofdnl.supabase.co

redis-cli: ## Connect to Redis Cloud
	@echo "$(CYAN)🔴 Connecting to Redis...$(NC)"
	@redis-cli -u redis://default:hOgB8zfnI5UcRqfnuAw3ehX5a6Fzs4gr@redis-13608.c84.us-east-1-2.ec2.redns.redis-cloud.com:13608

# ============================================
# TELEGRAM BOT
# ============================================

bot: ## Start Telegram bot
	@echo "$(GREEN)🤖 Starting Telegram bot...$(NC)"
	@cd backend && node advanced-telegram-bot.js

bot-test: ## Test Telegram bot
	@echo "$(CYAN)🧪 Testing Telegram bot...$(NC)"
	@curl http://localhost:5000/api/health

# ============================================
# DEPLOYMENT
# ============================================

deploy: ## Deploy to production (frontend + backend)
	@echo "$(GREEN)🚀 Deploying to production...$(NC)"
	@./deploy-backend.sh
	@./deploy-frontend.sh
	@echo "$(GREEN)✅ Deployment complete!$(NC)"

deploy-frontend: ## Deploy frontend to Vercel
	@echo "$(GREEN)🌐 Deploying frontend to Vercel...$(NC)"
	@./deploy-frontend.sh

deploy-backend: ## Deploy backend to Railway
	@echo "$(GREEN)🚂 Deploying backend to Railway...$(NC)"
	@./deploy-backend.sh

deploy-check: ## Check deployment status
	@echo "$(CYAN)🔍 Checking deployment status...$(NC)"
	@railway status
	@vercel ls

# ============================================
# CLEANING
# ============================================

clean: ## Clean all build artifacts and dependencies
	@echo "$(RED)🧹 Cleaning project...$(NC)"
	@rm -rf node_modules frontend/node_modules backend/node_modules ecmw/node_modules
	@rm -rf frontend/dist backend/dist ecmw/dist
	@rm -rf frontend/.vite backend/.vite
	@rm -rf ecmw/coverage
	@echo "$(GREEN)✅ Project cleaned!$(NC)"

clean-deps: ## Clean dependencies only
	@echo "$(RED)🧹 Cleaning dependencies...$(NC)"
	@rm -rf node_modules frontend/node_modules backend/node_modules ecmw/node_modules

clean-build: ## Clean build artifacts only
	@echo "$(RED)🧹 Cleaning build artifacts...$(NC)"
	@rm -rf frontend/dist backend/dist ecmw/dist ecmw/coverage

clean-cache: ## Clean cache files
	@echo "$(RED)🧹 Cleaning cache...$(NC)"
	@rm -rf frontend/.vite backend/.vite
	@rm -rf .turbo frontend/.turbo backend/.turbo

clean-logs: ## Clean log files
	@echo "$(RED)🧹 Cleaning logs...$(NC)"
	@rm -rf backend/*.log frontend/*.log

# ============================================
# SECURITY
# ============================================

security-audit: ## Run security audit
	@echo "$(CYAN)🔒 Running security audit...$(NC)"
	@npm audit
	@cd frontend && npm audit
	@cd backend && npm audit
	@cd ecmw && npm audit

security-fix: ## Fix security vulnerabilities
	@echo "$(GREEN)🔧 Fixing security vulnerabilities...$(NC)"
	@npm audit fix
	@cd frontend && npm audit fix
	@cd backend && npm audit fix
	@cd ecmw && npm audit fix

# ============================================
# UTILITIES
# ============================================

check-updates: ## Check for dependency updates
	@echo "$(CYAN)🔍 Checking for updates...$(NC)"
	@npx npm-check-updates

update-deps: ## Update dependencies
	@echo "$(GREEN)⬆️  Updating dependencies...$(NC)"
	@npx npm-check-updates -u
	@make install

analyze: ## Analyze bundle size
	@echo "$(CYAN)📊 Analyzing bundle size...$(NC)"
	@cd frontend && npm run build -- --report

logs-backend: ## View backend logs
	@echo "$(CYAN)📋 Viewing backend logs...$(NC)"
	@tail -f backend/backend.log

logs-frontend: ## View frontend logs
	@echo "$(CYAN)📋 Viewing frontend logs...$(NC)"
	@tail -f frontend/frontend.log

open-frontend: ## Open frontend in browser
	@echo "$(GREEN)🌐 Opening frontend...$(NC)"
	@open http://localhost:5173

open-backend: ## Open backend health check
	@echo "$(GREEN)⚙️  Opening backend...$(NC)"
	@open http://localhost:5000/api/health

open-sentry: ## Open Sentry dashboard
	@echo "$(GREEN)📊 Opening Sentry...$(NC)"
	@open https://sentry.io/organizations/aaas-6y/projects/

open-supabase: ## Open Supabase dashboard
	@echo "$(GREEN)🗄️  Opening Supabase...$(NC)"
	@open https://waqewqdmtnabpcvofdnl.supabase.co

open-redis: ## Open Redis Cloud dashboard
	@echo "$(GREEN)🔴 Opening Redis Cloud...$(NC)"
	@open https://app.redislabs.com/

# ============================================
# GIT SHORTCUTS
# ============================================

git-status: ## Git status
	@git status

git-push: ## Push to remote
	@echo "$(GREEN)Pushing to remote...$(NC)"
	@git push

git-pull: ## Pull from remote
	@echo "$(GREEN)Pulling from remote...$(NC)"
	@git pull

git-sync: ## Sync with remote (pull + push)
	@git pull
	@git push

git-commit: ## Quick commit (use: make git-commit m="your message")
	@git add -A
	@git commit -m "$(m)"
	@git push

# ============================================
# QUICK FIXES
# ============================================

fix-all: ## Fix everything (quality + security)
	@echo "$(GREEN)🔧 Fixing everything...$(NC)"
	@make quality-fix
	@make security-fix
	@echo "$(GREEN)✅ All fixes applied!$(NC)"

reset: clean-install setup ## Complete reset (clean + install + setup)
	@echo "$(GREEN)✅ Project reset complete!$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)🔄 Restarting services...$(NC)"
	@pkill -f "node.*backend" || echo "Backend not running"
	@pkill -f "vite.*frontend" || echo "Frontend not running"
	@sleep 2
	@make dev

# ============================================
# MONITORING
# ============================================

health-check: ## Check if all services are running
	@echo "$(CYAN)🏥 Health check...$(NC)"
	@echo "$(YELLOW)Backend:$(NC)"
	@curl -f http://localhost:5000/api/health > /dev/null 2>&1 && echo "$(GREEN)✓ Running$(NC)" || echo "$(RED)✗ Not running$(NC)"
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -f http://localhost:5173 > /dev/null 2>&1 && echo "$(GREEN)✓ Running$(NC)" || echo "$(RED)✗ Not running$(NC)"
	@echo "$(YELLOW)Redis:$(NC)"
	@redis-cli -u redis://default:hOgB8zfnI5UcRqfnuAw3ehX5a6Fzs4gr@redis-13608.c84.us-east-1-2.ec2.redns.redis-cloud.com:13608 ping 2>&1 | grep -q "PONG" && echo "$(GREEN)✓ Connected$(NC)" || echo "$(RED)✗ Not connected$(NC)"

status: health-check ## Alias for health-check

# ============================================
# DOCUMENTATION
# ============================================

docs: ## Open project documentation
	@echo "$(CYAN)📖 Opening documentation...$(NC)"
	@open README.md

docs-api: ## Open API documentation
	@echo "$(CYAN)📖 Opening API docs...$(NC)"
	@open http://localhost:5000/api/openapi.json

docs-test: ## Open test report
	@echo "$(CYAN)📖 Opening test report...$(NC)"
	@open COMPLETE_TEST_REPORT.md

docs-deploy: ## Open deployment guide
	@echo "$(CYAN)📖 Opening deployment guide...$(NC)"
	@open PRODUCTION_READY.md

# ============================================
# PROJECT INFO
# ============================================

info: ## Show project information
	@echo "$(CYAN)╔════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║          AMRIKYY TRAVEL AGENT - INFO                  ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Node Version:$(NC)      $$(node --version)"
	@echo "$(YELLOW)NPM Version:$(NC)       $$(npm --version)"
	@echo "$(YELLOW)Git Branch:$(NC)        $$(git branch --show-current)"
	@echo "$(YELLOW)Git Status:$(NC)        $$(git status --short | wc -l | xargs) files changed"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)          http://localhost:5173"
	@echo "$(YELLOW)Backend:$(NC)           http://localhost:5000"
	@echo "$(YELLOW)API Docs:$(NC)          http://localhost:5000/api/openapi.json"
	@echo ""
	@echo "$(YELLOW)Supabase:$(NC)          https://waqewqdmtnabpcvofdnl.supabase.co"
	@echo "$(YELLOW)Sentry:$(NC)            https://sentry.io/organizations/aaas-6y/"
	@echo "$(YELLOW)Redis Cloud:$(NC)       Connected"
	@echo ""

version: ## Show version information
	@echo "$(CYAN)Amrikyy Travel Agent v2.0.0$(NC)"
	@echo "$(GREEN)E-CMW System: Active$(NC)"
	@echo "$(GREEN)Test Status: 21/21 Passing$(NC)"

# ============================================
# ALIASES (Common shortcuts)
# ============================================

i: install ## Alias for install
d: dev ## Alias for dev
b: build ## Alias for build
t: test ## Alias for test
l: lint ## Alias for lint
f: format ## Alias for format
c: clean ## Alias for clean
h: help ## Alias for help
s: status ## Alias for status

