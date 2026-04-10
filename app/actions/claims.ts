"use server";

import { createClient } from "@/lib/supabase/server";

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

  const { error } = await supabase.from("profiles").insert({
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
