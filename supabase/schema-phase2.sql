-- ============================================================
-- PepAssure Phase 2 Schema — Scrapers, Scoring, Nominations
-- Apply AFTER the base schema (schema.sql)
-- ============================================================

-- 1. Reddit mentions (scraped every 6 hours)
create table if not exists public.reddit_mentions (
  id              uuid primary key default gen_random_uuid(),
  vendor_slug     text not null,
  subreddit       text not null,
  post_id         text not null unique,
  post_title      text,
  post_body       text,
  author          text,
  author_karma    integer,
  author_age_days integer,
  upvotes         integer default 0,
  comment_count   integer default 0,
  sentiment       text check (sentiment in ('positive','neutral','negative')),
  sentiment_score numeric,
  topics          text[],
  is_shill        boolean default false,
  permalink       text,
  posted_at       timestamptz,
  scraped_at      timestamptz default now()
);

create index if not exists idx_reddit_vendor on public.reddit_mentions(vendor_slug);
create index if not exists idx_reddit_subreddit on public.reddit_mentions(subreddit);
create index if not exists idx_reddit_sentiment on public.reddit_mentions(sentiment);
create index if not exists idx_reddit_posted on public.reddit_mentions(posted_at desc);

alter table public.reddit_mentions enable row level security;
create policy "Public can view reddit mentions" on public.reddit_mentions for select using (true);
create policy "Admins manage reddit mentions" on public.reddit_mentions for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- 2. Finnrick test results
create table if not exists public.finnrick_results (
  id                    uuid primary key default gen_random_uuid(),
  vendor_slug           text not null,
  finnrick_vendor_slug  text,
  peptide_slug          text not null,
  finnrick_peptide_slug text,
  grade                 text check (grade in ('A','B','C','D','E')),
  grade_label           text,
  rank_in_peptide       integer,
  badges                text[],
  source_url            text not null,
  last_verified_at      timestamptz,
  scraped_at            timestamptz default now(),
  constraint finnrick_unique unique (vendor_slug, peptide_slug)
);

create index if not exists idx_finnrick_vendor on public.finnrick_results(vendor_slug);
create index if not exists idx_finnrick_peptide on public.finnrick_results(peptide_slug);
create index if not exists idx_finnrick_grade on public.finnrick_results(grade);

alter table public.finnrick_results enable row level security;
create policy "Public can view finnrick results" on public.finnrick_results for select using (true);
create policy "Admins manage finnrick results" on public.finnrick_results for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- 3. Vendor score history (for consistency + trends)
create table if not exists public.vendor_score_history (
  id            uuid primary key default gen_random_uuid(),
  vendor_slug   text not null,
  pvs_score     numeric not null,
  pillar_scores jsonb not null,
  computed_at   timestamptz default now()
);

create index if not exists idx_score_history_vendor on public.vendor_score_history(vendor_slug, computed_at desc);

alter table public.vendor_score_history enable row level security;
create policy "Public can view score history" on public.vendor_score_history for select using (true);
create policy "Admins manage score history" on public.vendor_score_history for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- 4. Vendor risk flags
create table if not exists public.vendor_risk_flags (
  id            uuid primary key default gen_random_uuid(),
  vendor_slug   text not null,
  flag_type     text not null check (flag_type in (
    'fda_warning','fraud_warning','customs_seizure','complaint_velocity',
    'lawsuit','new_domain','expired_ssl','finnrick_d_grade','finnrick_e_grade','other'
  )),
  penalty       integer not null,
  source_url    text,
  description   text,
  detected_at   timestamptz default now(),
  expires_at    timestamptz,
  resolved_at   timestamptz
);

create index if not exists idx_risk_vendor on public.vendor_risk_flags(vendor_slug);
create index if not exists idx_risk_type on public.vendor_risk_flags(flag_type);

alter table public.vendor_risk_flags enable row level security;
create policy "Public can view risk flags" on public.vendor_risk_flags for select using (true);
create policy "Admins manage risk flags" on public.vendor_risk_flags for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- 5. Vendor events (for event risk detection + alerts)
create table if not exists public.vendor_events (
  id            uuid primary key default gen_random_uuid(),
  vendor_slug   text not null,
  event_type    text not null check (event_type in (
    'score_drop','score_rise','new_finnrick_grade','new_fraud_warning',
    'new_mention_spike','risk_flag_added','risk_flag_resolved'
  )),
  prev_value    jsonb,
  new_value     jsonb,
  delta         numeric,
  detected_at   timestamptz default now()
);

create index if not exists idx_events_vendor on public.vendor_events(vendor_slug, detected_at desc);

alter table public.vendor_events enable row level security;
create policy "Public can view events" on public.vendor_events for select using (true);
create policy "Admins manage events" on public.vendor_events for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- 6. Nominations (community-requested vendors)
create table if not exists public.nominations (
  id                    uuid primary key default gen_random_uuid(),
  nominee_name          text not null,
  nominee_website       text,
  nominee_slug          text not null,
  submitted_by          uuid references auth.users(id) on delete set null,
  reason                text,
  peptides_requested    text[],
  nominator_experience  integer check (nominator_experience between 1 and 5),
  status                text not null default 'pending' check (
    status in ('pending','under_review','queued_for_testing','verified','rejected','duplicate','claimed_by_vendor')
  ),
  verification_url      text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_nominations_status on public.nominations(status);
create index if not exists idx_nominations_slug on public.nominations(nominee_slug);
create index if not exists idx_nominations_created on public.nominations(created_at desc);

alter table public.nominations enable row level security;
create policy "Public can view active nominations" on public.nominations for select using (status != 'rejected');
create policy "Anyone can nominate" on public.nominations for insert to anon, authenticated with check (true);
create policy "Users update own pending" on public.nominations for update to authenticated
  using (auth.uid() = submitted_by and status = 'pending');
create policy "Admins manage nominations" on public.nominations for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- 7. Nomination votes
create table if not exists public.nomination_votes (
  id              uuid primary key default gen_random_uuid(),
  nomination_id   uuid not null references public.nominations(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete cascade,
  visitor_hash    text,
  voted_at        timestamptz default now(),
  constraint unique_vote_per_user unique (nomination_id, user_id)
);

create index if not exists idx_votes_nomination on public.nomination_votes(nomination_id);

alter table public.nomination_votes enable row level security;
create policy "Public can view vote counts" on public.nomination_votes for select using (true);
create policy "Authenticated can vote" on public.nomination_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users remove own votes" on public.nomination_votes for delete to authenticated using (auth.uid() = user_id);
create policy "Admins manage votes" on public.nomination_votes for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- 8. Batch archive (append-only provenance data)
create table if not exists public.batch_archive (
  id              uuid primary key default gen_random_uuid(),
  batch_id        text not null,
  vendor_slug     text not null,
  peptide_name    text not null,
  source          text not null check (source in ('vendor_upload','finnrick','scraper','manual')),
  purity          text,
  grade           text,
  method          text,
  raw_data        jsonb,
  verified        boolean default false,
  archived_at     timestamptz default now()
);

create index if not exists idx_batch_vendor on public.batch_archive(vendor_slug);
create index if not exists idx_batch_id on public.batch_archive(batch_id);
create index if not exists idx_batch_peptide on public.batch_archive(peptide_name);

alter table public.batch_archive enable row level security;
create policy "Public can view verified batches" on public.batch_archive for select using (verified = true);
create policy "Admins manage batches" on public.batch_archive for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));
