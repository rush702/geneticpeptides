-- ================================================================
-- PepAssure — Complete Supabase Setup
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ── 1. CLAIM REQUESTS (no login required — anon-safe) ────────────
-- Vendors fill the claim form without needing to create an account.
-- We verify ownership afterward via email domain check.

CREATE TABLE IF NOT EXISTS claim_requests (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name    TEXT NOT NULL,
  website_url    TEXT NOT NULL,
  contact_email  TEXT NOT NULL,
  company_name   TEXT,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  ip_address     TEXT,                          -- optional: store for spam detection
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_claim_requests_status     ON claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_claim_requests_email      ON claim_requests(contact_email);
CREATE INDEX IF NOT EXISTS idx_claim_requests_created_at ON claim_requests(created_at DESC);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_col()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS claim_requests_updated_at ON claim_requests;
CREATE TRIGGER claim_requests_updated_at
  BEFORE UPDATE ON claim_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_col();

-- RLS
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon visitors) can submit a claim
CREATE POLICY "Anon can insert claim requests"
  ON claim_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public cannot read back submissions (admin only via service role)
-- (No SELECT policy for anon = denied by default)


-- ── 2. SALES INQUIRIES (Enterprise contact form — anon-safe) ─────

CREATE TABLE IF NOT EXISTS sales_inquiries (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  company      TEXT NOT NULL,
  message      TEXT,
  plan         TEXT DEFAULT 'enterprise',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_inquiries_created ON sales_inquiries(created_at DESC);

ALTER TABLE sales_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can submit sales inquiries"
  ON sales_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- ── 3. VENDOR CLAIMS (authenticated vendors managing their listing)

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

CREATE INDEX IF NOT EXISTS idx_vendor_claims_user_id ON vendor_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_claims_status  ON vendor_claims(status);

DROP TRIGGER IF EXISTS vendor_claims_updated_at ON vendor_claims;
CREATE TRIGGER vendor_claims_updated_at
  BEFORE UPDATE ON vendor_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_col();

ALTER TABLE vendor_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert their own claims"
  ON vendor_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own claims"
  ON vendor_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- ── 4. VENDOR SCORES (for the ranking display) ───────────────────

CREATE TABLE IF NOT EXISTS vendor_scores (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name      TEXT NOT NULL,
  website_url      TEXT NOT NULL UNIQUE,
  pvs_score        NUMERIC(4,1),
  purity_score     NUMERIC(4,1),
  reputation_score NUMERIC(4,1),
  cs_score         NUMERIC(4,1),
  community_score  NUMERIC(4,1),
  price_score      NUMERIC(4,1),
  finnrick_tested  BOOLEAN DEFAULT false,
  claimed          BOOLEAN DEFAULT false,
  rank_position    INT,
  last_updated     TIMESTAMPTZ DEFAULT now(),
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE vendor_scores ENABLE ROW LEVEL SECURITY;

-- Public can read vendor scores (powers the rankings page)
CREATE POLICY "Public can read vendor scores"
  ON vendor_scores FOR SELECT
  TO anon, authenticated
  USING (true);


-- ── 5. SEED INITIAL VENDOR DATA ───────────────────────────────────

INSERT INTO vendor_scores (vendor_name, website_url, pvs_score, purity_score, reputation_score, cs_score, community_score, price_score, finnrick_tested, claimed, rank_position)
VALUES
  ('Ascension Peptides',        'ascensionpeptides.com',        95.5, 98, 95, 93, 96, 91, true,  false, 1),
  ('Limitless Life Nootropics', 'limitlesslifenootropics.com',  91.5, 94, 90, 92, 89, 93, true,  false, 2),
  ('Peptide Partners',          'peptidepartners.com',          90.5, 92, 91, 88, 90, 94, false, false, 3),
  ('Amino Asylum',              'aminoasylum.shop',             87.0, 88, 86, 85, 91, 87, false, false, 4),
  ('Sports Technology Labs',    'sportstechnologylabs.com',     85.5, 87, 84, 86, 85, 84, true,  false, 5)
ON CONFLICT (website_url) DO NOTHING;


-- ── 6. HELPFUL VIEWS ─────────────────────────────────────────────

-- Admin: pending claims queue
CREATE OR REPLACE VIEW pending_claims AS
  SELECT
    id,
    vendor_name,
    website_url,
    contact_email,
    company_name,
    message,
    status,
    created_at
  FROM claim_requests
  WHERE status = 'pending'
  ORDER BY created_at DESC;

-- ================================================================
-- DONE! Next steps:
--
-- 1. Copy your Supabase project URL + anon key from:
--    Dashboard → Settings → API
--
-- 2. Run "🚀 Deploy PepAssure.command" — it will prompt you for
--    those two values, inject them into the HTML, and deploy.
--
-- 3. In Supabase Dashboard → Authentication → Settings:
--    - Set Site URL: https://pepassure.com
--    - Add Redirect URLs: https://pepassure.com/for-vendors
-- ================================================================
