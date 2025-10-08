# Supabase URL Configuration for Maya Travel Agent

## 🔐 Authentication URL Setup

**Project:** Maya Travel Agent  
**Supabase Project:** komahmavsulpkawmhqhk  
**Date:** October 8, 2025

---

## 🌐 **Required URL Configuration**

### **Step 1: Access Supabase Dashboard**

1. Go to: https://supabase.com/dashboard
2. Select project: **komahmavsulpkawmhqhk**
3. Navigate to: **Authentication** → **URL Configuration**

---

## 📝 **Site URL Configuration**

### **Primary Site URL**
Set this as your main application URL:

```
https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app
```

**Purpose:** Default redirect URL when authentication completes

---

## 🔗 **Redirect URLs (Allow List)**

Add ALL of these URLs to your Supabase redirect URL allow list:

### **Production URLs (Vercel)**
```
https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app/**
https://frontend-ntqdzspko-mohameds-projects-e3d02482.vercel.app/**
https://frontend-r5ebx6ndg-mohameds-projects-e3d02482.vercel.app/**
https://frontend-*.mohameds-projects-e3d02482.vercel.app/**
```

### **Lovable URLs (if using)**
```
https://c9adf5f3-9a8f-4ab7-b936-20bde358f7b0.lovableproject.com/**
https://id-preview--c9adf5f3-9a8f-4ab7-b936-20bde358f7b0.lovable.app/**
https://preview--voyage-weave-bot.lovable.app/**
https://voyage-weave-bot.lovable.app/**
```

### **Local Development**
```
http://localhost:3000/**
http://localhost:5173/**
http://127.0.0.1:3000/**
```

### **Network Access (for testing)**
```
http://192.168.1.4:3000/**
http://192.168.*.*:3000/**
```

---

## 🎯 **Specific Callback Routes**

Make sure these specific paths work:

```
/auth/callback
/dashboard
/planner
/payment/success
```

**Full example URLs:**
```
https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app/auth/callback
https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app/dashboard
http://localhost:3000/auth/callback
```

---

## 📱 **Telegram Bot Integration**

For Telegram Mini App authentication, also add:

```
https://t.me/YOUR_BOT_USERNAME
tg://resolve?domain=YOUR_BOT_USERNAME
```

---

## ✅ **Step-by-Step Configuration**

### **In Supabase Dashboard:**

1. **Set Site URL:**
   - Field: "Site URL"
   - Value: `https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app`
   - Click **"Save"**

2. **Add Redirect URLs:**
   - Click **"Add URL"** for each URL listed above
   - Paste the URL
   - Click **"Add"** or press Enter
   - Repeat for all URLs

3. **Save Configuration:**
   - Click **"Save"** at the bottom
   - Wait for confirmation

4. **Test Authentication:**
   - Visit your site
   - Try logging in
   - Check that redirect works

---

## 🔧 **Environment Variables Update**

Also add to your Vercel environment variables:

```bash
cd /Users/Shared/maya-travel-agent/frontend

# Add site URL
echo "https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app" | vercel env add VITE_SITE_URL production

# Add for local testing too
echo "http://localhost:3000" | vercel env add VITE_SITE_URL development
```

---

## 🧪 **Testing Checklist**

After configuration, test these flows:

### **Email/Password Auth**
- [ ] Sign up with email
- [ ] Receive confirmation email
- [ ] Click email link → redirects to site
- [ ] Sign in with password → redirects to dashboard

### **Magic Link Auth**
- [ ] Request magic link
- [ ] Click link in email
- [ ] Redirects to dashboard

### **Web3 Wallet Auth**
- [ ] Click "Connect Web3 Wallet"
- [ ] Connect MetaMask
- [ ] Sign message
- [ ] Redirects to dashboard

### **Telegram Bot**
- [ ] Open Telegram bot
- [ ] Click "Open App"
- [ ] Mini app loads
- [ ] Authentication works

### **OAuth (if configured)**
- [ ] Google login
- [ ] GitHub login
- [ ] Redirects properly

---

## 🚨 **Important Notes**

### **Wildcards (`**`)**
- ✅ Use `/**` to allow all subpaths
- ✅ Use `*.domain.com` to allow all subdomains
- ❌ Cannot use wildcards in Site URL

### **HTTPS vs HTTP**
- ✅ Production: Always use HTTPS
- ✅ Local dev: HTTP is fine
- ❌ Don't mix HTTP/HTTPS in production

### **Port Numbers**
- Local dev uses `:3000` or `:5173`
- Production doesn't need port numbers
- Include both if needed

---

## 📊 **Current Configuration Status**

| Setting | Value | Status |
|---------|-------|--------|
| **Site URL** | Need to update | ⏳ Pending |
| **Redirect URLs** | Need to add | ⏳ Pending |
| **Supabase URL** | ✅ Added to Vercel | ✅ Done |
| **Supabase Key** | ✅ Added to Vercel | ✅ Done |
| **Web3 Integration** | ✅ Code ready | ✅ Done |
| **WalletConnect ID** | Need to add | ⏳ Pending |

---

## 🎯 **Quick Action Items**

### **Right Now:**

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/auth/url-configuration

2. **Set Site URL to:**
   ```
   https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app
   ```

3. **Add these Redirect URLs** (click "Add URL" for each):
   ```
   https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app/**
   http://localhost:3000/**
   ```

4. **Click "Save Changes"**

5. **Get WalletConnect Project ID:**
   - Go to: https://cloud.walletconnect.com/
   - Create project
   - Copy Project ID
   - Add to Vercel: `vercel env add VITE_WALLETCONNECT_PROJECT_ID production`

6. **Redeploy:**
   ```bash
   cd /Users/Shared/maya-travel-agent/frontend
   vercel --prod --yes
   ```

---

## 🎊 **After Configuration**

Your site will support:
- ✅ Email/Password login
- ✅ Magic link authentication
- ✅ **Web3 wallet login** (MetaMask, WalletConnect, etc.)
- ✅ OAuth providers (Google, GitHub)
- ✅ Telegram Mini App integration

---

**Status:** ⏳ Waiting for Supabase URL configuration  
**Deployment:** ✅ Code ready, pending env vars

