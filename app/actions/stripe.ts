"use server";

import { createClient } from "@/lib/supabase/server";

// Stripe price IDs — set these in your Stripe dashboard
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || "price_pro_yearly",
  enterprise_monthly: process.env.STRIPE_PRICE_ENT_MONTHLY || "price_ent_monthly",
  enterprise_yearly: process.env.STRIPE_PRICE_ENT_YEARLY || "price_ent_yearly",
};

type PlanKey = keyof typeof PRICE_IDS;

export async function createCheckoutSession(plan: PlanKey) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to upgrade." };
  }

  // --- Stripe checkout stub ---
  // Replace with real Stripe SDK when ready:
  //
  // import Stripe from "stripe";
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   customer_email: user.email,
  //   line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
  //   success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgraded=true`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/for-vendors#pricing`,
  //   metadata: { user_id: user.id, plan },
  // });
  // return { url: session.url };

  console.log(`[Stripe Stub] Would create checkout for plan "${plan}", user ${user.id}`);

  // For now, return a stub URL
  return {
    url: `/dashboard?upgraded=true&plan=${plan}`,
    stub: true,
  };
}

// Webhook handler — call this from app/api/stripe/webhook/route.ts
export async function handleStripeWebhook(event: {
  type: string;
  data: { object: { metadata?: { user_id?: string; plan?: string } } };
}) {
  if (event.type === "checkout.session.completed") {
    const { user_id, plan } = event.data.object.metadata || {};
    if (!user_id || !plan) return;

    const supabase = await createClient();
    const tier = plan.startsWith("enterprise") ? "enterprise" : "pro";

    await supabase
      .from("profiles")
      .update({ tier, upgraded_at: new Date().toISOString() })
      .eq("user_id", user_id);
  }
}
