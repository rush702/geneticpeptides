"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardData {
  pvsScore: number;
  rank: number;
  totalVendors: number;
  scoreDelta: number;         // change vs. 30 days ago
  trendData30: number[];      // daily scores, last 30 days
  trendData90: number[];      // daily scores, last 90 days
  pageViewsThisMonth: number;
  pageViewsLastMonth: number;
  pillars: {
    name: string;
    weight: string;
    score: number;
  }[];
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get vendor profile for vendor_slug and scores
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, vendor_slug, pvs_score, rank, pillar_coa_score, pillar_reddit_score, pillar_purity_score, pillar_transparency_score, pillar_experience_score")
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  // Get vendor_slug (may be null on new profiles)
  const slug = profile.vendor_slug ?? null;

  // Score history for trend charts
  let trendData30: number[] = [];
  let trendData90: number[] = [];
  let scoreDelta = 0;

  if (slug) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);

    const { data: history } = await supabase
      .from("vendor_score_history")
      .select("pvs_score, computed_at")
      .eq("vendor_slug", slug)
      .gte("computed_at", thirtyDaysAgo.toISOString())
      .order("computed_at", { ascending: true })
      .limit(90);

    const scores = (history ?? []).map((h) => Math.round(h.pvs_score));
    trendData90 = scores.length > 0 ? scores : [];
    trendData30 = scores.slice(-30);

    if (scores.length >= 2) {
      scoreDelta = scores[scores.length - 1] - scores[Math.max(0, scores.length - 31)];
    }
  }

  // Total vendor count (for rank display)
  const { count: totalVendors } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  // Page views this month vs last month
  let pageViewsThisMonth = 0;
  let pageViewsLastMonth = 0;

  if (slug) {
    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
    const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];

    const [thisMonthRes, lastMonthRes] = await Promise.all([
      supabase
        .from("vendor_page_views")
        .select("view_count")
        .eq("vendor_slug", slug)
        .gte("view_date", firstOfThisMonth)
        .lt("view_date", firstOfNextMonth),
      supabase
        .from("vendor_page_views")
        .select("view_count")
        .eq("vendor_slug", slug)
        .gte("view_date", firstOfLastMonth)
        .lt("view_date", firstOfThisMonth),
    ]);

    pageViewsThisMonth = (thisMonthRes.data ?? []).reduce((sum, r) => sum + r.view_count, 0);
    pageViewsLastMonth = (lastMonthRes.data ?? []).reduce((sum, r) => sum + r.view_count, 0);
  }

  const pvsScore = Math.round(profile.pvs_score ?? 0);

  return {
    pvsScore,
    rank: profile.rank ?? 0,
    totalVendors: totalVendors ?? 0,
    scoreDelta: Math.round(scoreDelta),
    trendData30,
    trendData90,
    pageViewsThisMonth,
    pageViewsLastMonth,
    pillars: [
      { name: "COA Verification",    weight: "30%", score: Math.round(profile.pillar_coa_score ?? 0) },
      { name: "Reddit Sentiment",    weight: "20%", score: Math.round(profile.pillar_reddit_score ?? 0) },
      { name: "Purity Testing",      weight: "25%", score: Math.round(profile.pillar_purity_score ?? 0) },
      { name: "Vendor Transparency", weight: "15%", score: Math.round(profile.pillar_transparency_score ?? 0) },
      { name: "Order Experience",    weight: "10%", score: Math.round(profile.pillar_experience_score ?? 0) },
    ],
  };
}

export interface PlaybookItem {
  action: string;
  pillar: string;
  estimatedGain: string;
  priority: "high" | "medium" | "low";
}

export async function getScorePlaybook(): Promise<PlaybookItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("pillar_coa_score, pillar_reddit_score, pillar_purity_score, pillar_transparency_score, pillar_experience_score")
    .eq("user_id", user.id)
    .single();

  if (!profile) return [];

  // Count pending COAs to suggest verification
  const { count: pendingCOAs } = await supabase
    .from("coa_uploads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  const { count: totalCOAs } = await supabase
    .from("coa_uploads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const items: PlaybookItem[] = [];

  const coaScore = profile.pillar_coa_score ?? 0;
  const redditScore = profile.pillar_reddit_score ?? 0;
  const transparencyScore = profile.pillar_transparency_score ?? 0;
  const purityScore = profile.pillar_purity_score ?? 0;

  if (coaScore < 70) {
    const needed = Math.max(1, 5 - (totalCOAs ?? 0));
    items.push({
      action: `Upload ${needed} more COA${needed > 1 ? "s" : ""} with ≥98% purity`,
      pillar: "COA Verification",
      estimatedGain: `+${Math.round((100 - coaScore) * 0.3 * 0.3)} pts`,
      priority: "high",
    });
  }

  if ((pendingCOAs ?? 0) > 0) {
    items.push({
      action: `${pendingCOAs} COA${(pendingCOAs ?? 0) > 1 ? "s are" : " is"} pending — check back after verification completes`,
      pillar: "COA Verification",
      estimatedGain: `+${Math.round((pendingCOAs ?? 0) * 2)} pts`,
      priority: "medium",
    });
  }

  if (transparencyScore < 80) {
    items.push({
      action: "Add your lab testing methodology URL to your vendor profile",
      pillar: "Vendor Transparency",
      estimatedGain: "+3–5 pts",
      priority: "medium",
    });
  }

  if (redditScore < 60) {
    items.push({
      action: "Encourage satisfied customers to leave honest feedback on r/Peptides",
      pillar: "Reddit Sentiment",
      estimatedGain: "+4–8 pts over 30 days",
      priority: "medium",
    });
  }

  if (purityScore < 75) {
    items.push({
      action: "Upload COAs with mass-spec (MS) verification for higher purity scores",
      pillar: "Purity Testing",
      estimatedGain: `+${Math.round((100 - purityScore) * 0.1)} pts`,
      priority: "high",
    });
  }

  // Always suggest review engagement
  items.push({
    action: "Respond to your most recent community review in your vendor profile",
    pillar: "Order Experience",
    estimatedGain: "+2 pts",
    priority: "low",
  });

  return items.slice(0, 4); // Show top 4 actions
}
