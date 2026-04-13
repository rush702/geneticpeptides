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

  // Input length limits
  if (vendorName.length > 200) return { error: "Vendor name is too long." };
  if (website.length > 500) return { error: "Website URL is too long." };
  if (message && message.length > 5000) return { error: "Message is too long." };

  // Sanitize website URL — prevent javascript: XSS
  const cleanWebsite = website.trim();
  if (cleanWebsite && !/^https?:\/\//i.test(cleanWebsite)) {
    // Auto-prepend https:// for bare domains
    const sanitizedUrl = `https://${cleanWebsite.replace(/^[a-z]+:\/\//i, "")}`;
    formData.set("website", sanitizedUrl);
  }

  // Use the sanitized website URL
  const safeWebsite = (formData.get("website") as string) || cleanWebsite;

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    vendor_name: vendorName.trim(),
    website: safeWebsite,
    contact_email: contactEmail || user.email,
    message: message?.trim() || null,
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
