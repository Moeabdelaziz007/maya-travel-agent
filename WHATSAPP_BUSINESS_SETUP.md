# 🟢 WhatsApp Business API - دليل الإعداد الكامل

## 📋 نظرة عامة

دليل شامل للحصول على WhatsApp Business API Token ودمجه مع Maya Travel Agent Bot.

---

## 1️⃣ إنشاء حساب Meta for Developers

### الخطوات:

1. **اذهب إلى:** https://developers.facebook.com/
2. **اضغط:** "Get Started" أو "تسجيل الدخول"
3. **سجل دخول** بحساب Facebook الخاص بك
4. **أكمل معلومات الحساب** إذا كانت أول مرة

---

## 2️⃣ إنشاء تطبيق جديد

### الخطوات:

1. **اضغط:** "My Apps" من القائمة العلوية
2. **اضغط:** "Create App"
3. **اختر نوع التطبيق:** "Business"
4. **املأ المعلومات:**
   ```
   App Name: Maya Travel Agent
   App Contact Email: your-email@example.com
   Business Account: [اختر أو أنشئ حساب أعمال]
   ```
5. **اضغط:** "Create App"
6. **أكمل التحقق الأمني** إذا طُلب منك

---

## 3️⃣ إضافة WhatsApp إلى التطبيق

### الخطوات:

1. في **لوحة التحكم**، ابحث عن **"WhatsApp"** في قائمة المنتجات
2. **اضغط:** "Set Up" أو "Add to App"
3. **اختر:** "WhatsApp Business API"
4. **انتظر** حتى يتم تفعيل المنتج

---

## 4️⃣ الحصول على Access Token

### أ) Temporary Token (للتجربة - 24 ساعة):

1. **اذهب إلى:** WhatsApp → Getting Started
2. **ستجد قسم:** "Temporary access token"
3. **اضغط:** "Generate Token"
4. **انسخ الـ Token** (صالح لـ 24 ساعة فقط)

```
Token Example:
EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ب) Permanent Token (للإنتاج):

#### الطريقة 1: من لوحة التحكم

1. **اذهب إلى:** WhatsApp → API Setup
2. **اضغط:** "Generate Permanent Token"
3. **اختر الصلاحيات:**
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
   - ✅ `business_management`
4. **انسخ الـ Token**

#### الطريقة 2: System User Token (الأفضل للإنتاج)

1. **اذهب إلى:** Business Settings → System Users
2. **اضغط:** "Add" لإنشاء System User جديد
3. **املأ المعلومات:**
   ```
   Name: Maya Bot System User
   Role: Admin
   ```
4. **اضغط:** "Create System User"
5. **اضغط:** "Generate New Token"
6. **اختر التطبيق:** Maya Travel Agent
7. **اختر الصلاحيات:**
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
8. **اضغط:** "Generate Token"
9. **انسخ الـ Token** (لن يظهر مرة أخرى!)

---

## 5️⃣ إعداد رقم الهاتف

### المتطلبات:

- ✅ رقم هاتف أعمال (ليس شخصي)
- ✅ لم يُستخدم في WhatsApp عادي من قبل
- ✅ يمكن استقبال SMS أو مكالمات

### الخطوات:

1. **اذهب إلى:** WhatsApp → Getting Started
2. **اضغط:** "Add Phone Number"
3. **أدخل رقم الهاتف** بالصيغة الدولية:
   ```
   مثال: +966501234567 (السعودية)
   مثال: +201012345678 (مصر)
   ```
4. **اختر طريقة التحقق:**
   - SMS (الأسرع)
   - Voice Call
5. **أدخل رمز التحقق**
6. **انسخ المعلومات المهمة:**
   - **Phone Number ID:** `123456789012345`
   - **WhatsApp Business Account ID:** `987654321098765`

---

## 6️⃣ إعداد Webhook

### ما هو Webhook؟

Webhook هو URL يستقبل الرسائل الواردة من WhatsApp.

### الخطوات:

1. **اذهب إلى:** WhatsApp → Configuration
2. **في قسم Webhooks:**
   ```
   Callback URL: https://yourdomain.com/webhook/whatsapp
   Verify Token: maya_webhook_2024_secure_token
   ```
3. **اختر الأحداث (Webhook Fields):**
   - ✅ `messages` - الرسائل الواردة
   - ✅ `message_status` - حالة الرسائل المرسلة
   - ✅ `message_echoes` - نسخ الرسائل
4. **اضغط:** "Verify and Save"

### ملاحظة:
يجب أن يكون الـ Callback URL متاحاً على الإنترنت. للتطوير المحلي، استخدم:
- **ngrok:** https://ngrok.com/
- **localtunnel:** https://localtunnel.github.io/www/

---

## 7️⃣ إنشاء Message Templates

### لماذا Message Templates؟

WhatsApp يتطلب استخدام قوالب معتمدة للرسائل الأولى (خارج نافذة الـ 24 ساعة).

### الخطوات:

1. **اذهب إلى:** WhatsApp → Message Templates
2. **اضغط:** "Create Template"
3. **املأ المعلومات:**
   ```
   Template Name: welcome_message
   Category: UTILITY
   Language: Arabic (ar)
   
   Content:
   مرحباً {{1}}! 👋
   أنا مايا، مساعدتك الذكية للسفر.
   كيف يمكنني مساعدتك اليوم؟
   ```
4. **اضغط:** "Submit"
5. **انتظر الموافقة** (عادة 1-24 ساعة)

### قوالب مقترحة:

```
1. welcome_message - رسالة الترحيب
2. booking_confirmation - تأكيد الحجز
3. payment_reminder - تذكير بالدفع
4. trip_update - تحديثات الرحلة
```

---

## 8️⃣ Business Verification (اختياري لكن مهم)

### الفوائد:

- ✅ رفع حد الرسائل (من 250 إلى 100,000+ يومياً)
- ✅ علامة التحقق الخضراء ✓
- ✅ ثقة أكبر من العملاء

### المتطلبات:

- سجل تجاري رسمي
- موقع إلكتروني نشط
- رقم هاتف أعمال
- عنوان فعلي للشركة

### الخطوات:

1. **اذهب إلى:** Business Settings → Security Center
2. **اضغط:** "Start Verification"
3. **ارفع المستندات:**
   - السجل التجاري
   - إثبات العنوان
   - بطاقة هوية المالك
4. **انتظر المراجعة** (3-5 أيام عمل)

---

## 9️⃣ التكامل مع Maya Bot

### ملف `.env`:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765
WHATSAPP_WEBHOOK_VERIFY_TOKEN=maya_webhook_2024_secure_token
WHATSAPP_APP_ID=1234567890123456
WHATSAPP_APP_SECRET=abcdef1234567890abcdef1234567890
WHATSAPP_API_VERSION=v21.0
```

### كود التكامل الأساسي:

```javascript
const axios = require('axios');

class WhatsAppClient {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp Send Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = WhatsAppClient;
```

---

## 🔐 أنواع الـ Tokens

| النوع | المدة | الاستخدام | الأمان |
|------|------|----------|--------|
| **Temporary Token** | 24 ساعة | التجربة والتطوير | منخفض |
| **User Access Token** | 60 يوم | التطوير | متوسط |
| **System User Token** | لا ينتهي | الإنتاج | عالي ⭐ |

---

## 💰 التكلفة

### الأسعار (حسب الدولة):

| الدولة | السعر لكل محادثة |
|--------|------------------|
| السعودية | $0.0365 |
| الإمارات | $0.0445 |
| مصر | $0.0160 |
| الأردن | $0.0445 |

### المجاني:

- ✅ أول **1,000 محادثة** شهرياً مجاناً
- ✅ الرسائل داخل نافذة الـ 24 ساعة لا تُحسب

### أنواع المحادثات:

1. **User-Initiated:** المستخدم يبدأ (أرخص)
2. **Business-Initiated:** الشركة تبدأ (أغلى)
3. **Utility:** إشعارات مهمة (متوسط)
4. **Marketing:** ترويجية (الأغلى)

---

## ⚠️ القيود والملاحظات المهمة

### القيود:

1. **حد الرسائل:**
   - بدون تحقق: 250 رسالة/يوم
   - مع تحقق: 1,000 → 10,000 → 100,000+ (تدريجياً)

2. **نافذة الـ 24 ساعة:**
   - يمكن الرد بحرية خلال 24 ساعة من آخر رسالة من المستخدم
   - بعدها: يجب استخدام Message Templates

3. **Message Templates:**
   - يجب الموافقة عليها من Meta
   - لا يمكن تعديلها بعد الموافقة
   - الرفض يتطلب إعادة إنشاء

### أفضل الممارسات:

- ✅ استخدم System User Token للإنتاج
- ✅ فعّل Business Verification
- ✅ أنشئ قوالب متنوعة
- ✅ راقب معدل الرد (Response Rate)
- ✅ احترم خصوصية المستخدمين
- ❌ لا ترسل spam
- ❌ لا تستخدم رقم شخصي

---

## 🧪 اختبار الـ API

### باستخدام cURL:

```bash
curl -X POST \
  "https://graph.facebook.com/v21.0/PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "966501234567",
    "type": "text",
    "text": {
      "body": "مرحباً من Maya Bot! 🤖"
    }
  }'
```

### الرد المتوقع:

```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "966501234567",
    "wa_id": "966501234567"
  }],
  "messages": [{
    "id": "wamid.HBgNOTY2NTAxMjM0NTY3FQIAERgSMEEwQjBDMEQwRTBGMTAxMTAyAA=="
  }]
}
```

---

## 📚 موارد إضافية

### الوثائق الرسمية:

- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp
- **Cloud API:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Message Templates:** https://developers.facebook.com/docs/whatsapp/message-templates
- **Webhooks:** https://developers.facebook.com/docs/whatsapp/webhooks

### أدوات مفيدة:

- **Postman Collection:** https://www.postman.com/meta/
- **API Explorer:** https://developers.facebook.com/tools/explorer/
- **Webhook Tester:** https://webhook.site/

---

## 🆘 استكشاف الأخطاء

### خطأ: "Invalid OAuth access token"

**الحل:**
- تحقق من صحة الـ Token
- تأكد من عدم انتهاء صلاحيته
- استخدم System User Token

### خطأ: "Message failed to send"

**الحل:**
- تحقق من رقم الهاتف (يجب أن يكون بالصيغة الدولية)
- تأكد من أن الرقم مسجل في WhatsApp
- راجع حد الرسائل اليومي

### خطأ: "Template not found"

**الحل:**
- تأكد من الموافقة على القالب
- استخدم الاسم الصحيح للقالب
- تحقق من اللغة المحددة

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء حساب Meta for Developers
- [ ] إنشاء تطبيق Business
- [ ] إضافة WhatsApp إلى التطبيق
- [ ] الحصول على Access Token
- [ ] إضافة وتحقق رقم الهاتف
- [ ] إعداد Webhook
- [ ] إنشاء Message Templates
- [ ] اختبار إرسال رسالة
- [ ] (اختياري) Business Verification
- [ ] دمج مع Maya Bot

---

## 🚀 الخطوة التالية

بعد الحصول على جميع المعلومات، أرسلها لي وسأدمج WhatsApp مع Maya Bot بالكامل! 🤖

**المعلومات المطلوبة:**
```
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

---

**تم إعداد هذا الدليل بواسطة Ona 🤖**
