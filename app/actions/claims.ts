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

  // Check for existing profile — allow resubmission if rejected
  const { data: existing } = await client
    .from("profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "rejected") {
      // Allow resubmission: update the existing rejected profile
      const { error } = await client
        .from("profiles")
        .update({
          vendor_name: vendorName,
          website_url: website,
          contact_email: contactEmail || user.email,
          message,
          status: "pending",
        })
        .eq("id", existing.id);

      if (error) {
        return { error: "Failed to resubmit claim. Please try again." };
      }
      return { success: true, resubmission: true };
    }

    if (existing.status === "pending") {
      return { error: "Your claim is already pending review. We'll notify you within 24-48 hours." };
    }

    return { error: "You already have an active vendor listing. Visit your dashboard to manage it." };
  }

  const { error } = await client.from("profiles").insert({
    id: user.id,
    user_id: user.id,
    vendor_name: vendorName,
    website_url: website,
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
