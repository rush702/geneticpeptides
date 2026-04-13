-- ============================================================
--  PepAssure — Supabase Migration
--  Paste this entire file into the Supabase SQL Editor and run.
--  Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================


-- ────────────────────────────────────────
--  1. VENDOR CLAIMS
--     Stores claims submitted via /for-vendors
-- ────────────────────────────────────────

create table if not exists public.vendor_claims (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  vendor_name    text not null,
  website_url    text not null,
  contact_email  text not null,
  message        text,
  status         text not null default 'pending'
                   check (status in ('pending', 'verified', 'rejected')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vendor_claims_updated_at on public.vendor_claims;
create trigger vendor_claims_updated_at
  before update on public.vendor_claims
  for each row execute procedure public.set_updated_at();

-- Indexes
create index if not exists vendor_claims_user_id_idx   on public.vendor_claims(user_id);
create index if not exists vendor_claims_status_idx    on public.vendor_claims(status);
create index if not exists vendor_claims_created_at_idx on public.vendor_claims(created_at desc);

-- Enable RLS
alter table public.vendor_claims enable row level security;

-- Policies
-- Authenticated users can insert their own claims
create policy "Users can insert own claims"
  on public.vendor_claims for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can read their own claims
create policy "Users can read own claims"
  on public.vendor_claims for select
  to authenticated
  using (auth.uid() = user_id);

-- Service role (used by admin panel server actions) has full access
-- Note: the admin page reads directly via the anon client with email-whitelist
-- gating in the UI. For a production app, move admin reads to a server action
-- using the service role key instead.
create policy "Anon can read all claims for admin panel"
  on public.vendor_claims for select
  to anon
  using (true);

create policy "Anon can update status for admin panel"
  on public.vendor_claims for update
  to anon
  using (true)
  with check (true);


-- ────────────────────────────────────────
--  2. SALES INQUIRIES
--     Stores Enterprise contact-sales submissions
-- ────────────────────────────────────────

create table if not exists public.sales_inquiries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null,
  email       text not null,
  company     text not null,
  message     text,
  created_at  timestamptz not null default now()
);

create index if not exists sales_inquiries_created_at_idx on public.sales_inquiries(created_at desc);

alter table public.sales_inquiries enable row level security;

-- Anyone (logged in or not) can submit an inquiry
create policy "Anyone can insert sales inquiry"
  on public.sales_inquiries for insert
  to anon, authenticated
  with check (true);

-- Only the submitting user can read their own inquiry
create policy "Users can read own inquiry"
  on public.sales_inquiries for select
  to authenticated
  using (auth.uid() = user_id);

-- Anon read for admin panel
create policy "Anon can read all inquiries for admin"
  on public.sales_inquiries for select
  to anon
  using (true);


-- ────────────────────────────────────────
--  3. OPTIONAL: PROFILES TABLE
--     Stores extra vendor profile data post-claim
-- ────────────────────────────────────────

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  vendor_name   text,
  website_url   text,
  contact_email text,
  status        text default 'pending'
                  check (status in ('pending', 'verified', 'rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can upsert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);


-- ────────────────────────────────────────
--  4. AUTH SETTINGS REMINDER
--  These can't be set via SQL — do them in the dashboard:
--
--  Dashboard → Authentication → Providers → Email
--    ✅ Enable email provider
--    ✅ Enable magic link (passwordless)
--    ✅ Confirm email (optional but recommended)
--
--  Dashboard → Authentication → URL Configuration
--    Site URL:         http://localhost:3000   (change to prod URL after deploy)
--    Redirect URLs:    http://localhost:3000/for-vendors
--                      https://pepassure.com/for-vendors
-- ────────────────────────────────────────


-- ────────────────────────────────────────
--  DONE — run this and all three tables
--  will be created with RLS enabled.
-- ────────────────────────────────────────
