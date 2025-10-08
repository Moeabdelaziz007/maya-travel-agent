# 🗄️ Supabase Complete Database Setup

**Project:** Maya Travel Agent  
**Supabase URL:** https://komahmavsulpkawmhqhk.supabase.co  
**Dashboard:** https://supabase.com/dashboard/project/komahmavsulpkawmhqhk

---

## 📋 **Complete Setup Checklist**

### **Phase 1: Run All Migrations** ⚡ CRITICAL

You have **10 migration files** to run in order:

#### **Go to:** https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/sql/new

Run each migration file in this exact order:

1. ✅ `20251007194755_05b184f9-cfae-41cb-acb2-eac72eb7c1c4.sql`
2. ✅ `20251007195104_24108003-e206-4bab-a9bc-b48966d0a932.sql`
3. ✅ `20251007195119_992f9a58-5686-4d0f-9813-ac83c17a0d7e.sql`
4. ✅ `20251008015202_01da0576-b29a-4ce3-bcf7-812d30acbd0b.sql`
5. ✅ `20251008120715_7b9edf90-0c9e-443e-b219-5cbe008a2f8c.sql`
6. ✅ `20251008120832_8ab42a6f-c82d-44ef-8848-ece6e3760de3.sql`
7. ✅ `20251008123053_cad1d883-d894-4208-a0f3-f996f0ffd8bb.sql`
8. ✅ `20251008123313_90f491d5-b42b-4c80-82bd-ff9c953d7a6e.sql`
9. ✅ `20251008180000_optimize_rls_performance.sql` ⚡ NEW - Performance fix
10. ✅ `20251008190000_fix_function_security.sql` ⚡ NEW - Security fix

**OR use the base schema:**
- Run: `supabase-schema.sql` (creates all basic tables)

---

### **Phase 2: Configure Authentication URLs**

**Go to:** https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/auth/url-configuration

#### **Set Site URL:**
```
https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app
```

#### **Add Redirect URLs:**
```
https://frontend-9mbmltejk-mohameds-projects-e3d02482.vercel.app/**
https://frontend-*.mohameds-projects-e3d02482.vercel.app/**
http://localhost:3000/**
http://localhost:5173/**
```

Click **"Save Changes"**

---

### **Phase 3: Verify Database Tables**

**Go to:** https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/editor

**Check these tables exist:**
- [ ] `auth.users` (built-in)
- [ ] `public.users` (user profiles)
- [ ] `public.trips` (trip data)
- [ ] `public.destinations` (destination catalog)
- [ ] `public.expenses` (expense tracking)
- [ ] `public.ai_conversations` (chat history)
- [ ] `public.subscriptions` (subscription data)
- [ ] `public.payments` (payment records)
- [ ] `public.analytics_events` (analytics tracking)
- [ ] `public.user_profiles` (extended profiles)

---

## 🔍 **Quick Database Check**

Run this SQL to verify everything is set up:

**Go to:** https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/sql/new

```sql
-- Check all tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;

-- Count policies (should have 19+ policies)
SELECT 
  COUNT(*) as policy_count,
  tablename
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected Results:**
- ~10 tables in public schema
- ~7 tables with RLS enabled
- ~19 RLS policies total

---

## 🚀 **Quick Setup Script** (All at Once)

If you want to set up everything from scratch, run this:

**Go to:** https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/sql/new

**Copy and paste this entire SQL:**

```sql
-- ============================================
-- MAYA TRAVEL AGENT - COMPLETE DATABASE SETUP
-- ============================================
-- Run this script to set up the entire database
-- Includes: tables, indexes, RLS policies, functions, triggers
-- ============================================

-- Drop existing tables if resetting (CAREFUL!)
-- DROP TABLE IF EXISTS public.payments CASCADE;
-- DROP TABLE IF EXISTS public.subscriptions CASCADE;
-- DROP TABLE IF EXISTS public.analytics_events CASCADE;
-- DROP TABLE IF EXISTS public.ai_conversations CASCADE;
-- DROP TABLE IF EXISTS public.expenses CASCADE;
-- DROP TABLE IF EXISTS public.trips CASCADE;
-- DROP TABLE IF EXISTS public.destinations CASCADE;
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles (extended)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  display_name TEXT,
  bio TEXT,
  wallet_address TEXT,
  auth_type TEXT DEFAULT 'email',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2) DEFAULT 0,
  travelers_count INTEGER DEFAULT 1,
  trip_style TEXT,
  preferences JSONB DEFAULT '{}',
  itinerary JSONB DEFAULT '{}',
  booking_status TEXT DEFAULT 'planning' CHECK (booking_status IN ('planning', 'booked', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  price_range TEXT DEFAULT '$$',
  best_time TEXT,
  description TEXT,
  features JSONB DEFAULT '[]',
  coordinates POINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'premium')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  stripe_payment_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(booking_status);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON public.trips(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_trip_id ON public.ai_conversations(trip_id);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON public.destinations(rating);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON public.analytics_events(event_type);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON public.ai_conversations;

-- Create OPTIMIZED RLS policies (with performance fix)
-- Users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- User profiles table
CREATE POLICY "Users can view own user_profile" ON public.user_profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own user_profile" ON public.user_profiles
  FOR UPDATE USING ((select auth.uid()) = id);

-- Trips table
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own trips" ON public.trips
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Expenses table
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own expenses" ON public.expenses
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING ((select auth.uid()) = user_id);

-- AI Conversations table
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Subscriptions table
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Payments table
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Analytics table
CREATE POLICY "Users can view own analytics" ON public.analytics_events
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own analytics" ON public.analytics_events
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Destinations table is public (no RLS)
ALTER TABLE public.destinations DISABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_profiles (id, user_id, display_name, auth_type)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'auth_type', 'email')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample destinations
INSERT INTO public.destinations (name, country, image_url, rating, price_range, best_time, description)
VALUES
  ('Tokyo', 'Japan', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', 4.8, '$$$', 'Mar-May, Sep-Nov', 'A vibrant metropolis blending traditional culture with cutting-edge technology.'),
  ('Paris', 'France', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400', 4.9, '$$$$', 'Apr-Jun, Sep-Oct', 'The City of Light, famous for its art, fashion, and romantic atmosphere.'),
  ('Bali', 'Indonesia', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400', 4.7, '$$', 'Apr-Oct', 'Tropical paradise with stunning beaches, temples, and lush landscapes.'),
  ('New York', 'USA', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', 4.6, '$$$$', 'Apr-Jun, Sep-Nov', 'The city that never sleeps, offering endless entertainment and culture.'),
  ('Santorini', 'Greece', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400', 4.9, '$$$', 'May-Oct', 'Breathtaking sunsets, white-washed buildings, and crystal-clear waters.'),
  ('Dubai', 'UAE', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', 4.5, '$$$', 'Nov-Mar', 'Ultra-modern city with world-class shopping, dining, and entertainment.')
ON CONFLICT DO NOTHING;

-- Verify setup
SELECT 'Setup complete!' as message,
       (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as table_count,
       (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policy_count,
       (SELECT COUNT(*) FROM public.destinations) as destination_count;
```

Click **"Run"** and you should see:
```
message: "Setup complete!"
table_count: 10
policy_count: 19
destination_count: 6
```

---

## 🧪 **Test Database Setup**

After running the setup, test with these queries:

### **1. Check Tables:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### **2. Check RLS Policies:**
```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

### **3. Test Destinations:**
```sql
SELECT name, country, rating FROM public.destinations ORDER BY rating DESC;
```

### **4. Create Test User** (via your app):
- Sign up on your site
- Check if user appears in `public.users`
- Check if profile created in `public.user_profiles`

---

## 🎯 **Quick Action Plan**

### **NOW (10 minutes):**

1. **Open SQL Editor:** https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/sql/new

2. **Copy the "Quick Setup Script" above** (from "MAYA TRAVEL AGENT - COMPLETE DATABASE SETUP")

3. **Paste and Run**

4. **Verify:** Should see "Setup complete!" with counts

5. **Go to Table Editor:** https://supabase.com/dashboard/project/komahmavsulpkawmhqhk/editor
   - Browse tables
   - Check data

6. **Configure Auth URLs** (from Phase 2 above)

7. **Test on your site:**
   - Sign up new user
   - Create a trip
   - Add expenses
   - Chat with AI

---

## ✅ **Expected Results**

After completing setup:

| Item | Expected | How to Verify |
|------|----------|---------------|
| **Tables** | 10 tables | Table Editor |
| **RLS Policies** | 19+ policies | SQL query |
| **Destinations** | 6 destinations | Query or browse |
| **Indexes** | 11 indexes | Performance tab |
| **Triggers** | 1 trigger (new users) | Functions tab |
| **Functions** | 1 function | Functions tab |

---

## 📞 **Need Help?**

### **If SQL fails:**
- Check error message carefully
- Run migrations one at a time
- Drop and recreate tables if needed
- Contact Supabase support

### **If RLS doesn't work:**
- Verify policies are created
- Check auth.uid() returns value
- Test with authenticated user
- Review Supabase logs

---

## 🎊 **After Database Setup**

Once complete, your app will have:
- ✅ User authentication and profiles
- ✅ Trip planning and management
- ✅ Expense tracking
- ✅ AI conversation history
- ✅ Subscription management
- ✅ Payment records
- ✅ Analytics tracking
- ✅ Sample destinations
- ✅ Optimized performance
- ✅ Secure RLS policies

---

**🚀 Start with the "Quick Setup Script" - it does everything in one go!**

