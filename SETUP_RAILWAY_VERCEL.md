# 🚀 Railway & Vercel Setup Guide

**Complete setup instructions for deploying Amrikyy to Railway and Vercel**

---

## 📋 Prerequisites

- [ ] **Railway Account**: https://railway.app
- [ ] **Vercel Account**: https://vercel.com
- [ ] **GitHub Repository**: Push your code to GitHub
- [ ] **API Keys Ready**:
  - Supabase URL & keys
  - Z.ai API key
  - Telegram bot token (optional)

---

## 🛤️ Part 1: Railway Setup (Backend)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Create Railway Project

```bash
cd /Users/Shared/maya-travel-agent/backend
railway init
# Choose "Empty Project" when prompted
```

### Step 3: Link to Existing Project (or create new)

```bash
railway link
# Select your project from the list
```

### Step 4: Deploy Backend

```bash
railway up
```

### Step 5: Get Railway URL

```bash
railway status
# Copy the deployment URL (e.g., https://amrikyy-backend.railway.app)
```

### Step 6: Configure Environment Variables

Go to: https://railway.app/project/YOUR_PROJECT/variables

Add these variables:

#### Required Variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_key...

# AI (Z.ai GLM-4.6)
ZAI_API_KEY=sk-...your_key...
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6
ZAI_MAX_TOKENS=2000
ZAI_TEMPERATURE=0.7

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# CORS (will update after Vercel deployment)
CORS_ORIGIN=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app

# Redis Configuration (Optional - for caching)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

#### Optional Variables (for full functionality):

```bash
# Telegram Bot (if using Telegram features)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://your-app.railway.app/api/payment/telegram-webhook

# Payments (Stripe/PayPal)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# External APIs
OPENWEATHER_API_KEY=your_weather_api_key
AMADEUS_API_KEY=your_amadeus_key
AMADEUS_API_SECRET=your_amadeus_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
RAPIDAPI_KEY=your_rapidapi_key
```

### Step 7: Verify Backend Deployment

```bash
# Test health endpoint
curl https://your-railway-app.railway.app/health

# Should return:
{
  "status": "healthy",
  "service": "amrikyy-backend",
  "timestamp": "...",
  "uptime": 123.45,
  "version": "2.0.0"
}
```

---

## ⚡ Part 2: Vercel Setup (Frontend)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy Frontend

```bash
cd /Users/Shared/maya-travel-agent
vercel --prod
```

### Step 3: Configure Vercel Project

When prompted:

- **Link to existing project?** No (create new)
- **Project name:** `amrikyy-platform` or `amrikyy-frontend`
- **Directory:** `./frontend` (select frontend directory)

### Step 4: Set Environment Variables in Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these variables:

```bash
# Backend API URL (from Railway)
VITE_API_BASE_URL=https://your-railway-app.railway.app

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key...

# Telegram Bot (optional)
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

### Step 5: Redeploy with Variables

```bash
vercel --prod
```

### Step 6: Get Vercel URL

After deployment, Vercel will give you a URL like:

```
https://amrikyy-platform.vercel.app
```

---

## 🔄 Part 3: Update CORS & Webhooks

### Step 1: Update Railway CORS

Go back to Railway dashboard and update:

```bash
CORS_ORIGIN=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 2: Redeploy Railway

```bash
cd /Users/Shared/maya-travel-agent/backend
railway up
```

### Step 3: Set up Telegram Webhook (if using Telegram)

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-railway-app.railway.app/api/payment/telegram-webhook"
```

### Step 4: Set up Stripe Webhook (if using Stripe)

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-railway-app.railway.app/api/stripe-webhook`
3. Copy the webhook secret to Railway environment variables

---

## 🧪 Part 4: Testing Deployment

### Test Backend APIs

```bash
# Health check
curl https://your-railway-app.railway.app/health

# API endpoints
curl https://your-railway-app.railway.app/api/health
curl https://your-railway-app.railway.app/api/health/detailed
```

### Test Frontend

1. Open: `https://your-vercel-app.vercel.app`
2. Try basic navigation
3. Test authentication (should work with Supabase)
4. Check browser console for CORS errors

### Test Integration

```bash
# Frontend should be able to call backend APIs
# No CORS errors in browser console
# Authentication should work
# AI chat should respond (if Z.ai key configured)
```

---

## 🔧 Troubleshooting

### Railway Issues

#### "Application Error" on Railway

```bash
railway logs
# Check for errors in logs
```

#### Environment Variables Not Working

```bash
railway variables list
# Verify variables are set correctly
```

#### Database Connection Issues

- Check Supabase URL and keys
- Verify Supabase project allows Railway IP

### Vercel Issues

#### Build Fails on Vercel

```bash
cd frontend
npm run build  # Test locally first
```

#### Environment Variables Not Working

- Vercel variables use `VITE_` prefix for client-side
- Redeploy after adding variables: `vercel --prod`

#### CORS Errors

- Ensure Railway CORS_ORIGIN matches Vercel URL exactly
- Check for https:// vs http:// mismatch

### Common Fixes

#### Redeploy Everything

```bash
# Railway
cd backend && railway up

# Vercel
cd .. && vercel --prod
```

#### Check Logs

```bash
# Railway logs
railway logs

# Vercel logs
vercel logs
```

---

## 📊 Monitoring

### Railway Monitoring

- Dashboard: https://railway.app/project/YOUR_PROJECT
- View metrics, logs, and environment variables
- Monitor usage and costs

### Vercel Monitoring

- Dashboard: https://vercel.com/dashboard
- Analytics and performance metrics
- Function logs and error tracking

---

## 🎯 Success Checklist

- [ ] Railway project created and linked
- [ ] Backend deployed successfully
- [ ] Environment variables configured in Railway
- [ ] Vercel project created
- [ ] Frontend deployed successfully
- [ ] Environment variables configured in Vercel
- [ ] CORS updated with correct Vercel URL
- [ ] Frontend loads without errors
- [ ] API calls work (no CORS errors)
- [ ] Authentication works
- [ ] Basic functionality tested

---

## 🚀 Production Ready Features

Once deployed, you have:

✅ **Scalable Backend** on Railway
✅ **CDN-Enabled Frontend** on Vercel
✅ **Database Integration** with Supabase
✅ **AI Chat** with Z.ai GLM-4.6
✅ **Payment Processing** (Stripe/PayPal)
✅ **Telegram Bot** integration
✅ **Health Monitoring** and metrics
✅ **Rate Limiting** and security
✅ **Redis Caching** (when configured)

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Railway Discord**: https://discord.gg/railway
- **Vercel Discord**: https://vercel.community

---

**Ready to deploy? Start with Railway setup! 🚀**
