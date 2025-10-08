# Supabase Magic Link Redirect Fix

## 🎯 Problem
Magic links from Supabase are redirecting to `http://localhost:3000` instead of the production URL `https://maya-travel-agent.lovable.app/`

## ✅ Solution Overview

This fix involves 3 parts:
1. **Update Supabase Dashboard Settings** (You need to do this manually)
2. **Update Frontend Code** (Already done - see below)
3. **Customize Email Template** (Instructions below)

---

## Part 1: Update Supabase Dashboard Settings

### Step-by-Step Instructions

1. **Log in to Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your Maya Trips project

2. **Update Site URL**
   - Go to **Authentication** → **URL Configuration**
   - Find **Site URL** field
   - Change from: `http://localhost:3000`
   - Change to: `https://maya-travel-agent.lovable.app`
   - Click **Save**

3. **Add Redirect URLs**
   - In the same **URL Configuration** section
   - Find **Redirect URLs** field
   - Add these URLs (one per line):
     ```
     https://maya-travel-agent.lovable.app
     https://maya-travel-agent.lovable.app/auth/callback
     https://maya-travel-agent.lovable.app/auth/reset-password
     http://localhost:3000
     http://localhost:3000/auth/callback
     ```
   - Click **Save**
   
   **Note:** Keep localhost URLs for local development testing

4. **Verify Settings**
   - Your configuration should look like:
     ```
     Site URL: https://maya-travel-agent.lovable.app
     
     Redirect URLs:
     - https://maya-travel-agent.lovable.app
     - https://maya-travel-agent.lovable.app/auth/callback
     - https://maya-travel-agent.lovable.app/auth/reset-password
     - http://localhost:3000
     - http://localhost:3000/auth/callback
     ```

---

## Part 2: Frontend Code Updates

### Updated Files

#### 1. Environment Configuration

**File: `frontend/.env.production` (NEW FILE - needs to be created on Lovable)**

```env
# Production Environment Variables for Lovable Deployment

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=Maya Trips
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Site URL for redirects
VITE_SITE_URL=https://maya-travel-agent.lovable.app
```

#### 2. Updated Auth Service

The auth service now uses `VITE_SITE_URL` for redirects instead of `window.location.origin`.

**Changes made in `frontend/src/lib/auth.ts`:**
- Sign up redirect: Uses production URL
- OAuth redirects: Uses production URL
- Password reset redirect: Uses production URL

---

## Part 3: Customize Magic Link Email Template

### Access Email Templates in Supabase

1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Replace with the custom template below

### Custom Maya Trips Email Template

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول إلى Maya Trips | Login to Maya Trips</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            direction: ltr;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 10px;
        }
        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #666666;
            margin-bottom: 30px;
        }
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .divider {
            margin: 30px 0;
            border-top: 1px solid #e0e0e0;
        }
        .arabic-section {
            direction: rtl;
            text-align: right;
            margin-top: 30px;
            padding-top: 30px;
            border-top: 2px solid #f0f0f0;
        }
        .arabic-greeting {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        .arabic-message {
            font-size: 16px;
            line-height: 1.8;
            color: #666666;
            margin-bottom: 20px;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #999999;
        }
        .footer-links {
            margin-top: 20px;
        }
        .footer-link {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }
        .security-note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .security-note p {
            margin: 0;
            font-size: 14px;
            color: #856404;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 20px;
                border-radius: 12px;
            }
            .header {
                padding: 30px 20px;
            }
            .content {
                padding: 30px 20px;
            }
            .greeting, .arabic-greeting {
                font-size: 20px;
            }
            .message, .arabic-message {
                font-size: 14px;
            }
            .button {
                padding: 14px 30px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">✈️ Maya Trips</div>
            <p class="header-subtitle">Your AI-Powered Travel Companion</p>
        </div>

        <!-- Content - English -->
        <div class="content">
            <h1 class="greeting">Welcome to Maya Trips! 👋</h1>
            
            <p class="message">
                You're just one click away from accessing your personalized travel planning experience. 
                Click the button below to securely log in to your Maya Trips account.
            </p>

            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="button">
                    🔐 Log In to Maya Trips
                </a>
            </div>

            <div class="security-note">
                <p>
                    <strong>🔒 Security Notice:</strong> This link will expire in 1 hour for your protection. 
                    If you didn't request this email, you can safely ignore it.
                </p>
            </div>

            <p class="message">
                Once logged in, you'll be able to:
            </p>
            <ul style="color: #666666; line-height: 1.8;">
                <li>🤖 Chat with our AI travel assistant</li>
                <li>🗺️ Plan personalized trips</li>
                <li>💰 Track your travel budget</li>
                <li>📍 Discover amazing destinations</li>
            </ul>

            <!-- Arabic Section -->
            <div class="arabic-section">
                <h1 class="arabic-greeting">مرحباً بك في Maya Trips! 👋</h1>
                
                <p class="arabic-message">
                    أنت على بُعد نقرة واحدة من الوصول إلى تجربة تخطيط سفر مخصصة لك.
                    انقر على الزر أدناه لتسجيل الدخول بأمان إلى حسابك في Maya Trips.
                </p>

                <div class="button-container">
                    <a href="{{ .ConfirmationURL }}" class="button">
                        🔐 تسجيل الدخول إلى Maya Trips
                    </a>
                </div>

                <div class="security-note" style="direction: rtl; text-align: right; border-right: 4px solid #ffc107; border-left: none;">
                    <p>
                        <strong>🔒 ملاحظة أمنية:</strong> سينتهي صلاحية هذا الرابط خلال ساعة واحدة لحمايتك.
                        إذا لم تطلب هذا البريد الإلكتروني، يمكنك تجاهله بأمان.
                    </p>
                </div>

                <p class="arabic-message">
                    بعد تسجيل الدخول، ستتمكن من:
                </p>
                <ul style="color: #666666; line-height: 1.8; text-align: right; direction: rtl;">
                    <li>🤖 الدردشة مع مساعد السفر الذكي</li>
                    <li>🗺️ تخطيط رحلات مخصصة</li>
                    <li>💰 تتبع ميزانية سفرك</li>
                    <li>📍 اكتشاف وجهات رائعة</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin-bottom: 10px;">
                <strong>Maya Trips</strong> - AI-Powered Travel Planning
            </p>
            <p style="margin: 5px 0; color: #666;">
                Making travel planning smarter and easier
            </p>
            <div class="footer-links">
                <a href="https://maya-travel-agent.lovable.app" class="footer-link">Visit Website</a>
                <a href="https://maya-travel-agent.lovable.app/destinations" class="footer-link">Explore Destinations</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                © 2025 Maya Trips. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
```

### Alternative: Text-Only Email Template

If you prefer a simpler text version:

```
Maya Trips - Log In to Your Account

Hello! 👋

You requested to log in to your Maya Trips account. Click the link below to securely access your account:

{{ .ConfirmationURL }}

This link will expire in 1 hour for your protection.

Once logged in, you can:
- Chat with our AI travel assistant
- Plan personalized trips
- Track your travel budget
- Discover amazing destinations

If you didn't request this email, you can safely ignore it.

---

مرحباً! 👋

طلبت تسجيل الدخول إلى حسابك في Maya Trips. انقر على الرابط أدناه للوصول بأمان إلى حسابك:

{{ .ConfirmationURL }}

سينتهي صلاحية هذا الرابط خلال ساعة واحدة لحمايتك.

---

Maya Trips
https://maya-travel-agent.lovable.app

© 2025 Maya Trips. All rights reserved.
```

---

## Part 4: Testing the Fix

### Test Checklist

1. **Test Magic Link (Production)**
   - Go to https://maya-travel-agent.lovable.app
   - Click "Sign Up" or "Log In"
   - Enter your email
   - Check email for magic link
   - Click the magic link
   - ✅ Should redirect to: `https://maya-travel-agent.lovable.app/auth/callback`
   - ✅ Should successfully log you in

2. **Test Password Reset (Production)**
   - Go to https://maya-travel-agent.lovable.app
   - Click "Forgot Password"
   - Enter your email
   - Check email for reset link
   - Click the reset link
   - ✅ Should redirect to: `https://maya-travel-agent.lovable.app/auth/reset-password`

3. **Test OAuth (Production)**
   - Try Google sign-in
   - Try GitHub sign-in
   - ✅ Should redirect back to production URL after authentication

4. **Test Local Development (Optional)**
   - Run locally: `cd frontend && npm run dev`
   - Test auth flows
   - ✅ Should still work with localhost URLs

---

## Common Issues & Solutions

### Issue 1: Still Redirecting to Localhost

**Cause:** Supabase dashboard not updated or cached settings

**Solution:**
1. Clear browser cache
2. Double-check Site URL in Supabase dashboard
3. Wait 5 minutes for settings to propagate
4. Try incognito/private browsing mode

### Issue 2: "Invalid Redirect URL" Error

**Cause:** Production URL not in Redirect URLs list

**Solution:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add all production URLs to the Redirect URLs list
3. Click Save
4. Wait a few minutes and try again

### Issue 3: Email Template Not Updating

**Cause:** Supabase caching email templates

**Solution:**
1. Clear template and save (make it blank)
2. Wait 1 minute
3. Paste new template and save
4. Send a test email to verify

### Issue 4: Email Goes to Spam

**Solution:**
1. In Supabase Dashboard → Settings → Auth
2. Configure custom SMTP (optional, improves deliverability)
3. Or ask users to whitelist noreply@mail.supabase.io

---

## Deployment Notes

### For Lovable Deployment

1. **Environment Variables**
   - Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Lovable
   - Add `VITE_SITE_URL=https://maya-travel-agent.lovable.app`

2. **Build Settings**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment: Production

3. **After Deployment**
   - Test all auth flows
   - Verify redirects work correctly
   - Check email template displays properly

---

## Summary

**What You Need to Do:**

1. ✅ **Supabase Dashboard** (REQUIRED - Manual Step)
   - Update Site URL to `https://maya-travel-agent.lovable.app`
   - Add production URLs to Redirect URLs list

2. ✅ **Email Template** (OPTIONAL - But Recommended)
   - Copy the custom email template above
   - Paste into Supabase → Authentication → Email Templates → Magic Link

3. ✅ **Frontend Code** (DONE - Already Updated)
   - Updated `auth.ts` to use proper redirect URLs
   - Created environment configuration guidance

4. ✅ **Test Everything**
   - Try signing up with a new email
   - Test magic link redirect
   - Verify email looks professional

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check browser console for errors
3. Verify all URLs are correct (no typos)
4. Ensure Supabase project is not paused

---

**Last Updated:** October 8, 2025  
**Production URL:** https://maya-travel-agent.lovable.app  
**Project:** Maya Trips - Supabase Auth Configuration

