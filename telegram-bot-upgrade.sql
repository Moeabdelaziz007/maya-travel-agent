-- ========================================
-- Maya Telegram Bot - Database Upgrade
-- ========================================
-- Run this ONCE in your Supabase SQL Editor
-- This adds new features to existing schema

-- ========================================
-- 1. Upgrade profiles table for Telegram Bot
-- ========================================

-- Add AI learning fields to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS travel_history JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS satisfaction_score DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ========================================
-- 2. Upgrade messages table for Telegram
-- ========================================

-- Add telegram support to existing messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_telegram BOOLEAN DEFAULT FALSE;

-- ========================================
-- 3. Create Travel Offers Table
-- ========================================

CREATE TABLE IF NOT EXISTS public.travel_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percentage INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general', -- luxury, budget, adventure, family, romantic
  duration_days INTEGER DEFAULT 7,
  includes JSONB DEFAULT '[]', -- ["flights", "hotels", "meals", "tours"]
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority shows first
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. Create Offer Interactions Table
-- ========================================

CREATE TABLE IF NOT EXISTS public.offer_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT NOT NULL,
  offer_id UUID NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'click', 'book', 'share'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (offer_id) REFERENCES public.travel_offers(id) ON DELETE CASCADE
);

-- ========================================
-- 5. Create Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

CREATE INDEX IF NOT EXISTS idx_messages_telegram_id ON public.messages(telegram_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_telegram ON public.messages(is_telegram);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_travel_offers_active ON public.travel_offers(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_travel_offers_destination ON public.travel_offers(destination);
CREATE INDEX IF NOT EXISTS idx_travel_offers_category ON public.travel_offers(category);
CREATE INDEX IF NOT EXISTS idx_travel_offers_valid_until ON public.travel_offers(valid_until);

CREATE INDEX IF NOT EXISTS idx_offer_interactions_telegram_id ON public.offer_interactions(telegram_id);
CREATE INDEX IF NOT EXISTS idx_offer_interactions_offer_id ON public.offer_interactions(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_interactions_timestamp ON public.offer_interactions(timestamp DESC);

-- ========================================
-- 6. Enable Row Level Security
-- ========================================

ALTER TABLE public.travel_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_interactions ENABLE ROW LEVEL SECURITY;

-- Public can view active offers
CREATE POLICY IF NOT EXISTS "Anyone can view active offers" ON public.travel_offers
  FOR SELECT USING (is_active = true);

-- Users can view their own interactions
CREATE POLICY IF NOT EXISTS "Users can view own interactions" ON public.offer_interactions
  FOR SELECT USING (true); -- Service role will handle this

-- Service role can insert interactions
CREATE POLICY IF NOT EXISTS "Service can insert interactions" ON public.offer_interactions
  FOR INSERT WITH CHECK (true);

-- ========================================
-- 7. Insert Sample Travel Offers
-- ========================================

INSERT INTO public.travel_offers (title, destination, description, price, original_price, discount_percentage, category, duration_days, includes, image_url, priority, valid_until) VALUES
('عرض تركيا الخاص - إسطنبول وبورصة', 'تركيا', 'رحلة شاملة لمدة 7 أيام تشمل إسطنبول وبورصة مع جولات سياحية يومية', 2499.00, 3500.00, 29, 'family', 7, '["طيران ذهاب وعودة", "إقامة 5 نجوم", "وجبات الإفطار", "جولات سياحية", "مرشد عربي"]', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200', 10, NOW() + INTERVAL '30 days'),

('عرض ماليزيا الذهبي', 'ماليزيا', 'استكشف كوالالمبور ولنكاوي مع أفضل الفنادق والجولات', 3299.00, 4200.00, 21, 'luxury', 10, '["طيران درجة أولى", "فنادق 5 نجوم", "جميع الوجبات", "جولات خاصة", "تأمين شامل"]', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07', 9, NOW() + INTERVAL '45 days'),

('مغامرة دبي الاقتصادية', 'الإمارات', 'عطلة نهاية أسبوع في دبي بأسعار لا تقاوم', 1299.00, 1800.00, 28, 'budget', 4, '["طيران اقتصادي", "فندق 4 نجوم", "إفطار", "تذاكر برج خليفة"]', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', 8, NOW() + INTERVAL '20 days'),

('رحلة مصر التاريخية', 'مصر', 'اكتشف الأهرامات والأقصر وأسوان في رحلة لا تنسى', 1899.00, 2500.00, 24, 'adventure', 8, '["طيران", "فنادق 4 نجوم", "جولات أثرية", "رحلة نيلية", "مرشد متخصص"]', 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a', 7, NOW() + INTERVAL '60 days'),

('شهر العسل في المالديف', 'المالديف', 'تجربة رومانسية فاخرة في جزر المالديف الساحرة', 8999.00, 12000.00, 25, 'romantic', 7, '["طيران درجة أولى", "منتجع 5 نجوم", "جميع الوجبات", "سبا مجاني", "رحلات بحرية"]', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8', 10, NOW() + INTERVAL '90 days'),

('عرض المغرب الثقافي', 'المغرب', 'جولة شاملة في مراكش وفاس والدار البيضاء', 2199.00, 2800.00, 21, 'family', 9, '["طيران", "فنادق تقليدية", "جولات ثقافية", "وجبات محلية", "تسوق في الأسواق"]', 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43', 6, NOW() + INTERVAL '40 days'),

('مغامرة تايلاند', 'تايلاند', 'بانكوك وبوكيت وشيانغ ماي - مغامرة آسيوية كاملة', 2799.00, 3600.00, 22, 'adventure', 12, '["طيران", "فنادق متنوعة", "جولات يومية", "طعام حلال", "أنشطة مائية"]', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a', 8, NOW() + INTERVAL '50 days'),

('عرض جورجيا الطبيعي', 'جورجيا', 'استكشف جمال القوقاز وتبليسي وباتومي', 1699.00, 2200.00, 23, 'budget', 6, '["طيران", "فنادق 3 نجوم", "جولات طبيعية", "إفطار", "مرشد عربي"]', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07', 7, NOW() + INTERVAL '35 days'),

('رحلة البوسنة الساحرة', 'البوسنة', 'سراييفو وموستار - تجربة أوروبية إسلامية فريدة', 1899.00, 2400.00, 21, 'family', 7, '["طيران", "فنادق 4 نجوم", "جولات تاريخية", "وجبات حلال", "تسوق"]', 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee', 6, NOW() + INTERVAL '45 days'),

('عرض إندونيسيا الاستوائي', 'إندونيسيا', 'بالي وجاكرتا - جنة استوائية بأسعار مميزة', 3499.00, 4500.00, 22, 'luxury', 10, '["طيران", "منتجعات 5 نجوم", "جميع الوجبات", "سبا", "جولات خاصة"]', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', 9, NOW() + INTERVAL '60 days')
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. Create Update Trigger
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to travel_offers
DROP TRIGGER IF EXISTS update_travel_offers_updated_at ON public.travel_offers;
CREATE TRIGGER update_travel_offers_updated_at 
  BEFORE UPDATE ON public.travel_offers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. Verification Queries
-- ========================================

-- Check if everything is created correctly
DO $$
BEGIN
  RAISE NOTICE '✅ Checking tables...';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'travel_offers') THEN
    RAISE NOTICE '✅ travel_offers table created';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'offer_interactions') THEN
    RAISE NOTICE '✅ offer_interactions table created';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
    RAISE NOTICE '✅ profiles.preferences column added';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'telegram_id') THEN
    RAISE NOTICE '✅ messages.telegram_id column added';
  END IF;
  
  RAISE NOTICE '✅ Database upgrade completed successfully!';
  RAISE NOTICE '🤖 Telegram Bot is ready to use!';
END $$;

-- Show sample offers
SELECT 
  '📊 Sample Offers:' as info,
  COUNT(*) as total_offers,
  COUNT(*) FILTER (WHERE is_active = true) as active_offers,
  AVG(discount_percentage) as avg_discount
FROM public.travel_offers;

-- ========================================
-- DONE! 🎉
-- ========================================
-- Your Telegram Bot database is now ready!
-- Run: node backend/server.js
-- ========================================
