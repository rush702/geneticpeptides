-- ============================================================
-- PepAssure — Supabase Schema
-- Apply this in your Supabase SQL Editor (supabase.com → SQL)
-- ============================================================

-- 1. Profiles table (vendor claims + account info)
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  vendor_name   text not null,
  website       text not null,
  contact_email text,
  message       text,
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  tier          text not null default 'free'
                check (tier in ('free', 'pro', 'enterprise')),
  is_admin      boolean not null default false,
  pvs_score     numeric,
  rank          integer,
  claimed_at    timestamptz default now(),
  verified_at   timestamptz,
  upgraded_at   timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- One claim per user
  constraint profiles_user_id_unique unique (user_id)
);

-- Index for common queries
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_tier on public.profiles(tier);

-- 2. Enable Row-Level Security
alter table public.profiles enable row level security;

-- 3. RLS Policies

-- Anyone can read approved (verified) vendor profiles
create policy "Public can view verified profiles"
  on public.profiles for select
  using (status = 'approved');

-- Authenticated users can read their own profile (any status)
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

-- Authenticated users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can do everything
create policy "Admins have full access"
  on public.profiles for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.is_admin = true
    )
  );

-- 4. Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_update
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- NOTES:
--
-- After applying this schema:
-- 1. Copy .env.local.example to .env.local
-- 2. Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
--    from your Supabase project settings → API
-- 3. Fill in SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role)
-- 4. To make a user admin: UPDATE profiles SET is_admin = true WHERE user_id = '<uuid>';
--
-- Stripe webhook setup:
-- 1. In Stripe Dashboard → Developers → Webhooks, add endpoint:
--    https://yourdomain.com/api/stripe/webhook
-- 2. Listen for: checkout.session.completed
-- 3. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET in .env.local
-- ============================================================
