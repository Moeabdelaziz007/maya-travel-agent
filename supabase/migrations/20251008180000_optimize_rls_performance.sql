-- Optimize RLS Performance by caching auth.uid() calls
-- This migration fixes the performance warning by replacing auth.uid() with (select auth.uid())
-- Date: 2025-10-08

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own data" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
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
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can create own analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- Recreate optimized policies with (select auth.uid())

-- User Profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can view own data" ON public.user_profiles
  FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  WITH CHECK ((select auth.uid()) = id);

-- Trips policies
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own trips" ON public.trips
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own expenses" ON public.expenses
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- AI Conversations policies
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own conversations" ON public.ai_conversations
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- Analytics Events policies
CREATE POLICY "Users can view own analytics" ON public.analytics_events
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own analytics" ON public.analytics_events
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- Payments policies  
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- Add comment for documentation
COMMENT ON POLICY "Users can create their own trips" ON public.trips IS 
  'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation for each row';

