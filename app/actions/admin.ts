"use server";

import { createClient } from "@/lib/supabase/server";

export async function approveClaim(profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved", verified_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectClaim(profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejected" })
    .eq("id", profileId);

  if (error) return { error: error.message };
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
