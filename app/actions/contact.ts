"use server";

import { createClient } from "@/lib/supabase/server";

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: "general" | "vendor" | "enterprise" | "press" | "bug";
}

export async function submitContactForm(data: ContactSubmission) {
  // Basic validation
  if (!data.name || !data.email || !data.message) {
    return { error: "Name, email, and message are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { error: "Please enter a valid email address." };
  }
  if (data.message.length < 10) {
    return { error: "Please provide a more detailed message (at least 10 characters)." };
  }

  // Store in Supabase contact_messages table (if configured)
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: data.name,
    email: data.email,
    subject: data.subject || "(no subject)",
    message: data.message,
    category: data.category,
    status: "new",
  });

  // Graceful fallback if table doesn't exist yet
  // Gracefully ignore table-missing errors (PGRST205 / schema cache)
  const isTableMissing =
    error?.code === 'PGRST205' ||
    error?.message?.includes('schema cache') ||
    error?.message?.includes('does not exist') ||
    error?.message?.includes('relation');

  if (error && !isTableMissing) {
    console.error("[contact] Supabase insert error:", error);
    return { error: "Failed to send message. Please try again or email hello@pepassure.com directly." };
  }

  // In production: also trigger an email notification here
  // (e.g. via Resend, SendGrid, or a Supabase edge function)
  console.log(`[contact] New message from ${data.email}: ${data.subject}`);

  return { success: true };
}
