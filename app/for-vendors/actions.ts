"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";

// ────────────────────────────────────────────────────────────────
// Supabase server client
// ────────────────────────────────────────────────────────────────
async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies — safe to ignore
          }
        },
      },
    }
  );
}

// ────────────────────────────────────────────────────────────────
// Server Action: submitClaim
// Inserts into the `profiles` table with status = 'pending'
// ────────────────────────────────────────────────────────────────
interface ClaimPayload {
  vendorName: string;
  websiteUrl: string;
  contactEmail: string;
  message: string | null;
  userId: string | null;
}

export async function submitClaim(
  payload: ClaimPayload
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!payload.vendorName || !payload.websiteUrl || !payload.contactEmail) {
      return { ok: false, error: "Missing required fields." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contactEmail)) {
      return { ok: false, error: "Invalid email address." };
    }

    const supabase = await getServerSupabase();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Authentication required." };
    }

    if (payload.userId && user.id !== payload.userId) {
      return { ok: false, error: "Authentication mismatch." };
    }

    // Check if user already has a profile
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return { ok: false, error: "You already have a vendor listing." };
    }

    // Insert into profiles table
    const { error } = await supabase.from("profiles").insert({
      user_id: user.id,
      vendor_name: payload.vendorName,
      website_url: payload.websiteUrl,
      contact_email: payload.contactEmail,
      message: payload.message,
      status: "pending",
      tier: "free",
    });

    if (error) {
      console.error("[PepAssure] Profile insert error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[PepAssure] submitClaim server error:", err);
    return { ok: false, error: "Internal server error." };
  }
}

// ────────────────────────────────────────────────────────────────
// Server Action: createCheckoutSession
// Creates a Stripe Checkout session for Pro or Enterprise upgrade
// ────────────────────────────────────────────────────────────────
const STRIPE_PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL || "",
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || "",
  },
};

export async function createCheckoutSession(
  tier: "pro" | "enterprise",
  billing: "monthly" | "annual"
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { ok: false, error: "Stripe is not configured." };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Authentication required." };
    }

    // Get or create the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id, contact_email, vendor_name")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return {
        ok: false,
        error: "Please claim your free listing first before upgrading.",
      };
    }

    const priceId = STRIPE_PRICE_IDS[tier]?.[billing];
    if (!priceId) {
      return { ok: false, error: "Invalid pricing plan." };
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.contact_email || user.email || "",
        name: profile.vendor_name,
        metadata: { supabase_user_id: user.id, profile_id: profile.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", profile.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/for-vendors`,
      metadata: {
        supabase_user_id: user.id,
        profile_id: profile.id,
        tier,
      },
    });

    return { ok: true, url: session.url || undefined };
  } catch (err: any) {
    console.error("[PepAssure] Checkout error:", err);
    return { ok: false, error: "Failed to create checkout session." };
  }
}
