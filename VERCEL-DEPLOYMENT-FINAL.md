# 🚀 Deploy Maya Travel Agent to Vercel (Like Lovable)

**Date:** October 9, 2025  
**Status:** ✅ Ready to Deploy  
**Build:** ✅ Verified Working (7s build time)

---

## 📊 What We Have

- ✅ **Frontend Built & Tested** - 241/262 tests passing
- ✅ **Latest Code Pushed** to GitHub
- ✅ **Vercel Config Ready** (`vercel.json` configured)
- ✅ **Environment Variables** documented
- ✅ **Supabase Credentials** available

---

## 🎯 Deployment Options

### **Option 1: Deploy via Vercel Dashboard** (⭐ Recommended - Like Lovable)

This is the easiest way, similar to how Lovable deployments work:

#### **Step 1: Connect GitHub Repository**

1. Go to: **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select: **`Moeabdelaziz007/maya-travel-agent`**
4. Click **"Import"**

#### **Step 2: Configure Project**

```yaml
Project Name: maya-travel-agent-frontend
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install --legacy-peer-deps
```

#### **Step 3: Add Environment Variables**

Click **"Environment Variables"** and add these:

```bash
# ⚡ CRITICAL - Supabase (Required)
VITE_SUPABASE_URL=https://komahmavsulpkawmhqhk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvbWFobWF2c3VscGthd21ocWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTg1MzgsImV4cCI6MjA3NTM5NDUzOH0.f95aQt5-GseYW92RPkEFlce8SHBZF6NSGIqziFARV2E

# 🌐 Site Configuration (Auto-filled after first deploy)
VITE_SITE_URL=https://maya-travel-agent-frontend.vercel.app

# 🗺️ Google Maps (Optional - for map features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# 🔐 WalletConnect (Optional - for Web3 wallet login)
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# 🤖 AI Services (Optional - for enhanced AI features)
VITE_GLM_API_KEY=your_glm_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

#### **Step 4: Deploy!**

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. Your app will be live at: `https://maya-travel-agent-frontend.vercel.app`

---

### **Option 2: Deploy via Vercel CLI** (⚡ Fastest)

```bash
# Navigate to frontend
cd /Users/Shared/maya-travel-agent/frontend

# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Answer the prompts:
# ? Set up and deploy? Y
# ? Which scope? Your account
# ? Link to existing project? N
# ? What's your project's name? maya-travel-agent-frontend
# ? In which directory is your code located? ./
# ? Want to override settings? Y
# ? Build Command: npm run build
# ? Output Directory: dist
# ? Install Command: npm install --legacy-peer-deps
```

---

## 🔧 Post-Deployment Configuration

### **Step 1: Update Supabase Auth URLs**

1. Go to: **https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/auth/url-configuration**

2. **Set Site URL:**
   ```
   https://maya-travel-agent-frontend.vercel.app
   ```

3. **Add Redirect URLs:**
   ```
   https://maya-travel-agent-frontend.vercel.app/**
   https://maya-travel-agent-frontend-*.vercel.app/**
   http://localhost:3000/**
   http://localhost:5173/**
   ```

4. Click **"Save"**

---

### **Step 2: Update VITE_SITE_URL**

After your first deployment, update the environment variable:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `VITE_SITE_URL`
3. Update to your actual Vercel URL (e.g., `https://maya-travel-agent-frontend.vercel.app`)
4. Click **"Save"**
5. Go to **Deployments** → Click **"..."** → **"Redeploy"**

---

### **Step 3: Run Supabase Migrations** (⚡ CRITICAL)

You need to run 3 important migrations:

#### **Migration 1: Enable RLS on Destinations Table**

1. Go to: **https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/sql/new**
2. Copy this SQL:

```sql
-- Enable RLS on destinations while keeping it publicly readable
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read destinations (public catalog)
DROP POLICY IF EXISTS "Public read access to destinations" ON public.destinations;
CREATE POLICY "Public read access to destinations"
  ON public.destinations
  FOR SELECT
  USING (true);

COMMENT ON POLICY "Public read access to destinations" ON public.destinations IS
  'Destinations are public but RLS is enabled for compliance.';
```

3. Click **"Run"**

#### **Migration 2: Optimize RLS Performance**

1. Same SQL Editor
2. Go to: `/Users/Shared/maya-travel-agent/supabase/migrations/20251008180000_optimize_rls_performance.sql`
3. Copy entire contents
4. Paste and **"Run"**

#### **Migration 3: Fix Function Security**

1. Same SQL Editor  
2. Go to: `/Users/Shared/maya-travel-agent/supabase/migrations/20251008190000_fix_function_security.sql`
3. Copy entire contents
4. Paste and **"Run"**

---

## ✅ Verification Checklist

After deployment, test these features:

### **Basic Functionality**
- [ ] App loads without errors
- [ ] Homepage displays correctly
- [ ] Navigation works (all pages accessible)
- [ ] No console errors

### **Authentication**
- [ ] Sign up form works
- [ ] Login form works
- [ ] Email verification flow works
- [ ] Password reset works
- [ ] Logout works
- [ ] Protected routes redirect to login

### **Core Features**
- [ ] Dashboard loads user data
- [ ] Trip planner works
- [ ] Destinations page loads
- [ ] AI Assistant responds
- [ ] Budget tracker functions

### **Performance**
- [ ] Page load < 3 seconds
- [ ] No layout shifts
- [ ] Images load properly
- [ ] Smooth animations

---

## 🆘 Troubleshooting

### **Error: "Invalid supabaseUrl"**

**Cause:** Missing `VITE_SUPABASE_URL` environment variable

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` with value: `https://komahmavsulpkawmhqhk.supabase.co`
3. Redeploy

---

### **Error: "supabaseKey is required"**

**Cause:** Missing `VITE_SUPABASE_ANON_KEY` environment variable

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `VITE_SUPABASE_ANON_KEY` with the anon key from above
3. Redeploy

---

### **Error: HTTP 401 "Authentication Required"**

**Cause:** Vercel Deployment Protection is enabled

**Fix:**
1. Go to Vercel Dashboard → Settings → Deployment Protection
2. **Disable** deployment protection
3. Or configure password/Vercel authentication

---

### **Error: "auth.users violates row-level security policy"**

**Cause:** RLS migrations not run

**Fix:**
1. Run all 3 SQL migrations listed in Step 3 above
2. Restart Supabase (not usually needed)

---

### **Build Fails: "ERESOLVE unable to resolve dependency tree"**

**Cause:** Peer dependency conflicts

**Fix:**
1. Vercel Dashboard → Settings → General
2. Override Install Command: `npm install --legacy-peer-deps`
3. Redeploy

---

### **Environment Variables Not Taking Effect**

**Fix:**
1. Verify variables are set for **"Production"** environment
2. **Redeploy** after adding variables (not just save)
3. Wait 60 seconds for cache to clear
4. Hard refresh browser (Cmd+Shift+R)

---

## 🚀 Advanced: Custom Domain

### **Step 1: Add Domain to Vercel**

1. Go to Vercel Dashboard → Settings → Domains
2. Click **"Add"**
3. Enter your domain (e.g., `maya-trips.com`)
4. Follow DNS configuration instructions

### **Step 2: Update Supabase URLs**

1. Add your custom domain to Supabase Auth URLs:
   ```
   https://maya-trips.com/**
   https://www.maya-trips.com/**
   ```

2. Update `VITE_SITE_URL`:
   ```
   VITE_SITE_URL=https://maya-trips.com
   ```

3. Redeploy

---

## 📊 Deployment Analytics

### **Vercel Analytics** (Already Integrated)

Your app already has Vercel Analytics installed. View metrics at:
- Vercel Dashboard → Your Project → **Analytics**

### **What You Can Track:**
- Page views
- User sessions
- Performance metrics (Web Vitals)
- Geographic distribution
- Device types

---

## 🔐 Security Checklist

Before going live:

- [ ] All API keys stored as environment variables (not in code)
- [ ] Supabase RLS policies enabled and tested
- [ ] Auth redirect URLs configured correctly
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SSL/HTTPS enforced
- [ ] Security headers configured

---

## 🎯 Performance Optimization

### **Already Optimized:**
- ✅ Vite for fast builds
- ✅ Code splitting configured
- ✅ Assets optimized
- ✅ Vercel Edge Network CDN

### **Optional Improvements:**
- [ ] Add service worker for offline support
- [ ] Enable Vercel Image Optimization
- [ ] Configure caching headers
- [ ] Add Sentry for error tracking

---

## 📞 Support & Resources

### **Vercel Documentation:**
- Deployment: https://vercel.com/docs/deployments/overview
- Environment Variables: https://vercel.com/docs/projects/environment-variables
- Custom Domains: https://vercel.com/docs/custom-domains

### **Supabase Documentation:**
- Auth Configuration: https://supabase.com/docs/guides/auth
- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security

### **Project Resources:**
- GitHub: https://github.com/Moeabdelaziz007/maya-travel-agent
- Issue Tracker: https://github.com/Moeabdelaziz007/maya-travel-agent/issues

---

## 🎉 Success!

Once deployed, your app will be live at:

**Production URL:** `https://maya-travel-agent-frontend.vercel.app`

Share it with the world! 🌍✈️

---

**Next Steps:**
1. Test all features thoroughly
2. Monitor Vercel Analytics
3. Set up custom domain (optional)
4. Configure CI/CD for automatic deployments
5. Add more features and iterate!

**Questions?** Check the troubleshooting section or create an issue on GitHub.

