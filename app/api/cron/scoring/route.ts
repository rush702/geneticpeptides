import { NextResponse, type NextRequest } from "next/server";
import { computeAllMetrics } from "@/lib/scrapers/scoring";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PVS scoring aggregator cron endpoint.
 * Runs daily after all scrapers complete.
 * Computes 12-metric trust dashboard for every vendor.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    console.log("[cron/scoring] Computing all vendor metrics...");
    const allMetrics = computeAllMetrics();

    let saved = 0;

    if (supabase) {
      for (const metrics of allMetrics) {
        // Save score snapshot to history
        const { error } = await supabase.from("vendor_score_history").insert({
          vendor_slug: metrics.vendorSlug,
          pvs_score: metrics.finalScore,
          pillar_scores: {
            coa: metrics.pillars.coa,
            purity: metrics.pillars.purity,
            sentiment: metrics.pillars.sentiment,
            transparency: metrics.pillars.transparency,
            experience: metrics.pillars.experience,
            finnrick: metrics.finnrickNumericScore,
            consistency: metrics.consistencyIndex,
            defect_rate: metrics.defectRate,
            liquidity: metrics.liquidityScore,
            risk_adjustment: metrics.riskAdjustment,
            final_score: metrics.finalScore,
          },
        });

        if (!error) saved++;
      }

      // Check for score events (drops > 5 points)
      for (const metrics of allMetrics) {
        const { data: prevScores } = await supabase
          .from("vendor_score_history")
          .select("pvs_score")
          .eq("vendor_slug", metrics.vendorSlug)
          .order("computed_at", { ascending: false })
          .limit(2);

        if (prevScores && prevScores.length >= 2) {
          const delta = metrics.finalScore - (prevScores[1]?.pvs_score || 0);
          if (Math.abs(delta) >= 5) {
            await supabase.from("vendor_events").insert({
              vendor_slug: metrics.vendorSlug,
              event_type: delta > 0 ? "score_rise" : "score_drop",
              prev_value: { score: prevScores[1]?.pvs_score },
              new_value: { score: metrics.finalScore },
              delta,
            });
          }
        }
      }
    }

    const summary = {
      success: true,
      vendorsScored: allMetrics.length,
      savedToHistory: saved,
      topVendor: allMetrics[0]
        ? { slug: allMetrics[0].vendorSlug, score: allMetrics[0].finalScore }
        : null,
      timestamp: new Date().toISOString(),
    };

    console.log("[cron/scoring] Complete:", JSON.stringify(summary));
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[cron/scoring] Fatal error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
