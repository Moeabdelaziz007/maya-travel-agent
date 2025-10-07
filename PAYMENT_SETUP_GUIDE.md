# 💳 دليل إعداد نظام الدفع - Maya Trips

## 🎯 نظرة عامة

تم إضافة نظام دفع شامل لـ Maya Trips يدعم:
- 💳 **Stripe** - بطاقات الائتمان
- 🅿️ **PayPal** - دفع عبر PayPal
- 📱 **Telegram Bot** - دفع عبر التلجرام

## 🚀 الإعداد السريع

### 1. إعداد متغيرات البيئة

```bash
# انسخ ملف البيئة
cp backend/env.example backend/.env

# عدّل المتغيرات في backend/.env
```

### 2. متغيرات البيئة المطلوبة

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

## 🤖 إعداد التلجرام بوت

### 1. إنشاء بوت جديد
1. ابحث عن `@BotFather` في التلجرام
2. أرسل `/newbot`
3. اختر اسم للبوت
4. احفظ الـ Token

### 2. تفعيل الدفع في التلجرام
```bash
# أرسل هذا الأمر لـ @BotFather
/setprivacy
# اختر Disable للسماح بالدفع

# ثم أرسل
/setjoingroups
# اختر Disable
```

### 3. إضافة البوت إلى مشروعك
```bash
# في backend/.env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

## 💳 إعداد Stripe

### 1. إنشاء حساب Stripe
1. اذهب إلى [stripe.com](https://stripe.com)
2. أنشئ حساب جديد
3. احصل على API Keys

### 2. إضافة المفاتيح
```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

## 🅿️ إعداد PayPal

### 1. إنشاء تطبيق PayPal
1. اذهب إلى [developer.paypal.com](https://developer.paypal.com)
2. أنشئ تطبيق جديد
3. احصل على Client ID و Secret

### 2. إضافة المفاتيح
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox
```

## 🚀 تشغيل النظام

### 1. تثبيت التبعيات
```bash
cd backend
npm install
```

### 2. تشغيل الخادم
```bash
npm run dev
```

### 3. اختبار التلجرام بوت
1. ابحث عن بوتك في التلجرام
2. أرسل `/start`
3. جرب `/payment`

## 📱 استخدام التلجرام بوت

### الأوامر المتاحة:
- `/start` - بدء المحادثة
- `/help` - عرض المساعدة
- `/payment` - إجراء عملية دفع
- `/trip` - تخطيط رحلة جديدة
- `/budget` - إدارة الميزانية

### مثال على الدفع:
1. أرسل `/payment`
2. أدخل المبلغ (مثال: 100.50)
3. اختر طريقة الدفع
4. أكمل العملية

## 🔧 API Endpoints

### إنشاء دفع جديد
```bash
POST /api/payment/create-payment
Content-Type: application/json

{
  "amount": 100.50,
  "currency": "USD",
  "paymentMethod": "telegram",
  "description": "Maya Trips Payment",
  "chatId": "telegram_chat_id"
}
```

### تأكيد الدفع
```bash
POST /api/payment/confirm-payment
Content-Type: application/json

{
  "paymentId": "payment_id",
  "paymentMethod": "telegram"
}
```

### حالة الدفع
```bash
GET /api/payment/payment-status/{paymentId}
```

## 🧪 اختبار النظام

### 1. اختبار التلجرام بوت
```bash
# أرسل رسالة للبوت
/start
/payment
100.50
```

### 2. اختبار API
```bash
# اختبار إنشاء دفع
curl -X POST http://localhost:5000/api/payment/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "USD",
    "paymentMethod": "telegram",
    "description": "Test Payment"
  }'
```

## 🔒 الأمان

### 1. حماية المفاتيح
- لا تشارك المفاتيح السرية
- استخدم متغيرات البيئة
- لا ترفع ملف .env إلى Git

### 2. التحقق من الدفع
- تحقق من صحة المبلغ
- تأكد من مصدر الطلب
- استخدم HTTPS في الإنتاج

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

1. **البوت لا يرد**
   - تحقق من صحة الـ Token
   - تأكد من تشغيل الخادم

2. **خطأ في الدفع**
   - تحقق من صحة المفاتيح
   - تأكد من إعداد PayPal/Stripe

3. **خطأ في الشبكة**
   - تحقق من اتصال الإنترنت
   - تأكد من صحة URLs

## 📞 الدعم

للحصول على المساعدة:
- 📧 البريد الإلكتروني: support@mayatrips.com
- 💬 التلجرام: @MayaTripsSupport
- 📚 الوثائق: [docs.mayatrips.com](https://docs.mayatrips.com)

---

**ملاحظة**: هذا النظام جاهز للاستخدام في بيئة التطوير. للإنتاج، تأكد من استخدام مفاتيح الإنتاج وتفعيل HTTPS.
