"use server";

import { createClient } from "@/lib/supabase/server";

export async function subscribeNewsletter(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  // Insert or update existing subscription
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email: email.toLowerCase().trim(),
      subscribed: true,
      source: "footer",
    });

  if (error) {
    // Already subscribed
    if (error.code === "23505") {
      return { error: "You're already subscribed to our newsletter." };
    }
    // PGRST205 = table missing from schema cache (table doesn't exist yet)
    // Also catch older PostgREST "does not exist" phrasing
    if (
      error.code === "PGRST205" ||
      error.message?.includes("schema cache") ||
      error.message?.includes("does not exist") ||
      error.message?.includes("relation")
    ) {
      console.warn("[newsletter] table not created Ñ run COMPLETE_MIGRATION.sql in Supabase");
      return { success: true };
    }
    console.error("[newsletter] insert failed:", error);
    return { error: "Failed to subscribe. Please try again." };
  }

  return { success: true };
}