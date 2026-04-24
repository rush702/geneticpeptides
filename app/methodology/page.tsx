import Link from "next/link";
import {
  Shield,
  FileCheck,
  MessageSquare,
  FlaskConical,
  Star,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  Eye,
  Zap,
  Target,
  BookOpen,
  Scale,
} from "lucide-react";

const pillars = [
  {
    icon: FileCheck,
    name: "COA Verification",
    weight: "30%",
    color: "#10B981",
    description:
      "The single largest factor in our scoring. Every vendor-submitted Certificate of Analysis is cross-referenced against lab databases, historical batch data, and our reference library of known HPLC/MS profiles.",
    checks: [
      "HPLC chromatogram validation (single dominant peak, purity ≥ 95%)",
      "Mass spectrometry identity confirmation (±1 Da tolerance)",
      "Lab accreditation and formatting standards",
      "Batch-to-batch consistency across multiple orders",
      "Cross-reference against peptide molecular weight databases",
      "Detection of duplicated or suspicious COA patterns",
    ],
  },
  {
    icon: FlaskConical,
    name: "Purity Testing",
    weight: "25%",
    color: "#34D399",
    description:
      "We aggregate multiple independent purity measurements: vendor-submitted data, third-party lab tests, and our own spot-check samples when available.",
    checks: [
      "Reported purity vs. industry averages for each peptide",
      "Independent verification via partner labs (for Pro+ tier)",
      "Historical purity trend analysis",
      "Correlation with HPLC method quality",
      "Detection of impurity outliers",
    ],
  },
  {
    icon: MessageSquare,
    name: "Reddit Sentiment",
    weight: "20%",
    color: "#6EE7B7",
    description:
      "Natural language processing aggregates community sentiment from r/Peptides, r/SARMs, r/ResearchChemicals, and related subreddits. Spam and shill detection filters remove promotional content.",
    checks: [
      "NLP-based sentiment classification (positive/neutral/negative)",
      "Volume-weighted scoring — more mentions matter more",
      "Recency weighting — recent posts carry more weight",
      "Shill detection via account history analysis",
      "Topic extraction for trend identification",
    ],
  },
  {
    icon: Star,
    name: "Vendor Transparency",
    weight: "15%",
    color: "#A7F3D0",
    description:
      "How open and responsive a vendor is to verification requests, customer inquiries, and independent testing.",
    checks: [
      "Response time to PepAssure verification requests",
      "Completeness of public listing information",
      "Third-party lab testing availability",
      "Return/refund policy clarity",
      "Public contact information",
      "Batch traceability",
    ],
  },
  {
    icon: Users,
    name: "Order Experience",
    weight: "10%",
    color: "#D1FAE5",
    description:
      "Aggregated feedback from the research community on the actual ordering experience — from checkout to delivery to support.",
    checks: [
      "Shipping speed and reliability",
      "Packaging quality and appropriate cold-chain handling",
      "Customer service responsiveness",
      "Order accuracy",
      "International shipping support",
    ],
  },
];

const scoreTiers = [
  { range: "90-100", label: "Exceptional", color: "bg-emerald/20 text-emerald border-emerald/30", description: "Top-tier vendor with consistent quality across all pillars. Typically verified for 12+ months." },
  { range: "80-89", label: "Strong", color: "bg-emerald/10 text-emerald-light border-emerald/20", description: "Reliable vendor with minor areas for improvement. Safe choice for most research." },
  { range: "70-79", label: "Average", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", description: "Acceptable but with some flagged concerns. Review the breakdown before ordering." },
  { range: "60-69", label: "Below Average", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", description: "Significant issues detected. Proceed with caution and independent verification." },
  { range: "< 60", label: "Poor", color: "bg-red-500/10 text-red-400 border-red-500/20", description: "Major red flags. Not recommended for research use." },
];

const principles = [
  { icon: Scale, title: "Independence", description: "We accept no money from vendors. Claiming a listing is free, and paid tiers only unlock dashboard tools — they never influence your score." },
  { icon: Eye, title: "Transparency", description: "The full scoring formula is public. Vendors can see exactly which factors affect their score and how to improve each one." },
  { icon: Database, title: "Data-Driven", description: "Every score component is measurable and reproducible. Subjective judgments are minimized through multi-source aggregation." },
  { icon: Zap, title: "Real-Time", description: "Scores update daily as new COAs, reviews, and community data flow in. Stale data points are weighted down over time." },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen molecular-bg pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <Shield className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">Methodology</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            How We Score <span className="text-gradient">Peptide Vendors</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The PVS (Peptide Verification Score) is a 0-100 quality metric built from 5 independent data pillars. Here&apos;s exactly how it works.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {/* The Formula */}
        <section className="py-16 border-b border-white/5">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              The Formula
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              5 Pillars, Weighted
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Each vendor earns a 0-100 sub-score on five independent pillars. The final PVS is a weighted average.
            </p>
          </div>

          {/* Formula display */}
          <div className="bg-ink-2 border border-white/10 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">PVS Score Formula</p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:text-base font-mono">
                <span className="text-emerald">PVS</span>
                <span className="text-gray-500">=</span>
                <span className="text-white">(COA × 0.30)</span>
                <span className="text-gray-400">+</span>
                <span className="text-white">(Purity × 0.25)</span>
                <span className="text-gray-400">+</span>
                <span className="text-white">(Sentiment × 0.20)</span>
                <span className="text-gray-400">+</span>
                <span className="text-white">(Transparency × 0.15)</span>
                <span className="text-gray-400">+</span>
                <span className="text-white">(Experience × 0.10)</span>
              </div>
            </div>
          </div>

          {/* Visual breakdown */}
          <div className="flex rounded-xl overflow-hidden h-3 mb-4">
            {pillars.map((p) => (
              <div
                key={p.name}
                style={{ width: p.weight, backgroundColor: p.color }}
                title={`${p.name} — ${p.weight}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-center">
            {pillars.map((p) => (
              <div key={p.name}>
                <div className="text-gray-300 font-medium">{p.name}</div>
                <div className="text-gray-400">{p.weight}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pillar Details */}
        <section className="py-16 space-y-12">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Pillar Breakdown
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              What Goes Into Each Score
            </h2>
          </div>

          {pillars.map((pillar, i) => (
            <div
              key={pillar.name}
              className="flex flex-col md:flex-row gap-6 p-6 bg-ink-2 border border-white/5 rounded-2xl"
            >
              {/* Icon + weight */}
              <div className="flex-shrink-0 md:w-48">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${pillar.color}15`, border: `1px solid ${pillar.color}33` }}
                >
                  <pillar.icon className="w-7 h-7" style={{ color: pillar.color }} />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-1">
                  {pillar.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-emerald">{pillar.weight}</span>
                  <span className="text-xs text-gray-500">of total score</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <p className="text-sm text-gray-400 leading-relaxed mb-5">
                  {pillar.description}
                </p>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  What we check
                </h4>
                <ul className="space-y-2">
                  {pillar.checks.map((check) => (
                    <li key={check} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
                      {check}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        {/* Score Tiers */}
        <section className="py-16 border-t border-white/5">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Score Tiers
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Interpreting Your Score
            </h2>
          </div>

          <div className="space-y-3">
            {scoreTiers.map((tier) => (
              <div
                key={tier.label}
                className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-ink-2 border border-white/5 rounded-xl"
              >
                <div className={`flex-shrink-0 w-full md:w-32 px-3 py-2 border rounded-lg text-center ${tier.color}`}>
                  <div className="text-xs opacity-80">Score</div>
                  <div className="text-lg font-bold">{tier.range}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white mb-1">{tier.label}</h3>
                  <p className="text-sm text-gray-400">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="py-16 border-t border-white/5">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Our Principles
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Why You Can Trust PVS
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {principles.map((p) => (
              <div
                key={p.title}
                className="card-glow p-6 bg-ink-2 border border-white/5 rounded-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-4">
                  <p.icon className="w-5 h-5 text-emerald" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Limitations */}
        <section className="py-16 border-t border-white/5">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Transparency
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              What PVS Does Not Measure
            </h2>
          </div>

          <div className="p-6 bg-ink-2 border border-yellow-500/10 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  PVS is an aggregate quality signal, not a substitute for your own due diligence. We explicitly don&apos;t measure:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Individual batch quality — always check the specific COA for your order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Therapeutic or safety claims — PVS is for research vendors only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Regulatory compliance in your jurisdiction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Price competitiveness — we focus purely on quality signals</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center border-t border-white/5">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to browse verified vendors?
          </h2>
          <p className="text-gray-400 mb-8">
            See all vendor rankings or dive into a specific peptide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-glow flex items-center gap-2 px-6 py-3 bg-emerald text-ink font-semibold rounded-xl hover:bg-emerald-light"
            >
              <TrendingUp className="w-4 h-4" />
              View Rankings
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/peptides"
              className="flex items-center gap-2 px-6 py-3 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <FlaskConical className="w-4 h-4" />
              Browse Peptides
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
