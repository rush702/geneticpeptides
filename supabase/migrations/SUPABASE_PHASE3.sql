-- ================================================================
-- PepAssure — Phase 3 Migration: Vendor self-service
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (idempotent).
-- ================================================================

-- ── 1. VENDORS CAN SEE THEIR OWN CLAIM REQUESTS ─────────────────
-- Match by email: the authenticated user's email must equal
-- the contact_email on the claim_request row.

drop policy if exists "Vendors can read own claim requests by email" on public.claim_requests;
create policy "Vendors can read own claim requests by email"
  on public.claim_requests for select
  to authenticated
  using (
    lower(contact_email) = lower(auth.jwt() ->> 'email')
  );

-- ── 2. APPROVE_CLAIM RPC ─────────────────────────────────────────
-- Called by admin when approving a claim. Updates status AND
-- creates a vendor_claims row if the claimant has an account.
-- Runs as SECURITY DEFINER so it can read auth.users to find
-- the vendor's user_id.

create or replace function public.approve_claim(claim_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _claim record;
  _vendor_user_id uuid;
  _vc_id uuid;
begin
  -- Must be admin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Not authorized');
  end if;

  -- Fetch claim
  select * into _claim from public.claim_requests where id = claim_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Claim not found');
  end if;

  -- Update status
  update public.claim_requests
    set status = 'approved', updated_at = now()
    where id = claim_id;

  -- Look up vendor by email
  select id into _vendor_user_id
    from auth.users
    where lower(email) = lower(_claim.contact_email)
    limit 1;

  -- If vendor has an account, create/upsert vendor_claims
  if _vendor_user_id is not null then
    insert into public.vendor_claims (user_id, vendor_name, website_url, contact_email, message, status)
    values (_vendor_user_id, _claim.vendor_name, _claim.website_url, _claim.contact_email, _claim.message, 'verified')
    on conflict do nothing
    returning id into _vc_id;

    return jsonb_build_object('ok', true, 'vendor_claim_id', _vc_id, 'linked_user', true);
  end if;

  -- No account yet — claim is approved but vendor_claims deferred
  return jsonb_build_object('ok', true, 'linked_user', false);
end;
$$;

grant execute on function public.approve_claim(uuid) to authenticated;

-- ── 3. COA STORAGE BUCKET ────────────────────────────────────────
-- Vendors upload COA PDFs/images. Private bucket, RLS-gated.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-coas',
  'vendor-coas',
  false,
  10485760,  -- 10 MB
  array['application/pdf','image/png','image/jpeg','image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: vendors can upload to their own folder (user_id/*)
-- and admins can read everything.

drop policy if exists "Vendors upload own COAs" on storage.objects;
create policy "Vendors upload own COAs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vendor-coas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Vendors read own COAs" on storage.objects;
create policy "Vendors read own COAs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'vendor-coas'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

drop policy if exists "Admins read all COAs" on storage.objects;
create policy "Admins read all COAs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'vendor-coas'
    and public.is_admin()
  );

drop policy if exists "Vendors delete own COAs" on storage.objects;
create policy "Vendors delete own COAs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vendor-coas'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ================================================================
-- DONE. Run the deploy script next.

-- ================================================================

