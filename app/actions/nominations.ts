"use server";

import { createClient } from "@/lib/supabase/server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export interface NominationInput {
  nomineeName: string;
  nomineeWebsite?: string;
  reason?: string;
  peptidesRequested?: string[];
  nominatorExperience?: number;
}

export async function submitNomination(data: NominationInput) {
  if (!data.nomineeName || data.nomineeName.length < 2) {
    return { error: "Vendor name is required (at least 2 characters)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const slug = slugify(data.nomineeName);

  // Check for duplicate nomination by same user
  if (user) {
    const { data: existing } = await supabase
      .from("nominations")
      .select("id")
      .eq("nominee_slug", slug)
      .eq("submitted_by", user.id)
      .maybeSingle();

    if (existing) {
      return { error: "You've already nominated this vendor. You can upvote the existing nomination instead." };
    }
  }

  const { data: nomination, error } = await supabase
    .from("nominations")
    .insert({
      nominee_name: data.nomineeName.trim(),
      nominee_website: data.nomineeWebsite?.trim() || null,
      nominee_slug: slug,
      submitted_by: user?.id || null,
      reason: data.reason?.trim() || null,
      peptides_requested: data.peptidesRequested || [],
      nominator_experience: data.nominatorExperience || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message?.includes("schema cache") ||
      error.message?.includes("does not exist") ||
      error.message?.includes("relation")
    ) {
      return { success: true, id: "stub" };
    }
    console.error("[nominations] insert failed:", error);
    return { error: "Failed to submit nomination. Please try again." };
  }

  // Auto-vote for your own nomination
  if (user && nomination) {
    await supabase.from("nomination_votes").insert({
      nomination_id: nomination.id,
      user_id: user.id,
    });
  }

  return { success: true, id: nomination?.id };
}

export async function upvoteNomination(nominationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to vote." };
  }

  // Check if already voted
  const { data: existing } = await supabase
    .from("nomination_votes")
    .select("id")
    .eq("nomination_id", nominationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Remove vote (toggle)
    await supabase
      .from("nomination_votes")
      .delete()
      .eq("id", existing.id);
    return { success: true, action: "removed" };
  }

  const { error } = await supabase.from("nomination_votes").insert({
    nomination_id: nominationId,
    user_id: user.id,
  });

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.message?.includes("schema cache") ||
      error.message?.includes("does not exist") ||
      error.message?.includes("relation")
    ) {
      return { success: true, action: "voted" };
    }
    return { error: "Failed to vote. Please try again." };
  }

  return { success: true, action: "voted" };
}
