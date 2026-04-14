"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail, newClaimAdminEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pepassure.com";

// ────────────────────────────────────────────────────────────────
// Server Action: submitClaim
// Inserts into the `profiles` table with status = 'pending'
// Checkout/billing is handled by app/actions/stripe.ts
// ────────────────────────────────────────────────────────────────
interface ClaimPayload {
  vendorName: string;
  websiteUrl: string;
  contactEmail: string;
  message: string | null;
  userId: string | null;
}

export async function submitClaim(
  payload: ClaimPayload
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!payload.vendorName || !payload.websiteUrl || !payload.contactEmail) {
      return { ok: false, error: "Missing required fields." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contactEmail)) {
      return { ok: false, error: "Invalid email address." };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Authentication required." };
    }

    if (payload.userId && user.id !== payload.userId) {
      return { ok: false, error: "Authentication mismatch." };
    }

    // Check if user already has a profile
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return { ok: false, error: "You already have a vendor listing." };
    }

    const { error } = await supabase.from("profiles").insert({
      user_id: user.id,
      vendor_name: payload.vendorName,
      website_url: payload.websiteUrl,
      contact_email: payload.contactEmail,
      message: payload.message,
      status: "pending",
      tier: "free",
    });

    if (error) {
      console.error("[PepAssure] Profile insert error:", error);
      return { ok: false, error: error.message };
    }

    // Notify admin of new claim
    await sendEmail(newClaimAdminEmail({
      vendorName: payload.vendorName,
      websiteUrl: payload.websiteUrl,
      contactEmail: payload.contactEmail,
      message: payload.message,
      adminUrl: `${BASE_URL}/admin`,
    }));

    return { ok: true };
  } catch (err: any) {
    console.error("[PepAssure] submitClaim server error:", err);
    return { ok: false, error: "Internal server error." };
  }
}
