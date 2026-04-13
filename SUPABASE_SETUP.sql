-- ============================================================
-- PeptideVerify — Supabase Database Setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. VENDOR CLAIMS TABLE
-- Stores claim requests submitted by authenticated users.
-- Status flow: pending → verified | rejected

CREATE TABLE IF NOT EXISTS vendor_claims (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_name   TEXT NOT NULL,
  website_url   TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_vendor_claims_user_id ON vendor_claims(user_id);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendor_claims_updated_at
  BEFORE UPDATE ON vendor_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: Users can INSERT their own claims and SELECT their own claims
ALTER TABLE vendor_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own claims"
  ON vendor_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own claims"
  ON vendor_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- 2. SALES INQUIRIES TABLE
-- Stores enterprise contact-sales form submissions.
-- Does NOT require auth (user_id is optional).

CREATE TABLE IF NOT EXISTS sales_inquiries (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  company    TEXT NOT NULL,
  message    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Allow anyone (authenticated or anon) to INSERT,
-- but only the user who submitted can SELECT their own rows.
ALTER TABLE sales_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a sales inquiry"
  ON sales_inquiries FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can view their own inquiries"
  ON sales_inquiries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- ENV VARS — Add these to your .env.local file:
--
--   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
--
-- Find these in: Supabase Dashboard > Settings > API
-- ============================================================

-- ============================================================
-- AUTH SETTINGS (configure in Dashboard > Authentication > Settings):
--
-- 1. Enable "Email" provider (enabled by default)
-- 2. Enable "Magic Link" under Email provider settings
-- 3. Set Site URL to: http://localhost:3000 (dev) or your prod URL
-- 4. Add Redirect URLs:
--      http://localhost:3000/for-vendors
--      https://yourdomain.com/for-vendors
-- 5. Optional: Disable "Confirm email" for faster dev testing
--    (re-enable for production!)
-- ============================================================

-- ============================================================
-- NPM PACKAGES — Install these in your Next.js project:
--
--   npm install @supabase/supabase-js @supabase/ssr
--
-- ============================================================
