export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "guides" | "research" | "industry" | "updates";
  readTime: string;
  date: string;
  author: { name: string; role: string };
  featured?: boolean;
  content: string;
}

export const categories = [
  { key: "all", label: "All" },
  { key: "guides", label: "Guides" },
  { key: "research", label: "Research" },
  { key: "industry", label: "Industry" },
  { key: "updates", label: "Updates" },
] as const;

export const posts: BlogPost[] = [
  {
    slug: "pepassure-is-live",
    title: "PepAssure is Live: Why We Built the Trust Layer for Peptides",
    excerpt:
      "A father and son saw a broken market — vendors claiming 99% purity with no proof, researchers relying on Reddit threads. So they built the accountability layer.",
    category: "updates",
    readTime: "4 min",
    date: "2026-04-13",
    author: { name: "The PepAssure Team", role: "Founders" },
    featured: true,
    content: `
## The Problem

The research peptide market has no trust infrastructure. Vendors claim 99% purity, post screenshot COAs that could be from anywhere, and the only way to evaluate them is scrolling through Reddit threads hoping someone had a good experience.

That's not good enough.

## Why We Built PepAssure

We're a father and son who share the same birthday and a passion for all things good. When we looked at how researchers were choosing peptide vendors, we saw an industry running on blind trust. So we built the verification layer.

## How It Works

Every vendor on PepAssure is evaluated against the same 5-pillar scoring system:

- **COA Verification (30%)** — We cross-reference certificates of analysis against lab standards, historical data, and known formatting
- **Purity Testing (25%)** — HPLC and mass spectrometry results validated against industry benchmarks
- **Reddit Sentiment (20%)** — NLP analysis across r/Peptides, r/SARMs, and related communities with shill detection
- **Transparency (15%)** — Response times, documentation completeness, third-party testing availability
- **Order Experience (10%)** — Community reviews on shipping, packaging, and customer service

The result is a single PVS Score (0-100) that tells you how trustworthy a vendor actually is.

## What Makes Us Different

**No paid placements — ever.** Vendors can claim a free listing and upgrade for dashboard tools, but paying us never influences scores. Our methodology is fully public. Judge for yourself.

**Community-driven.** Our Most Wanted leaderboard lets researchers vote on which vendors get verified next. You decide the priorities.

**Real-time.** Scores update daily as new data flows in. Reddit sentiment is scraped every 6 hours. COAs are verified on upload.

## What's Next

We're just getting started. We want PepAssure to be the standard that researchers point to when they need to know: "Can I trust this vendor?"

Browse the rankings, check your vendor's score, or nominate one we haven't covered yet.

Bringing light, one action at a time.

— The PepAssure Team
    `,
  },
  {
    slug: "how-to-read-peptide-coa",
    title: "How to Read a Peptide Certificate of Analysis",
    excerpt:
      "A practical guide to understanding HPLC chromatograms, mass spec data, and purity percentages on vendor-issued COAs.",
    category: "guides",
    readTime: "8 min",
    date: "2026-04-08",
    author: { name: "Dr. Elena Marsh", role: "Chief Science Officer" },
    featured: true,
    content: `
## What Is a COA?

A Certificate of Analysis (COA) is a document issued by a manufacturer or third-party laboratory that confirms the identity, purity, and quality of a peptide product. Every reputable vendor should provide a COA for each batch they sell.

## Key Sections to Review

### 1. Peptide Identity

The COA should list the peptide's full name, sequence, molecular weight, and CAS number (if applicable). Cross-reference the stated molecular weight against known databases like PubChem or UniProt.

**Red flag:** If the molecular weight doesn't match the expected value for the peptide sequence, the product may be mislabeled or contaminated.

### 2. HPLC Purity

High-Performance Liquid Chromatography (HPLC) is the gold standard for measuring peptide purity. Look for:

- **Purity percentage** — 95% or above is acceptable for research; 98%+ is preferred
- **Chromatogram** — a clean, single dominant peak indicates high purity
- **Retention time** — should be consistent with the expected value for that peptide
- **Column and method details** — C18 columns with acetonitrile/water gradient are standard

### 3. Mass Spectrometry

Mass spec (MS) confirms the molecular identity. The observed mass should match the theoretical mass within ±1 Da. MALDI-TOF and ESI-MS are the most common methods.

### 4. Additional Tests

Some COAs include:
- **Amino acid analysis** — confirms the sequence composition
- **Endotoxin testing** — critical for injectable peptides
- **Sterility testing** — ensures no microbial contamination
- **Water content (Karl Fischer)** — important for lyophilized peptides

## How PepAssure Verifies COAs

Our automated pipeline cross-references vendor-submitted COAs against:
1. Expected molecular weights for the stated peptide
2. Historical HPLC profiles from our database
3. Known lab formatting standards
4. Batch consistency across multiple orders

We flag discrepancies and assign a COA Verification score as part of the PVS scoring system.

## Quick Checklist

- ✅ Peptide name and sequence match the product listing
- ✅ Purity ≥ 95% (preferably ≥ 98%)
- ✅ Mass spec confirms molecular weight (±1 Da)
- ✅ Chromatogram shows a single dominant peak
- ✅ Lab name and date are present on the document
- ✅ Batch number matches your order
- ❌ Blurry or clearly edited documents
- ❌ Missing lab details or dates
- ❌ Purity claims without supporting chromatogram
    `,
  },
  {
    slug: "pvs-scoring-methodology",
    title: "Inside the PVS Scoring System: Our 5-Pillar Methodology",
    excerpt:
      "A deep dive into how we calculate Peptide Verification Scores — from COA verification to Reddit sentiment analysis.",
    category: "research",
    readTime: "12 min",
    date: "2026-04-02",
    author: { name: "Marcus Chen", role: "Head of Data Science" },
    featured: true,
    content: `
## Overview

The Peptide Verification Score (PVS) is PepAssure's proprietary quality metric. It aggregates five independent data pillars into a single 0-100 score that reflects a vendor's overall reliability and product quality.

## The Five Pillars

### 1. COA Verification (30%)

The largest component. We evaluate:
- Consistency of COA data across batches
- Whether HPLC and MS data support the stated purity
- Lab accreditation and formatting standards
- Historical COA reliability

### 2. Purity Testing (25%)

We cross-reference reported purity values against:
- Industry averages for each peptide type
- Our internal testing database
- Third-party lab results when available

### 3. Reddit Sentiment (20%)

We aggregate mentions across r/Peptides, r/SARMs, r/ResearchChemicals, and related communities:
- NLP-based sentiment classification (positive, neutral, negative)
- Volume-weighted scoring — more mentions carry more weight
- Recency weighting — recent posts matter more
- Spam and shill detection filters

### 4. Vendor Transparency (15%)

How open and responsive a vendor is:
- Response time to PepAssure verification requests
- Completeness of public listing information
- Third-party lab testing availability
- Return/refund policy clarity

### 5. Order Experience (10%)

Aggregated from user-submitted reviews:
- Shipping speed and reliability
- Packaging quality
- Customer service responsiveness
- Order accuracy

## Score Calculation

Each pillar produces a 0-100 sub-score. The final PVS is a weighted average:

\`\`\`
PVS = (COA × 0.30) + (Purity × 0.25) + (Sentiment × 0.20) + (Transparency × 0.15) + (Experience × 0.10)
\`\`\`

Scores update daily as new data flows in.

## Score Tiers

- **90-100**: Exceptional — top-tier vendor with consistent quality
- **80-89**: Strong — reliable vendor with minor areas for improvement
- **70-79**: Average — acceptable but some concerns flagged
- **60-69**: Below Average — significant issues detected
- **Below 60**: Poor — major red flags, not recommended
    `,
  },
  {
    slug: "peptide-purity-testing-methods",
    title: "HPLC vs Mass Spec: Peptide Purity Testing Methods Compared",
    excerpt:
      "Understanding the strengths and limitations of different analytical methods used to verify peptide quality.",
    category: "research",
    readTime: "10 min",
    date: "2026-03-25",
    author: { name: "Dr. Elena Marsh", role: "Chief Science Officer" },
    content: `
## Introduction

Peptide purity testing is essential for ensuring product quality and safety. Two primary methods dominate the field: High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS). Each has distinct strengths.

## HPLC: The Purity Standard

HPLC separates components in a mixture and quantifies relative abundances. For peptides:

- **What it measures:** Relative purity as a percentage of total peak area
- **Strengths:** Quantitative, reproducible, widely standardized
- **Limitations:** Cannot confirm molecular identity; co-eluting impurities may inflate purity
- **Typical result:** "Purity: 98.5% by HPLC (C18 column, 220nm)"

## Mass Spectrometry: Identity Confirmation

MS determines molecular weight with high precision:

- **What it measures:** Exact molecular mass of the peptide
- **Strengths:** Confirms identity, detects truncations and modifications
- **Limitations:** Not inherently quantitative for purity
- **Typical result:** "Observed mass: 1182.3 Da (theoretical: 1182.3 Da)"

## Best Practice: Use Both

A credible COA should include both HPLC purity data and MS identity confirmation. HPLC alone can miss misidentified peptides; MS alone can miss low-purity batches.

## What PepAssure Looks For

We require vendors to submit COAs with both HPLC and MS data. Our verification pipeline:
1. Validates HPLC purity ≥ 95%
2. Confirms MS mass matches theoretical (±1 Da)
3. Checks for suspicious patterns (identical chromatograms across different peptides, etc.)
    `,
  },
  {
    slug: "state-of-peptide-market-2026",
    title: "State of the Peptide Market: 2026 Trends and Outlook",
    excerpt:
      "Market analysis covering GLP-1 agonists, regulatory changes, vendor consolidation, and quality standardization efforts.",
    category: "industry",
    readTime: "7 min",
    date: "2026-03-18",
    author: { name: "Jordan Hayes", role: "Market Analyst" },
    content: `
## Market Overview

The research peptide market continues to evolve rapidly in 2026, driven by interest in GLP-1 agonists, longevity research, and increasing regulatory scrutiny.

## Key Trends

### 1. GLP-1 Demand Surge

Semaglutide and tirzepatide remain the most-requested peptides, with research demand growing 300% year-over-year. This has driven vendor expansion and price competition.

### 2. Quality Standardization

The industry is moving toward standardized quality metrics. PepAssure's PVS scoring system is being referenced by an increasing number of researchers and forums as a baseline quality check.

### 3. Regulatory Landscape

Several jurisdictions have tightened regulations around peptide sales. Vendors with strong COA documentation and transparent practices are best positioned to navigate this environment.

### 4. Vendor Consolidation

Smaller vendors without consistent quality documentation are losing market share to verified, established suppliers. The top 10 vendors now account for an estimated 65% of research peptide sales.

## Outlook

We expect continued growth in demand, further quality standardization, and increasing importance of third-party verification services like PepAssure.
    `,
  },
  {
    slug: "pepassure-q1-2026-update",
    title: "PepAssure Q1 2026: Platform Updates and New Features",
    excerpt:
      "Recap of everything we shipped in Q1 — vendor dashboard, compare tools, enterprise features, and what's next.",
    category: "updates",
    readTime: "5 min",
    date: "2026-04-01",
    author: { name: "Alex Rivera", role: "Product Lead" },
    content: `
## Q1 2026 Highlights

### Vendor Dashboard

We launched a comprehensive vendor dashboard with:
- PVS score breakdown with 5-pillar visualization
- COA management with upload and verification tracking
- Competitor benchmarking (Pro+ plans)
- Activity feed and notification preferences

### Search & Compare Tools

The homepage now features:
- Instant search across vendor names, peptides, tags, and locations
- Keyboard shortcut (Cmd+K) for power users
- Side-by-side vendor comparison (up to 3 vendors)
- Advanced filtering and sorting

### Admin Panel

Internal tools for our team:
- Claims management with approve/reject workflow
- Vendor tier administration
- Platform analytics

### Enterprise Features

New capabilities for Enterprise subscribers:
- REST API access with webhook support
- SSO/SAML integration
- White-label verification reports
- Bulk batch COA verification

## What's Next in Q2

- Real-time COA monitoring with automated alerts
- Reddit sentiment dashboard improvements
- Mobile app beta
- International vendor expansion
    `,
  },
  {
    slug: "choosing-peptide-vendor",
    title: "How to Choose a Peptide Vendor: A Researcher's Checklist",
    excerpt:
      "Practical criteria for evaluating peptide suppliers — from COA quality to shipping reliability and community reputation.",
    category: "guides",
    readTime: "6 min",
    date: "2026-03-10",
    author: { name: "Dr. Elena Marsh", role: "Chief Science Officer" },
    content: `
## Before You Order

Choosing a peptide vendor is a critical decision that directly impacts your research quality. Here's what to evaluate:

## The Checklist

### ✅ 1. COA Quality

- Does the vendor provide a COA for every batch?
- Does the COA include both HPLC purity and mass spec data?
- Is the COA from an accredited lab?

### ✅ 2. Purity Standards

- Is the stated purity ≥ 95% for research grade?
- Are purity claims supported by chromatogram data?

### ✅ 3. Third-Party Verification

- Is the vendor listed and verified on PepAssure?
- What is their PVS score?

### ✅ 4. Community Reputation

- Check r/Peptides and related forums
- Look for consistent positive feedback over time
- Be wary of vendors with only recent, suspiciously positive reviews

### ✅ 5. Transparency

- Clear contact information and business address
- Published return/refund policy
- Responsive customer service

### ✅ 6. Shipping & Handling

- Appropriate cold-chain shipping for temperature-sensitive peptides
- Discrete packaging
- Domestic vs. international shipping options

### ✅ 7. Pricing

- Competitive but not suspiciously cheap
- Bulk pricing available
- Clear pricing without hidden fees

## Red Flags

- ❌ No COA available or "COA available upon request" only
- ❌ Identical COAs across different peptides or batches
- ❌ No verifiable business information
- ❌ Prices significantly below market average
- ❌ Aggressive marketing with medical claims
    `,
  },
];
