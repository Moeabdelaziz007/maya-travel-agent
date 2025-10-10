# ⚡ Maya Travel Agent - Quick Start Deployment

**Fast track guide to get Maya Travel Agent deployed in 30 minutes!**

---

## 🎯 What You Just Got

✅ **Collibra Config Manager** - Centralized configuration governance  
✅ **CI/CD Pipeline** - Automated GitHub Actions workflow  
✅ **Monitoring Stack** - Prometheus + Grafana ready  
✅ **Test Suite** - Smoke tests + Load tests  
✅ **Deployment Scripts** - One-command deployments  
✅ **Security** - Rate limiting, validation, headers  

---

## 🚀 Quick Deploy (3 Steps)

### Step 1: Set Environment Variables

Create `backend/.env`:

```bash
# Copy from .env.example
cp backend/.env.example backend/.env

# Edit with your values
nano backend/.env
```

**Minimum required:**
- `DATABASE_URL` - Your Supabase/PostgreSQL URL
- `ZAI_API_KEY` - Your Z.ai API key
- `SUPABASE_URL` + `SUPABASE_ANON_KEY`

### Step 2: Test Locally

```bash
# Install dependencies
npm run install:all

# Run tests
cd backend && npm test

# Test Collibra config
node backend/test-collibra.js

# Start development server
npm run dev
```

### Step 3: Deploy

**Option A: Automatic (GitHub Actions)**

```bash
# Push to main branch
git checkout main
git merge your-branch
git push

# GitHub Actions will automatically:
# 1. Run tests
# 2. Build frontend
# 3. Deploy to Railway (backend)
# 4. Deploy to Vercel (frontend)
# 5. Run smoke tests
```

**Option B: Manual (Scripts)**

```bash
# Deploy to staging
./scripts/quick-deploy.sh staging

# Deploy to production (after staging validation)
./scripts/quick-deploy.sh production
```

---

## 🔧 What Needs Manual Setup

### 1. GitHub Secrets (5 min)

Run the helper script:

```bash
./scripts/setup-secrets.sh
```

Or manually add at: `Settings → Secrets → Actions`

**Required secrets:**
- `RAILWAY_TOKEN` - Get from https://railway.app/account/tokens
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens  
- `COLLIBRA_API_KEY` - Optional (uses fallback if not set)

### 2. Collibra Setup (10 min) - OPTIONAL

Collibra provides governance but isn't required for deployment!

**If you want to use Collibra:**

1. Login to your Collibra instance
2. Create configuration domain
3. Add config assets (see DEPLOYMENT.md)
4. Add `COLLIBRA_API_KEY` to `.env`

**If you skip Collibra:**

The system will automatically use fallback configs from environment variables. Everything works perfectly!

### 3. Monitoring Setup (5 min) - OPTIONAL

**For local development:**
```bash
# Use the built-in health check
curl http://localhost:3001/health

# Check metrics
curl http://localhost:3001/metrics
```

**For production:**
- Set up Prometheus (see `prometheus.yml`)
- Import Grafana dashboard (see `grafana/maya-dashboard.json`)
- Or use Railway/Vercel built-in monitoring

---

## ✅ Validation Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Collibra test passed (or using fallback)

### Post-Deployment
- [ ] Health check works: `curl https://your-api.com/health`
- [ ] Metrics endpoint works: `curl https://your-api.com/metrics`
- [ ] Frontend loads correctly
- [ ] API responds to requests

---

## 🧪 Testing Commands

```bash
# Test Collibra config
node backend/test-collibra.js

# Run backend tests
cd backend && npm test

# Run smoke tests
cd backend && npm run smoke-test

# Run comprehensive test suite
./scripts/run-all-tests.sh

# Load testing (requires k6)
k6 run k6/load-test.js
```

---

## 📦 Deployment Targets

### Backend (Railway)
- **Staging**: Auto-deploy from PRs
- **Production**: Auto-deploy from `main` branch
- **Manual**: `railway up --environment production`

### Frontend (Vercel)
- **Staging**: Auto-deploy from PRs  
- **Production**: Auto-deploy from `main` branch
- **Manual**: `vercel --prod`

---

## 🆘 Troubleshooting

### "Collibra connection failed"
✅ **This is NORMAL!** System uses fallback configs automatically.

### "Tests failed"
```bash
# Check what failed
cd backend && npm test

# Run specific test
node test-simulation.js
```

### "Deployment failed"
```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs

# Run smoke tests
TEST_URL=your-url npm run smoke-test
```

### "Environment variables missing"
```bash
# Check .env file exists
ls backend/.env

# Verify required vars
grep -E "DATABASE_URL|ZAI_API_KEY" backend/.env
```

---

## 🎓 Learn More

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Architecture**: See `openmemory.md`
- **API Documentation**: See `backend/README.md`

---

## 📞 Quick Commands Reference

```bash
# Development
npm run dev                          # Start dev servers
npm run install:all                  # Install all dependencies

# Testing
npm test                             # Run tests
node backend/test-collibra.js       # Test Collibra
./scripts/run-all-tests.sh          # Run all tests

# Deployment
./scripts/quick-deploy.sh staging   # Deploy to staging
./scripts/quick-deploy.sh production # Deploy to production
./scripts/setup-secrets.sh           # Setup GitHub secrets

# Monitoring
curl http://localhost:3001/health   # Health check
curl http://localhost:3001/metrics  # Prometheus metrics
```

---

## 🎉 You're Ready!

Your Maya Travel Agent is production-ready with:

- ✅ Intelligent configuration management
- ✅ Automated CI/CD pipeline  
- ✅ Comprehensive testing
- ✅ Production monitoring
- ✅ Security hardening
- ✅ Graceful error handling

**Deploy with confidence!** 🚀

---

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.

