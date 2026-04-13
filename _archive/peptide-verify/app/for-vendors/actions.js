"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action: Submit a vendor claim
 *
 * Inserts a row into the `vendor_claims` table with status "pending".
 * Requires the user to be authenticated — returns an error otherwise.
 */
export async function submitVendorClaim(formData) {
  const supabase = await createClient();

  // 1. Verify the user is logged in
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { success: false, error: "You must be logged in to submit a claim." };
  }

  // 2. Validate required fields
  const vendorName = formData.get("vendorName")?.trim();
  const website = formData.get("website")?.trim();
  const contactEmail = formData.get("contactEmail")?.trim();
  const message = formData.get("message")?.trim() || null;

  if (!vendorName || !website || !contactEmail) {
    return { success: false, error: "Vendor name, website, and contact email are required." };
  }

  // 3. Insert into vendor_claims
  const { data, error: insertErr } = await supabase.from("vendor_claims").insert({
    user_id: user.id,
    vendor_name: vendorName,
    website_url: website,
    contact_email: contactEmail,
    message,
    status: "pending",
  }).select().single();

  if (insertErr) {
    console.error("Claim insert error:", insertErr);
    return { success: false, error: "Failed to submit claim. Please try again." };
  }

  return { success: true, claimId: data.id };
}
