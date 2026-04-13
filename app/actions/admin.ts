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
