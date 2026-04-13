-- ================================================================
-- PepAssure — Supabase Schema for Next.js For-Vendors Page
-- The claim_requests and sales_inquiries tables should already
-- exist from the static HTML setup. This file documents the
-- schema and RLS policies the Next.js page depends on.
-- ================================================================

-- ── claim_requests (already exists) ─────────────────────────────
-- Used by: ClaimModal → submitClaim server action
CREATE TABLE IF NOT EXISTS public.claim_requests (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name   text NOT NULL,
  website_url   text NOT NULL,
  contact_email text NOT NULL,
  message       text,
  status        text DEFAULT 'pending' CHECK (status IN ('pending','reviewing','approved','rejected')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- RLS: Anonymous users can insert (public claim form)
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can insert claim requests" ON public.claim_requests;
CREATE POLICY "Anon can insert claim requests"
  ON public.claim_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS: Vendors can read their own claims (by email match)
DROP POLICY IF EXISTS "Vendors can read own claim requests by email" ON public.claim_requests;
CREATE POLICY "Vendors can read own claim requests by email"
  ON public.claim_requests FOR SELECT
  TO authenticated
  USING (
    lower(contact_email) = lower(auth.jwt() ->> 'email')
  );

-- RLS: Admins can do everything (via is_admin() function)
DROP POLICY IF EXISTS "Admins full access to claim_requests" ON public.claim_requests;
CREATE POLICY "Admins full access to claim_requests"
  ON public.claim_requests FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── sales_inquiries (already exists) ────────────────────────────
-- Used by: ContactModal (direct Supabase insert from client)
CREATE TABLE IF NOT EXISTS public.sales_inquiries (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  company    text,
  message    text,
  plan       text DEFAULT 'enterprise',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sales_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can insert sales inquiries" ON public.sales_inquiries;
CREATE POLICY "Anon can insert sales inquiries"
  ON public.sales_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can read all sales inquiries
DROP POLICY IF EXISTS "Admins read sales_inquiries" ON public.sales_inquiries;
CREATE POLICY "Admins read sales_inquiries"
  ON public.sales_inquiries FOR SELECT
  TO authenticated
  USING (public.is_admin());
