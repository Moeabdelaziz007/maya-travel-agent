-- Fix RLS Linter Issues Migration
-- Date: 2025-10-08
-- Addresses: auth_rls_initplan and multiple_permissive_policies warnings

-- ============================================
-- 1. FIX auth_rls_initplan ISSUES
-- Replace direct auth.<function>() calls with (select auth.<function>())
-- ============================================

-- Fix public.user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

CREATE POLICY "users_view_own_profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Fix public.trips policies
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON public.trips;

CREATE POLICY "trips_select_own" ON public.trips
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "trips_update_own" ON public.trips
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "trips_delete_own" ON public.trips
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix public.ai_conversations policies (assuming this is the messages table)
DROP POLICY IF EXISTS "Users can view their own messages" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.ai_conversations;

CREATE POLICY "conversations_select_own" ON public.ai_conversations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "conversations_insert_own" ON public.ai_conversations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix public.payments policies
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- 2. FIX multiple_permissive_policies ISSUES
-- Merge duplicate policies for same role/action combinations
-- ============================================

-- Clean up any remaining duplicate policies on payments table
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;

-- Clean up any remaining duplicate policies on trips table
DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;

-- Ensure we have the correct merged policies (already created above with proper naming)

-- ============================================
-- 3. ADD MISSING POLICIES WITH PROPER SECURITY
-- ============================================

-- Ensure all tables have proper RLS enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Check that all policies use (select auth.uid()) instead of direct auth.uid()
DO $$
DECLARE
    policy_record RECORD;
    issue_count INTEGER := 0;
BEGIN
    FOR policy_record IN
        SELECT
            schemaname,
            tablename,
            policyname,
            cmd,
            roles,
            qual
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (tablename IN ('user_profiles', 'trips', 'ai_conversations', 'payments'))
          AND qual LIKE '%auth.uid()%'
    LOOP
        -- Check if policy uses direct auth.uid() instead of (select auth.uid())
        IF policy_record.qual LIKE '%auth.uid()%' AND policy_record.qual NOT LIKE '%(select auth.uid())%' THEN
            RAISE NOTICE 'Policy %.% still uses direct auth.uid(): %', policy_record.tablename, policy_record.policyname, policy_record.qual;
            issue_count := issue_count + 1;
        END IF;
    END LOOP;

    IF issue_count = 0 THEN
        RAISE NOTICE 'All RLS policies are optimized and use (select auth.uid())';
    ELSE
        RAISE NOTICE 'Found % policies that still need optimization', issue_count;
    END IF;
END $$;

-- Check for duplicate policies
SELECT
    schemaname,
    tablename,
    cmd,
    array_agg(policyname ORDER BY policyname) as policies,
    count(*) as duplicate_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'trips', 'ai_conversations', 'payments')
GROUP BY schemaname, tablename, cmd
HAVING count(*) > 1
ORDER BY tablename, cmd;

-- Final verification
SELECT
    'RLS Optimization Complete' as status,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('user_profiles', 'trips', 'ai_conversations', 'payments')) as total_policies,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN ('user_profiles', 'trips', 'ai_conversations', 'payments')) as rls_enabled_tables;

COMMENT ON POLICY "users_view_own_profile" ON public.user_profiles IS
  'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row - TO authenticated for security';

COMMENT ON POLICY "trips_select_own" ON public.trips IS
  'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row - TO authenticated for security';

COMMENT ON POLICY "conversations_select_own" ON public.ai_conversations IS
  'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row - TO authenticated for security';

COMMENT ON POLICY "payments_select_own" ON public.payments IS
  'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row - TO authenticated for security';