import Link from "next/link";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  FileCheck,
  Microscope,
  TrendingUp,
  Users,
} from "lucide-react";

const vendors = [
  { name: "NovaPeptides", score: 96, purity: "99.4%", verified: true, tags: ["HPLC", "MS"] },
  { name: "PeptideWorks", score: 93, purity: "98.8%", verified: true, tags: ["HPLC", "COA"] },
  { name: "BioSynth Labs", score: 91, purity: "99.1%", verified: true, tags: ["MS", "COA"] },
  { name: "CorePeptide", score: 89, purity: "98.5%", verified: true, tags: ["HPLC"] },
  { name: "Amino Science", score: 86, purity: "97.9%", verified: false, tags: ["COA"] },
  { name: "PureSequence", score: 84, purity: "98.2%", verified: false, tags: ["HPLC", "MS"] },
];

const features = [
  {
    icon: FileCheck,
    title: "COA Verification",
    description: "Every certificate of analysis independently verified against lab standards.",
  },
  {
    icon: BarChart3,
    title: "PVS Scoring",
    description: "Proprietary 5-pillar scoring system updated in real time.",
  },
  {
    icon: Microscope,
    title: "Purity Testing",
    description: "HPLC and mass spec data cross-referenced for accuracy.",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "Track vendor quality over time with historical data.",
  },
  {
    icon: Users,
    title: "Community Reviews",
    description: "Aggregated Reddit sentiment and user feedback.",
  },
  {
    icon: Shield,
    title: "Independent & Unbiased",
    description: "No paid placements. Rankings based on data alone.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen molecular-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-8">
            <Shield className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">
              Independent Peptide Verification
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Trust, <span className="text-gradient">Verified</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Unbiased peptide vendor rankings powered by COA verification, purity testing, and community sentiment. No paid placements — ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#vendors"
              className="btn-glow px-8 py-4 bg-emerald text-white font-semibold text-lg rounded-xl hover:bg-emerald-light inline-flex items-center gap-2"
            >
              Browse Vendors
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/for-vendors"
              className="px-8 py-4 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Claim Your Listing
            </Link>
          </div>
        </div>
      </section>

      {/* Vendors */}
      <section id="vendors" className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Vendor Rankings
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Top Verified Vendors
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map((v) => (
              <div
                key={v.name}
                className="card-glow group p-6 bg-ink-2 border border-white/5 rounded-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">
                      {v.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {v.verified && (
                        <span className="flex items-center gap-1 text-xs text-emerald">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Score circle */}
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg width="56" height="56" className="-rotate-90">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle
                        cx="28" cy="28" r="22" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${(v.score / 100) * 138.2} 138.2`}
                        className="drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                      {v.score}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Purity: <span className="text-white font-medium">{v.purity}</span>
                  </span>
                  <div className="flex gap-1.5">
                    {v.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 bg-emerald/10 text-emerald rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Our Platform
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Data-Driven Verification
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-glow group p-6 bg-ink-2 border border-white/5 rounded-xl cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-4 group-hover:bg-emerald/20 group-hover:scale-110 transition-all duration-300">
                  <f.icon className="w-6 h-6 text-emerald" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="p-12 bg-ink-2 border border-white/10 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Are You a Vendor?
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Claim your free listing, get verified, and let your quality speak for itself.
              </p>
              <Link
                href="/for-vendors"
                className="btn-glow inline-flex items-center gap-2 px-8 py-4 bg-emerald text-white font-semibold text-lg rounded-xl hover:bg-emerald-light"
              >
                Claim Your Listing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
