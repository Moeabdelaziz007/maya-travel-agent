# 🚀 Maya Travel Agent - Deployment Guide

Complete guide for deploying Maya Travel Agent to production with Collibra config management, Prometheus monitoring, and CI/CD automation.

---

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Collibra Setup](#collibra-setup)
4. [Deployment Options](#deployment-options)
5. [Monitoring Setup](#monitoring-setup)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Testing & Validation](#testing--validation)
8. [Security Checklist](#security-checklist)

---

## 🔧 **Prerequisites**

### Required Accounts & Services

- ✅ **Railway.app** - Backend hosting
- ✅ **Vercel** - Frontend hosting
- ✅ **Collibra** - Configuration governance
- ✅ **GitHub** - Source control & CI/CD
- ✅ **Supabase** - Database
- ✅ **JSONbin.io** - Caching
- ✅ **Prometheus + Grafana** - Monitoring

### Required Tools

```bash
# Node.js 18+
node --version  # Should be v18.x or higher

# Git
git --version

# Railway CLI
npm install -g @railway/cli

# Vercel CLI
npm install -g vercel

# k6 (for load testing)
# See: https://k6.io/docs/getting-started/installation/
```

---

## 🔐 **Environment Configuration**

### 1. Create Environment Files

**Backend `.env` file:**

```bash
# Environment
NODE_ENV=production
PORT=3001

# Collibra Configuration Management
COLLIBRA_URL=https://maya.collibra.com
COLLIBRA_API_KEY=your_collibra_api_key_here
COLLIBRA_USERNAME=your_username
COLLIBRA_PASSWORD=your_password

# Database (Supabase)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# AI Provider (Z.ai)
ZAI_API_KEY=your_zai_api_key
ZAI_API_URL=https://open.bigmodel.cn/api/paas/v4
ZAI_MODEL=glm-4-flash

# Caching (JSONbin.io)
JSONBIN_API_KEY=your_jsonbin_api_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ENABLED=true

# Security
JWT_SECRET=your_very_long_secure_random_string
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Monitoring
METRICS_PORT=9090
PROMETHEUS_ENABLED=true
```

**Frontend `.env` file:**

```bash
VITE_API_URL=https://api.mayatravel.ai
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TELEGRAM_BOT_USERNAME=@YourBotUsername
```

### 2. GitHub Secrets

Add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required Secrets:**

- `RAILWAY_TOKEN` - Railway API token
- `RAILWAY_SERVICE_BACKEND_STAGING` - Staging service ID
- `RAILWAY_SERVICE_BACKEND_PROD` - Production service ID
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `STAGING_API_KEY` - API key for staging smoke tests
- `PRODUCTION_API_KEY` - API key for production smoke tests
- `TELEGRAM_WEBHOOK_URL` - For deployment notifications
- `COLLIBRA_API_KEY` - Collibra API key for config management

---

## 🏛️ **Collibra Setup**

### 1. Create Configuration Assets

1. **Login to Collibra**: https://maya.collibra.com

2. **Create Configuration Domain**:
   - Navigate to: Data Assets → Create Domain
   - Name: `Configuration`
   - Type: `Configuration Management`

3. **Create Configuration Assets**:

   **Development Config:**
   ```
   Name: maya_development_config
   Type: Configuration
   Domain: Configuration
   ```

   **Staging Config:**
   ```
   Name: maya_staging_config
   Type: Configuration
   Domain: Configuration
   ```

   **Production Config:**
   ```
   Name: maya_production_config
   Type: Configuration
   Domain: Configuration
   ```

4. **Add Attributes to Each Asset**:

   Format: `section.key` = `value`

   ```
   database.url = postgresql://...
   database.pool_size = 10
   database.ssl = true
   
   ai.provider = zai
   ai.api_url = https://open.bigmodel.cn/api/paas/v4
   ai.model = glm-4-flash
   ai.max_tokens = 2000
   ai.temperature = 0.7
   
   payments.stripe_enabled = true
   payments.webhook_secret = whsec_...
   
   telegram.bot_token = 123456:ABC...
   telegram.webhook_url = https://...
   
   cache.jsonbin_api_key = $2a$10...
   cache.ttl = 3600
   
   monitoring.prometheus_enabled = true
   monitoring.metrics_port = 9090
   
   security.rate_limit_window_ms = 60000
   security.rate_limit_max = 100
   security.cors_origin = https://...
   ```

5. **Set Data Owners & Stewards**:
   - Assign responsible team members
   - Configure approval workflows
   - Enable audit logging

### 2. Test Collibra Integration

```bash
cd backend
node -e "
const { getInstance } = require('./src/config/collibra-config');
const collibra = getInstance();

collibra.getConfig('development').then(config => {
  console.log('✅ Collibra connection successful!');
  console.log(JSON.stringify(config, null, 2));
}).catch(err => {
  console.error('❌ Collibra connection failed:', err.message);
});
"
```

---

## 🌐 **Deployment Options**

### Option 1: Railway (Backend) + Vercel (Frontend) ⭐ **Recommended**

#### Deploy Backend to Railway

```bash
# 1. Login to Railway
railway login

# 2. Link to your project
railway link

# 3. Set environment variables
railway variables set NODE_ENV=production
railway variables set COLLIBRA_API_KEY=your_key
# ... set all other env vars

# 4. Deploy
railway up

# 5. Get the deployment URL
railway domain
```

#### Deploy Frontend to Vercel

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy to production
cd frontend
vercel --prod

# 3. Set environment variables
vercel env add VITE_API_URL production
vercel env add VITE_SUPABASE_URL production
# ... set all other env vars
```

### Option 2: PM2 on VPS

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Start backend
cd backend
pm2 start ecosystem.config.js --env production

# 3. Serve frontend with nginx
cd frontend
npm run build
sudo cp -r dist/* /var/www/html/

# 4. Setup PM2 startup
pm2 startup
pm2 save
```

---

## 📊 **Monitoring Setup**

### 1. Prometheus Setup

**Install Prometheus:**

```bash
# Download Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# Copy config
cp /path/to/maya-travel-agent/prometheus.yml .

# Start Prometheus
./prometheus --config.file=prometheus.yml
```

**Access Prometheus:**
- URL: http://localhost:9090
- Check targets: http://localhost:9090/targets

### 2. Grafana Setup

**Install Grafana:**

```bash
# Ubuntu/Debian
sudo apt-get install -y grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

**Configure Grafana:**

1. Access Grafana: http://localhost:3000
2. Login: admin/admin
3. Add Prometheus datasource:
   - Configuration → Data Sources → Add data source
   - Select Prometheus
   - URL: http://localhost:9090
   - Save & Test

4. Import Maya Dashboard:
   - Dashboards → Import
   - Upload: `grafana/maya-dashboard.json`
   - Select Prometheus datasource
   - Import

### 3. Alerts Configuration

Create `alerts.yml`:

```yaml
groups:
  - name: maya_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "95th percentile response time > 5s"
          
      - alert: LowCacheHitRate
        expr: cache_hits / (cache_hits + cache_misses) < 0.7
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Cache hit rate below 70%"
```

---

## 🔄 **CI/CD Pipeline**

### GitHub Actions Workflow

The workflow is already configured in `.github/workflows/production-deploy.yml`

**Triggers:**
- Push to `main` branch → Deploy to Production
- Pull Request → Deploy to Staging

**Pipeline Stages:**

1. **Lint** - Code quality checks
2. **Test** - Run test suite
3. **Build** - Build frontend
4. **Deploy Staging** - Deploy to staging environment
5. **Smoke Tests (Staging)** - Validate staging deployment
6. **Deploy Production** - Deploy to production
7. **Smoke Tests (Production)** - Validate production deployment
8. **Load Test** - Performance validation

**Manual Trigger:**

```bash
# Trigger workflow manually
gh workflow run production-deploy.yml
```

---

## ✅ **Testing & Validation**

### 1. Smoke Tests

**Run locally:**

```bash
cd backend
TEST_URL=http://localhost:3001 npm run smoke-test
```

**Run against staging:**

```bash
TEST_URL=https://staging-api.mayatravel.ai \
TEST_API_KEY=your_staging_key \
npm run smoke-test
```

**Expected Output:**

```
🚀 Starting Maya Travel Agent Smoke Tests
Target URL: https://api.mayatravel.ai
────────────────────────────────────────────────────────────
✓ [2024-01-10T12:00:00.000Z] Health Check: PASSED
✓ [2024-01-10T12:00:01.000Z] Metrics Endpoint: PASSED
✓ [2024-01-10T12:00:05.000Z] Boss Agent Orchestration: PASSED
✓ [2024-01-10T12:00:08.000Z] AI Chat Endpoint: PASSED
✓ [2024-01-10T12:00:10.000Z] Skills System - Empathy Detection: PASSED
✓ [2024-01-10T12:00:15.000Z] Rate Limiting: PASSED
✓ [2024-01-10T12:00:16.000Z] Error Handling - Invalid Input: PASSED
✓ [2024-01-10T12:00:20.000Z] Concurrent Request Handling: PASSED
────────────────────────────────────────────────────────────
✅ Tests Passed: 8/8
❌ Tests Failed: 0/8
📊 Success Rate: 100.00%
🟢 All smoke tests PASSED
```

### 2. Load Testing with k6

```bash
# Install k6
# See: https://k6.io/docs/getting-started/installation/

# Run load test
K6_TARGET_URL=https://api.mayatravel.ai \
K6_API_KEY=your_api_key \
k6 run k6/load-test.js

# Custom load test
k6 run --vus 100 --duration 5m k6/load-test.js
```

---

## 🔒 **Security Checklist**

### Pre-Deployment Security Checklist

- [ ] All API keys stored in environment variables
- [ ] Collibra API key securely stored in GitHub Secrets
- [ ] Database connection uses SSL
- [ ] CORS configured for specific domains (not `*`)
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] Input validation on all endpoints
- [ ] JWT tokens with proper expiration
- [ ] Stripe webhook signature verification
- [ ] Telegram webhook uses HTTPS
- [ ] Dependencies audited (`npm audit`)
- [ ] Secrets not committed to git
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced on all domains
- [ ] Content Security Policy configured
- [ ] XSS protection enabled

### Post-Deployment Security Checks

```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm audit fix

# SSL/TLS check
curl -I https://api.mayatravel.ai

# CORS check
curl -H "Origin: https://malicious-site.com" -I https://api.mayatravel.ai
```

---

## 🎯 **Deployment Checklist**

### Before Deploying

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Collibra assets created and populated
- [ ] Database migrations run
- [ ] Backup created
- [ ] Team notified

### During Deployment

- [ ] CI/CD pipeline triggered
- [ ] Monitor deployment logs
- [ ] Watch for errors in real-time
- [ ] Smoke tests pass

### After Deployment

- [ ] Verify health endpoint
- [ ] Check Prometheus metrics
- [ ] Review Grafana dashboards
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Verify monitoring alerts
- [ ] Update documentation
- [ ] Notify stakeholders

---

## 📞 **Support & Troubleshooting**

### Common Issues

**1. Collibra Connection Failed**

```bash
# Test connection
curl -X GET "https://maya.collibra.com/rest/2.0/version" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Check credentials in .env
echo $COLLIBRA_API_KEY
```

**2. Deployment Failed**

```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs
```

**3. Smoke Tests Failed**

```bash
# Run with debug mode
DEBUG=* npm run smoke-test

# Test individual endpoints
curl https://api.mayatravel.ai/health
```

---

## 🚀 **Quick Deploy Commands**

```bash
# Full deployment from scratch
npm run deploy:full

# Backend only
npm run deploy:backend

# Frontend only
npm run deploy:frontend

# Run all tests
npm run test:all

# Monitor deployment
npm run deploy:monitor
```

---

**📚 Additional Resources:**

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Collibra Documentation](https://docs.collibra.com/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [k6 Documentation](https://k6.io/docs/)

---

**🎉 Happy Deploying!**

For support, contact: support@mayatravel.ai

