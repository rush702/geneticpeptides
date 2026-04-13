-- ================================================================
-- PepAssure — Phase 4: Email notifications on claim status change
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run (idempotent).
--
-- REQUIRES: pg_net extension (enabled by default on Supabase)
-- REQUIRES: You must set the Resend API key as a database secret:
--   SELECT vault.create_secret('re_cL54rzvR_dQcndjxo37ePADUVXeyyCrWM', 'resend_api_key');
-- ================================================================

-- ── 0. Enable pg_net if not already ─────────────────────────────
create extension if not exists pg_net with schema extensions;

-- ── 1. Store the Resend API key in Supabase Vault ───────────────
-- (Run this once — if already exists, it will be a no-op)
-- We use a DO block to avoid duplicate key errors.
do $$
begin
  -- Check if secret already exists
  if not exists (select 1 from vault.secrets where name = 'resend_api_key') then
    perform vault.create_secret('re_cL54rzvR_dQcndjxo37ePADUVXeyyCrWM', 'resend_api_key');
  end if;
end $$;

-- ── 2. Function: send_claim_notification ────────────────────────
-- Called by admin after approving or rejecting a claim.
-- Sends an email to the vendor via Resend HTTP API using pg_net.
-- Runs as SECURITY DEFINER so it can read vault secrets.

create or replace function public.send_claim_notification(
  claim_id uuid,
  new_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _claim record;
  _api_key text;
  _subject text;
  _html text;
  _request_id bigint;
begin
  -- Must be admin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Not authorized');
  end if;

  -- Validate status
  if new_status not in ('approved', 'rejected') then
    return jsonb_build_object('ok', false, 'error', 'Invalid status for notification');
  end if;

  -- Fetch claim
  select * into _claim from public.claim_requests where id = claim_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Claim not found');
  end if;

  -- Get Resend API key from vault
  select decrypted_secret into _api_key
    from vault.decrypted_secrets
    where name = 'resend_api_key'
    limit 1;

  if _api_key is null then
    return jsonb_build_object('ok', false, 'error', 'Email API key not configured');
  end if;

  -- Build email content
  if new_status = 'approved' then
    _subject := 'Your PepAssure listing claim has been approved! 🎉';
    _html := format(
      '<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#00d4b8,#3b82f6);color:white;font-weight:900;font-size:1rem;line-height:48px;">PA</div>
        </div>
        <h1 style="font-size:1.4rem;font-weight:800;text-align:center;color:#0f172a;margin-bottom:16px;">Claim Approved!</h1>
        <p style="color:#475569;line-height:1.7;margin-bottom:16px;">Great news — your claim for <strong>%s</strong> has been approved by our team.</p>
        <p style="color:#475569;line-height:1.7;margin-bottom:24px;">You can now sign in to your vendor dashboard to manage your listing, upload Certificates of Analysis (COAs), and update your company information.</p>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="https://pepassure.com/login" style="display:inline-block;padding:14px 32px;background:#10b981;color:white;font-weight:700;border-radius:10px;text-decoration:none;font-size:.95rem;">Sign in to your dashboard →</a>
        </div>
        <p style="color:#94a3b8;font-size:.82rem;line-height:1.6;">If you don''t have an account yet, use the same email address (%s) to sign up and your listing will be linked automatically.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:.75rem;text-align:center;">PepAssure — AI-Powered Peptide Vendor Rankings</p>
      </div>',
      _claim.vendor_name,
      _claim.contact_email
    );
  else
    _subject := 'Update on your PepAssure listing claim';
    _html := format(
      '<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#00d4b8,#3b82f6);color:white;font-weight:900;font-size:1rem;line-height:48px;">PA</div>
        </div>
        <h1 style="font-size:1.4rem;font-weight:800;text-align:center;color:#0f172a;margin-bottom:16px;">Claim Update</h1>
        <p style="color:#475569;line-height:1.7;margin-bottom:16px;">Thank you for your interest in claiming the listing for <strong>%s</strong> on PepAssure.</p>
        <p style="color:#475569;line-height:1.7;margin-bottom:16px;">After reviewing your submission, we were unable to verify your ownership at this time. This may be because:</p>
        <ul style="color:#475569;line-height:1.9;margin-bottom:16px;padding-left:20px;">
          <li>The email domain doesn''t match the vendor''s website</li>
          <li>We couldn''t verify the company information provided</li>
          <li>Additional documentation may be needed</li>
        </ul>
        <p style="color:#475569;line-height:1.7;margin-bottom:24px;">If you believe this is an error, please reply to this email or contact us at <a href="mailto:vendors@pepassure.com" style="color:#1a56db;">vendors@pepassure.com</a> with additional verification documents.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#94a3b8;font-size:.75rem;text-align:center;">PepAssure — AI-Powered Peptide Vendor Rankings</p>
      </div>',
      _claim.vendor_name
    );
  end if;

  -- Send via Resend API using pg_net
  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || _api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'PepAssure <noreply@pepassure.com>',
      'to', array[_claim.contact_email],
      'subject', _subject,
      'html', _html
    )
  ) into _request_id;

  return jsonb_build_object('ok', true, 'request_id', _request_id, 'sent_to', _claim.contact_email);
end;
$$;

grant execute on function public.send_claim_notification(uuid, text) to authenticated;

-- ================================================================
-- DONE. After running this SQL:
-- 1. The admin panel will call send_claim_notification after approve/reject
-- 2. Emails are sent via Resend through pg_net (async, non-blocking)
-- ================================================================
