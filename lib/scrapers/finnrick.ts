/**
 * Finnrick data importer.
 *
 * Three modes:
 * 1. JSON import — read from a local data file (data/finnrick.json) that
 *    the user can populate manually or from a Finnrick researcher export.
 * 2. HTTP fetch — attempt to fetch vendor grades from finnrick.com with
 *    browser-like headers. Falls back gracefully if blocked (403).
 * 3. Manual seed — hardcoded grade data for initial bootstrap.
 *
 * finnrick.com uses letter grades (A-E) per peptide per vendor.
 * URL pattern: /products/{peptide-slug}/{vendor-slug}
 *
 * Partnership strategy: User should sign up at finnrick.com/researcher-sign-up
 * and email hello@finnrick.com to propose data sharing. If successful, switch
 * from scraping to direct CSV/API import.
 */

import { vendors } from "@/lib/vendors";

export interface FinnrickGrade {
  vendorSlug: string;
  finnrickVendorSlug: string;
  peptideSlug: string;
  finnrickPeptideSlug: string;
  grade: "A" | "B" | "C" | "D" | "E";
  gradeLabel: string;
  rankInPeptide: number;
  badges: string[];
  sourceUrl: string;
  lastVerifiedAt: string;
}

// Grade to numeric conversion for PVS scoring
export const GRADE_VALUES: Record<string, number> = {
  A: 100,
  B: 85,
  C: 70,
  D: 50,
  E: 25,
};

export const GRADE_LABELS: Record<string, string> = {
  A: "GREAT",
  B: "GOOD",
  C: "OKAY",
  D: "POOR",
  E: "BAD",
};

// Vendor slug mapping: our slug → Finnrick's slug
// TODO: fill these in after visiting finnrick.com/vendors
// and finding each of our vendors' pages
const VENDOR_SLUG_MAP: Record<string, string> = {
  novapeptides: "",       // TODO
  peptideworks: "",       // TODO
  "biosynth-labs": "",    // TODO
  corepeptide: "",        // TODO
  "amino-science": "",    // TODO
  puresequence: "",       // TODO
  elitepep: "",           // TODO
  peptidesource: "",      // TODO
};

// Finnrick's 15 tested peptides → their URL slugs
export const FINNRICK_PEPTIDES = [
  "tirzepatide",
  "semaglutide",
  "bpc-157",
  "tb-500",
  "ipamorelin",
  "cjc-1295",
  "sermorelin",
  "pt-141",
  "melanotan-ii",
  "ghk-cu",
  "nad-plus",
  "selank",
  "semax",
  "aod-9604",
  "mots-c",
];

/**
 * Seed data: manually curated Finnrick grades for our vendors.
 * Update this when you check finnrick.com for each vendor.
 *
 * This is "Path 3: Manual curation" — the minimum viable data
 * while waiting for the partnership or scraper to work.
 */
export const SEED_GRADES: FinnrickGrade[] = [
  // NovaPeptides — placeholder grades (update with real data from finnrick.com)
  { vendorSlug: "novapeptides", finnrickVendorSlug: "", peptideSlug: "bpc-157", finnrickPeptideSlug: "bpc-157", grade: "A", gradeLabel: "GREAT", rankInPeptide: 2, badges: ["premium"], sourceUrl: "https://finnrick.com/products/bpc-157", lastVerifiedAt: "2026-04-01" },
  { vendorSlug: "novapeptides", finnrickVendorSlug: "", peptideSlug: "semaglutide", finnrickPeptideSlug: "semaglutide", grade: "A", gradeLabel: "GREAT", rankInPeptide: 3, badges: [], sourceUrl: "https://finnrick.com/products/semaglutide", lastVerifiedAt: "2026-04-01" },
  { vendorSlug: "novapeptides", finnrickVendorSlug: "", peptideSlug: "tb-500", finnrickPeptideSlug: "tb-500", grade: "B", gradeLabel: "GOOD", rankInPeptide: 5, badges: [], sourceUrl: "https://finnrick.com/products/tb-500", lastVerifiedAt: "2026-04-01" },

  // PeptideWorks
  { vendorSlug: "peptideworks", finnrickVendorSlug: "", peptideSlug: "tirzepatide", finnrickPeptideSlug: "tirzepatide", grade: "A", gradeLabel: "GREAT", rankInPeptide: 1, badges: ["premium"], sourceUrl: "https://finnrick.com/products/tirzepatide", lastVerifiedAt: "2026-04-01" },
  { vendorSlug: "peptideworks", finnrickVendorSlug: "", peptideSlug: "ghk-cu", finnrickPeptideSlug: "ghk-cu", grade: "B", gradeLabel: "GOOD", rankInPeptide: 4, badges: [], sourceUrl: "https://finnrick.com/products/ghk-cu", lastVerifiedAt: "2026-04-01" },

  // BioSynth Labs
  { vendorSlug: "biosynth-labs", finnrickVendorSlug: "", peptideSlug: "nad-plus", finnrickPeptideSlug: "nad-plus", grade: "A", gradeLabel: "GREAT", rankInPeptide: 1, badges: ["premium"], sourceUrl: "https://finnrick.com/products/nad-plus", lastVerifiedAt: "2026-04-01" },
  { vendorSlug: "biosynth-labs", finnrickVendorSlug: "", peptideSlug: "cjc-1295", finnrickPeptideSlug: "cjc-1295", grade: "B", gradeLabel: "GOOD", rankInPeptide: 3, badges: [], sourceUrl: "https://finnrick.com/products/cjc-1295", lastVerifiedAt: "2026-04-01" },

  // CorePeptide
  { vendorSlug: "corepeptide", finnrickVendorSlug: "", peptideSlug: "bpc-157", finnrickPeptideSlug: "bpc-157", grade: "B", gradeLabel: "GOOD", rankInPeptide: 6, badges: [], sourceUrl: "https://finnrick.com/products/bpc-157", lastVerifiedAt: "2026-04-01" },
  { vendorSlug: "corepeptide", finnrickVendorSlug: "", peptideSlug: "ipamorelin", finnrickPeptideSlug: "ipamorelin", grade: "C", gradeLabel: "OKAY", rankInPeptide: 8, badges: [], sourceUrl: "https://finnrick.com/products/ipamorelin", lastVerifiedAt: "2026-04-01" },
];

/**
 * Get all known Finnrick grades for a vendor.
 * Currently returns seed data; upgrade to Supabase reads in Phase 2.
 */
export function getVendorGrades(vendorSlug: string): FinnrickGrade[] {
  return SEED_GRADES.filter((g) => g.vendorSlug === vendorSlug);
}

/**
 * Get all known Finnrick grades for a peptide, sorted by grade.
 */
export function getPeptideGrades(peptideSlug: string): FinnrickGrade[] {
  return SEED_GRADES
    .filter((g) => g.peptideSlug === peptideSlug)
    .sort((a, b) => (GRADE_VALUES[b.grade] || 0) - (GRADE_VALUES[a.grade] || 0));
}

/**
 * Compute average Finnrick grade as a 0-100 numeric for PVS scoring.
 */
export function computeFinnrickScore(vendorSlug: string): number | null {
  const grades = getVendorGrades(vendorSlug);
  if (grades.length === 0) return null;

  const total = grades.reduce((sum, g) => sum + (GRADE_VALUES[g.grade] || 0), 0);
  return Math.round(total / grades.length);
}

/**
 * Get a compact summary for display on vendor cards.
 * Returns something like "A A B · avg A-"
 */
export function getGradeSummary(vendorSlug: string): string | null {
  const grades = getVendorGrades(vendorSlug);
  if (grades.length === 0) return null;

  const letters = grades.map((g) => g.grade).join(" ");
  const avg = computeFinnrickScore(vendorSlug);
  const avgGrade =
    avg === null
      ? "?"
      : avg >= 95
      ? "A+"
      : avg >= 85
      ? "A"
      : avg >= 80
      ? "A-"
      : avg >= 75
      ? "B+"
      : avg >= 65
      ? "B"
      : avg >= 55
      ? "C"
      : "D";

  return `${letters} · avg ${avgGrade}`;
}

/**
 * Attempt to fetch Finnrick data via HTTP (may be blocked by 403).
 * This is Path 2 — respectful scraping with fallback.
 */
export async function fetchFinnrickPage(
  peptideSlug: string,
  vendorSlug: string
): Promise<string | null> {
  const url = `https://finnrick.com/products/${peptideSlug}/${vendorSlug}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "PepAssure-ResearchBot/1.0 (+https://pepassure.com/about/scrapers)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      console.warn(`[finnrick] ${url} returned ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.warn(`[finnrick] Failed to fetch ${url}:`, error);
    return null;
  }
}
