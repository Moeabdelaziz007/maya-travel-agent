# 🔑 How to Get Amadeus API Keys

**Date**: October 11, 2025  
**Status**: ⚠️ Authentication Issue Detected

---

## 🚨 Current Issue

You're experiencing an authentication error when trying to log in to Amadeus:

```
Error Code: 26322
Error Message: Authentication failed. Please check your credentials and try again.
Email: mabdela1@students.kenneesaw.edu
```

---

## ✅ Solution: Create a NEW Amadeus Account

The login issue suggests you may need to create a fresh account or reset your credentials.

### **Step 1: Create New Amadeus Developer Account**

1. **Go to Amadeus for Developers**:
   ```
   https://developers.amadeus.com/register
   ```

2. **Sign Up with Different Email** (Recommended):
   - Use a personal email instead of .edu email
   - Or use: `cryptojoker710@gmail.com` (if you have access)
   - .edu emails sometimes have issues with developer platforms

3. **Fill Registration Form**:
   - First Name
   - Last Name
   - Email (use personal, not .edu)
   - Password (strong password)
   - Company Name: `AAAS` or `Amrikyy Travel`
   - Country
   - Accept Terms & Conditions

4. **Verify Email**:
   - Check your inbox for verification email
   - Click verification link

---

### **Step 2: Create a Self-Service App**

After successfully logging in:

1. **Go to My Self-Service Workspace**:
   ```
   https://developers.amadeus.com/my-apps
   ```

2. **Click "Create New App"**:
   - App Name: `Amrikyy Travel Agent`
   - Description: `AI-powered travel planning and booking system`
   - Purpose: `Production` or `Testing`

3. **Get Your API Keys**:
   - You'll see two keys:
     - **API Key** (Client ID)
     - **API Secret** (Client Secret)
   - **IMPORTANT**: Copy both immediately!

---

## 📋 What You'll Get

### **Test Environment Keys** (Free)
```bash
API_KEY: YOUR_TEST_API_KEY
API_SECRET: YOUR_TEST_API_SECRET
```

**Free Tier Limits**:
- 100 API calls/month
- Test data only
- Perfect for development!

### **Production Environment Keys** (After Approval)
```bash
API_KEY: YOUR_PRODUCTION_API_KEY
API_SECRET: YOUR_PRODUCTION_API_SECRET
```

**Production Tier**:
- 10,000 API calls/month (Free tier)
- Real booking data
- Requires application approval

---

## 🔧 Alternative: Password Reset

If you want to keep your existing account:

1. **Go to Password Reset**:
   ```
   https://developers.amadeus.com/reset-password
   ```

2. **Enter Email**: `mabdela1@students.kenneesaw.edu`

3. **Check Email** for reset link

4. **Create New Password**

5. **Try Logging In Again**

---

## 🎯 Quick Start After Getting Keys

Once you have your API keys, I'll add them to your `.env` file:

```bash
# Amadeus API (Travel Data)
AMADEUS_API_KEY=YOUR_API_KEY_HERE
AMADEUS_API_SECRET=YOUR_API_SECRET_HERE
AMADEUS_HOSTNAME=test.api.amadeus.com  # Use 'api.amadeus.com' for production
```

---

## 📊 What Amadeus Provides

### **Flight APIs**
- Flight search
- Flight offers
- Flight booking
- Flight status
- Airport information

### **Hotel APIs**
- Hotel search
- Hotel booking
- Hotel offers
- Ratings & reviews

### **Destination APIs**
- Points of interest
- Activities & tours
- Safe places
- Travel recommendations

### **Other APIs**
- Airport & city search
- Airline routes
- Travel analytics
- Trip parser

---

## 💡 Pro Tips

### **1. Use Personal Email**
- Developer platforms prefer personal emails
- University emails often have restrictions
- Easier to manage long-term

### **2. Start with Test Environment**
- Free tier is perfect for development
- Test data is sufficient for building features
- Upgrade to production only when ready to launch

### **3. Keep Keys Secure**
- Never commit to GitHub
- Store in `.env` files only
- Use environment variables in production

### **4. Monitor Usage**
- Check Amadeus dashboard regularly
- Track API call usage
- Optimize queries to stay within limits

---

## 🆘 If You Still Have Issues

### **Option 1: Use Alternative Travel APIs**
```bash
# We have these working already:
✅ News API (Event Registry)
✅ Weather API (Visual Crossing)

# Alternatives to Amadeus:
- Skyscanner API (flights)
- Booking.com API (hotels)
- TripAdvisor API (reviews)
```

### **Option 2: Use Mock Data**
```bash
# Your system already has:
✅ Mock flight data
✅ Mock hotel data
✅ Mock activity data

# Good enough for:
- Development
- Testing
- Demos
- MVP launch
```

---

## 📞 Next Steps

**Choose Your Path**:

1. **Create New Amadeus Account** (Recommended)
   - Use personal email
   - Get fresh API keys
   - Takes 10 minutes

2. **Reset Existing Account**
   - Use password reset
   - May still have issues
   - Try first if you prefer

3. **Skip Amadeus for Now**
   - Use mock data
   - Deploy with what we have
   - Add Amadeus later

---

## ✅ What to Do After Getting Keys

**Send me the keys and I'll**:
1. Add them to your `.env` file
2. Test the integration
3. Update the documentation
4. Commit and push to GitHub

---

**What do you want to do?**

1. **"I'll create a new Amadeus account"** → Let me know when you have the keys
2. **"Try password reset"** → I'll wait for you to reset and get keys
3. **"Skip Amadeus for now"** → We deploy with mock data
4. **"Use alternative API"** → I'll research other options

**يا Boss، ايش تبي تسوي؟** 🚀

