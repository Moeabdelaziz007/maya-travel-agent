# 🤖 Automated Deployment Setup Guide

## ✅ **GitHub Actions Workflow Added!**

**File:** `.github/workflows/vercel-deploy.yml`  
**Status:** ✅ Committed and pushed  
**Features:** Self-healing, retry logic, debug artifacts

---

## 🎯 **What the Workflow Does**

### **Triggers:**
- ✅ Auto-deploys on push to `main` branch
- ✅ Auto-deploys on push to any `cursor/**` branch
- ✅ Only runs when `frontend/**` files change
- ✅ Manual trigger available (workflow_dispatch)

### **Self-Healing Features:**
- ✅ **Retry on failure** - Rebuilds up to 2 times
- ✅ **Cache cleanup** - Clears npm cache if build fails
- ✅ **Health checks** - Verifies deployment with 5 retries
- ✅ **Debug artifacts** - Uploads logs on failure

### **Build Process:**
1. Checkout code
2. Setup Node.js 20
3. Install Vercel CLI
4. Verify secrets present
5. Install dependencies (with retry)
6. Build project (with retry)
7. Pull Vercel environment
8. Deploy to production
9. Health check the URL
10. Upload artifacts

---

## 🔑 **Required: GitHub Secrets**

To enable auto-deploy, add these secrets to your GitHub repository:

### **Step 1: Get Vercel Token**

1. Go to: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name: `GitHub Actions - Maya Travel Agent`
4. Scope: Select your team/account
5. Click **"Create"**
6. **Copy the token** (you won't see it again!)

### **Step 2: Get Project IDs**

Already extracted from your `.vercel/project.json`:
- **VERCEL_ORG_ID:** `team_8YAcROnXeb4bhsWGjuxKItBJ`
- **VERCEL_PROJECT_ID:** `prj_jNriqxFppqPPDv53OdxQTZoX8ufx`

### **Step 3: Add Secrets to GitHub**

1. Go to: https://github.com/Moeabdelaziz007/maya-travel-agent/settings/secrets/actions

2. Click **"New repository secret"** for each:

**Secret 1:**
- Name: `VERCEL_TOKEN`
- Value: (paste the token from Step 1)
- Click "Add secret"

**Secret 2:**
- Name: `VERCEL_ORG_ID`
- Value: `team_8YAcROnXeb4bhsWGjuxKItBJ`
- Click "Add secret"

**Secret 3:**
- Name: `VERCEL_PROJECT_ID`
- Value: `prj_jNriqxFppqPPDv53OdxQTZoX8ufx`
- Click "Add secret"

**Optional Secret 4:**
- Name: `ACTIONS_STEP_DEBUG`
- Value: `true`
- Purpose: Enables verbose debug logging
- Click "Add secret"

---

## 🧪 **Test the Workflow**

### **Method 1: Make a Change**

```bash
cd /Users/Shared/maya-travel-agent
echo "# Auto-deploy test" >> README.md
git add README.md
git commit -m "test: verify auto-deploy workflow"
git push
```

Then:
1. Go to: https://github.com/Moeabdelaziz007/maya-travel-agent/actions
2. Watch the workflow run
3. Should deploy automatically to Vercel!

### **Method 2: Manual Trigger**

1. Go to: https://github.com/Moeabdelaziz007/maya-travel-agent/actions/workflows/vercel-deploy.yml
2. Click **"Run workflow"**
3. Select branch
4. Click **"Run workflow"**
5. Watch it deploy!

---

## 📊 **Workflow Features Explained**

### **1. Self-Healing Retries**

If the build fails:
```yaml
- Install dependencies (attempt 1)
- Build (attempt 1)
  ↓ FAILS
- Clean cache & reinstall (attempt 2)
- Build (attempt 2)
  ↓ SUCCESS
```

### **2. Health Checks**

After deployment:
```yaml
- Deploy to Vercel
  ↓
- Health check (5 retries over 2 minutes)
  ↓ Checks for HTTP 200 or 308
- Success ✅
```

### **3. Debug Artifacts**

On failure, uploads:
- `dist/` folder (build output)
- `vercel-logs.txt` (Vercel deployment logs)
- `deploy-url.txt` (deployment URL)
- Configuration files (package.json, vite.config, etc.)

Download from: Actions → Failed run → Artifacts

### **4. Concurrency Control**

```yaml
concurrency:
  group: vercel-frontend-${{ github.ref }}
  cancel-in-progress: true
```

**Benefits:**
- Cancels old deployments when new push arrives
- Prevents multiple deployments from same branch
- Saves build minutes

---

## 🔍 **Monitoring & Debugging**

### **View Workflow Runs:**
https://github.com/Moeabdelaziz007/maya-travel-agent/actions

### **Debug Failed Runs:**
1. Click on failed run
2. View logs for each step
3. Download artifacts for detailed debugging
4. Check "Collect Vercel logs on failure" step

### **View Deployment in Vercel:**
https://vercel.com/mohameds-projects-e3d02482/frontend/deployments

---

## 🚀 **Automated Workflow**

Once secrets are added:

```
Developer makes changes
        ↓
    git push
        ↓
GitHub Actions triggers
        ↓
Install & Build (with retries)
        ↓
Deploy to Vercel
        ↓
Health check (5 retries)
        ↓
✅ Success! Site updated
        OR
❌ Failure → Upload debug artifacts
```

---

## 📋 **Checklist**

### **Setup:**
- [x] Workflow file created
- [x] Committed and pushed
- [ ] Add VERCEL_TOKEN to GitHub secrets ← **DO THIS**
- [ ] Add VERCEL_ORG_ID to GitHub secrets ← **DO THIS**
- [ ] Add VERCEL_PROJECT_ID to GitHub secrets ← **DO THIS**
- [ ] Test with a push
- [ ] Verify deployment succeeds

### **Configuration in Vercel:**
- [ ] Disable Deployment Protection ← **CRITICAL**
- [ ] Verify environment variables
- [ ] Check build settings
- [ ] Set production branch

---

## 🎯 **Priority Actions**

### **1. Fix Vercel 401 (URGENT)**
See: `VERCEL-401-FIX.md`

**Quick:** https://vercel.com/mohameds-projects-e3d02482/frontend/settings/general
→ Disable "Deployment Protection"

### **2. Add GitHub Secrets (5 minutes)**
See instructions above in Step 3.

### **3. Test Auto-Deploy (1 minute)**
Make a small change and push to verify.

---

## 🎊 **After Setup**

Your workflow will:
- ✅ **Auto-deploy** every push
- ✅ **Self-heal** build failures
- ✅ **Health-check** deployments
- ✅ **Debug** with artifacts
- ✅ **Cancel** duplicate runs
- ✅ **Save** build minutes
- ✅ **Notify** on failures

**No more manual `vercel --prod` commands!** 🎉

---

## 📚 **Related Docs**

- `FINAL-CHECKLIST.md` - Complete setup checklist
- `VERCEL-401-FIX.md` - Fix the 401 error
- `CONNECT-VERCEL-TO-GITHUB.md` - GitHub integration
- `DEPLOYMENT-COMPLETE.md` - What was deployed

---

**Next Action:** Add the 3 GitHub secrets, then disable Vercel protection!

