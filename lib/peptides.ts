import { vendors } from "./vendors";

export interface Peptide {
  slug: string;
  name: string;
  category: "Healing" | "GLP-1" | "Growth Hormone" | "Nootropic" | "Longevity" | "Immune" | "Melanocortin";
  molecularWeight: string;
  sequence: string;
  description: string;
  halfLife: string;
  researchAreas: string[];
  commonDoses: string;
  synonyms: string[];
}

export const peptides: Peptide[] = [
  {
    slug: "bpc-157",
    name: "BPC-157",
    category: "Healing",
    molecularWeight: "1419.53 g/mol",
    sequence: "GEPPPGKPADDAGLV",
    description:
      "BPC-157 (Body Protection Compound) is a pentadecapeptide derived from a protective protein found in human gastric juice. Research suggests it may play a role in tissue repair, angiogenesis, and gastrointestinal health. It has become one of the most studied peptides for tissue regeneration research.",
    halfLife: "~4 hours (subcutaneous)",
    researchAreas: ["Tissue repair", "Tendon healing", "Gut health", "Angiogenesis", "Anti-inflammatory"],
    commonDoses: "250-500 mcg/day (research protocols)",
    synonyms: ["Body Protection Compound 157", "PL 14736"],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    category: "Healing",
    molecularWeight: "4963.5 g/mol",
    sequence: "Ac-SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES",
    description:
      "TB-500 is a synthetic fragment of the naturally-occurring protein Thymosin Beta-4. Research has focused on its potential role in cell migration, vascular development, and tissue repair — particularly in muscle and cardiac tissue recovery.",
    halfLife: "~2 days",
    researchAreas: ["Tissue repair", "Muscle recovery", "Cardiac research", "Anti-inflammatory"],
    commonDoses: "2-5 mg/week (research protocols)",
    synonyms: ["Thymosin Beta-4 Fragment", "TB4 Fragment"],
  },
  {
    slug: "semaglutide",
    name: "Semaglutide",
    category: "GLP-1",
    molecularWeight: "4113.58 g/mol",
    sequence: "HAEGT(F)TSDVSSYLEGQAAKEFIAWLVRGRG",
    description:
      "Semaglutide is a glucagon-like peptide-1 (GLP-1) receptor agonist. It is one of the most widely studied peptides in metabolic research, with applications in glucose regulation and weight management studies.",
    halfLife: "~1 week",
    researchAreas: ["Metabolic research", "Glucose regulation", "Weight management studies", "Cardiovascular research"],
    commonDoses: "Consult published research literature",
    synonyms: ["GLP-1 receptor agonist"],
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    category: "GLP-1",
    molecularWeight: "4813.45 g/mol",
    sequence: "Y(Aib)EGTFTSDYSI(Aib)LDKIAQKAFVQWLIAGGPSSGAPPPS",
    description:
      "Tirzepatide is a dual GIP/GLP-1 receptor agonist — the first peptide of its kind to reach commercial availability. Research interest spans metabolic regulation, weight management studies, and cardiovascular outcomes.",
    halfLife: "~5 days",
    researchAreas: ["Dual GIP/GLP-1 research", "Metabolic studies", "Weight management", "Glucose regulation"],
    commonDoses: "Consult published research literature",
    synonyms: ["Dual GIP/GLP-1 receptor agonist"],
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    category: "Longevity",
    molecularWeight: "340.84 g/mol",
    sequence: "Gly-His-Lys (copper complex)",
    description:
      "GHK-Cu is a naturally occurring copper-binding peptide tripeptide found in human plasma. Research has focused on its potential roles in skin regeneration, anti-inflammatory activity, and gene expression modulation.",
    halfLife: "~1-4 hours",
    researchAreas: ["Skin regeneration", "Wound healing", "Anti-aging research", "Gene expression"],
    commonDoses: "1-3 mg/day (research protocols)",
    synonyms: ["Copper Peptide", "Glycyl-L-Histidyl-L-Lysine Cu"],
  },
  {
    slug: "cjc-1295",
    name: "CJC-1295",
    category: "Growth Hormone",
    molecularWeight: "3367.9 g/mol",
    sequence: "Y-Aib-DAIFTQSYRKVLAQLSARKLLQDIMSRQQGESNQERGARARL",
    description:
      "CJC-1295 is a synthetic analog of growth hormone-releasing hormone (GHRH). Research studies its effects on growth hormone secretion, with particular interest in its extended half-life version (CJC-1295 with DAC).",
    halfLife: "~30 min (no DAC), ~6-8 days (with DAC)",
    researchAreas: ["GH secretion", "Body composition research", "Sleep studies", "Recovery research"],
    commonDoses: "1-2 mg/week (research protocols)",
    synonyms: ["Modified GRF 1-29"],
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    category: "Growth Hormone",
    molecularWeight: "711.85 g/mol",
    sequence: "Aib-His-D-2-Nal-D-Phe-Lys-NH2",
    description:
      "Ipamorelin is a selective growth hormone secretagogue and one of the most well-studied GHRPs. Research suggests it stimulates growth hormone release without significantly affecting cortisol or prolactin levels.",
    halfLife: "~2 hours",
    researchAreas: ["GH release", "Body composition", "Sleep quality research", "Recovery"],
    commonDoses: "200-300 mcg, 2-3x daily (research protocols)",
    synonyms: ["NNC 26-0161"],
  },
  {
    slug: "nad-plus",
    name: "NAD+",
    category: "Longevity",
    molecularWeight: "663.43 g/mol",
    sequence: "Nicotinamide Adenine Dinucleotide",
    description:
      "NAD+ (Nicotinamide Adenine Dinucleotide) is a coenzyme central to metabolism and cellular energy production. Research has expanded significantly in longevity science, focusing on its role in mitochondrial function and DNA repair.",
    halfLife: "Varies significantly by administration route",
    researchAreas: ["Longevity research", "Mitochondrial function", "DNA repair", "Metabolic health"],
    commonDoses: "50-300 mg (research protocols, IV/IM)",
    synonyms: ["Nicotinamide Adenine Dinucleotide", "Coenzyme I"],
  },
  {
    slug: "epithalon",
    name: "Epithalon",
    category: "Longevity",
    molecularWeight: "390.35 g/mol",
    sequence: "Ala-Glu-Asp-Gly",
    description:
      "Epithalon is a synthetic tetrapeptide developed from the natural pineal gland peptide epithalamin. Research focuses on its potential role in telomerase activation, circadian rhythm regulation, and longevity studies.",
    halfLife: "~20-30 minutes",
    researchAreas: ["Telomere research", "Circadian rhythm", "Pineal function", "Longevity studies"],
    commonDoses: "5-10 mg/day during cycles (research protocols)",
    synonyms: ["Epitalon", "Epithalamin synthetic"],
  },
  {
    slug: "selank",
    name: "Selank",
    category: "Nootropic",
    molecularWeight: "751.87 g/mol",
    sequence: "TKPRPGP",
    description:
      "Selank is a synthetic heptapeptide analog of tuftsin, developed in Russia. Research has investigated its potential anxiolytic and nootropic properties, particularly in stress-response studies.",
    halfLife: "~30 minutes intranasal",
    researchAreas: ["Anxiety research", "Cognitive studies", "Immunomodulation", "Stress response"],
    commonDoses: "250-500 mcg/day intranasal (research protocols)",
    synonyms: ["TP-7"],
  },
  {
    slug: "pt-141",
    name: "PT-141",
    category: "Melanocortin",
    molecularWeight: "1025.2 g/mol",
    sequence: "Ac-Nle-cyclo(Asp-His-D-Phe-Arg-Trp-Lys)-OH",
    description:
      "PT-141 (Bremelanotide) is a synthetic analog of alpha-melanocyte-stimulating hormone. Research has focused on its melanocortin receptor activity, particularly MC3R and MC4R pathways.",
    halfLife: "~2 hours",
    researchAreas: ["Melanocortin research", "Sexual health studies", "Appetite research"],
    commonDoses: "0.5-2 mg (research protocols)",
    synonyms: ["Bremelanotide", "PT141"],
  },
  {
    slug: "kpv",
    name: "KPV",
    category: "Immune",
    molecularWeight: "412.53 g/mol",
    sequence: "Lys-Pro-Val",
    description:
      "KPV is a tripeptide derived from alpha-melanocyte-stimulating hormone. Research has explored its anti-inflammatory and immunomodulatory properties, particularly in gastrointestinal inflammation studies.",
    halfLife: "~30 minutes",
    researchAreas: ["Anti-inflammatory", "GI research", "Autoimmune studies", "Skin research"],
    commonDoses: "200-500 mcg/day (research protocols)",
    synonyms: ["Lysine-Proline-Valine"],
  },
];

export function getPeptide(slug: string): Peptide | undefined {
  return peptides.find((p) => p.slug === slug);
}

/**
 * Map a peptide display name (e.g. "BPC-157", "NAD+") to its URL slug.
 * Returns undefined if the peptide isn't in the library.
 */
export function getPeptideSlug(name: string): string | undefined {
  const normalized = name.toLowerCase().trim();
  const p = peptides.find(
    (p) =>
      p.name.toLowerCase() === normalized ||
      p.slug === normalized ||
      p.synonyms.some((s) => s.toLowerCase() === normalized)
  );
  return p?.slug;
}

// Return vendors that sell a given peptide, sorted by score
export function getVendorsForPeptide(peptideName: string) {
  return vendors
    .filter((v) => v.peptideCatalog.some((p) => p.toLowerCase() === peptideName.toLowerCase()))
    .sort((a, b) => b.score - a.score);
}
