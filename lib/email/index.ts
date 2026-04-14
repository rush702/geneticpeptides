/**
 * lib/email/index.ts
 *
 * Typed email helpers wrapping Resend.
 * Set RESEND_API_KEY in Vercel env vars.
 * All functions degrade gracefully (console.warn) when the key is missing,
 * so the app won't crash in dev.
 *
 * Usage:
 *   await sendEmail(claimApprovedEmail({ vendorName, contactEmail, dashboardUrl }))
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const FROM = "PepAssure <hello@pepassure.com>";

// ─── Low-level send ──────────────────────────────────────────────
export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.warn("[Email] RESEND_API_KEY not set — skipping:", payload.subject, "→", payload.to);
    return { ok: true }; // silent no-op in dev
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Email] Resend error:", res.status, body);
      return { ok: false, error: body };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[Email] sendEmail failed:", err);
    return { ok: false, error: err.message };
  }
}

// ─── Email templates ─────────────────────────────────────────────

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0f0d;font-family:Inter,sans-serif;color:#e5e7eb;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
  <div style="margin-bottom:32px;">
    <span style="font-size:22px;font-weight:700;color:#10b981;">PepAssure</span>
  </div>
  ${content}
  <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#6b7280;">
    PepAssure &bull; hello@pepassure.com &bull; No paid placements, ever.
  </div>
</div>
</body>
</html>`;
}

// Admin: new claim submitted
export function newClaimAdminEmail(opts: {
  vendorName: string;
  websiteUrl: string;
  contactEmail: string;
  message: string | null;
  adminUrl: string;
}): EmailPayload {
  return {
    to: process.env.ADMIN_EMAIL || "hello@pepassure.com",
    subject: `New Claim: ${opts.vendorName}`,
    html: baseHtml(`
      <h2 style="color:#fff;font-size:20px;margin:0 0 16px;">New Vendor Claim</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#9ca3af;width:140px;">Vendor</td><td style="color:#fff;">${opts.vendorName}</td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af;">Website</td><td><a href="${opts.websiteUrl}" style="color:#10b981;">${opts.websiteUrl}</a></td></tr>
        <tr><td style="padding:8px 0;color:#9ca3af;">Contact</td><td style="color:#fff;">${opts.contactEmail}</td></tr>
        ${opts.message ? `<tr><td style="padding:8px 0;color:#9ca3af;vertical-align:top;">Message</td><td style="color:#d1d5db;">${opts.message}</td></tr>` : ""}
      </table>
      <a href="${opts.adminUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
        Review in Admin Dashboard
      </a>
    `),
  };
}

// Vendor: claim approved
export function claimApprovedEmail(opts: {
  vendorName: string;
  contactEmail: string;
  dashboardUrl: string;
}): EmailPayload {
  return {
    to: opts.contactEmail,
    subject: `Your listing is live — welcome to PepAssure`,
    html: baseHtml(`
      <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">You're live on PepAssure</h2>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Congratulations — <strong style="color:#fff;">${opts.vendorName}</strong> has been approved and your listing is now visible to researchers.
      </p>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;">
        Next step: upload your first COA to start boosting your PVS score. Vendors with verified COAs rank significantly higher in search results.
      </p>
      <a href="${opts.dashboardUrl}" style="display:inline-block;padding:12px 28px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
        Open Your Dashboard
      </a>
    `),
  };
}

// Vendor: claim rejected
export function claimRejectedEmail(opts: {
  vendorName: string;
  contactEmail: string;
  reason?: string;
  contactUrl: string;
}): EmailPayload {
  return {
    to: opts.contactEmail,
    subject: `Your PepAssure claim was not approved`,
    html: baseHtml(`
      <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">Claim Not Approved</h2>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 16px;">
        We were unable to approve the listing for <strong style="color:#fff;">${opts.vendorName}</strong>.
      </p>
      ${opts.reason ? `<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 20px;">Reason: ${opts.reason}</p>` : ""}
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;">
        If you believe this is an error, please reach out and we'll take another look.
      </p>
      <a href="${opts.contactUrl}" style="display:inline-block;padding:12px 28px;background:#374151;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
        Contact Support
      </a>
    `),
  };
}

// Vendor: subscription activated
export function subscriptionActivatedEmail(opts: {
  vendorName: string;
  contactEmail: string;
  plan: string;
  dashboardUrl: string;
}): EmailPayload {
  const planLabel = opts.plan.includes("enterprise") ? "Enterprise" : "Pro";
  return {
    to: opts.contactEmail,
    subject: `${planLabel} plan activated — your new features are ready`,
    html: baseHtml(`
      <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">Welcome to ${planLabel}</h2>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Your <strong style="color:#10b981;">${planLabel}</strong> subscription for <strong style="color:#fff;">${opts.vendorName}</strong> is now active.
      </p>
      ${planLabel === "Pro" ? `
      <ul style="color:#9ca3af;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
        <li>Competitor benchmarking dashboard</li>
        <li>Weekly score report emails (every Monday)</li>
        <li>Advanced Reddit sentiment analytics</li>
        <li>Monthly PDF reports</li>
        <li>Priority COA verification</li>
      </ul>` : `
      <ul style="color:#9ca3af;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
        <li>Everything in Pro, plus</li>
        <li>REST API access with webhooks</li>
        <li>White-label PDF reports</li>
        <li>SSO / SAML integration</li>
        <li>Dedicated account manager</li>
        <li>Real-time COA monitoring</li>
      </ul>`}
      <a href="${opts.dashboardUrl}" style="display:inline-block;padding:12px 28px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
        Go to Dashboard
      </a>
    `),
  };
}

// Vendor: payment failed
export function paymentFailedEmail(opts: {
  vendorName: string;
  contactEmail: string;
  billingUrl: string;
}): EmailPayload {
  return {
    to: opts.contactEmail,
    subject: `Action required: payment failed for ${opts.vendorName}`,
    html: baseHtml(`
      <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">Payment Failed</h2>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 20px;">
        We were unable to process your most recent payment for <strong style="color:#fff;">${opts.vendorName}</strong>.
        Please update your payment method to keep your subscription active.
      </p>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;">
        If payment is not updated within 3 days, your account will revert to the Free tier.
      </p>
      <a href="${opts.billingUrl}" style="display:inline-block;padding:12px 28px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
        Update Payment Method
      </a>
    `),
  };
}

// Vendor: weekly score report (Pro/Enterprise)
export function weeklyScoreReportEmail(opts: {
  vendorName: string;
  contactEmail: string;
  score: number;
  scoreDelta: number;
  rank: number;
  totalVendors: number;
  topAction: string;
  dashboardUrl: string;
}): EmailPayload {
  const delta = opts.scoreDelta;
  const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
  const deltaColor = delta >= 0 ? "#10b981" : "#ef4444";

  return {
    to: opts.contactEmail,
    subject: `Weekly PVS Report: ${opts.vendorName} — Score ${opts.score} (${deltaStr})`,
    html: baseHtml(`
      <h2 style="color:#fff;font-size:20px;margin:0 0 20px;">Your Weekly PVS Report</h2>
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
        <div style="font-size:56px;font-weight:700;color:#fff;line-height:1;">${opts.score}</div>
        <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin:4px 0 12px;">PVS Score</div>
        <div style="font-size:18px;font-weight:600;color:${deltaColor};">${deltaStr} pts this week</div>
      </div>
      <table style="width:100%;font-size:14px;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;color:#9ca3af;border-bottom:1px solid rgba(255,255,255,0.05);">Rank</td>
          <td style="padding:10px 0;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">#${opts.rank} of ${opts.totalVendors}</td>
        </tr>
      </table>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px;margin-bottom:24px;">
        <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Top Action This Week</div>
        <p style="color:#d1d5db;font-size:14px;margin:0;">${opts.topAction}</p>
      </div>
      <a href="${opts.dashboardUrl}" style="display:inline-block;padding:12px 28px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
        View Full Dashboard
      </a>
    `),
  };
}
