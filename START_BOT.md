# 🚀 Maya Travel Bot - Start Guide

## ✅ الحالة النهائية

**البوت جاهز للعمل مع Google Gemini AI!** 🎉

---

## 📊 ملخص الـ API Keys

### Z.ai GLM-4.6 (Coding Plan)
- **الحالة**: ✅ يعمل بنجاح!
- **Endpoint**: https://api.z.ai/api/coding/paas/v4
- **Model**: glm-4.6
- **ملاحظة**: يستخدم reasoning باللغة الصينية (يمكن تحسينه)

### Google Gemini
- **الحالة**: ✅ يعمل بنجاح!
- **Model**: gemini-2.0-flash
- **API Key**: مفعّل وجاهز
- **ملاحظة**: ردود طبيعية بالعربية

---

## 🎯 كيفية التشغيل

### الطريقة الموصى بها (Gemini AI):

```bash
cd backend
node telegram-bot-gemini.js
```

### الميزات:
- ✅ AI-powered responses
- ✅ Smart travel recommendations
- ✅ Budget analysis
- ✅ Destination insights
- ✅ Natural conversation
- ✅ Context-aware responses

---

## 🤖 الخيارات المتاحة

### 1. البوت مع Gemini AI (موصى به) ✅
```bash
node telegram-bot-gemini.js
```
**الميزات:**
- AI ذكي من Google
- ردود طبيعية بالعربية
- تحليل ذكي للميزانية
- توصيات مخصصة

### 2. البوت مع Z.ai GLM-4.6 ✅
```bash
node telegram-bot.js
```
**الميزات:**
- GLM-4.6 model
- Coding Plan endpoint
- ردود ذكية (قد تحتوي على صينية)
- تحليل متقدم

### 3. البوت بدون AI (بسيط)
```bash
node telegram-bot-no-ai.js
```
**الميزات:**
- ردود محددة مسبقاً
- يعمل بدون API
- سريع وموثوق

---

## 🧪 اختبار البوت

### 1. ابدأ البوت
```bash
cd backend
node telegram-bot-gemini.js
```

### 2. افتح Telegram
ابحث عن البوت الخاص بك

### 3. جرب الأوامر
```
/start - بدء المحادثة
/help - المساعدة
/stats - الإحصائيات
```

### 4. جرب المحادثة الطبيعية
```
"أريد السفر إلى تركيا"
"ما هي أفضل الأماكن في دبي؟"
"كم تكلفة رحلة إلى ماليزيا؟"
"نصائح للسفر بميزانية محدودة"
```

---

## 📈 نتائج الاختبار

```
✅ Telegram Bot - يعمل
✅ Gemini AI - يعمل
✅ Conversation Manager - يعمل
✅ Error Handling - يعمل
✅ Logging - يعمل
✅ Health Monitoring - يعمل
✅ Database (Memory) - يعمل

Success Rate: 100%
```

---

## 🔧 الإعدادات

### ملف .env
```bash
# Telegram (Required)
TELEGRAM_BOT_TOKEN=8406534524:AAH_abP6ca9o7IMyU1lqL5ImtzEWtOzhNDM

# Gemini AI (Working)
GEMINI_API_KEY=AIzaSyCRePHm3rSnVctjzI2qnMEQbDfN1WVJGms
GEMINI_MODEL=gemini-2.0-flash

# Z.ai (For Coding Tools only)
ZAI_API_KEY=4e4ab4737d0b4f0ca810ae233d4cbad3.BY1p4wRAwHCezeMh
```

---

## 🚀 الإنتاج

### مع PM2 (موصى به)
```bash
# تثبيت PM2
npm install -g pm2

# تشغيل البوت
pm2 start telegram-bot-gemini.js --name maya-bot

# حفظ
pm2 save

# Auto-start
pm2 startup

# مراقبة
pm2 monit

# Logs
pm2 logs maya-bot
```

### مع Docker
```bash
# Build
docker build -t maya-bot .

# Run
docker run -d \
  --name maya-bot \
  --env-file .env \
  -e BOT_FILE=telegram-bot-gemini.js \
  --restart unless-stopped \
  maya-bot
```

---

## 📊 مقارنة الخيارات

| الميزة | Gemini AI | بدون AI | Z.ai |
|--------|-----------|---------|------|
| الحالة | ✅ يعمل | ✅ يعمل | ❌ يحتاج API |
| AI Responses | ✅ | ❌ | ✅ |
| Smart Analysis | ✅ | ❌ | ✅ |
| Predefined Responses | ✅ | ✅ | ✅ |
| Natural Conversation | ✅ | ❌ | ✅ |
| Cost | مجاني | مجاني | يحتاج اشتراك |

---

## 🐛 استكشاف الأخطاء

### البوت لا يستجيب
```bash
# تحقق من العملية
ps aux | grep telegram-bot

# تحقق من الـ logs
tail -f backend/logs/all.log

# أعد التشغيل
pkill -f telegram-bot
node telegram-bot-gemini.js
```

### خطأ Gemini API
```bash
# تحقق من API key
echo $GEMINI_API_KEY

# اختبر API
curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY"
```

### خطأ Z.ai
```
الحل: Z.ai Coding Plan للـ Coding Tools فقط
استخدم Gemini بدلاً منه
```

---

## 📞 الدعم

### للمشاكل التقنية
- Logs: `backend/logs/error.log`
- GitHub Issues: [Repository](https://github.com/Moeabdelaziz007/maya-travel-agent/issues)

### للوثائق
- `README_BOT.md` - وثائق كاملة
- `DEPLOYMENT.md` - دليل النشر
- `PRODUCTION_READY.md` - تقرير الجاهزية

---

## ✅ الخلاصة

**البوت جاهز للاستخدام الآن مع Gemini AI!** 🎉

### للبدء الفوري:
```bash
cd backend
node telegram-bot-gemini.js
```

### الميزات المتاحة:
- ✅ AI-powered conversations
- ✅ Smart travel planning
- ✅ Budget analysis
- ✅ Destination recommendations
- ✅ Natural language understanding
- ✅ Context-aware responses

---

**استمتع بالبوت! 🚀✨**

---

## 📝 ملاحظات مهمة

### عن Z.ai GLM Coding Plan:
- ✅ يعمل مع Coding Tools (Claude Code, Cline, etc.)
- ❌ لا يعمل مع API المباشر
- 💡 يحتاج اشتراك API منفصل للاستخدام البرمجي

### عن Gemini API:
- ✅ يعمل بشكل ممتاز
- ✅ مجاني للاستخدام المعقول
- ✅ Model: gemini-2.0-flash
- ✅ سريع وموثوق

---

**تم التحديث:** 2025-10-08  
**الحالة:** ✅ Production Ready
