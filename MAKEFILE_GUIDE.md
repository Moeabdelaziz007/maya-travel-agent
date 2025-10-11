# 🚀 Makefile Quick Reference Guide

**Professional development shortcuts for Amrikyy Travel Agent**

---

## 📋 Most Used Commands

### **Quick Shortcuts**
```bash
make h          # Help (show all commands)
make i          # Install dependencies
make d          # Start dev servers
make t          # Run tests
make b          # Build project
make s          # Status check
```

---

## 🎯 Development Workflow

### **First Time Setup**
```bash
make install    # Install all dependencies
make setup      # Create .env files
make dev        # Start development
```

### **Daily Development**
```bash
make dev        # Start both frontend & backend
make d          # Same (shortcut)
make restart    # Restart all services
```

### **Frontend Only**
```bash
make dev-frontend
```

### **Backend Only**
```bash
make dev-backend
```

---

## 🧪 Testing

```bash
make test              # Run all tests
make test-ecmw         # E-CMW tests only (21 tests)
make test-watch        # Watch mode
make test-coverage     # With coverage report
make t                 # Shortcut for test
```

---

## 🔍 Code Quality

```bash
make lint              # Check code style
make lint-fix          # Auto-fix issues
make format            # Format with Prettier
make format-check      # Check formatting
make type-check        # TypeScript checking
make quality           # All checks
make quality-fix       # Fix everything
```

---

## 🏗️ Building

```bash
make build             # Build everything
make build-frontend    # Frontend only
make build-backend     # Backend only
make build-ecmw        # E-CMW only
make b                 # Shortcut for build
```

---

## 🚀 Deployment

```bash
make deploy            # Deploy both services
make deploy-frontend   # Vercel deployment
make deploy-backend    # Railway deployment
make deploy-check      # Check deploy status
```

---

## 🧹 Cleaning

```bash
make clean             # Clean everything
make clean-deps        # Dependencies only
make clean-build       # Build artifacts only
make clean-logs        # Log files only
make c                 # Shortcut for clean
```

---

## 🗄️ Database & Cache

```bash
make db-studio         # Open Supabase dashboard
make redis-cli         # Connect to Redis Cloud
make open-supabase     # Open Supabase UI
make open-redis        # Open Redis dashboard
```

---

## 🔒 Security

```bash
make security-audit    # Check vulnerabilities
make security-fix      # Fix vulnerabilities
make check-updates     # Check for updates
make update-deps       # Update dependencies
```

---

## 📊 Monitoring

```bash
make health-check      # Check all services
make status            # Same as health-check
make logs-backend      # View backend logs
make logs-frontend     # View frontend logs
```

---

## 🌐 Quick Open Commands

```bash
make open-frontend     # Open http://localhost:5173
make open-backend      # Open http://localhost:5000/api/health
make open-sentry       # Open Sentry dashboard
make open-supabase     # Open Supabase UI
make open-redis        # Open Redis Cloud UI
```

---

## 📖 Documentation

```bash
make docs              # Open README
make docs-api          # Open API docs
make docs-test         # Open test report
make docs-deploy       # Open deployment guide
```

---

## 🤖 Telegram Bot

```bash
make bot               # Start Telegram bot
make bot-test          # Test bot health
```

---

## 🔄 Git Shortcuts

```bash
make git-status        # Git status
make git-pull          # Pull from remote
make git-push          # Push to remote
make git-sync          # Pull + Push
make git-commit m="your message"  # Quick commit & push
```

---

## ℹ️ Project Info

```bash
make info              # Show project info
make version           # Show version
```

---

## 🛠️ Troubleshooting Commands

### **Reset Everything**
```bash
make reset             # Clean + install + setup
```

### **Restart Services**
```bash
make restart           # Kill and restart all
```

### **Fix All Issues**
```bash
make fix-all           # Quality + security fixes
```

### **Check Environment**
```bash
make check-env         # Verify .env files exist
```

---

## 💡 Pro Tips

### **1. Chain Commands**
```bash
make clean install test    # Clean, install, test
```

### **2. Use Shortcuts**
All common commands have single-letter shortcuts:
- `h` = help
- `i` = install
- `d` = dev
- `t` = test
- `b` = build
- `c` = clean
- `l` = lint
- `f` = format
- `s` = status

### **3. Quick Commit**
```bash
make git-commit m="add new feature"
# This does: git add -A && git commit -m "..." && git push
```

### **4. Development Cycle**
```bash
# Typical development cycle:
make d          # Start dev
# ... make changes ...
make t          # Test
make f          # Format
make git-commit m="my changes"
```

### **5. Pre-Deployment Check**
```bash
make quality    # Runs: lint + format-check + type-check + test
```

---

## 📊 Command Categories

### **Installation** (7 commands)
- install, install-frontend, install-backend, install-ecmw, clean-install

### **Setup** (2 commands)
- setup, check-env

### **Development** (5 commands)
- dev, dev-frontend, dev-backend, dev-all, restart

### **Building** (4 commands)
- build, build-frontend, build-backend, build-ecmw

### **Testing** (6 commands)
- test, test-frontend, test-backend, test-ecmw, test-watch, test-coverage

### **Quality** (7 commands)
- lint, lint-fix, format, format-check, type-check, quality, quality-fix

### **Deployment** (4 commands)
- deploy, deploy-frontend, deploy-backend, deploy-check

### **Cleaning** (5 commands)
- clean, clean-deps, clean-build, clean-cache, clean-logs

### **Security** (4 commands)
- security-audit, security-fix, check-updates, update-deps

### **Monitoring** (5 commands)
- health-check, status, logs-backend, logs-frontend

### **Database** (2 commands)
- db-studio, redis-cli

### **Bot** (2 commands)
- bot, bot-test

### **Git** (5 commands)
- git-status, git-pull, git-push, git-sync, git-commit

### **Utilities** (8 commands)
- open-frontend, open-backend, open-sentry, open-supabase, open-redis, docs, info, version

### **Shortcuts** (8 aliases)
- h, i, d, t, b, c, l, f, s

**Total: 60+ commands** 🎉

---

## 🎯 Common Workflows

### **Morning Startup**
```bash
make git-pull     # Get latest code
make i            # Update dependencies
make d            # Start development
```

### **Feature Development**
```bash
make d            # Start servers
# ... code ...
make t            # Test
make quality      # Check quality
make git-commit m="add feature X"
```

### **Bug Fix**
```bash
make d            # Start servers
# ... fix bug ...
make t            # Verify fix
make git-commit m="fix: bug description"
```

### **Pre-Deployment**
```bash
make quality      # All checks
make build        # Test build
make deploy       # Deploy
```

### **After Deployment**
```bash
make deploy-check  # Check status
make open-backend  # Verify backend
make open-frontend # Verify frontend
```

---

## 📚 Learn More

Run `make help` to see all available commands with descriptions.

Each command shows what it's doing with color-coded output:
- 🟢 **GREEN**: Success messages
- 🔵 **CYAN**: Info messages
- 🟡 **YELLOW**: Warnings
- 🔴 **RED**: Errors/cleaning actions

---

**Made with ❤️ for Amrikyy Travel Agent**  
**60+ professional shortcuts at your fingertips!** 🚀

