# 🚀 Maya Travel Bot - Quick Start Guide

## ⚡ البدء السريع

### الوضع الحالي

البوت جاهز للعمل بطريقتين:

---

## 🤖 الخيار 1: البوت مع AI (يحتاج رصيد Z.ai)

### المشكلة الحالية
```
❌ Z.ai API Error: "Insufficient balance or no resource package"
```

### الحل
1. اذهب إلى [https://z.ai](https://z.ai)
2. سجل دخول بحسابك
3. اذهب إلى قسم Billing/Recharge
4. أضف رصيد أو اشترِ resource package

### التشغيل
```bash
cd backend
node telegram-bot.js
```

### الميزات
- ✅ جميع الميزات الأساسية
- ✅ AI-powered responses
- ✅ Smart recommendations
- ✅ Budget analysis
- ✅ Destination insights

---

## 🎯 الخيار 2: البوت بدون AI (يعمل الآن!)

### الحالة
```
✅ يعمل بشكل كامل بدون الحاجة لـ Z.ai
```

### التشغيل
```bash
cd backend
node telegram-bot-no-ai.js
```

### الميزات
- ✅ جميع الأوامر تعمل
- ✅ Conversation management
- ✅ Predefined responses
- ✅ Budget advice
- ✅ Destination info
- ✅ Health monitoring
- ✅ Error handling
- ✅ Logging system

### الردود المتاحة
- 🇹🇷 تركيا - معلومات كاملة
- 🇦🇪 دبي - معلومات كاملة
- 🇲🇾 ماليزيا - معلومات كاملة
- 🇹🇭 تايلاند - معلومات كاملة
- 💰 نصائح الميزانية (4 مستويات)

---

## 📊 مقارنة الخيارات

| الميزة | مع AI | بدون AI |
|--------|-------|---------|
| الأوامر الأساسية | ✅ | ✅ |
| Conversation Flow | ✅ | ✅ |
| Predefined Responses | ✅ | ✅ |
| AI-Generated Content | ✅ | ❌ |
| Smart Analysis | ✅ | ❌ |
| Dynamic Recommendations | ✅ | ❌ |
| يعمل الآن | ⚠️ (يحتاج رصيد) | ✅ |

---

## 🎮 اختبار البوت

### 1. ابدأ البوت
```bash
# بدون AI (يعمل الآن - موصى به)
node telegram-bot-no-ai.js

# مع AI (إذا كان لديك رصيد)
node telegram-bot.js
```

### 2. افتح Telegram
ابحث عن البوت الخاص بك

### 3. جرب الأوامر
```
/start - بدء المحادثة
/help - المساعدة
/trip - تخطيط رحلة
/stats - الإحصائيات
```

### 4. جرب الرسائل النصية
```
"أريد السفر إلى تركيا"
"ما هي ميزانية الرحلة؟"
"نصائح للسفر"
```

---

## 🔧 الإعدادات

### ملف .env
```bash
# Required
TELEGRAM_BOT_TOKEN=8406534524:AAH_abP6ca9o7IMyU1lqL5ImtzEWtOzhNDM

# Optional (للنسخة مع AI)
ZAI_API_KEY=4e4ab4737d0b4f0ca810ae233d4cbad3.BY1p4wRAwHCezeMh

# Optional (Database)
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

---

## 📈 الحالة الحالية

### ✅ يعمل الآن
- Telegram Bot ✅
- Conversation Manager ✅
- Error Handling ✅
- Logging System ✅
- Health Monitoring ✅
- Database (Memory Fallback) ✅

### ⚠️ يحتاج إعداد
- Z.ai API (يحتاج رصيد)
- Supabase (اختياري)

---

## 🐛 استكشاف الأخطاء

### البوت لا يستجيب
```bash
# تحقق من أن البوت يعمل
ps aux | grep telegram-bot

# تحقق من الـ logs
tail -f backend/logs/all.log

# أعد تشغيل البوت
pkill -f telegram-bot
node telegram-bot-no-ai.js
```

### خطأ Z.ai
```
الحل: استخدم telegram-bot-no-ai.js
أو أضف رصيد لحساب Z.ai
```

### خطأ Database
```
الحل: البوت يستخدم memory storage تلقائياً
لا حاجة لإعداد Supabase للتجربة
```

---

## 🚀 الإنتاج

### مع PM2
```bash
# بدون AI (موصى به حالياً)
pm2 start telegram-bot-no-ai.js --name maya-bot

# مع AI (بعد إضافة رصيد)
pm2 start telegram-bot.js --name maya-bot-ai

# حفظ
pm2 save

# Auto-start
pm2 startup
```

### مع Docker
```bash
# Build
docker build -t maya-bot .

# Run (بدون AI)
docker run -d \
  --name maya-bot \
  --env-file .env \
  -e BOT_FILE=telegram-bot-no-ai.js \
  maya-bot
```

---

## 📞 الدعم

### للمشاكل التقنية
- GitHub Issues: [Repository](https://github.com/Moeabdelaziz007/maya-travel-agent/issues)
- Logs: `backend/logs/error.log`

### لإعداد Z.ai
- Website: [https://z.ai](https://z.ai)
- Documentation: Z.ai API Docs

---

## ✅ التوصية

**للبدء الفوري:**
```bash
cd backend
node telegram-bot-no-ai.js
```

**للحصول على AI:**
1. أضف رصيد لحساب Z.ai
2. استخدم `telegram-bot.js`

---

**البوت جاهز للاستخدام الآن! 🎉**

اختر الخيار المناسب لك وابدأ!
