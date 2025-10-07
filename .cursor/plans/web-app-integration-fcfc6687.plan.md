<!-- fcfc6687-853b-49ca-9e75-32ad8e7a78e3 6ba76232-8dd9-4ca1-87ae-66e7b8b74a33 -->
# Web App & Telegram Mini App Integration Plan

## Phase 1: Export Lovable.dev Project
1. تصدير الكود من Lovable.dev
2. نسخ الملفات إلى المشروع المحلي
3. التأكد من جميع Dependencies

## Phase 2: Local Web App Setup
1. **دمج مع المشروع الحالي:**
   - نقل مكونات Lovable.dev إلى `frontend/src/components/`
   - دمج الأنماط والتصاميم مع `frontend/src/index.css`
   - تحديث `App.tsx` للتكامل مع التصميم الجديد

2. **ربط بالـ Backend:**
   - تحديث API endpoints في `frontend/src/api/services.ts`
   - ربط Payment Service مع Stripe
   - ربط Authentication مع Supabase
   - ربط Trip Planning و Budget مع Backend APIs

3. **إضافة ميزات جديدة:**
   - دمج Payment Links من Stripe
   - ربط AI Assistant مع Backend
   - إضافة Telegram Login Widget

## Phase 3: Telegram Mini App Conversion
1. **إضافة Telegram WebApp SDK:**
   - تثبيت `@twa-dev/sdk`
   - إعداد Telegram WebApp في `main.tsx`
   - إضافة Telegram theme integration

2. **تحديث البوت لدعم Mini App:**
   - إضافة Web App button في telegram-bot.js
   - إنشاء endpoint لـ Mini App في `backend/server.js`
   - ربط البوت بالـ Web App

3. **Telegram-specific Features:**
   - إضافة Telegram user authentication
   - دمج Telegram payments
   - إضافة sharing capabilities
   - حفظ chat_id في database

## Phase 4: Testing & Deployment
1. **اختبار محلي:**
   - تشغيل Web App على localhost
   - اختبار جميع الميزات
   - التأكد من ربط Backend

2. **نشر Mini App:**
   - رفع Web App على Vercel/Netlify
   - تحديث Bot Menu Button برابط Mini App
   - اختبار Mini App في Telegram

3. **Integration Testing:**
   - اختبار تدفق الدفع الكامل
   - اختبار Trip Planning من Mini App
   - اختبار التزامن بين Bot و Mini App

## Files to Create/Modify:
- `frontend/src/telegram-webapp.ts` - Telegram WebApp SDK setup
- `backend/routes/miniapp.js` - Mini App endpoints
- `backend/telegram-bot.js` - Add Web App button
- `frontend/src/App.tsx` - Update for Mini App support
- `frontend/src/api/telegram.ts` - Telegram API integration
- `.env` - Add Telegram Mini App URL

## Success Criteria:
- ✅ Web App يعمل محلياً
- ✅ Mini App يفتح من البوت
- ✅ Payment Links تعمل في Mini App
- ✅ User data يتزامن بين Bot و Mini App
- ✅ جميع الميزات متاحة في Mini App

### To-dos

- [ ] Export code from Lovable.dev and integrate into frontend/
- [ ] Setup local Web App with backend integration
- [ ] Add Telegram WebApp SDK and configuration
- [ ] Update telegram-bot.js to support Mini App launch
- [ ] Deploy and test Mini App in Telegram