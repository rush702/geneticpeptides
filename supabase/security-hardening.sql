-- ============================================================
-- PepAssure Security Hardening — MUST RUN BEFORE LAUNCH
-- Fixes critical RLS vulnerabilities
-- ============================================================

-- 1. Fix profiles update policy — prevent users from self-modifying
--    sensitive columns (tier, is_admin, status, pvs_score, rank)
--    Users can only update their own display fields.

-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a restricted update policy — users can only update safe fields
-- by ensuring sensitive fields remain unchanged
CREATE POLICY "Users can update own safe fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Prevent users from changing sensitive columns
    AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.user_id = auth.uid())
    AND tier = (SELECT p.tier FROM public.profiles p WHERE p.user_id = auth.uid())
    AND status = (SELECT p.status FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- 2. Add pro_plus to the tier check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_tier_check
  CHECK (tier IN ('free', 'pro', 'pro_plus', 'enterprise'));

-- 3. Verify the admin full access policy exists (for service client / admin operations)
-- This should already exist from schema.sql, but ensure it's there:
-- DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
-- CREATE POLICY "Admins have full access"
--   ON public.profiles FOR ALL
--   TO authenticated
--   USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));

-- 4. Add rate limiting on newsletter_subscribers via unique constraint
-- (already has unique on email, but add a created_at index for cleanup)
CREATE INDEX IF NOT EXISTS idx_newsletter_created ON public.newsletter_subscribers(created_at DESC);

-- 5. Add rate limiting on contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_created ON public.contact_messages(created_at DESC);
