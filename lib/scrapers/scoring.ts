/**
 * PVS Scoring Aggregator
 *
 * Computes the full 12-metric trust dashboard for each vendor:
 *
 * BASE METRICS:
 *   1. PVS Score (0-100) — weighted 5-pillar average
 *   2. Finnrick Grade — letter grade summary from independent tests
 *   3. Peer Rank — position vs competitors per peptide
 *
 * STABILITY:
 *   4. Consistency Index (0-100) — variance of historical scores
 *   5. 30d Trend — score delta over last 30 days
 *   6. Event Risk — any sudden drops detected
 *
 * OPERATIONAL QUALITY:
 *   7. Defect Rate — % of Finnrick tests graded D or E
 *   8. Recovery Velocity — batches to recover from bad grade
 *   9. (P2) Support SLA — measured response time
 *
 * TRUST & TRANSPARENCY:
 *   10. Liquidity Score — how many alternative vendors sell same peptides
 *   11. (P2) Covenant Score — buyer protection rating
 *   12. Community Presence — Reddit activity from vendor's account
 */

import { vendors, type Vendor } from "@/lib/vendors";
import {
  getVendorGrades,
  computeFinnrickScore,
  getGradeSummary,
  GRADE_VALUES,
} from "./finnrick";

export interface VendorTrustMetrics {
  vendorSlug: string;
  vendorName: string;

  // Base
  pvsScore: number;
  finnrickSummary: string | null;
  finnrickNumericScore: number | null;
  peerRanks: { peptide: string; rank: number; total: number }[];

  // Stability
  consistencyIndex: number;
  trend30d: number;
  eventRisk: string | null;

  // Operational
  defectRate: number | null;
  defectCount: number;
  totalTested: number;

  // Trust
  liquidityScore: number;
  alternativeVendors: number;

  // Risk
  riskAdjustment: number;
  riskFlags: { type: string; penalty: number; description: string }[];

  // Final
  finalScore: number;

  // Pillar breakdown (for visualization)
  pillars: {
    coa: number;
    purity: number;
    sentiment: number;
    transparency: number;
    experience: number;
  };
}

/**
 * Compute full trust metrics for a single vendor.
 * Uses available data sources (mock scores + Finnrick grades + static analysis).
 */
export function computeVendorMetrics(vendor: Vendor): VendorTrustMetrics {
  // --- 1. Base PVS Score (from vendor pillars data) ---
  const pillars = vendor.pillars;
  const basePVS = Math.round(
    pillars.coa * 0.3 +
    pillars.purity * 0.25 +
    pillars.sentiment * 0.2 +
    pillars.transparency * 0.15 +
    pillars.experience * 0.1
  );

  // --- 2. Finnrick Grade ---
  const finnrickScore = computeFinnrickScore(vendor.slug);
  const finnrickSummary = getGradeSummary(vendor.slug);

  // If Finnrick data exists, blend it into the COA pillar
  let adjustedPVS = basePVS;
  if (finnrickScore !== null) {
    // Replace 30% of COA pillar with Finnrick data
    const coaWithFinnrick = Math.round(pillars.coa * 0.5 + finnrickScore * 0.5);
    adjustedPVS = Math.round(
      coaWithFinnrick * 0.3 +
      pillars.purity * 0.25 +
      pillars.sentiment * 0.2 +
      pillars.transparency * 0.15 +
      pillars.experience * 0.1
    );
  }

  // --- 3. Peer Rank ---
  const peerRanks = computePeerRanks(vendor);

  // --- 4. Consistency Index ---
  // Based on score history variance. Uses vendor.scoreHistory if available.
  const consistencyIndex = computeConsistency(vendor.scoreHistory);

  // --- 5. 30d Trend ---
  const trend30d = compute30dTrend(vendor.scoreHistory);

  // --- 6. Event Risk ---
  const eventRisk = detectEventRisk(vendor.scoreHistory);

  // --- 7. Defect Rate ---
  const vendorGrades = getVendorGrades(vendor.slug);
  const defectCount = vendorGrades.filter(
    (g) => g.grade === "D" || g.grade === "E"
  ).length;
  const totalTested = vendorGrades.length;
  const defectRate =
    totalTested > 0 ? Math.round((defectCount / totalTested) * 100) : null;

  // --- 10. Liquidity Score ---
  const { liquidityScore, alternativeVendors } = computeLiquidity(vendor);

  // --- Risk Adjustment ---
  const riskFlags: { type: string; penalty: number; description: string }[] = [];

  // Auto-generate risk flags from Finnrick data
  for (const g of vendorGrades) {
    if (g.grade === "D") {
      riskFlags.push({
        type: "finnrick_d_grade",
        penalty: -5,
        description: `Finnrick D grade on ${g.peptideSlug}`,
      });
    }
    if (g.grade === "E") {
      riskFlags.push({
        type: "finnrick_e_grade",
        penalty: -10,
        description: `Finnrick E (BAD) grade on ${g.peptideSlug}`,
      });
    }
  }

  // Fraud warnings from Finnrick badges
  for (const g of vendorGrades) {
    if (g.badges.includes("fraud_warning")) {
      riskFlags.push({
        type: "fraud_warning",
        penalty: -10,
        description: `Finnrick fraud warning on ${g.peptideSlug}`,
      });
    }
  }

  // Domain age risk (using founded year as proxy)
  const yearsInBusiness =
    new Date().getFullYear() - parseInt(vendor.founded);
  if (yearsInBusiness < 1) {
    riskFlags.push({
      type: "new_domain",
      penalty: -5,
      description: `Vendor is less than 1 year old`,
    });
  }

  const riskAdjustment = riskFlags.reduce((sum, f) => sum + f.penalty, 0);

  // --- Final Score ---
  const finalScore = Math.max(0, Math.min(100, adjustedPVS + riskAdjustment));

  return {
    vendorSlug: vendor.slug,
    vendorName: vendor.name,
    pvsScore: adjustedPVS,
    finnrickSummary,
    finnrickNumericScore: finnrickScore,
    peerRanks,
    consistencyIndex,
    trend30d,
    eventRisk,
    defectRate,
    defectCount,
    totalTested,
    liquidityScore,
    alternativeVendors,
    riskAdjustment,
    riskFlags,
    finalScore,
    pillars,
  };
}

/**
 * Compute metrics for all vendors. Returns sorted by final score.
 */
export function computeAllMetrics(): VendorTrustMetrics[] {
  return vendors
    .filter((v) => !v.pending)
    .map(computeVendorMetrics)
    .sort((a, b) => b.finalScore - a.finalScore);
}

// --- Helper functions ---

function computeConsistency(history: number[]): number {
  if (history.length < 3) return 50; // not enough data
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const variance =
    history.reduce((sum, x) => sum + (x - mean) ** 2, 0) / history.length;
  const stddev = Math.sqrt(variance);
  // Invert: lower variance → higher consistency
  return Math.max(0, Math.min(100, Math.round(100 - stddev * 4)));
}

function compute30dTrend(history: number[]): number {
  if (history.length < 2) return 0;
  const recent = history[history.length - 1];
  const older = history[Math.max(0, history.length - 4)]; // ~30d ago
  return recent - older;
}

function detectEventRisk(history: number[]): string | null {
  if (history.length < 2) return null;
  const latest = history[history.length - 1];
  const prev = history[history.length - 2];
  const delta = latest - prev;

  if (delta <= -10) return `Score dropped ${Math.abs(delta)} points recently`;
  if (delta <= -5) return `Declining trend (−${Math.abs(delta)} pts)`;
  return null;
}

function computePeerRanks(
  vendor: Vendor
): { peptide: string; rank: number; total: number }[] {
  const ranks: { peptide: string; rank: number; total: number }[] = [];

  for (const peptide of vendor.peptideCatalog) {
    const vendorsWithPeptide = vendors.filter((v) =>
      v.peptideCatalog.includes(peptide)
    );
    const sorted = vendorsWithPeptide.sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((v) => v.slug === vendor.slug) + 1;
    if (rank > 0) {
      ranks.push({ peptide, rank, total: vendorsWithPeptide.length });
    }
  }

  return ranks;
}

function computeLiquidity(vendor: Vendor): {
  liquidityScore: number;
  alternativeVendors: number;
} {
  // For each peptide the vendor sells, count how many OTHER vendors sell it
  const altCounts = vendor.peptideCatalog.map((peptide) => {
    const others = vendors.filter(
      (v) => v.slug !== vendor.slug && v.peptideCatalog.includes(peptide)
    );
    return others.length;
  });

  if (altCounts.length === 0) return { liquidityScore: 0, alternativeVendors: 0 };

  const avgAlternatives =
    altCounts.reduce((a, b) => a + b, 0) / altCounts.length;
  const maxPossible = vendors.length - 1;
  const liquidityScore = Math.round(
    (avgAlternatives / Math.max(maxPossible, 1)) * 100
  );

  return {
    liquidityScore,
    alternativeVendors: Math.round(avgAlternatives),
  };
}
