# 🚨 Quick Fix: Configure Supabase in Lovable

Since you can't find the environment variables section in Lovable, let's use a different approach that will work immediately!

## Option 1: Direct Code Edit (Fastest - 2 minutes)

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Maya Trips project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Public Key** (long string starting with `eyJ...`)

### Step 2: Update Code in Lovable

1. In Lovable, open the file: `frontend/src/lib/supabase.ts`
2. Find lines 4-5 (around the top):
   ```javascript
   const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
   const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
   ```

3. Replace with your actual values:
   ```javascript
   const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'https://YOUR-PROJECT-ID.supabase.co'
   const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'eyJ...YOUR-ACTUAL-ANON-KEY...'
   ```

4. Also update `frontend/src/lib/auth.ts` line 11-13:
   ```javascript
   const getSiteUrl = () => {
     return (import.meta as any)?.env?.VITE_SITE_URL || 'https://maya-travel-agent.lovable.app'
   }
   ```

5. **Save and Deploy** in Lovable

---

## Option 2: Create .env File in Lovable (Better - 3 minutes)

1. In Lovable's file explorer, create a new file: `frontend/.env`
2. Add these lines (with your real values):
   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...YOUR-ACTUAL-ANON-KEY...
   VITE_SITE_URL=https://maya-travel-agent.lovable.app
   ```
3. Save and deploy

---

## Option 3: Check These Lovable Locations

Sometimes environment variables are hidden in:

### During Deployment:
1. Click **Deploy** button
2. Look for **"Configure"** or **"Settings"** before it deploys
3. Check for **"Environment Variables"** option

### In Project View:
1. Look for **three dots (...)** menu near your project name
2. Check for **"Environment"** or **"Secrets"**
3. Try **right-clicking** on the project name

### In Editor:
1. Check the **top menu bar** for a **"Config"** or **"Env"** option
2. Look for a **gear icon ⚙️** in the editor toolbar
3. Check if there's a **".env" tab** in the editor

---

## 🎯 Quickest Solution Right Now

**Do Option 1** - directly edit the code with your Supabase credentials. This will make everything work immediately!

After editing, your `frontend/src/lib/supabase.ts` should look like:

```javascript
import { createClient } from '@supabase/supabase-js'

// Prefer Vite env vars (but fallback to actual values)
const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'https://YOUR-ACTUAL-PROJECT.supabase.co'
const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'eyJ...YOUR-ACTUAL-KEY...'

// ... rest of the file
```

And `frontend/src/lib/auth.ts` should have:

```javascript
const getSiteUrl = () => {
  return (import.meta as any)?.env?.VITE_SITE_URL || 'https://maya-travel-agent.lovable.app'
}
```

---

## ✅ Test After Making Changes

1. Deploy in Lovable
2. Visit https://maya-travel-agent.lovable.app
3. Try to sign up
4. Check if magic link works!

---

## Need Your Supabase Credentials?

Tell me if you need help finding your Supabase URL and Anon Key. I can guide you through the Supabase dashboard!
