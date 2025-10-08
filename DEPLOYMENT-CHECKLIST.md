# 🚀 Maya Trips - Production Deployment Checklist

## Quick Status: What's Done vs. What You Need to Do

| Task | Status | Who | Time |
|------|--------|-----|------|
| Update frontend code | ✅ Done | AI | Complete |
| Create documentation | ✅ Done | AI | Complete |
| Custom email template | ✅ Done | AI | Complete |
| **Update Supabase Dashboard** | ⚠️ **TODO** | **You** | **5 min** |
| **Set Lovable env vars** | ⚠️ **TODO** | **You** | **3 min** |
| **Test auth flows** | ⚠️ **TODO** | **You** | **5 min** |

---

## 🎯 Your Action Items (3 Steps)

### ⚠️ Step 1: Configure Supabase (5 minutes)

**Where:** [https://supabase.com/dashboard](https://supabase.com/dashboard)

**What to do:**
1. Open your Maya Trips project
2. Go to **Authentication** → **URL Configuration**
3. Set **Site URL** to:
   ```
   https://maya-travel-agent.lovable.app
   ```
4. Set **Redirect URLs** to (one per line):
   ```
   https://maya-travel-agent.lovable.app
   https://maya-travel-agent.lovable.app/auth/callback
   https://maya-travel-agent.lovable.app/auth/reset-password
   http://localhost:5173
   http://localhost:5173/auth/callback
   ```
5. Click **Save**

**Optional:** Customize email template
- Go to **Authentication** → **Email Templates** → **Magic Link**
- Copy template from `SUPABASE-REDIRECT-FIX.md`
- Paste and save

---

### ⚠️ Step 2: Configure Lovable (3 minutes)

**Where:** Your Lovable project at [https://lovable.dev](https://lovable.dev)

**What to do:**
1. Open Maya Trips project
2. Go to **Settings** → **Environment Variables**
3. Add these 6 variables:

   | Variable | Value |
   |----------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `VITE_SITE_URL` | `https://maya-travel-agent.lovable.app` |
   | `VITE_APP_NAME` | `Maya Trips` |
   | `VITE_APP_VERSION` | `1.0.0` |
   | `VITE_ENVIRONMENT` | `production` |

4. Click **Save**
5. Click **Redeploy**
6. Wait for deployment (~2-3 minutes)

---

### ⚠️ Step 3: Test Everything (5 minutes)

**Test 1: Magic Link Sign Up**
```
1. Go to: https://maya-travel-agent.lovable.app
2. Click "Sign Up"
3. Enter email + password
4. Check email
5. Click magic link
6. ✅ Should redirect to production URL and log you in
```

**Test 2: Password Reset**
```
1. Click "Forgot Password"
2. Enter email
3. Check email
4. Click reset link
5. ✅ Should redirect to production reset page
```

**Test 3: Login Flow**
```
1. Log out
2. Try logging in with email/password
3. ✅ Should work without issues
```

---

## 📋 Complete Deployment Checklist

### Pre-Deployment
- [x] Frontend code updated
- [x] Auth redirect logic fixed
- [x] Environment configuration created
- [x] Documentation written
- [x] Verification script created

### Supabase Configuration
- [ ] Logged into Supabase Dashboard
- [ ] Selected Maya Trips project
- [ ] Updated Site URL to production
- [ ] Added all Redirect URLs
- [ ] Saved configuration
- [ ] (Optional) Updated email template
- [ ] (Optional) Sent test email

### Lovable Configuration
- [ ] Logged into Lovable
- [ ] Opened Maya Trips project
- [ ] Added `VITE_SUPABASE_URL`
- [ ] Added `VITE_SUPABASE_ANON_KEY`
- [ ] Added `VITE_SITE_URL`
- [ ] Added other VITE variables
- [ ] Saved environment variables
- [ ] Triggered redeploy
- [ ] Deployment completed successfully

### Testing
- [ ] Opened production site
- [ ] Tested sign up flow
- [ ] Received magic link email
- [ ] Clicked magic link
- [ ] Verified redirect to production URL
- [ ] Confirmed successful login
- [ ] Tested password reset
- [ ] Tested logout
- [ ] Tested login again
- [ ] (If enabled) Tested OAuth flows

### Post-Deployment
- [ ] Cleared browser cache
- [ ] Tested in incognito mode
- [ ] Tested on mobile device
- [ ] Verified email deliverability
- [ ] Checked Supabase auth logs
- [ ] Monitored for errors

---

## 🆘 Quick Troubleshooting

### Problem: Magic link still goes to localhost

**Quick Fix:**
```bash
# 1. Verify Lovable environment variables
Check VITE_SITE_URL is set correctly

# 2. Verify Supabase Site URL
Check it's set to production URL

# 3. Clear cache and test in incognito
```

### Problem: "Invalid Redirect URL" error

**Quick Fix:**
```bash
# 1. Check Supabase Redirect URLs list
Make sure https://maya-travel-agent.lovable.app is there

# 2. Wait 5 minutes for DNS/settings to propagate

# 3. Try again
```

### Problem: Environment variables not working

**Quick Fix:**
```bash
# 1. Verify variables are saved in Lovable

# 2. Redeploy the app

# 3. Check browser console for env var values
Open DevTools → Console → Type:
import.meta.env.VITE_SITE_URL
```

---

## 📞 Getting Help

| Issue Type | Resource |
|-----------|----------|
| Supabase config | `SUPABASE-REDIRECT-FIX.md` |
| Lovable deployment | `LOVABLE-DEPLOYMENT-GUIDE.md` |
| Quick summary | `AUTH-FIX-SUMMARY.md` |
| Check configuration | Run `./verify-auth-config.sh` |

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Magic link emails arrive promptly
2. ✅ Magic links redirect to `https://maya-travel-agent.lovable.app/auth/callback`
3. ✅ You're successfully logged in after clicking link
4. ✅ Password reset works correctly
5. ✅ No console errors in browser DevTools
6. ✅ No errors in Supabase auth logs

---

## 📊 Time Estimates

| Task | Estimated Time | Priority |
|------|---------------|----------|
| Supabase config | 5 minutes | 🔴 Critical |
| Lovable env vars | 3 minutes | 🔴 Critical |
| Email template | 5 minutes | 🟡 Optional |
| Testing | 5 minutes | 🔴 Critical |
| **Total** | **13-18 minutes** | |

---

## 🎯 Priority Order

1. **FIRST:** Update Supabase Dashboard (Site URL + Redirect URLs)
2. **SECOND:** Set Lovable environment variables
3. **THIRD:** Redeploy and test
4. **OPTIONAL:** Customize email template

---

## 📱 Mobile Testing

After completing desktop testing:

- [ ] Open production site on mobile browser
- [ ] Test sign up flow
- [ ] Check email on mobile
- [ ] Tap magic link
- [ ] Verify redirect works on mobile
- [ ] Test responsive design

---

## 🔐 Security Notes

✅ **Good Practices Implemented:**
- Environment-based configuration
- No hardcoded credentials
- Secure redirect URL validation
- Email link expiration (1 hour)

⚠️ **Remember:**
- Never commit `.env` files with real credentials
- Keep Supabase service role key secret
- Monitor auth logs regularly
- Use HTTPS only in production

---

## 🌐 URLs Reference

| Service | URL |
|---------|-----|
| **Production App** | https://maya-travel-agent.lovable.app |
| Auth Callback | https://maya-travel-agent.lovable.app/auth/callback |
| Password Reset | https://maya-travel-agent.lovable.app/auth/reset-password |
| Supabase Dashboard | https://supabase.com/dashboard |
| Lovable Dashboard | https://lovable.dev |

---

## 📝 Notes Section

Use this space to note any issues or custom configurations:

```
Date: _______________
Issue: _______________________________________________
Solution: _______________________________________________

Date: _______________
Custom Config: _______________________________________________
```

---

## ✨ Final Steps

Once everything is working:

1. ✅ Mark all checkboxes above as complete
2. ✅ Save this checklist for future reference
3. ✅ Consider upgrading Supabase plan for custom SMTP (better email deliverability)
4. ✅ Set up monitoring/analytics
5. ✅ Share the app with beta testers

---

## 🎉 Congratulations!

When all checkboxes are complete, your Maya Trips app will have:
- ✅ Production-ready authentication
- ✅ Professional email templates
- ✅ Secure redirect handling
- ✅ Bilingual user experience

**You're ready to launch! 🚀**

---

**Last Updated:** October 8, 2025  
**Deployment URL:** https://maya-travel-agent.lovable.app  
**Status:** ⚠️ Awaiting Your Configuration (Steps 1-3 above)

