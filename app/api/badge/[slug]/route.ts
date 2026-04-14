import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * GET /api/badge/[slug]
 *
 * Returns a dynamic SVG badge showing the vendor's PVS score.
 * Vendors embed this on their own sites:
 *   <img src="https://pepassure.com/api/badge/ascension-peptides" />
 *
 * Pro/Enterprise: shows score + "Pro Verified" or "Verified"
 * Free: shows "Listed on PepAssure" (no score)
 * Missing slug: 404
 *
 * Cache: 1 hour (s-maxage=3600) — badge updates with scoring cron
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return new NextResponse("Service unavailable", { status: 503 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("vendor_name, pvs_score, tier, status")
    .eq("vendor_slug", slug)
    .eq("status", "approved")
    .single();

  if (!profile) {
    return new NextResponse("Vendor not found", { status: 404 });
  }

  const score = Math.round(profile.pvs_score ?? 0);
  const tier = profile.tier ?? "free";
  const isProPlus = tier === "pro" || tier === "enterprise";

  // Score color
  const scoreColor = score >= 90 ? "#10b981" : score >= 75 ? "#f59e0b" : "#ef4444";

  const svg = isProPlus
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="56" viewBox="0 0 200 56">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0f0d"/>
      <stop offset="100%" style="stop-color:#0f1a14"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="200" height="56" rx="10" fill="url(#bg)" stroke="rgba(16,185,129,0.3)" stroke-width="1.5"/>
  <!-- Left emerald accent -->
  <rect x="0" y="0" width="4" height="56" rx="2" fill="${scoreColor}"/>
  <!-- Logo text -->
  <text x="16" y="18" font-family="Inter,sans-serif" font-size="9" font-weight="600" fill="#10b981" letter-spacing="0.05em">PEPASSURE</text>
  <!-- Score -->
  <text x="16" y="38" font-family="Inter,sans-serif" font-size="20" font-weight="700" fill="white">${score}</text>
  <text x="44" y="38" font-family="Inter,sans-serif" font-size="10" font-weight="400" fill="#6b7280">/100</text>
  <!-- Tier badge -->
  <rect x="130" y="24" width="60" height="18" rx="9" fill="${scoreColor}22" stroke="${scoreColor}55" stroke-width="1"/>
  <text x="160" y="36" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" font-weight="600" fill="${scoreColor}">${tier === "enterprise" ? "ENTERPRISE" : "PRO VERIFIED"}</text>
  <!-- PVS label -->
  <text x="16" y="50" font-family="Inter,sans-serif" font-size="8" fill="#4b5563">PVS Score</text>
</svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="40" viewBox="0 0 180 40">
  <rect width="180" height="40" rx="8" fill="#0a0f0d" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <rect x="0" y="0" width="3" height="40" rx="1.5" fill="#10b981"/>
  <text x="13" y="14" font-family="Inter,sans-serif" font-size="8" font-weight="600" fill="#10b981" letter-spacing="0.05em">PEPASSURE</text>
  <text x="13" y="30" font-family="Inter,sans-serif" font-size="11" font-weight="500" fill="#d1d5db">Listed Vendor</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
