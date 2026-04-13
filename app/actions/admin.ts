"use server";

import { createClient } from "@/lib/supabase/server";

export async function approveClaim(profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "verified", verified: true })
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
    .update({ tier })
    .eq("id", profileId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleAdmin(profileId: string, isAdmin: boolean) {
  const supabase = await createClient();

  if (isAdmin) {
    // Add admin role
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: profileId, role: "admin" }, { onConflict: "user_id" });
    if (error) return { error: error.message };
  } else {
    // Remove admin role (set back to vendor)
    const { error } = await supabase
      .from("user_roles")
      .update({ role: "vendor" })
      .eq("user_id", profileId);
    if (error) return { error: error.message };
  }
  return { success: true };
}

export async function approveReview(reviewId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ status: "approved" })
    .eq("id", reviewId);

  if (error) {
    if (error.message?.includes("does not exist")) return { success: true };
    return { error: error.message };
  }
  return { success: true };
}

export async function rejectReview(reviewId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ status: "rejected" })
    .eq("id", reviewId);

  if (error) {
    if (error.message?.includes("does not exist")) return { success: true };
    return { error: error.message };
  }
  return { success: true };
}

export async function updateNominationStatus(
  nominationId: string,
  status: "pending" | "under_review" | "queued_for_testing" | "verified" | "rejected"
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("nominations")
    .update({ status })
    .eq("id", nominationId);

  if (error) {
    if (error.message?.includes("does not exist")) return { success: true };
    return { error: error.message };
  }
  return { success: true };
}
