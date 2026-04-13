-- ============================================================
-- PepAssure Vendor Alerts Schema
-- Supports shutdown notices, FDA warnings, fraud alerts, etc.
-- Apply AFTER the base schema (schema.sql)
-- ============================================================

create table if not exists public.vendor_alerts (
  id              uuid primary key default gen_random_uuid(),
  vendor_name     text not null,
  vendor_slug     text,
  alert_type      text not null check (alert_type in (
    'shutdown', 'fda_warning', 'fraud_alert', 'quality_issue',
    'domain_change', 'acquisition', 'general'
  )),
  severity        text not null default 'warning' check (severity in ('critical', 'warning', 'info')),
  headline        text not null,
  summary         text not null,
  banner_text     text,
  alternatives    text[] default '{}',
  link            text,
  link_text       text default 'View full alert',
  is_active       boolean not null default true,
  published_at    timestamptz default now(),
  expires_at      timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_alerts_active on public.vendor_alerts(is_active, published_at desc);
create index if not exists idx_alerts_type on public.vendor_alerts(alert_type);
create index if not exists idx_alerts_vendor on public.vendor_alerts(vendor_slug);

alter table public.vendor_alerts enable row level security;

-- Anyone can read active alerts
create policy "Public can view active alerts"
  on public.vendor_alerts for select
  using (is_active = true and (expires_at is null or expires_at > now()));

-- Admins can do everything
create policy "Admins manage alerts"
  on public.vendor_alerts for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- Trigger for updated_at
create trigger vendor_alerts_updated_at
  before update on public.vendor_alerts
  for each row execute function handle_updated_at();
