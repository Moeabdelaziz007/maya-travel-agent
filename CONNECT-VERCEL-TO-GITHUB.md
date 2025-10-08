# Connect Vercel to GitHub Repository

## ✅ **Git Changes Pushed Successfully!**

**Commit:** `ff03ad6` - feat: merge frontend/backend with shadcn/ui, Web3 auth, Vercel integration  
**Branch:** `cursor/optimize-memory-and-performance-with-multimodal-features-296e`  
**Repository:** https://github.com/Moeabdelaziz007/maya-travel-agent

**Changes:** 145 files changed, 38,871 insertions, 3,601 deletions

---

## 🔗 **Connect Vercel to GitHub for Auto-Deploy**

### **Why Connect to GitHub?**

Right now you're deploying manually with `vercel --prod`. When connected to GitHub:
- ✅ **Auto-deploy** on every push
- ✅ **Preview deployments** for branches
- ✅ **Rollback** to any previous commit
- ✅ **Team collaboration** easier
- ✅ **No manual deploys** needed

---

## 🚀 **How to Connect (2 Methods)**

### **Method 1: Via Vercel Dashboard** (Recommended)

1. **Go to your Vercel project:**
   https://vercel.com/mohameds-projects-e3d02482/frontend

2. **Click "Settings"** (top navigation)

3. **Click "Git"** in left sidebar

4. **Click "Connect Git Repository"**

5. **Select GitHub**

6. **Authorize Vercel** to access your GitHub (if not already)

7. **Select repository:**
   - Organization: `Moeabdelaziz007`
   - Repository: `maya-travel-agent`

8. **Configure:**
   - **Root Directory:** `frontend`  ⚠️ IMPORTANT!
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build:dev`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install --legacy-peer-deps`

9. **Click "Connect"**

10. **Done!** ✅

---

### **Method 2: Create New Project from GitHub** (Alternative)

If the above doesn't work, create a fresh project:

1. **Go to:** https://vercel.com/new

2. **Import Git Repository:**
   - Click "Add GitHub Account" if needed
   - Select: `Moeabdelaziz007/maya-travel-agent`
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** `maya-travel-agent-frontend`
   - **Framework:** Vite
   - **Root Directory:** `frontend` ⚠️ IMPORTANT!
   - **Build Command:** `npm run build:dev`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install --legacy-peer-deps`

4. **Add Environment Variables:**
   - Click "Add" for each:
   - `VITE_SUPABASE_URL` = `https://komahmavsulpkawmhqhk.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (same as anon key)

5. **Click "Deploy"**

6. **Delete old project** (optional):
   - Go to old project settings
   - Scroll to "Danger Zone"
   - Delete project

---

## ⚙️ **Important: Root Directory Setting**

### **CRITICAL CONFIGURATION:**

Since your repository has this structure:
```
maya-travel-agent/
├── frontend/     ← Your Vite app is here
├── backend/
└── supabase/
```

**You MUST set:**
```
Root Directory: frontend
```

**Otherwise Vercel will try to build from the root and fail!**

---

## 🔄 **Auto-Deploy Workflow After Connection**

Once connected:

1. **Make changes** locally
2. **Commit:** `git commit -m "your message"`
3. **Push:** `git push`
4. **Vercel automatically:**
   - Detects the push
   - Builds your project
   - Deploys to production
   - Sends you notification
   - Updates your domain

**No more manual `vercel --prod` needed!** 🎉

---

## 📋 **Deployment Settings to Configure**

After connecting, verify these settings in Vercel:

### **Build & Development Settings:**
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build:dev
Output Directory: dist
Install Command: npm install --legacy-peer-deps
Development Command: npm run dev
```

### **Environment Variables:**
Make sure these are set (Settings → Environment Variables):
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_ANON_KEY` ✅
- `VITE_SUPABASE_PUBLISHABLE_KEY` ✅
- `VITE_WALLETCONNECT_PROJECT_ID` ⏳ (get from cloud.walletconnect.com)

---

## 🌿 **Branch Configuration**

### **Production Branch:**
- **Branch:** `main` or `cursor/optimize-memory-and-performance-with-multimodal-features-296e`
- **URL:** Your main production domain

### **Preview Deployments:**
Any push to other branches creates a preview URL:
- `feature/new-feature` → `frontend-abc123.vercel.app`
- Auto-deployed and auto-deleted when merged

---

## 🎯 **Recommended: Merge to Main Branch**

For cleaner deployment, merge your current branch to main:

```bash
cd /Users/Shared/maya-travel-agent

# Switch to main
git checkout main

# Merge your feature branch
git merge cursor/optimize-memory-and-performance-with-multimodal-features-296e

# Push to GitHub
git push origin main
```

Then in Vercel, set production branch to `main`.

---

## ✅ **Verification After Connection**

1. **Make a small change** to test auto-deploy:
   ```bash
   cd /Users/Shared/maya-travel-agent
   echo "Test" >> README.md
   git add README.md
   git commit -m "test: verify auto-deploy"
   git push
   ```

2. **Check Vercel Dashboard:**
   - Should see new deployment appear
   - Auto-builds and deploys
   - Updates production URL

3. **If it works:**
   - ✅ Connection successful!
   - ✅ Future pushes auto-deploy

---

## 🔧 **Troubleshooting**

### **"Cannot find Root Directory 'frontend'"**
- ✅ Make sure you typed `frontend` exactly (lowercase)
- ✅ Check repository structure on GitHub
- ✅ Verify frontend folder exists

### **"Build fails with dependency errors"**
- ✅ Set Install Command to: `npm install --legacy-peer-deps`
- ✅ Set Build Command to: `npm run build:dev`

### **"Environment variables not working"**
- ✅ Make sure they're set for "Production" environment
- ✅ Redeploy after adding new variables

---

## 📊 **Current Deployment Status**

| Status | URL | Type |
|--------|-----|------|
| ✅ **Latest** | https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app | Manual deploy |
| ✅ **Working** | https://frontend-ntqdzspko-mohameds-projects-e3d02482.vercel.app | Manual deploy |
| 🔗 **After GitHub Connection** | Will get custom domain | Auto-deploy |

---

## 🎯 **Next Actions**

### **Step 1: Connect to GitHub** (5 minutes)
Follow Method 1 above to connect your existing Vercel project to GitHub.

### **Step 2: Configure Build Settings** (2 minutes)
Set Root Directory to `frontend` and other settings.

### **Step 3: Test Auto-Deploy** (1 minute)
Make a test commit and push to verify it auto-deploys.

### **Step 4: Set Custom Domain** (Optional)
Go to: Settings → Domains → Add your custom domain

---

## 💡 **Pro Tips**

1. **Use `main` branch** for production
2. **Use feature branches** for development
3. **Enable preview deployments** for testing
4. **Set up notifications** for deploy status
5. **Use environment-specific variables** for dev/staging/prod

---

## 🎊 **Benefits of GitHub Connection**

✅ **Automatic deployments** on every push  
✅ **Preview URLs** for every PR  
✅ **Easy rollbacks** to any commit  
✅ **Team collaboration** with PR reviews  
✅ **CI/CD pipeline** integrated  
✅ **No manual commands** needed  
✅ **Version control** for deployments  

---

**🔗 Start with Method 1 to connect your GitHub repository to Vercel!**

Your deployment link: https://vercel.com/mohameds-projects-e3d02482/frontend

