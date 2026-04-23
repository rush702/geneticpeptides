import type { VendorReview, VendorCOA } from "./vendors-types";

export function makeReviews(seed: string): VendorReview[] {
  const templates = [
    { author: "ResearcherA", rating: 5, title: "Excellent purity", body: "Received my order in 3 days. The COA matched the product exactly and the peptide performed as expected in my assays." },
    { author: "LabUser42", rating: 5, title: "Reliable vendor", body: "Third order from them. Consistent quality across batches. Customer service is responsive to any questions about documentation." },
    { author: "BioPhD", rating: 4, title: "Good quality, decent price", body: "Purity was verified by independent HPLC. Slightly pricey compared to alternatives but the documentation quality justifies it." },
    { author: "MSResearcher", rating: 5, title: "MS data checks out", body: "Ran independent mass spec verification — the vendor's COA was accurate within 0.3 Da. Highly recommend for serious research." },
    { author: "PeptideFan", rating: 4, title: "Solid overall", body: "Packaging was discrete and professional. Peptide arrived intact. Minor issue with one batch but they replaced it without hassle." },
  ];
  const seedNum = (seed.charCodeAt(0) || 0) + (seed.charCodeAt(1) || 0);
  return templates.slice(0, 3 + (seedNum % 3)).map((t, i) => ({
    id: `${seed}-review-${i}`,
    ...t,
    verified: i % 2 === 0,
    helpful: 12 + ((seedNum + i * 7) % 30),
    date: `2026-0${3 + (i % 2)}-${String(5 + i * 4).padStart(2, "0")}`,
  }));
}

export function makeCOAs(peptides: string[], purity: string): VendorCOA[] {
  return peptides.map((p, i) => ({
    peptide: p,
    batchId: `${p.substring(0, 3).toUpperCase()}-2026-${String(400 + i * 13).padStart(4, "0")}`,
    purity: `${(parseFloat(purity) - i * 0.2).toFixed(1)}%`,
    date: `Apr ${8 - i}, 2026`,
    method: i % 2 === 0 ? "HPLC + MS" : "HPLC",
  }));
}

/**
 * Deterministic score history for a vendor. Uses a seeded PRNG derived from
 * the current score so regenerating gives identical output (important for
 * static-render stability in Next.js).
 */
export function makeScoreHistory(currentScore: number): number[] {
  let rng = currentScore * 9301 + 49297;
  const nextRand = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };
  const history: number[] = [];
  let s = currentScore - 8;
  for (let i = 0; i < 12; i++) {
    history.push(Math.max(40, Math.min(100, s)));
    s += Math.floor(nextRand() * 3) - 0.2;
  }
  history.push(currentScore);
  return history.map(Math.round);
}
