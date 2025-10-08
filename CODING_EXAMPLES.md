# 💡 أمثلة عملية - استخدام Z.ai Coding Tools

## 🎯 أمثلة جاهزة للاستخدام في مشروع Maya Travel Bot

---

## 1️⃣ إضافة ميزة حجز الفنادق

### الأمر في Claude Code:

```
أضف ميزة حجز الفنادق للبوت مع المتطلبات التالية:

1. API Integration:
   - استخدم Booking.com API
   - ابحث عن الفنادق حسب المدينة والتاريخ
   - اعرض النتائج مع الأسعار والتقييمات

2. Telegram Bot Integration:
   - أضف command /hotels
   - استخدم inline keyboards للاختيار
   - اعرض تفاصيل الفندق مع صور

3. Database:
   - احفظ الحجوزات في Supabase
   - أضف جدول bookings
   - تتبع حالة الحجز

4. Error Handling:
   - استخدم errorHandler الموجود
   - أضف fallback للـ API failures
   - log جميع الأخطاء

الملفات المطلوبة:
- backend/src/services/bookingService.js
- backend/database/bookings-schema.sql
- تحديث telegram-bot-gemini.js
```

### النتيجة المتوقعة:
- ✅ ملفات جديدة مع كود كامل
- ✅ Integration مع البوت
- ✅ Database schema
- ✅ Error handling
- ✅ Tests

---

## 2️⃣ إضافة دعم الصور

### الأمر:

```
أضف دعم الصور للبوت:

1. Image Upload:
   - المستخدم يرسل صورة لمكان سياحي
   - استخدم Gemini Vision API لتحليل الصورة
   - اعرف المكان وأعطِ معلومات عنه

2. Image Generation:
   - عند طلب معلومات عن وجهة
   - أنشئ صورة توضيحية باستخدام DALL-E
   - أرسلها مع المعلومات

3. Implementation:
   - أضف handler للصور في telegram-bot-gemini.js
   - استخدم geminiClient للتحليل
   - أضف image caching لتوفير API calls

الملفات:
- backend/src/services/imageService.js
- تحديث geminiClient.js لدعم vision
- تحديث telegram-bot-gemini.js
```

---

## 3️⃣ Analytics Dashboard

### الأمر:

```
أنشئ analytics dashboard للبوت:

1. Backend API:
   - endpoint: GET /api/analytics/overview
   - endpoint: GET /api/analytics/users
   - endpoint: GET /api/analytics/destinations
   - استخدم Supabase للبيانات

2. Metrics:
   - عدد المستخدمين النشطين (يومي/أسبوعي/شهري)
   - أكثر الوجهات طلباً
   - معدل التحويل (من استفسار إلى حجز)
   - متوسط وقت الاستجابة

3. Frontend:
   - صفحة React بسيطة
   - Charts باستخدام Chart.js
   - Real-time updates
   - Export to PDF

الملفات:
- backend/routes/analytics.js
- frontend/src/pages/Analytics.jsx
- backend/src/services/analyticsService.js
```

---

## 4️⃣ Multi-language Support

### الأمر:

```
أضف دعم اللغات المتعددة:

1. Language Detection:
   - اكتشف لغة المستخدم تلقائياً
   - دعم: العربية، الإنجليزية، الفرنسية
   - احفظ تفضيل اللغة في profile

2. Translation:
   - استخدم Google Translate API
   - ترجم responses تلقائياً
   - احتفظ بـ cache للترجمات الشائعة

3. Commands:
   - /language - تغيير اللغة
   - /ar, /en, /fr - اختصارات سريعة
   - عرض اللغة الحالية في /settings

4. Implementation:
   - backend/src/services/translationService.js
   - backend/utils/i18n.js
   - تحديث جميع responses
```

---

## 5️⃣ Payment Integration

### الأمر:

```
أضف payment integration كامل:

1. Payment Providers:
   - Stripe (بطاقات ائتمان)
   - PayPal
   - Apple Pay
   - Google Pay

2. Features:
   - إنشاء payment links
   - معالجة webhooks
   - تتبع الـ transactions
   - إصدار فواتير

3. Security:
   - PCI compliance
   - تشفير البيانات الحساسة
   - rate limiting
   - fraud detection

4. User Experience:
   - inline payment في Telegram
   - تأكيد فوري
   - إشعارات
   - refund handling

الملفات:
- backend/src/services/paymentService.js
- backend/routes/payment.js
- backend/webhooks/stripe.js
- تحديث telegram-bot-gemini.js
```

---

## 6️⃣ Voice Messages Support

### الأمر:

```
أضف دعم الرسائل الصوتية:

1. Speech-to-Text:
   - استقبل voice messages من Telegram
   - استخدم Google Speech-to-Text
   - دعم اللغة العربية والإنجليزية

2. Processing:
   - حول الصوت إلى نص
   - معالجة النص بالـ AI
   - أنشئ response

3. Text-to-Speech (Optional):
   - حول الـ response إلى صوت
   - أرسله كـ voice message
   - استخدم Google TTS

4. Implementation:
   - backend/src/services/voiceService.js
   - تحديث telegram-bot-gemini.js
   - أضف voice message handler
```

---

## 7️⃣ Testing Suite

### الأمر:

```
أنشئ comprehensive testing suite:

1. Unit Tests:
   - جميع الـ services
   - جميع الـ utilities
   - coverage > 80%

2. Integration Tests:
   - API endpoints
   - Database operations
   - External API calls (mocked)

3. E2E Tests:
   - Bot conversation flows
   - Payment flows
   - Booking flows

4. Setup:
   - استخدم Jest
   - أضف test scripts في package.json
   - CI/CD integration
   - coverage reports

الملفات:
- backend/tests/unit/
- backend/tests/integration/
- backend/tests/e2e/
- jest.config.js
- .github/workflows/test.yml
```

---

## 8️⃣ Performance Optimization

### الأمر:

```
حلل وحسّن performance:

1. Analysis:
   - profile الكود
   - ابحث عن bottlenecks
   - قس memory usage
   - قس response times

2. Optimizations:
   - أضف caching (Redis)
   - optimize database queries
   - implement connection pooling
   - add request batching

3. Monitoring:
   - أضف performance metrics
   - real-time monitoring
   - alerts للـ slow requests
   - APM integration

4. Implementation:
   - backend/src/cache/redisClient.js
   - تحديث database queries
   - أضف monitoring middleware
```

---

## 9️⃣ Admin Panel

### الأمر:

```
أنشئ admin panel للإدارة:

1. Features:
   - إدارة المستخدمين
   - إدارة العروض السياحية
   - مراجعة الحجوزات
   - إحصائيات مفصلة

2. Authentication:
   - JWT-based auth
   - role-based access control
   - secure sessions

3. UI:
   - React dashboard
   - responsive design
   - real-time updates
   - export capabilities

4. API:
   - RESTful endpoints
   - pagination
   - filtering & sorting
   - bulk operations

الملفات:
- backend/routes/admin/
- frontend/src/pages/Admin/
- backend/middleware/auth.js
```

---

## 🔟 Mobile App Integration

### الأمر:

```
أضف mobile app integration:

1. API Enhancements:
   - RESTful API للـ mobile
   - authentication tokens
   - push notifications
   - offline support

2. Features:
   - user registration/login
   - browse destinations
   - make bookings
   - chat with bot

3. Documentation:
   - API documentation (Swagger)
   - mobile SDK
   - integration guide

4. Implementation:
   - backend/routes/mobile/
   - backend/docs/api-spec.yaml
   - backend/sdk/mobile/
```

---

## 🎨 أمثلة سريعة (Quick Wins)

### Code Review:
```
راجع الكود في telegram-bot-gemini.js وأعطني:
1. Security issues
2. Performance improvements
3. Code quality suggestions
4. Best practices violations
```

### Documentation:
```
أنشئ JSDoc comments لجميع functions في:
- geminiClient.js
- conversationManager.js
- errorHandler.js
```

### Refactoring:
```
أعد هيكلة conversationManager.js:
1. فصل state management
2. أضف TypeScript types
3. حسّن error handling
4. أضف unit tests
```

### Bug Fix:
```
البوت يتوقف بعد 100 رسالة.
ابحث عن memory leak وأصلحه.
أضف monitoring لمنع تكرار المشكلة.
```

---

## 📊 نصائح للحصول على أفضل النتائج

### 1. كن محدداً:
```
❌ "حسّن الكود"
✅ "حسّن performance في conversationManager.js بإضافة caching وتقليل memory usage بنسبة 30%"
```

### 2. اذكر السياق:
```
✅ "المشروع يستخدم:
- Node.js 18
- Telegram Bot API
- Supabase database
- Gemini AI
أضف ميزة X مع مراعاة هذه التقنيات"
```

### 3. اطلب شرح:
```
✅ "اشرح لي الكود المولد خطوة بخطوة"
✅ "ما هي الـ trade-offs في هذا الحل؟"
✅ "هل هناك طريقة أفضل؟"
```

### 4. راجع النتائج:
```
✅ "راجع الكود المولد وتأكد من:
- Security best practices
- Error handling
- Performance
- Tests coverage"
```

---

## 🚀 ابدأ الآن!

```bash
# 1. Setup Claude Code
./CLAUDE_CODE_SETUP.sh

# 2. Navigate to project
cd backend

# 3. Start Claude Code
claude

# 4. Try your first command
> أضف ميزة booking للفنادق (استخدم المثال أعلاه)
```

---

**استمتع بالتطوير السريع! 🎉**
