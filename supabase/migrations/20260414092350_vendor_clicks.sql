-- vendor_clicks: tracks every outbound click from /go/[slug]
create table if not exists vendor_clicks (
  id           uuid primary key default gen_random_uuid(),
  vendor_id    uuid references vendors(id) on delete cascade,
  slug         text not null,
  referrer     text,
  user_agent   text,
  clicked_at   timestamptz not null default now()
);
create index if not exists vendor_clicks_vendor_id_idx on vendor_clicks(vendor_id);
create index if not exists vendor_clicks_clicked_at_idx on vendor_clicks(clicked_at desc);
alter table vendor_clicks enable row level security;
create policy "service role only" on vendor_clicks using (false);
