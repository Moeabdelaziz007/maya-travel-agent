# Vercel Environment Variables Setup

## 🚨 **URGENT: Required Environment Variables**

Your Maya Travel Agent app is deployed but needs environment variables to work properly.

---

## 📋 **Required Variables for Vercel**

Add these environment variables to your Vercel project:

### **1. Supabase Configuration** (Required)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### **2. Site URL** (Required for Auth)
```bash
VITE_SITE_URL=https://frontend-r5ebx6ndg-mohameds-projects-e3d02482.vercel.app
```

### **3. Google Maps** (Optional - for map features)
```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **4. AI Services** (Optional - for AI features)
```bash
VITE_GLM_API_KEY=your_glm_api_key
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_GROQ_API_KEY=your_groq_api_key
```

---

## 🔧 **How to Add Environment Variables to Vercel**

### **Method 1: Via Vercel Dashboard** (Recommended)

1. Go to: https://vercel.com/mohameds-projects-e3d02482/frontend
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. For each variable:
   - Click **"Add New"**
   - Enter the **Name** (e.g., `VITE_SUPABASE_URL`)
   - Enter the **Value** (your actual URL/key)
   - Select **Production**, **Preview**, and **Development**
   - Click **Save**
5. After adding all variables, **redeploy** the project:
   - Go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

### **Method 2: Via Vercel CLI**

```bash
cd /Users/Shared/maya-travel-agent/frontend

# Add each variable
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase Anon Key when prompted

vercel env add VITE_SITE_URL
# Paste: https://frontend-r5ebx6ndg-mohameds-projects-e3d02482.vercel.app

# Redeploy after adding all variables
vercel --prod
```

---

## 📍 **Where to Find Your Supabase Credentials**

### **If you have an existing Supabase project:**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click on **Settings** (gear icon)
4. Click on **API** in the left sidebar
5. Copy:
   - **Project URL** → use for `VITE_SUPABASE_URL`
   - **anon public** key → use for `VITE_SUPABASE_ANON_KEY`

### **If you DON'T have a Supabase project yet:**

1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New Project"**
5. Fill in:
   - **Name:** maya-travel-agent
   - **Database Password:** (create a strong password)
   - **Region:** Choose closest to your users
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup
8. Once ready, go to **Settings → API** to get your credentials

---

## 🗄️ **Database Setup (Required)**

After creating your Supabase project, you need to set up the database:

### **Run the database migrations:**

```bash
cd /Users/Shared/maya-travel-agent

# If you have Supabase CLI installed:
supabase db push

# OR manually run the SQL migrations:
# Go to Supabase Dashboard → SQL Editor
# Copy and paste each file from supabase/migrations/
# Execute them in order (oldest to newest)
```

### **Migrations to run:**
1. `20251007194755_05b184f9-cfae-41cb-acb2-eac72eb7c1c4.sql`
2. `20251007195104_24108003-e206-4bab-a9bc-b48966d0a932.sql`
3. `20251007195119_992f9a58-5686-4d0f-9813-ac83c17a0d7e.sql`
4. `20251008015202_01da0576-b29a-4ce3-bcf7-812d30acbd0b.sql`
5. `20251008120715_7b9edf90-0c9e-443e-b219-5cbe008a2f8c.sql`
6. `20251008120832_8ab42a6f-c82d-44ef-8848-ece6e3760de3.sql`
7. `20251008123053_cad1d883-d894-4208-a0f3-f996f0ffd8bb.sql`
8. `20251008123313_90f491d5-b42b-4c80-82bd-ff9c953d7a6e.sql`

---

## 🔒 **Auth Redirect URLs**

In your Supabase Dashboard:

1. Go to **Authentication → URL Configuration**
2. Add to **Redirect URLs:**
   ```
   https://frontend-r5ebx6ndg-mohameds-projects-e3d02482.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
3. Set **Site URL** to:
   ```
   https://frontend-r5ebx6ndg-mohameds-projects-e3d02482.vercel.app
   ```

---

## ✅ **Verification Checklist**

After adding environment variables:

- [ ] Supabase URL added to Vercel
- [ ] Supabase Anon Key added to Vercel
- [ ] Site URL configured
- [ ] Redeployed the Vercel project
- [ ] Database migrations run
- [ ] Auth redirect URLs configured in Supabase
- [ ] Visited the live site to test

---

## 🚀 **Quick Deploy with Environment Variables**

If you want to redeploy after adding env vars:

```bash
cd /Users/Shared/maya-travel-agent/frontend
vercel --prod --yes
```

---

## 🆘 **Troubleshooting**

### **Error: "Invalid supabaseUrl"**
- ✅ **Solution:** Add `VITE_SUPABASE_URL` environment variable to Vercel
- The URL should look like: `https://xxxxxxxxxxxxx.supabase.co`

### **Error: "supabaseKey is required"**
- ✅ **Solution:** Add `VITE_SUPABASE_ANON_KEY` environment variable to Vercel
- This is a long string starting with `eyJ...`

### **Authentication not working**
- ✅ **Solution:** 
  1. Add redirect URLs in Supabase dashboard
  2. Set `VITE_SITE_URL` environment variable
  3. Redeploy

### **Environment variables not taking effect**
- ✅ **Solution:** 
  1. Make sure you selected **Production** environment when adding
  2. Redeploy the project after adding variables
  3. Wait 30-60 seconds for deployment to complete

---

## 📞 **Need Help?**

If you get stuck:

1. Check the Vercel build logs for errors
2. Check browser console for specific error messages
3. Verify all environment variables are set correctly
4. Make sure database migrations are run

---

**⚡ Priority Action:** Add the Supabase environment variables to Vercel and redeploy!

