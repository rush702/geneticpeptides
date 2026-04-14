"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail, newClaimAdminEmail, claimApprovedEmail, claimRejectedEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pepassure.com";

export async function approveClaim(profileId: string) {
  const supabase = await createClient();
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("vendor_name, contact_email")
    .eq("id", profileId)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved", verified_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { error: error.message };

  // Notify vendor
  if (!fetchError && profile?.contact_email) {
    await sendEmail(claimApprovedEmail({
      vendorName: profile.vendor_name,
      contactEmail: profile.contact_email,
      dashboardUrl: `${BASE_URL}/dashboard`,
    }));
  }

  return { success: true };
}

export async function rejectClaim(profileId: string, reason?: string) {
  const supabase = await createClient();
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("vendor_name, contact_email")
    .eq("id", profileId)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", profileId);

  if (error) return { error: error.message };

  // Notify vendor
  if (!fetchError && profile?.contact_email) {
    await sendEmail(claimRejectedEmail({
      vendorName: profile.vendor_name,
      contactEmail: profile.contact_email,
      reason,
      contactUrl: `${BASE_URL}/contact`,
    }));
  }

  return { success: true };
}

export async function updateVendorTier(profileId: string, tier: "free" | "pro" | "enterprise") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ tier, upgraded_at: tier !== "free" ? new Date().toISOString() : null })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleAdmin(profileId: string, isAdmin: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}
