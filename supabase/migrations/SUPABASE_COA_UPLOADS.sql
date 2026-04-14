-- ─────────────────────────────────────────────────────────────────
-- COA Uploads table
-- Tracks every COA document a vendor uploads for verification.
-- Files are stored in Supabase Storage bucket: coa-documents
-- ─────────────────────────────────────────────────────────────────

create table if not exists coa_uploads (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profiles(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  peptide_name  text not null,
  batch_id      text not null,
  storage_path  text not null,         -- e.g. user-id/timestamp-filename.pdf
  file_name     text not null,
  file_size     bigint,                -- bytes
  status        text not null default 'pending'
                  check (status in ('pending', 'verified', 'rejected')),
  purity        text,                  -- e.g. "99.4%" — extracted on verification
  rejection_reason text,
  uploaded_at   timestamptz not null default now(),
  verified_at   timestamptz,
  updated_at    timestamptz not null default now()
);

-- Index for dashboard COA queries
create index if not exists coa_uploads_profile_idx  on coa_uploads(profile_id, uploaded_at desc);
create index if not exists coa_uploads_status_idx   on coa_uploads(status);

-- Auto-update updated_at
create or replace function update_coa_uploads_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_coa_uploads_updated_at on coa_uploads;
create trigger trg_coa_uploads_updated_at
  before update on coa_uploads
  for each row execute function update_coa_uploads_updated_at();

-- RLS
alter table coa_uploads enable row level security;

-- Vendors can read/insert their own COAs
create policy "Vendors can view own COAs"
  on coa_uploads for select
  using (user_id = auth.uid());

create policy "Vendors can insert own COAs"
  on coa_uploads for insert
  with check (user_id = auth.uid());

-- Admins can do everything (bypassed via service role key)

-- ─────────────────────────────────────────────────────────────────
-- nomination_votes table
-- Persists Most-Wanted page votes per nomination per user/IP.
-- ─────────────────────────────────────────────────────────────────

create table if not exists nomination_votes (
  id              uuid primary key default gen_random_uuid(),
  nomination_id   text not null,       -- matches nom.id from nominations table
  user_id         uuid references auth.users(id) on delete set null,
  ip_fingerprint  text,                -- hashed IP for anonymous deduplication
  created_at      timestamptz not null default now(),
  -- One vote per user per nomination
  unique (nomination_id, user_id)
);

create index if not exists nomination_votes_nom_idx on nomination_votes(nomination_id);

alter table nomination_votes enable row level security;

create policy "Anyone can vote"
  on nomination_votes for insert
  with check (true);

create policy "Anyone can read vote counts"
  on nomination_votes for select
  using (true);

-- ─────────────────────────────────────────────────────────────────
-- vendor_page_views table
-- Tracks daily view counts per vendor for the dashboard analytics.
-- ─────────────────────────────────────────────────────────────────

create table if not exists vendor_page_views (
  id          uuid primary key default gen_random_uuid(),
  vendor_slug text not null,
  view_date   date not null default current_date,
  view_count  int not null default 1,
  unique (vendor_slug, view_date)
);

create index if not exists vendor_page_views_slug_idx on vendor_page_views(vendor_slug, view_date desc);

alter table vendor_page_views enable row level security;

-- Public can insert (page views are public events)
create policy "Anyone can record page views"
  on vendor_page_views for insert
  with check (true);

-- Vendors can read their own (matched by slug in profiles)
create policy "Public can read page view counts"
  on vendor_page_views for select
  using (true);
