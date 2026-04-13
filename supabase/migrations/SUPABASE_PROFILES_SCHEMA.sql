-- ================================================================
-- PepAssure — Profiles Table + RLS
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- Safe to re-run (idempotent).
-- ================================================================

-- ── 1. PROFILES TABLE ────────────────────────────────────────────
-- Stores vendor profile info, tier, and Stripe metadata.
-- One row per authenticated user. Created on claim submission.

create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  vendor_name   text not null,
  website_url   text not null,
  contact_email text not null,
  message       text,
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  tier          text not null default 'free'
                check (tier in ('free', 'pro', 'enterprise')),
  stripe_customer_id   text,
  stripe_subscription_id text,
  pvs_score     integer default 0,
  rank          integer,
  verified      boolean default false,
  -- 5-pillar scores (0-100 each)
  pillar_purity       integer default 0,
  pillar_reputation   integer default 0,
  pillar_transparency integer default 0,
  pillar_service      integer default 0,
  pillar_value        integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Unique constraint: one profile per user
create unique index if not exists profiles_user_id_idx on public.profiles(user_id);

-- ── 2. RLS POLICIES ──────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can read their own profile
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (user_id = auth.uid());

-- Users can update their own profile (limited fields)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Authenticated users can insert their own profile
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (user_id = auth.uid());

-- Service role (server-side) can do everything (for Stripe webhooks)
-- This is implicit — service role bypasses RLS.

-- ── 3. UPDATED_AT TRIGGER ────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ================================================================
-- DONE. Profiles table ready for vendor claims + Stripe tiers.
-- ================================================================
