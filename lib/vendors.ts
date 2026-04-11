export interface VendorReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
}

export interface VendorCOA {
  peptide: string;
  batchId: string;
  purity: string;
  date: string;
  method: string;
}

export interface Vendor {
  slug: string;
  name: string;
  score: number;
  purity: string;
  verified: boolean;
  tags: string[];
  coaCount: number;
  sentiment: number;
  shipping: string;
  founded: string;
  location: string;
  specialties: string[];
  description: string;
  website: string;
  pillars: {
    coa: number;
    sentiment: number;
    purity: number;
    transparency: number;
    experience: number;
  };
  peptideCatalog: string[];
  reviews: VendorReview[];
  recentCOAs: VendorCOA[];
  scoreHistory: number[];
}

function makeReviews(seed: string): VendorReview[] {
  // Deterministic mock reviews per vendor
  const templates = [
    { author: "ResearcherA", rating: 5, title: "Excellent purity", body: "Received my order in 3 days. The COA matched the product exactly and the peptide performed as expected in my assays." },
    { author: "LabUser42", rating: 5, title: "Reliable vendor", body: "Third order from them. Consistent quality across batches. Customer service is responsive to any questions about documentation." },
    { author: "BioPhD", rating: 4, title: "Good quality, decent price", body: "Purity was verified by independent HPLC. Slightly pricey compared to alternatives but the documentation quality justifies it." },
    { author: "MSResearcher", rating: 5, title: "MS data checks out", body: "Ran independent mass spec verification — the vendor's COA was accurate within 0.3 Da. Highly recommend for serious research." },
    { author: "PeptideFan", rating: 4, title: "Solid overall", body: "Packaging was discrete and professional. Peptide arrived intact. Minor issue with one batch but they replaced it without hassle." },
  ];
  const seedNum = seed.charCodeAt(0) + seed.charCodeAt(1);
  return templates.slice(0, 3 + (seedNum % 3)).map((t, i) => ({
    id: `${seed}-review-${i}`,
    ...t,
    verified: i % 2 === 0,
    helpful: 12 + (seedNum + i * 7) % 30,
    date: `2026-0${(3 + (i % 2))}-${String(5 + i * 4).padStart(2, "0")}`,
  }));
}

function makeCOAs(peptides: string[], purity: string): VendorCOA[] {
  return peptides.map((p, i) => ({
    peptide: p,
    batchId: `${p.substring(0, 3).toUpperCase()}-2026-${String(400 + i * 13).padStart(4, "0")}`,
    purity: `${(parseFloat(purity) - i * 0.2).toFixed(1)}%`,
    date: `Apr ${8 - i}, 2026`,
    method: i % 2 === 0 ? "HPLC + MS" : "HPLC",
  }));
}

function makeScoreHistory(currentScore: number): number[] {
  const history: number[] = [];
  let s = currentScore - 8;
  for (let i = 0; i < 12; i++) {
    history.push(Math.max(40, Math.min(100, s)));
    s += Math.floor(Math.random() * 3) - 0.2;
  }
  history.push(currentScore);
  return history.map(Math.round);
}

export const vendors: Vendor[] = [
  {
    slug: "novapeptides",
    name: "NovaPeptides",
    score: 96,
    purity: "99.4%",
    verified: true,
    tags: ["HPLC", "MS"],
    coaCount: 142,
    sentiment: 94,
    shipping: "2-3 days",
    founded: "2019",
    location: "USA",
    specialties: ["BPC-157", "TB-500", "Semaglutide"],
    description: "NovaPeptides is a research-grade peptide supplier based in the United States. Founded in 2019, they've built a reputation for consistent high-purity products, thorough third-party COA verification, and fast domestic shipping. All batches are tested by independent labs using HPLC and mass spectrometry.",
    website: "https://novapeptides.example.com",
    pillars: { coa: 98, sentiment: 94, purity: 99, transparency: 95, experience: 92 },
    peptideCatalog: ["BPC-157", "TB-500", "Semaglutide", "Tirzepatide", "GHK-Cu", "NAD+", "Epithalon", "CJC-1295", "Ipamorelin"],
    reviews: makeReviews("novapeptides"),
    recentCOAs: makeCOAs(["BPC-157", "TB-500", "Semaglutide", "Tirzepatide"], "99.4%"),
    scoreHistory: makeScoreHistory(96),
  },
  {
    slug: "peptideworks",
    name: "PeptideWorks",
    score: 93,
    purity: "98.8%",
    verified: true,
    tags: ["HPLC", "COA"],
    coaCount: 98,
    sentiment: 89,
    shipping: "3-5 days",
    founded: "2020",
    location: "USA",
    specialties: ["Tirzepatide", "GHK-Cu", "Selank"],
    description: "PeptideWorks specializes in research peptides with a focus on GLP-1 agonists and cognitive enhancers. Their transparent batch documentation and responsive customer support have earned them a strong reputation in the research community.",
    website: "https://peptideworks.example.com",
    pillars: { coa: 95, sentiment: 89, purity: 96, transparency: 90, experience: 88 },
    peptideCatalog: ["Tirzepatide", "GHK-Cu", "Selank", "Semax", "BPC-157", "AOD-9604"],
    reviews: makeReviews("peptideworks"),
    recentCOAs: makeCOAs(["Tirzepatide", "GHK-Cu", "Selank", "Semax"], "98.8%"),
    scoreHistory: makeScoreHistory(93),
  },
  {
    slug: "biosynth-labs",
    name: "BioSynth Labs",
    score: 91,
    purity: "99.1%",
    verified: true,
    tags: ["MS", "COA"],
    coaCount: 76,
    sentiment: 87,
    shipping: "2-4 days",
    founded: "2018",
    location: "USA",
    specialties: ["NAD+", "Epithalon", "CJC-1295"],
    description: "BioSynth Labs is an ISO-certified peptide research supplier with in-house HPLC testing and external mass spec verification. Established in 2018, they serve both academic and independent researchers.",
    website: "https://biosynthlabs.example.com",
    pillars: { coa: 94, sentiment: 87, purity: 98, transparency: 86, experience: 85 },
    peptideCatalog: ["NAD+", "Epithalon", "CJC-1295", "Ipamorelin", "BPC-157", "MOTS-c"],
    reviews: makeReviews("biosynth"),
    recentCOAs: makeCOAs(["NAD+", "Epithalon", "CJC-1295", "Ipamorelin"], "99.1%"),
    scoreHistory: makeScoreHistory(91),
  },
  {
    slug: "corepeptide",
    name: "CorePeptide",
    score: 89,
    purity: "98.5%",
    verified: true,
    tags: ["HPLC"],
    coaCount: 54,
    sentiment: 82,
    shipping: "3-5 days",
    founded: "2021",
    location: "USA",
    specialties: ["BPC-157", "Ipamorelin", "Sermorelin"],
    description: "CorePeptide is a newer entrant focused on value and fast shipping. While they only provide HPLC data on their COAs, their consistency and customer service have earned them a solid following.",
    website: "https://corepeptide.example.com",
    pillars: { coa: 88, sentiment: 82, purity: 93, transparency: 85, experience: 87 },
    peptideCatalog: ["BPC-157", "Ipamorelin", "Sermorelin", "TB-500", "GHRP-6"],
    reviews: makeReviews("corepeptide"),
    recentCOAs: makeCOAs(["BPC-157", "Ipamorelin", "Sermorelin"], "98.5%"),
    scoreHistory: makeScoreHistory(89),
  },
  {
    slug: "amino-science",
    name: "Amino Science",
    score: 86,
    purity: "97.9%",
    verified: false,
    tags: ["COA"],
    coaCount: 31,
    sentiment: 78,
    shipping: "5-7 days",
    founded: "2022",
    location: "Canada",
    specialties: ["PT-141", "Melanotan II", "DSIP"],
    description: "Amino Science is a Canadian-based supplier focusing on less common research peptides. They offer COAs with HPLC data but haven't yet been fully verified through PepAssure's process.",
    website: "https://aminoscience.example.ca",
    pillars: { coa: 82, sentiment: 78, purity: 89, transparency: 75, experience: 80 },
    peptideCatalog: ["PT-141", "Melanotan II", "DSIP", "Tesamorelin", "Hexarelin"],
    reviews: makeReviews("amino"),
    recentCOAs: makeCOAs(["PT-141", "Melanotan II", "DSIP"], "97.9%"),
    scoreHistory: makeScoreHistory(86),
  },
  {
    slug: "puresequence",
    name: "PureSequence",
    score: 84,
    purity: "98.2%",
    verified: false,
    tags: ["HPLC", "MS"],
    coaCount: 43,
    sentiment: 75,
    shipping: "4-6 days",
    founded: "2021",
    location: "EU",
    specialties: ["KPV", "LL-37", "Thymosin Alpha-1"],
    description: "PureSequence is a European supplier serving the EU market with focus on immunomodulatory peptides. They provide both HPLC and mass spec data on every COA.",
    website: "https://puresequence.example.eu",
    pillars: { coa: 85, sentiment: 75, purity: 90, transparency: 82, experience: 78 },
    peptideCatalog: ["KPV", "LL-37", "Thymosin Alpha-1", "Thymosin Beta-4", "LR3 IGF-1"],
    reviews: makeReviews("puresequence"),
    recentCOAs: makeCOAs(["KPV", "LL-37", "Thymosin Alpha-1"], "98.2%"),
    scoreHistory: makeScoreHistory(84),
  },
  {
    slug: "elitepep",
    name: "ElitePep",
    score: 82,
    purity: "97.6%",
    verified: false,
    tags: ["HPLC"],
    coaCount: 22,
    sentiment: 71,
    shipping: "5-8 days",
    founded: "2023",
    location: "USA",
    specialties: ["Retatrutide", "AOD-9604", "MOTS-c"],
    description: "ElitePep is a recent entrant specializing in novel research peptides including Retatrutide and other next-gen compounds. Still building their reputation and verification history.",
    website: "https://elitepep.example.com",
    pillars: { coa: 80, sentiment: 71, purity: 88, transparency: 78, experience: 75 },
    peptideCatalog: ["Retatrutide", "AOD-9604", "MOTS-c", "BPC-157", "TB-500"],
    reviews: makeReviews("elitepep"),
    recentCOAs: makeCOAs(["Retatrutide", "AOD-9604", "MOTS-c"], "97.6%"),
    scoreHistory: makeScoreHistory(82),
  },
  {
    slug: "peptidesource",
    name: "PeptideSource",
    score: 79,
    purity: "97.1%",
    verified: false,
    tags: ["COA"],
    coaCount: 18,
    sentiment: 68,
    shipping: "7-10 days",
    founded: "2022",
    location: "Canada",
    specialties: ["Selank", "Semax", "Dihexa"],
    description: "PeptideSource is a Canadian supplier with a focus on nootropic peptides. Limited documentation and longer shipping times have kept their score lower, but product quality has been consistent in limited testing.",
    website: "https://peptidesource.example.ca",
    pillars: { coa: 75, sentiment: 68, purity: 85, transparency: 72, experience: 70 },
    peptideCatalog: ["Selank", "Semax", "Dihexa", "Cerebrolysin", "P21"],
    reviews: makeReviews("peptidesource"),
    recentCOAs: makeCOAs(["Selank", "Semax", "Dihexa"], "97.1%"),
    scoreHistory: makeScoreHistory(79),
  },
];

export function getVendor(slug: string): Vendor | undefined {
  return vendors.find((v) => v.slug === slug);
}
