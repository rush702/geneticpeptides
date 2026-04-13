import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

// Stripe requires the raw request body to verify webhook signatures
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

function planToTier(plan: string | undefined): "pro" | "pro_plus" | "enterprise" | null {
  if (!plan) return null;
  if (plan.startsWith("enterprise")) return "enterprise";
  if (plan.startsWith("pro_plus")) return "pro_plus";
  if (plan.startsWith("pro")) return "pro";
  return null;
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhooks are not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("[Stripe webhook] Supabase service client not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    switch (event.type) {
      // ─── Subscription activated ────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        const tier = planToTier(plan);
        const customerId = typeof session.customer === "string" ? session.customer : null;

        if (!userId || !tier) {
          console.warn("[Stripe webhook] missing user_id or plan in session metadata");
          break;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : null,
            upgraded_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("[Stripe webhook] profiles update failed:", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        console.log(`[Stripe webhook] Upgraded user ${userId} to ${tier}`);
        break;
      }

      // ─── Subscription canceled / downgraded ────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.warn("[Stripe webhook] missing user_id in subscription metadata");
          break;
        }

        const { error } = await supabase
          .from("profiles")
          .update({ tier: "free", stripe_subscription_id: null })
          .eq("user_id", userId);

        if (error) {
          console.error("[Stripe webhook] downgrade failed:", error);
        }

        console.log(`[Stripe webhook] Downgraded user ${userId} to free`);
        break;
      }

      // ─── Payment failed — optional: notify user ────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[Stripe webhook] Payment failed for customer ${invoice.customer}`);
        // In production: send email notification here
        break;
      }

      default:
        console.log(`[Stripe webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe webhook] handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
