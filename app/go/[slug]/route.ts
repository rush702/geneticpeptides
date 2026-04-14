import { NextResponse, type NextRequest } from "next/server";
import { vendors } from "@/lib/vendors";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Click tracking redirect.
 * pepassure.com/go/{vendor-slug} → vendor website
 *
 * Logs every click to vendor_clicks table for analytics.
 * Vendors on Pro+ tiers can see click data in their dashboard.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const vendor = vendors.find((v) => v.slug === slug);

  if (!vendor) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Log click asynchronously (don't block the redirect)
  const supabase = createServiceClient();
  if (supabase) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";

    // Fire and forget — don't await, don't block redirect
    supabase
      .from("vendor_clicks")
      .insert({
        vendor_slug: slug,
        destination_url: vendor.website,
        ip_hash: hashIP(ip),
        user_agent: userAgent.substring(0, 200),
        referer: referer.substring(0, 500),
      })
      .then(({ error }) => {
        if (error && !error.message?.includes("does not exist")) {
          console.error("[go] click log error:", error.message);
        }
      });
  }

  return NextResponse.redirect(vendor.website, 302);
}

/**
 * Hash IP for privacy — we don't store raw IPs.
 * Simple hash, not cryptographic (just for deduplication).
 */
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `ip_${Math.abs(hash).toString(36)}`;
}
