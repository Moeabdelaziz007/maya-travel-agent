# 🤖 Maya Telegram Bot - دليل الإعداد الكامل

## ✨ المميزات الجديدة

### 1. **ذاكرة دائمة مع Supabase**
- ✅ يتذكر كل محادثاتك السابقة
- ✅ يحفظ تفضيلاتك في السفر
- ✅ يتعلم من تاريخ رحلاتك
- ✅ يقدم توصيات مخصصة بناءً على سلوكك

### 2. **نظام عروض السفر الذكي**
- ✅ عروض مخصصة لكل مستخدم
- ✅ خصومات حصرية تصل إلى 30%
- ✅ 10+ وجهات سياحية مميزة
- ✅ تتبع العروض والحجوزات

### 3. **منع الحلقات اللانهائية**
- ✅ كشف الأسئلة المتكررة
- ✅ حد أقصى 15 رسالة لكل موضوع
- ✅ خيارات إنهاء المحادثة الذكية
- ✅ إعادة تشغيل تلقائية عند الأخطاء

### 4. **البوت يعمل دائماً**
- ✅ معالجة أخطاء متقدمة
- ✅ إعادة اتصال تلقائية
- ✅ مراقبة الأداء
- ✅ إحصائيات مفصلة

---

## 📋 متطلبات التشغيل

### 1. قاعدة البيانات Supabase

قم بتشغيل هذا الأمر في Supabase SQL Editor:

\`\`\`sql
-- إضافة حقول جديدة لجدول profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS travel_history JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- إضافة حقول لجدول messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_telegram BOOLEAN DEFAULT FALSE;

-- إنشاء جدول عروض السفر
CREATE TABLE IF NOT EXISTS public.travel_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percentage INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  duration_days INTEGER DEFAULT 7,
  includes JSONB DEFAULT '[]',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول تتبع التفاعل مع العروض
CREATE TABLE IF NOT EXISTS public.offer_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT NOT NULL,
  offer_id UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (offer_id) REFERENCES public.travel_offers(id) ON DELETE CASCADE
);

-- إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_messages_telegram_id ON public.messages(telegram_id);
CREATE INDEX IF NOT EXISTS idx_travel_offers_active ON public.travel_offers(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_offer_interactions_telegram_id ON public.offer_interactions(telegram_id);
\`\`\`

### 2. إضافة عروض السفر (اختياري)

\`\`\`sql
-- إضافة عروض سفر تجريبية
INSERT INTO public.travel_offers (title, destination, description, price, original_price, discount_percentage, category, duration_days, includes, priority, valid_until) VALUES
('عرض تركيا الخاص', 'تركيا', 'رحلة شاملة لمدة 7 أيام تشمل إسطنبول وبورصة', 2499.00, 3500.00, 29, 'family', 7, '["طيران ذهاب وعودة", "إقامة 5 نجوم", "وجبات الإفطار", "جولات سياحية"]', 10, NOW() + INTERVAL '30 days'),
('عرض ماليزيا الذهبي', 'ماليزيا', 'استكشف كوالالمبور ولنكاوي', 3299.00, 4200.00, 21, 'luxury', 10, '["طيران درجة أولى", "فنادق 5 نجوم", "جميع الوجبات"]', 9, NOW() + INTERVAL '45 days'),
('مغامرة دبي الاقتصادية', 'الإمارات', 'عطلة نهاية أسبوع في دبي', 1299.00, 1800.00, 28, 'budget', 4, '["طيران اقتصادي", "فندق 4 نجوم", "إفطار"]', 8, NOW() + INTERVAL '20 days');
\`\`\`

---

## 🚀 تشغيل البوت

### 1. تأكد من ملف .env

\`\`\`bash
# في backend/.env
TELEGRAM_BOT_TOKEN=your_bot_token_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ZAI_API_KEY=your_zai_api_key
\`\`\`

### 2. تشغيل البوت

\`\`\`bash
cd backend
node server.js
\`\`\`

---

## 💬 كيفية الاستخدام

### الأوامر الأساسية:

- \`/start\` - بدء المحادثة
- \`/trip\` - تخطيط رحلة جديدة
- \`/budget\` - تحليل الميزانية
- \`/weather\` - حالة الطقس
- \`/profile\` - ملفك الشخصي
- \`/help\` - المساعدة

### إنهاء المحادثة:

اكتب أي من هذه الكلمات:
- إنهاء
- توقف
- كفاية
- شكراً وداعاً
- end
- stop

---

## 🎯 سيناريوهات الاستخدام

### 1. تخطيط رحلة بسيطة

\`\`\`
المستخدم: /trip
البوت: [يعرض عروض مخصصة + وجهات شائعة]
المستخدم: أريد رحلة إلى تركيا لمدة أسبوع بميزانية 5000 ريال
البوت: [يقدم توصيات مخصصة بناءً على التاريخ]
\`\`\`

### 2. اختيار عرض جاهز

\`\`\`
المستخدم: /trip
البوت: [يعرض 3 عروض مخصصة]
المستخدم: [يضغط على عرض تركيا]
البوت: [يعرض تفاصيل العرض الكاملة]
المستخدم: نعم، احجز الآن
البوت: [يبدأ عملية الحجز]
\`\`\`

### 3. منع الحلقات اللانهائية

\`\`\`
المستخدم: ما هي أفضل الأسعار؟
البوت: [يجيب]
المستخدم: وما هي أرخص الأسعار؟
البوت: [يجيب]
المستخدم: طيب الأسعار الأقل؟
البوت: 🔄 يبدو أننا نكرر نفس الموضوع. دعني أساعدك بطريقة مختلفة...
[يعرض خيارات: إنهاء / بداية جديدة / اقتراحات أخرى]
\`\`\`

---

## 📊 الإحصائيات والتحليلات

البوت يتتبع:
- ✅ عدد المحادثات
- ✅ الوجهات المفضلة
- ✅ متوسط الميزانية
- ✅ معدل الحجوزات
- ✅ رضا المستخدمين

---

## 🔧 استكشاف الأخطاء

### البوت لا يستجيب؟

1. تحقق من token البوت
2. تأكد من اتصال Supabase
3. راجع logs في terminal

### لا يتذكر المحادثات؟

1. تأكد من تشغيل SQL schema
2. تحقق من SUPABASE_SERVICE_ROLE_KEY
3. راجع جدول messages في Supabase

### العروض لا تظهر؟

1. تأكد من إضافة عروض في جدول travel_offers
2. تحقق من is_active = true
3. راجع valid_until date

---

## 🎨 التخصيص

### إضافة عروض جديدة:

\`\`\`javascript
await db.createTravelOffer({
  title: 'عرض خاص',
  destination: 'مصر',
  description: 'رحلة تاريخية',
  price: 1899,
  originalPrice: 2500,
  discountPercentage: 24,
  category: 'adventure',
  durationDays: 8,
  includes: ['طيران', 'فنادق', 'جولات'],
  priority: 7,
  validUntil: '2024-12-31'
});
\`\`\`

### تعديل رسائل البوت:

عدّل الملف: \`backend/advanced-telegram-bot.js\`

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع logs في terminal
2. تحقق من Supabase dashboard
3. راجع ملف .env

---

## ✅ قائمة التحقق

- [ ] تشغيل SQL schema في Supabase
- [ ] إضافة عروض السفر
- [ ] تحديث ملف .env
- [ ] تشغيل البوت
- [ ] اختبار /start
- [ ] اختبار /trip
- [ ] اختبار اختيار عرض
- [ ] اختبار إنهاء المحادثة
- [ ] التحقق من حفظ المحادثات

---

## 🎉 الخلاصة

البوت الآن:
- ✅ يتذكر كل شيء عن المستخدمين
- ✅ يقدم عروض مخصصة ذكية
- ✅ لا يدخل في حلقات لانهائية
- ✅ يعمل بشكل مستقر دائماً
- ✅ يتعلم ويتحسن مع الوقت

**مايا جاهزة لتقديم أفضل تجربة سفر! 🌍✈️**
