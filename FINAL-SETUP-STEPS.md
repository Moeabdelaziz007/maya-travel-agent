# 🎯 Final Setup Steps - Get It Working Now!

## You've Already Done ✅
- ✅ Supabase Dashboard: Site URL and Redirect URLs configured
- ✅ Frontend code: Updated with proper redirect logic

## What's Left to Do 🔧

### Step 1: Get Your Supabase Credentials (2 minutes)

1. **Open** https://supabase.com/dashboard
2. **Sign in** to your Supabase account
3. **Select** your Maya Trips project
4. **Click** "Settings" (gear icon) in left sidebar
5. **Click** "API"
6. **Copy these two values:**

   ```
   Project URL: https://xxxxxxxxx.supabase.co
   Anon/Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   📝 **Save these somewhere temporarily** (notepad, etc.)

### Step 2: Add to Lovable (3 minutes)

#### Option A: Through Integrations (If Available)

1. **Log into** https://lovable.dev
2. **Open** your maya-travel-agent project
3. **Go to** Settings → Integrations → Supabase
4. **Paste:**
   - Supabase URL: [paste your Project URL]
   - Supabase Anon Key: [paste your Anon Key]
5. **Save** and **Deploy**

#### Option B: Direct Code Edit (If Integrations Not Working)

1. **In Lovable**, open your maya-travel-agent project
2. **Edit file:** `frontend/src/lib/supabase.ts`
3. **Replace lines 4-5:**

   ```javascript
   // Change from:
   const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
   const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
   
   // To (with your actual values):
   const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co'
   const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'eyJ...YOUR-KEY...'
   ```

4. **Also edit:** `frontend/src/lib/auth.ts` line 12:

   ```javascript
   // Make sure this line says:
   return (import.meta as any)?.env?.VITE_SITE_URL || 'https://maya-travel-agent.lovable.app'
   ```

5. **Save** all files
6. **Deploy** in Lovable

### Step 3: Test Everything (2 minutes)

1. **Visit** https://maya-travel-agent.lovable.app
2. **Click** "Sign Up"
3. **Enter** a test email and password
4. **Submit** the form
5. **Check** your email for the magic link
6. **Click** the magic link
7. **Verify:**
   - ✅ It redirects to https://maya-travel-agent.lovable.app/auth/callback
   - ✅ You're logged in successfully

---

## 🚨 Quick Troubleshooting

### If you get "Supabase not configured" error:
- Your credentials aren't set correctly
- Double-check the URL and key from Supabase dashboard
- Make sure you saved and deployed in Lovable

### If magic link still goes to localhost:
- The auth.ts file needs the production URL
- Make sure line 12 in auth.ts has: `'https://maya-travel-agent.lovable.app'`

### If you can't find where to add credentials in Lovable:
- Use Option B (Direct Code Edit) - it always works!

---

## 📱 Quick Reference

### Your Supabase Dashboard
https://supabase.com/dashboard → Your Project → Settings → API

### Your Lovable Project
https://lovable.dev → maya-travel-agent → Settings/Integrations

### Your Live App
https://maya-travel-agent.lovable.app

---

## ✨ Once It's Working

You'll know it's successful when:
1. No console errors about Supabase
2. Sign up creates a user in Supabase
3. Magic link redirects to production URL
4. Login works properly

---

## 🎯 Action Items Summary

1. [ ] Get Supabase URL and Anon Key from Supabase dashboard
2. [ ] Add them to Lovable (either through Integrations or direct code edit)
3. [ ] Deploy in Lovable
4. [ ] Test sign up with magic link
5. [ ] Celebrate! 🎉

---

**Estimated Time:** 7 minutes total

**Need Help?** The direct code edit (Option B) always works if you can't find the Integrations section!
