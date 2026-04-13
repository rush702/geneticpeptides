"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function submitClaim(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to submit a claim." };
  }

  const vendorName = formData.get("vendorName") as string;
  const website = formData.get("website") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const message = formData.get("message") as string;

  if (!vendorName || !website) {
    return { error: "Vendor name and website are required." };
  }

  // Use service client to bypass RLS recursion
  const service = createServiceClient();
  const client = service || supabase;

  // Check if user already has a profile
  const { data: existing } = await client
    .from("profiles")
    .select("id, vendor_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Update existing profile with new vendor claim info
    const { error } = await client
      .from("profiles")
      .update({
        vendor_name: vendorName,
        website,
        contact_email: contactEmail || user.email,
        message,
      })
      .eq("user_id", user.id);

    if (error) {
      return { error: "Failed to update claim. Please try again." };
    }

    return { success: true };
  }

  // Create new profile
  const { error } = await client.from("profiles").insert({
    user_id: user.id,
    vendor_name: vendorName,
    website,
    contact_email: contactEmail || user.email,
    message,
    status: "pending",
    tier: "free",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A claim for this vendor already exists." };
    }
    return { error: "Failed to submit claim. Please try again." };
  }

  return { success: true };
}
