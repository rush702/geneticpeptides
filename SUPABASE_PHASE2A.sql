-- ================================================================
-- PepAssure — Phase 2a Migration: Auth + Roles
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (idempotent).
-- ================================================================

-- ── 1. USER ROLES ────────────────────────────────────────────────
-- Tracks who is an admin vs. a regular vendor.
-- A user is created in auth.users on first magic-link sign-in;
-- this table is populated by the trigger below.

create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('admin','vendor')),
  created_at timestamptz default now()
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- ── 2. is_admin() HELPER ─────────────────────────────────────────
-- Used by RLS policies on claim_requests / vendor_claims.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ── 3. AUTO-PROMOTE FIRST ADMIN ON SIGN-UP ───────────────────────
-- When rush702@gmail.com first signs in via magic link, Supabase
-- creates a row in auth.users — this trigger gives that row admin role.
-- All other new users default to 'vendor'.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when lower(new.email) = 'rush702@gmail.com' then 'admin' else 'vendor' end
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: if rush702@gmail.com already exists in auth.users
-- (e.g. from earlier testing), promote them now.
insert into public.user_roles (user_id, role)
  select id, 'admin' from auth.users where lower(email) = 'rush702@gmail.com'
  on conflict (user_id) do update set role = 'admin';

-- ── 4. ADMIN-AWARE POLICIES ON claim_requests ────────────────────

drop policy if exists "Admins can read all claim requests" on public.claim_requests;
create policy "Admins can read all claim requests"
  on public.claim_requests for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update claim requests" on public.claim_requests;
create policy "Admins can update claim requests"
  on public.claim_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── 5. ADMIN-AWARE POLICIES ON vendor_claims ─────────────────────

drop policy if exists "Admins can read all vendor claims" on public.vendor_claims;
create policy "Admins can read all vendor claims"
  on public.vendor_claims for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert vendor claims" on public.vendor_claims;
create policy "Admins can insert vendor claims"
  on public.vendor_claims for insert
  to authenticated
  with check (public.is_admin() or auth.uid() = user_id);

drop policy if exists "Admins can update vendor claims" on public.vendor_claims;
create policy "Admins can update vendor claims"
  on public.vendor_claims for update
  to authenticated
  using (public.is_admin() or auth.uid() = user_id)
  with check (public.is_admin() or auth.uid() = user_id);

-- ================================================================
-- DONE.
--
-- Next manual step (one-time, in Supabase Dashboard):
--   Authentication → URL Configuration
--     Site URL:        https://pepassure.com
--     Redirect URLs:   https://pepassure.com/dashboard
--                      https://pepassure.com/admin
--                      https://pepassure.com/login
--                      http://localhost:8000/dashboard   (optional, dev)
--
-- Then run the deploy script and sign in with rush702@gmail.com.
-- ================================================================
