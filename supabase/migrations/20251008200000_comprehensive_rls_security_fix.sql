-- Comprehensive RLS Security Fix Migration
-- Date: 2025-10-08
-- This migration addresses critical security vulnerabilities and inconsistencies

-- 1. TABLE STRUCTURE CONSOLIDATION
-- Consolidate user_profiles and profiles into a single authoritative users table
-- The schema.sql already defines the correct users table structure

-- Drop duplicate/conflicting tables if they exist
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Ensure users table has all necessary columns from both user_profiles and profiles
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_id TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS travel_style TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS budget_preference TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS accessibility_needs TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_languages TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trial_messages_used INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trial_messages_limit INTEGER DEFAULT 10;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY; -- Enable RLS for destinations too
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING INSECURE POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorite_destinations;
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorite_destinations;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorite_destinations;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorite_destinations;
DROP POLICY IF EXISTS "Users can view their own alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can create their own alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can update their own alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can delete their own alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON public.ai_conversations;

-- 4. CREATE SECURE RLS POLICIES WITH 'TO authenticated' CLAUSES

-- Users table policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Trips table policies
CREATE POLICY "trips_select_own" ON public.trips
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "trips_insert_own" ON public.trips
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "trips_update_own" ON public.trips
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "trips_delete_own" ON public.trips
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- Favorite destinations policies
CREATE POLICY "favorite_destinations_select_own" ON public.favorite_destinations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "favorite_destinations_insert_own" ON public.favorite_destinations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "favorite_destinations_update_own" ON public.favorite_destinations
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "favorite_destinations_delete_own" ON public.favorite_destinations
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- Price alerts policies
CREATE POLICY "price_alerts_select_own" ON public.price_alerts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "price_alerts_insert_own" ON public.price_alerts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "price_alerts_update_own" ON public.price_alerts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "price_alerts_delete_own" ON public.price_alerts
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- Expenses policies
CREATE POLICY "expenses_select_own" ON public.expenses
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "expenses_insert_own" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "expenses_update_own" ON public.expenses
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "expenses_delete_own" ON public.expenses
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- AI conversations policies
CREATE POLICY "ai_conversations_select_own" ON public.ai_conversations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "ai_conversations_insert_own" ON public.ai_conversations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Destinations table - public read access for all authenticated users
CREATE POLICY "destinations_public_read" ON public.destinations
  FOR SELECT TO authenticated
  USING (true);

-- 5. CREATE CONSOLIDATED TABLES FROM OLD STRUCTURE

-- Create consolidated conversations table (replaces multiple conversation tables)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram', 'web')),
  messages JSONB DEFAULT '[]'::jsonb,
  detected_preferences JSONB,
  trip_intent TEXT,
  sentiment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consolidated trips table (replaces ai_generated_trips)
CREATE TABLE IF NOT EXISTS public.user_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  travelers_count INTEGER DEFAULT 1,
  itinerary JSONB,
  preferences JSONB,
  booking_status TEXT DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Make payment immutable after creation (no updated_at)
  UNIQUE(user_id, stripe_payment_intent_id)
);

-- Enable RLS on new tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 6. CREATE POLICIES FOR NEW TABLES

-- Conversations policies
CREATE POLICY "conversations_select_own" ON public.conversations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "conversations_insert_own" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "conversations_update_own" ON public.conversations
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- User trips policies
CREATE POLICY "user_trips_select_own" ON public.user_trips
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_trips_insert_own" ON public.user_trips
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_trips_update_own" ON public.user_trips
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_trips_delete_own" ON public.user_trips
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- Payment transactions policies (read-only for users, immutable)
CREATE POLICY "payment_transactions_select_own" ON public.payment_transactions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Service role can manage payments (for webhooks)
CREATE POLICY "payment_transactions_service_all" ON public.payment_transactions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. CREATE HELPER FUNCTIONS

-- Helper function to get current user ID (cached)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT (select auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function for user profile access patterns
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  telegram_id TEXT,
  whatsapp_phone TEXT,
  travel_style TEXT,
  budget_preference TEXT,
  subscription_status TEXT,
  subscription_tier TEXT,
  trial_messages_used INTEGER,
  trial_messages_limit INTEGER,
  last_active_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.avatar_url,
    u.telegram_id,
    u.whatsapp_phone,
    u.travel_style,
    u.budget_preference,
    u.subscription_status,
    u.subscription_tier,
    u.trial_messages_used,
    u.trial_messages_limit,
    u.last_active_at
  FROM public.users u
  WHERE u.id = COALESCE(user_id, (select auth.uid()));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8. CREATE INDEXES FOR PERFORMANCE

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_phone ON public.users(whatsapp_phone);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON public.conversations(channel);
CREATE INDEX IF NOT EXISTS idx_user_trips_user_id ON public.user_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trips_destination ON public.user_trips(destination);
CREATE INDEX IF NOT EXISTS idx_user_trips_booking_status ON public.user_trips(booking_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_intent ON public.payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

-- 9. UPDATE TRIGGERS FOR CONSOLIDATED TABLES

-- Updated trigger function with proper security
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Add triggers for new tables
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_trips_updated_at
  BEFORE UPDATE ON public.user_trips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. AUDIT LOGGING FOR PAYMENT CHANGES

-- Create audit log table for payment changes
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL, -- 'created', 'updated', 'status_changed'
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies (users can only see their own payment audit logs)
CREATE POLICY "payment_audit_log_select_own" ON public.payment_audit_log
  FOR SELECT TO authenticated
  USING (
    payment_transaction_id IN (
      SELECT id FROM public.payment_transactions 
      WHERE user_id = (select auth.uid())
    )
  );

-- Service role can manage audit logs
CREATE POLICY "payment_audit_log_service_all" ON public.payment_audit_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to log payment changes
CREATE OR REPLACE FUNCTION public.log_payment_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change
  INSERT INTO public.payment_audit_log (
    payment_transaction_id,
    changed_by,
    change_type,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    (select auth.uid()),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Create audit trigger for payment transactions
CREATE TRIGGER log_payment_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_payment_change();

-- 11. COMMENTS FOR DOCUMENTATION

COMMENT ON POLICY "users_select_own" ON public.users IS 
  'Users can only view their own profile data - secured with TO authenticated clause';

COMMENT ON POLICY "payment_transactions_select_own" ON public.payment_transactions IS 
  'Users can only view their own payment transactions - immutable after creation';

COMMENT ON POLICY "payment_transactions_service_all" ON public.payment_transactions IS 
  'Service role can manage all payment transactions for webhook processing';

COMMENT ON FUNCTION public.get_current_user_id() IS 
  'Returns cached current user ID for performance optimization in RLS policies';

COMMENT ON FUNCTION public.get_user_profile(UUID) IS 
  'Helper function to get user profile with all travel preferences and subscription data';
