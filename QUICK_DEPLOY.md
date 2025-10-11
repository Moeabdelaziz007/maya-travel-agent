# 🚀 Quick Deploy Guide

**TL;DR:** Deploy in 10 minutes

---

## Prerequisites

```bash
# Install CLI tools
npm install -g vercel @railway/cli

# Login to both platforms
vercel login
railway login
```

---

## Step 1: Deploy Backend (Railway) 🛤️

```bash
cd /Users/Shared/amrikyy-travel-agent
chmod +x deploy-backend.sh
./deploy-backend.sh
```

**Or manually:**

```bash
cd backend
railway init
railway up
railway status  # Get your URL
```

### Set Environment Variables in Railway Dashboard:

**Required:**

- `NODE_ENV=production`
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_ANON_KEY=your_key`
- `SUPABASE_SERVICE_ROLE_KEY=your_key`
- `TELEGRAM_BOT_TOKEN=your_token`
- `ZAI_API_KEY=your_key`
- `ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4`
- `ZAI_MODEL=glm-4.6`
- `JWT_SECRET=random_secret_here`
- `CORS_ORIGIN=https://your-vercel-app.vercel.app`
- `FRONTEND_URL=https://your-vercel-app.vercel.app`

**Optional (Payments):**

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

---

## Step 2: Deploy Frontend (Vercel) ⚡

```bash
cd /Users/Shared/amrikyy-travel-agent
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

**Or manually:**

```bash
cd /Users/Shared/amrikyy-travel-agent
vercel --prod
```

### Set Environment Variables in Vercel Dashboard:

1. Go to: Settings → Environment Variables
2. Add:

   - `VITE_API_BASE_URL` = `https://your-railway-app.railway.app`
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

3. Redeploy: `vercel --prod`

---

## Step 3: Post-Deployment Configuration 🔧

### Update Telegram Webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-railway-app.railway.app/api/payment/telegram-webhook"
```

### Update CORS in Railway:

```bash
railway variables set CORS_ORIGIN=https://your-vercel-app.vercel.app
railway variables set FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Test Deployments:

```bash
# Test backend health
curl https://your-railway-app.railway.app/health

# Test frontend
open https://your-vercel-app.vercel.app
```

---

## Troubleshooting 🔍

### Frontend can't connect to backend?

- Check `VITE_API_BASE_URL` in Vercel matches Railway URL
- Verify CORS is set correctly in Railway

### Backend shows "Application Error"?

```bash
railway logs
```

### Build fails?

```bash
# Test locally first
cd frontend && npm run build
cd ../backend && npm run build
```

---

## Get Your URLs 🔗

```bash
# Railway backend URL
cd backend && railway status

# Vercel frontend URL
cd .. && vercel ls
```

---

**That's it! Your app is live! 🎉**
