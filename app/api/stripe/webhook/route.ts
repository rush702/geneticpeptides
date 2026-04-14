import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Idempotency guard ─────────────────────────────────────────────────────────
// Stripe may retry events. We track processed event IDs so we never double-write.
// In-memory per-instance; for multi-replica deploys move this to Redis or a DB table.
const processedEventIds = new Set<string>();
const MAX_CACHE_SIZE = 5_000;

function markProcessed(id: string) {
  if (processedEventIds.size >= MAX_CACHE_SIZE) processedEventIds.clear();
  processedEventIds.add(id);
}
// ─────────────────────────────────────────────────────────────────────────────

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

function planToTier(plan: string | undefined): "pro" | "enterprise" | null {
  if (!plan) return null;
  if (plan.startsWith("enterprise")) return "enterprise";
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

  // ── Idempotency check ─────────────────────────────────────────────────────
  if (processedEventIds.has(event.id)) {
    console.log(`[Stripe webhook] Duplicate event ignored: ${event.id}`);
    return NextResponse.json({ received: true, duplicate: true });
  }
  // ─────────────────────────────────────────────────────────────────────────

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("[Stripe webhook] Supabase service client not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    switch (event.type) {
      // ─── Subscription activated ───────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        const tier = planToTier(plan);
        const customerId =
          typeof session.customer === "string" ? session.customer : null;

        if (!userId || !tier) {
          console.warn(
            "[Stripe webhook] missing user_id or plan in session metadata"
          );
          break;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id:
              typeof session.subscription === "string"
                ? session.subscription
                : null,
            upgraded_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("[Stripe webhook] profiles update failed:", error);
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          );
        }

        console.log(`[Stripe webhook] Upgraded user ${userId} to ${tier}`);
        break;
      }

      // ─── Subscription canceled / downgraded ──────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.warn(
            "[Stripe webhook] missing user_id in subscription metadata"
          );
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

      // ─── Payment failed ───────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          `[Stripe webhook] Payment failed for customer ${invoice.customer}`
        );
        // TODO: send payment failure email via Resend/SendGrid
        break;
      }

      default:
        console.log(`[Stripe webhook] Unhandled event type: ${event.type}`);
    }

    // Mark processed only after successful handling so failures can be retried
    markProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe webhook] handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
