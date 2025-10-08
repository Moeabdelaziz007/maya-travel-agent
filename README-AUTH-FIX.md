# 🔐 Quick Fix: Magic Link Redirect Issue

## Problem
Magic links redirect to `localhost` instead of `https://maya-travel-agent.lovable.app`

## Solution (3 Steps - 15 minutes)

### Step 1: Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. **Authentication** → **URL Configuration**
3. Set **Site URL**: `https://maya-travel-agent.lovable.app`
4. Add to **Redirect URLs**:
   ```
   https://maya-travel-agent.lovable.app
   https://maya-travel-agent.lovable.app/auth/callback
   https://maya-travel-agent.lovable.app/auth/reset-password
   http://localhost:5173
/localhost:5173/auth/callback   http:/
   ```
5. **Save**

### Step 2: Lovable Environment
1. Open Lovable project
2. **Settings** → **Environment Variables**
3. Add:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SITE_URL=https://maya-travel-agent.lovable.app
   ```
4. **Save** & **Redeploy**

### Step 3: Test
1. Visit https://maya-travel-agent.lovable.app
2. Sign up with test email
3. Click magic link
4. ✅ Should redirect to production URL

## Documentation

| Quick | Detailed |
|-------|----------|
| This file | `DEPLOYMENT-CHECKLIST.md` |
| `AUTH-FIX-SUMMARY.md` | `SUPABASE-REDIRECT-FIX.md` |

## Check Configuration
```bash
./verify-auth-config.sh
```

## Status
✅ Code: Complete  
⚠️ Config: Needs Steps 1-2  

---
**All code changes done. You just need to configure Supabase + Lovable (15 min)**

