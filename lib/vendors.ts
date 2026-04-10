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
  },
];
