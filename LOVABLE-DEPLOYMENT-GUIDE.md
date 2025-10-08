# Maya Trips - Lovable Deployment Guide

## 🚀 Quick Start

Your frontend is deployed at: **https://maya-travel-agent.lovable.app/**

This guide helps you configure environment variables and fix auth redirects for production.

---

## 📋 Environment Variables for Lovable

### Required Variables

Go to your Lovable project settings and add these environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Site URL (IMPORTANT for auth redirects)
VITE_SITE_URL=https://maya-travel-agent.lovable.app

# App Configuration
VITE_APP_NAME=Maya Trips
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### How to Add Environment Variables in Lovable

1. Open your Maya Trips project in Lovable
2. Go to **Settings** → **Environment Variables**
3. Add each variable above
4. Click **Save** and **Redeploy**

---

## 🔧 Supabase Dashboard Configuration

### Step 1: Update Site URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Maya Trips project
3. Navigate to **Authentication** → **URL Configuration**
4. Update **Site URL** to: `https://maya-travel-agent.lovable.app`
5. Click **Save**

### Step 2: Add Redirect URLs

In the same **URL Configuration** section, add these to **Redirect URLs**:

```
https://maya-travel-agent.lovable.app
https://maya-travel-agent.lovable.app/auth/callback
https://maya-travel-agent.lovable.app/auth/reset-password
http://localhost:5173
http://localhost:5173/auth/callback
```

**Important:** Keep localhost URLs for local development testing.

---

## 📧 Customize Magic Link Email

### Access Email Templates

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Copy the custom template from `SUPABASE-REDIRECT-FIX.md`
4. Paste and save

The custom template includes:
- ✅ Bilingual (English + Arabic)
- ✅ Professional Maya Trips branding
- ✅ Security notices
- ✅ Mobile-responsive design
- ✅ Beautiful gradient colors

---

## ✅ Deployment Checklist

### Before Deploying

- [ ] Supabase URL added to Lovable environment variables
- [ ] Supabase Anon Key added to Lovable environment variables
- [ ] `VITE_SITE_URL` set to `https://maya-travel-agent.lovable.app`
- [ ] All environment variables saved in Lovable

### In Supabase Dashboard

- [ ] Site URL updated to production URL
- [ ] Redirect URLs list includes production URLs
- [ ] Email template customized (optional but recommended)
- [ ] Test email sent to verify template

### After Deploying

- [ ] Visit https://maya-travel-agent.lovable.app
- [ ] Test sign up with a test email
- [ ] Check email for magic link
- [ ] Click magic link - should redirect to production URL
- [ ] Verify successful login
- [ ] Test password reset flow
- [ ] Test OAuth (Google/GitHub) if enabled

---

## 🧪 Testing Auth Flows

### Test 1: Magic Link Sign Up

1. Go to https://maya-travel-agent.lovable.app
2. Click "Sign Up"
3. Enter email and password
4. Check email
5. Click magic link in email
6. **Expected:** Redirects to `https://maya-travel-agent.lovable.app/auth/callback`
7. **Expected:** Successfully logged in

### Test 2: Password Reset

1. Go to https://maya-travel-agent.lovable.app
2. Click "Forgot Password"
3. Enter email
4. Check email for reset link
5. Click reset link
6. **Expected:** Redirects to `https://maya-travel-agent.lovable.app/auth/reset-password`

### Test 3: OAuth Login (if enabled)

1. Click "Sign in with Google" or "Sign in with GitHub"
2. Complete OAuth flow
3. **Expected:** Redirects back to production URL
4. **Expected:** Successfully logged in

---

## 🐛 Troubleshooting

### Issue: Magic link still goes to localhost

**Solution:**
1. Check `VITE_SITE_URL` is set in Lovable environment variables
2. Redeploy the frontend after adding the variable
3. Clear browser cache
4. Try in incognito mode

### Issue: "Invalid Redirect URL" error

**Solution:**
1. Verify production URL is in Supabase Redirect URLs list
2. Check for typos (https vs http, trailing slashes)
3. Wait 5 minutes for Supabase settings to propagate

### Issue: Email template not updating

**Solution:**
1. Clear the template in Supabase (make it blank)
2. Save
3. Wait 1 minute
4. Paste new template
5. Save again

### Issue: CORS errors

**Solution:**
1. Make sure your backend allows requests from `https://maya-travel-agent.lovable.app`
2. Update `CORS_ORIGIN` in backend environment to include production URL
3. Restart backend server

---

## 📱 Backend Deployment (Optional)

If you want to deploy the backend for AI features:

### Backend Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Z.ai GLM-4.6
ZAI_API_KEY=4e4ab4737d0b4f0ca810ae233d4cbad3.BY1p4wRAwHCezeMh
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6

# CORS (IMPORTANT)
CORS_ORIGIN=https://maya-travel-agent.lovable.app

# Telegram (if using)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
WEB_APP_URL=https://maya-travel-agent.lovable.app

# Payments (if configured)
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Recommended Backend Hosting

- **Render.com** (Free tier available)
- **Railway.app** (Easy deployment)
- **Fly.io** (Global edge deployment)
- **Heroku** (Classic choice)

---

## 📊 Production URLs Summary

| Service | URL |
|---------|-----|
| Frontend (Lovable) | https://maya-travel-agent.lovable.app |
| Auth Callback | https://maya-travel-agent.lovable.app/auth/callback |
| Password Reset | https://maya-travel-agent.lovable.app/auth/reset-password |
| Supabase Dashboard | https://supabase.com/dashboard |

---

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `SUPABASE-REDIRECT-FIX.md` | Detailed fix instructions + email template |
| `frontend/env.production.example` | Production environment template |
| `frontend/src/lib/auth.ts` | Updated auth with dynamic redirects |

---

## 💡 Tips

### 1. Always Use Environment Variables
Never hardcode URLs in your code. Use `VITE_SITE_URL` for all redirects.

### 2. Test Locally First
Before deploying, test with localhost to ensure auth flows work.

### 3. Monitor Supabase Logs
Check **Logs** → **Auth Logs** in Supabase for debugging auth issues.

### 4. Keep Localhost URLs
Keep localhost URLs in Supabase Redirect URLs for local development.

### 5. Email Deliverability
Consider configuring custom SMTP in Supabase for better email deliverability.

---

## 🎯 Next Steps

1. ✅ Add environment variables to Lovable
2. ✅ Update Supabase dashboard settings
3. ✅ Customize email template
4. ✅ Deploy and test
5. 📱 (Optional) Deploy backend for AI features
6. 🔐 (Optional) Set up custom domain
7. 📊 (Optional) Add analytics

---

## 📞 Support

**Supabase Issues:**
- Check [Supabase Logs](https://supabase.com/dashboard) → Auth Logs
- [Supabase Docs](https://supabase.com/docs)

**Lovable Issues:**
- Check Lovable deployment logs
- Verify environment variables are set
- Try rebuilding the project

**Code Issues:**
- Check browser console for errors
- Verify network requests in DevTools
- Test in incognito mode

---

**Last Updated:** October 8, 2025  
**Production URL:** https://maya-travel-agent.lovable.app  
**Project:** Maya Trips - Travel Planning AI Assistant

