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
  /** True when the vendor has been seeded into the directory but not yet scored. */
  pending: boolean;
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
