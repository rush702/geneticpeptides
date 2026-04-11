"use server";

import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

// ─── Price IDs (set in Vercel env vars) ─────────────────────────
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  enterprise_monthly: process.env.STRIPE_PRICE_ENT_MONTHLY,
  enterprise_yearly: process.env.STRIPE_PRICE_ENT_YEARLY,
};

type PlanKey = keyof typeof PRICE_IDS;

// Lazy Stripe init — only create when called, so build doesn't fail
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export async function createCheckoutSession(plan: PlanKey) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to upgrade." };
  }

  const stripe = getStripe();
  const priceId = PRICE_IDS[plan];

  // ─── Dev fallback when Stripe isn't configured ─────────────
  if (!stripe || !priceId) {
    console.warn(
      "[Stripe] Not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_* env vars. Returning stub URL."
    );
    return {
      url: `/dashboard?upgraded=true&plan=${plan}&stub=true`,
      stub: true,
    };
  }

  // ─── Real checkout session ─────────────────────────────────
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?upgraded=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/for-vendors#pricing`,
      metadata: {
        user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      return { error: "Failed to create checkout session." };
    }

    return { url: session.url };
  } catch (error) {
    console.error("[Stripe] checkout.sessions.create failed:", error);
    return {
      error: error instanceof Error ? error.message : "Checkout session failed.",
    };
  }
}

// ─── Customer portal (manage subscription) ──────────────────────
export async function createPortalSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { error: "Billing is not configured." };
  }

  try {
    // Fetch customer ID from user metadata or profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return { error: "No active subscription found." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard`,
    });

    return { url: session.url };
  } catch (error) {
    console.error("[Stripe] billingPortal.sessions.create failed:", error);
    return { error: "Failed to open billing portal." };
  }
}
