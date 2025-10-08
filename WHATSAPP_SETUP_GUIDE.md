# WhatsApp Business API - Complete Setup Guide

## 🔐 SECURITY FIRST

**⚠️ CRITICAL:** Never share your access tokens publicly! If you accidentally exposed your token:

1. **Immediately go to:** https://developers.facebook.com/apps
2. Select your app → Settings → Basic
3. Click "Show" next to App Secret
4. **Regenerate** your access token
5. Update your `.env` file with the new token

---

## 📋 Prerequisites

Before starting, you need:

1. **Meta Business Account** - https://business.facebook.com
2. **WhatsApp Business Account** - Set up through Meta Business
3. **Meta Developer Account** - https://developers.facebook.com
4. **Phone Number** - Verified for WhatsApp Business

---

## 🚀 Step 1: Get Your WhatsApp Business API Credentials

### A. Create/Access Your Meta App

1. Go to https://developers.facebook.com/apps
2. Click "Create App" or select existing app
3. Choose "Business" as app type
4. Fill in app details and create

### B. Add WhatsApp Product

1. In your app dashboard, find "WhatsApp" in products
2. Click "Set Up"
3. Follow the setup wizard

### C. Get Your Credentials

You need three key pieces of information:

#### 1. **Access Token**
```
Location: WhatsApp → API Setup → Temporary access token
Note: Generate a permanent token for production!
```

#### 2. **Phone Number ID**
```
Location: WhatsApp → API Setup → Phone number ID
Format: 123456789012345
```

#### 3. **Business Account ID**
```
Location: WhatsApp → API Setup → WhatsApp Business Account ID
Format: 123456789012345
```

---

## 📝 Step 2: Configure Your Backend

### Update `.env` File

Open `backend/.env` and add:

```bash
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=EAATksYO...  # Your FULL access token
WHATSAPP_PHONE_NUMBER_ID=123456789012345  # From API Setup
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765  # From API Setup
WHATSAPP_API_VERSION=v21.0  # Current version
WHATSAPP_WEBHOOK_VERIFY_TOKEN=maya_whatsapp_webhook_2024  # Custom token
```

**Token Types:**

- **Temporary Token:** Expires in 24 hours (for testing)
- **Permanent Token:** Never expires (for production)

**To generate permanent token:**
1. Go to System Users in Business Settings
2. Create a system user
3. Assign WhatsApp permissions
4. Generate token

---

## 🔗 Step 3: Configure Webhook

Webhooks allow WhatsApp to send messages to your server.

### A. Get Your Public URL

For development, use **ngrok** or similar:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start ngrok
ngrok http 5000

# You'll get a URL like: https://abc123.ngrok.io
```

### B. Configure Webhook in Meta

1. Go to: WhatsApp → Configuration
2. Click "Edit" next to Webhook
3. **Callback URL:** `https://your-domain.com/api/whatsapp/webhook`
   - Example: `https://abc123.ngrok.io/api/whatsapp/webhook`
4. **Verify Token:** `maya_whatsapp_webhook_2024` (from your .env)
5. Click "Verify and Save"

### C. Subscribe to Webhook Events

Select these events:
- ✅ **messages** - Incoming messages
- ✅ **message_status** - Delivery/read receipts

---

## ✅ Step 4: Test Your Setup

### Test 1: Health Check

```bash
curl http://localhost:5000/api/whatsapp/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "data": {
    "verified_name": "Maya Travel",
    "display_phone_number": "+1234567890"
  }
}
```

### Test 2: Send Test Message

```bash
curl -X POST http://localhost:5000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "message": "Hello from Maya! 🌍"
  }'
```

**Note:** Replace `1234567890` with a real phone number (without +)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [...],
    "messages": [...]
  },
  "messageId": "wamid.ABC123..."
}
```

### Test 3: Receive Messages

1. Send a message to your WhatsApp Business number
2. Check your server logs:

```
📱 WhatsApp message from 1234567890
✅ WhatsApp message sent to 1234567890
```

---

## 🎯 Step 5: Testing with Real Conversations

### Start Command

Send `/start` to your WhatsApp Business number

**You should receive:**
```
🌍 مرحباً! أنا مايا، مساعدتك الذكية للسفر ✨

🧠 أنا هنا لمساعدتك في:
• 📍 تخطيط رحلات مثالية
• 💰 تحليل الميزانية
• 🏨 توصيات الفنادق
• 🍽️ مطاعم حلال

اسألني أي سؤال عن السفر!

[Buttons: تخطيط رحلة | وجهات مقترحة | مساعدة]
```

### AI Chat Test

Send any travel question:
```
"أريد السفر إلى دبي، ما هي أفضل الفنادق؟"
```

**Maya will respond with AI-powered recommendations!**

---

## 🔍 Troubleshooting

### Issue 1: "WhatsApp not configured"

**Problem:** Server shows `⚠️ WhatsApp not configured`

**Solutions:**
1. Check `.env` file exists in `backend/` directory
2. Verify all three required variables are set:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
3. Restart your server: `npm run dev`

### Issue 2: Webhook verification fails

**Problem:** Meta says "Unable to verify"

**Solutions:**
1. Make sure server is running
2. Check URL is publicly accessible (use ngrok)
3. Verify token matches exactly (case-sensitive)
4. Check server logs for errors

### Issue 3: Messages not sending

**Problem:** API returns error

**Solutions:**

**Error: "Invalid OAuth access token"**
- Token expired → Generate new permanent token
- Token invalid → Copy full token (very long string)

**Error: "Phone number not found"**
- Wrong Phone Number ID
- Go to API Setup and copy correct ID

**Error: "Recipient not registered"**
- Phone number must have WhatsApp
- Format: numbers only, no + or spaces
- Example: `1234567890` not `+1 (234) 567-890`

### Issue 4: Can't receive messages

**Problem:** Server not receiving webhooks

**Solutions:**
1. Webhook URL must be HTTPS (use ngrok for dev)
2. Check webhook is subscribed to "messages"
3. Verify callback URL ends with `/api/whatsapp/webhook`
4. Check server logs for incoming requests

---

## 📊 Monitor Your Integration

### View Logs

```bash
# Backend logs
cd backend
npm run dev

# Watch for:
# ✅ WhatsApp Business API initialized
# 📱 Phone Number ID: 123456789012345
# 📱 WhatsApp message from 1234567890
```

### Test Endpoints

```bash
# Health check
curl http://localhost:5000/api/whatsapp/health | jq

# Send test message
curl -X POST http://localhost:5000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"to":"1234567890", "message":"Test"}' | jq
```

---

## 🎨 Advanced Features

### 1. Interactive Buttons

```javascript
const buttons = [
  { id: 'plan_trip', title: '🚀 تخطيط رحلة' },
  { id: 'destinations', title: '🌍 وجهات مقترحة' },
  { id: 'help', title: '❓ مساعدة' }
];

await whatsappClient.sendInteractive(
  phoneNumber,
  'اختر خدمة:',
  buttons
);
```

### 2. List Messages

```javascript
const sections = [
  {
    title: "وجهات شعبية",
    rows: [
      { id: "dubai", title: "دبي", description: "الإمارات" },
      { id: "paris", title: "باريس", description: "فرنسا" }
    ]
  }
];

await whatsappClient.sendList(
  phoneNumber,
  'اختر وجهة:',
  'الوجهات',
  sections
);
```

### 3. Template Messages

```javascript
await whatsappClient.sendTemplate(
  phoneNumber,
  'booking_confirmation',
  'ar',
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'مايا' },
        { type: 'text', text: 'دبي' }
      ]
    }
  ]
);
```

---

## 🔐 Security Best Practices

### 1. Token Management

```bash
# ❌ NEVER commit tokens to git
git update-index --assume-unchanged backend/.env

# ✅ Use environment variables
export WHATSAPP_ACCESS_TOKEN="your_token"

# ✅ Use secrets manager in production
# AWS Secrets Manager, Google Secret Manager, etc.
```

### 2. Webhook Security

```javascript
// Verify webhook signature (production)
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, appSecret) {
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}
```

### 3. Rate Limiting

```javascript
// Prevent spam
const rateLimit = new Map();

function checkRateLimit(phoneNumber) {
  const key = phoneNumber;
  const now = Date.now();
  const limit = 10; // 10 messages
  const window = 60000; // per minute
  
  if (!rateLimit.has(key)) {
    rateLimit.set(key, []);
  }
  
  const timestamps = rateLimit.get(key)
    .filter(t => now - t < window);
  
  if (timestamps.length >= limit) {
    return false; // Rate limited
  }
  
  timestamps.push(now);
  rateLimit.set(key, timestamps);
  return true;
}
```

---

## 📈 Production Deployment

### Checklist

- [ ] Generate **permanent access token** (not temporary)
- [ ] Set up **system user** with WhatsApp permissions
- [ ] Configure **production webhook URL** (HTTPS required)
- [ ] Enable **webhook signature verification**
- [ ] Set up **error monitoring** (Sentry, LogRocket, etc.)
- [ ] Configure **rate limiting**
- [ ] Set up **message queue** (Redis, RabbitMQ)
- [ ] Implement **conversation persistence** (database)
- [ ] Add **analytics tracking**
- [ ] Set up **backup phone numbers**
- [ ] Configure **failover strategy**
- [ ] Document **incident response plan**

### Environment Variables (Production)

```bash
NODE_ENV=production
WHATSAPP_ACCESS_TOKEN=<permanent_token>
WHATSAPP_PHONE_NUMBER_ID=<prod_phone_id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<prod_business_id>
WHATSAPP_API_VERSION=v21.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<strong_random_token>
```

---

## 📚 Resources

### Official Documentation
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp
- **Cloud API Guide:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Message Templates:** https://developers.facebook.com/docs/whatsapp/message-templates

### Meta Developer Tools
- **Meta Business Suite:** https://business.facebook.com
- **Developer Console:** https://developers.facebook.com/apps
- **API Explorer:** https://developers.facebook.com/tools/explorer

### Testing Tools
- **ngrok:** https://ngrok.com (for local webhook testing)
- **Postman:** WhatsApp API collection available
- **curl:** Command-line testing

---

## 🆘 Support

### Common Commands

```bash
# Check if WhatsApp is configured
curl http://localhost:5000/api/whatsapp/health

# Test sending message
curl -X POST http://localhost:5000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"to":"YOUR_PHONE", "message":"Test"}'

# View server logs
tail -f backend/logs/app.log

# Check environment variables
cd backend && grep WHATSAPP .env
```

### Get Help

1. **Server logs:** Check console output
2. **Meta docs:** https://developers.facebook.com/docs/whatsapp
3. **API Explorer:** Test API calls directly
4. **Community:** Facebook Developer Community

---

## ✅ Quick Setup Checklist

- [ ] Created Meta Business Account
- [ ] Set up WhatsApp Business
- [ ] Created Meta Developer App
- [ ] Added WhatsApp product
- [ ] Got Access Token
- [ ] Got Phone Number ID
- [ ] Got Business Account ID
- [ ] Updated `.env` file
- [ ] Configured webhook URL
- [ ] Verified webhook
- [ ] Tested health check
- [ ] Sent test message
- [ ] Received test message
- [ ] Tested AI conversation

**All done?** You're ready to use WhatsApp Business API! 🎉

---

## 📞 Your Turn!

Now test it:

1. **Send a message** to your WhatsApp Business number
2. **Type:** `/start`
3. **Ask Maya** a travel question
4. **Enjoy** AI-powered travel assistance!

---

**Need help?** Check the troubleshooting section or review server logs.

**Ready for production?** Follow the production deployment checklist above.
