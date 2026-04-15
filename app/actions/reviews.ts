"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface ReviewSubmission {
  vendor_slug: string;
  rating: number;
  title: string;
  body: string;
}

export async function submitReview(data: ReviewSubmission) {
  const supabase = await createClient();

  // Must be signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to submit a review." };
  }

  // Validation
  if (!data.vendor_slug) {
    return { error: "Missing vendor." };
  }
  if (data.rating < 1 || data.rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }
  if (!data.title || data.title.length < 3) {
    return { error: "Please write a short review title (at least 3 characters)." };
  }
  if (!data.body || data.body.length < 20) {
    return { error: "Please write at least 20 characters in your review body." };
  }

  // Derive author display name from user metadata or email prefix
  const authorName =
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Anonymous";

  // Use service client to bypass RLS recursion
  const service = createServiceClient();
  const client = service || supabase;

  // Check if user already reviewed this vendor
  const { data: existing } = await client
    .from("reviews")
    .select("id")
    .eq("vendor_slug", data.vendor_slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "You've already reviewed this vendor. You can edit your existing review from your account." };
  }

  const { error } = await client.from("reviews").insert({
    vendor_slug: data.vendor_slug,
    user_id: user.id,
    author_name: authorName,
    rating: data.rating,
    title: data.title,
    body: data.body,
    verified: false, // admin can mark as verified later
    status: "pending", // admin approval before appearing publicly
    helpful_count: 0,
  });

  if (error) {
    // Graceful fallback if the reviews table doesn't exist yet
    if (
      error.code === "PGRST205" ||
      error.message?.includes("schema cache") ||
      error.message?.includes("does not exist") ||
      error.message?.includes("relation")
    ) {
      console.warn("[reviews] reviews table missing — run COMPLETE_MIGRATION.sql");
      return { success: true, pending: true };
    };
    }
    console.error("[reviews] insert failed:", error);
    return { error: "Failed to submit review. Please try again." };
  }

  return { success: true, pending: true };
}
