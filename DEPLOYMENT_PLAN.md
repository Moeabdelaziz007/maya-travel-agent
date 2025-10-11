# 🚀 Amrikyy Platform Deployment Plan

**Goal:** Deploy Frontend on Vercel and Backend on Railway

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  User Browser → Vercel (Frontend) → Railway (Backend)  │
│                    ↓                      ↓             │
│               Supabase DB         Z.ai / Telegram      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Frontend: **Vercel**
- **What:** React + Vite SPA
- **Location:** `/frontend` directory
- **Build Output:** `/frontend/dist`
- **Domain:** Auto-assigned `.vercel.app` domain (can be customized)

### Backend: **Railway**
- **What:** Node.js + Express API
- **Location:** `/backend` directory
- **Port:** 5000 (Railway will auto-assign public port)
- **Health Check:** `/health` endpoint

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Killed local processes to free up system resources
- [x] Reviewed project structure (monorepo with frontend/backend)
- [x] Identified environment variables needed
- [x] Existing `vercel.json` found (needs update)

### 🔧 To Do Before Deploy

- [ ] Create Railway configuration files
- [ ] Update frontend to use Railway backend URL (not localhost)
- [ ] Add health check endpoint to backend
- [ ] Test build process locally
- [ ] Set up environment variables in Vercel and Railway dashboards
- [ ] Configure CORS to allow Vercel domain
- [ ] Update Telegram webhook URLs to Railway domain

---

## 📁 Files to Create/Update

### 1. Backend Health Check (`/backend/routes/health.js`)
```javascript
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production'
  });
});

module.exports = router;
```

### 2. Railway Configuration (`/backend/railway.toml`)
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

### 3. Nixpacks Configuration (`/backend/nixpacks.toml`)
```toml
[phases.setup]
nixPkgs = ["nodejs_18"]

[phases.install]
cmds = ["npm ci --omit=dev"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### 4. Updated Root Vercel Config (`/vercel.json`)
```json
{
  "version": 2,
  "name": "amrikyy-platform",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api_base_url",
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### 5. Frontend Environment Variables File (`.env.production`)
```bash
# This will be set in Vercel dashboard
VITE_API_BASE_URL=https://your-railway-backend.railway.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🔐 Environment Variables Setup

### Vercel (Frontend) Variables
| Variable Name | Description | Example |
|--------------|-------------|---------|
| `VITE_API_BASE_URL` | Railway backend URL | `https://amrikyy-backend.railway.app` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key | `eyJ...` |

### Railway (Backend) Variables
| Variable Name | Description | Required? |
|--------------|-------------|-----------|
| `PORT` | Server port (Railway auto-assigns) | ✅ Yes |
| `NODE_ENV` | Environment (production) | ✅ Yes |
| `SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `SUPABASE_ANON_KEY` | Supabase public key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | ✅ Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | ✅ Yes |
| `TELEGRAM_WEBHOOK_URL` | Railway webhook endpoint | ⚠️ Update after deploy |
| `ZAI_API_KEY` | Z.ai API key | ✅ Yes |
| `ZAI_API_BASE_URL` | Z.ai endpoint | ✅ Yes |
| `ZAI_MODEL` | AI model name | ✅ Yes (glm-4.6) |
| `STRIPE_SECRET_KEY` | Stripe secret key | ⚠️ Optional |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ⚠️ Optional |
| `JWT_SECRET` | JWT signing secret | ✅ Yes |
| `CORS_ORIGIN` | Allowed origins | ✅ Yes (Vercel URL) |
| `FRONTEND_URL` | Frontend URL | ✅ Yes (Vercel URL) |

---

## 🚀 Deployment Steps

### Phase 1: Backend Deployment on Railway

#### Step 1: Install Railway CLI (if needed)
```bash
npm i -g @railway/cli
```

#### Step 2: Login to Railway
```bash
railway login
```

#### Step 3: Initialize Railway Project
```bash
cd /Users/Shared/amrikyy-travel-agent/backend
railway init
```

#### Step 4: Link to Railway Project
```bash
railway link
```

#### Step 5: Set Environment Variables
```bash
# Option A: Set via CLI
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=your_value
railway variables set SUPABASE_ANON_KEY=your_value
# ... (set all required variables)

# Option B: Set via Railway Dashboard (Recommended)
# Go to: https://railway.app/project/your-project/variables
```

#### Step 6: Deploy Backend
```bash
railway up
```

#### Step 7: Get Backend URL
```bash
railway status
# Copy the deployment URL (e.g., https://amrikyy-backend.railway.app)
```

#### Step 8: Update CORS and Frontend URL
```bash
# Update in Railway dashboard:
CORS_ORIGIN=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

### Phase 2: Frontend Deployment on Vercel

#### Step 1: Install Vercel CLI (if needed)
```bash
npm i -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy from Root Directory
```bash
cd /Users/Shared/amrikyy-travel-agent
vercel --prod
```

#### Step 4: Set Environment Variables in Vercel Dashboard
1. Go to: https://vercel.com/your-username/amrikyy-platform/settings/environment-variables
2. Add variables:
   - `VITE_API_BASE_URL` = Your Railway backend URL
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

#### Step 5: Redeploy to Apply Variables
```bash
vercel --prod
```

---

### Phase 3: Post-Deployment Configuration

#### Step 1: Update Telegram Webhook
```bash
# Update webhook to point to Railway backend
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook?url=https://your-railway-backend.railway.app/api/payment/telegram-webhook"
```

#### Step 2: Update Stripe Webhook (if using Stripe)
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-railway-backend.railway.app/api/stripe-webhook`
3. Update `STRIPE_WEBHOOK_SECRET` in Railway

#### Step 3: Test Deployments
```bash
# Test backend health
curl https://your-railway-backend.railway.app/health

# Test frontend
open https://your-vercel-app.vercel.app
```

---

## 🔍 Debugging & Monitoring

### Railway Logs
```bash
# View live logs
railway logs

# View logs for specific service
railway logs --service backend
```

### Vercel Logs
```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

### Common Issues & Fixes

#### Issue: Build fails on Vercel
**Fix:** Check that `frontend/package.json` has correct build script
```bash
cd frontend
npm run build  # Test locally first
```

#### Issue: Backend shows "Application Error" on Railway
**Fix:** Check Railway logs for errors
```bash
railway logs
```

#### Issue: CORS errors in browser console
**Fix:** Update `CORS_ORIGIN` in Railway to include Vercel URL
```bash
railway variables set CORS_ORIGIN=https://your-vercel-app.vercel.app
```

#### Issue: Frontend can't connect to backend
**Fix:** Verify `VITE_API_BASE_URL` in Vercel matches Railway URL

---

## 📊 Success Metrics

After deployment, verify:
- [ ] Frontend loads at Vercel URL
- [ ] Backend health check responds at `/health`
- [ ] Frontend can make API calls to backend
- [ ] Authentication works (Supabase)
- [ ] AI chat works (Z.ai integration)
- [ ] Telegram bot receives messages
- [ ] Payment webhooks work (if configured)

---

## 🎉 Next Steps After Deployment

1. **Custom Domains:**
   - Vercel: Settings → Domains → Add domain
   - Railway: Settings → Networking → Add custom domain

2. **SSL/HTTPS:**
   - Both Vercel and Railway provide automatic HTTPS
   - No additional configuration needed

3. **Monitoring:**
   - Set up Vercel Analytics
   - Use Railway built-in metrics
   - Configure alerts for downtime

4. **CI/CD:**
   - Vercel: Automatic deployments from GitHub
   - Railway: Automatic deployments from GitHub
   - Connect GitHub repo to both platforms

---

## 🛟 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Railway CLI:** https://docs.railway.app/develop/cli
- **Vercel CLI:** https://vercel.com/docs/cli

---

**Last Updated:** 2025-10-11
**Status:** Ready to Deploy 🚀

