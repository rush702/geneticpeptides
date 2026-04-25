import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  MessageSquare,
  Eye,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Welcome to PepAssure",
  description:
    "The first independent peptide vendor verification platform. 5-pillar scoring, no paid placements, fully transparent methodology.",
};

const pillars = [
  { icon: FlaskConical, name: "COA Verification", weight: "30%", desc: "Cross-referenced against lab standards and historical data" },
  { icon: Shield, name: "Purity Testing", weight: "25%", desc: "HPLC and mass spectrometry results validated" },
  { icon: MessageSquare, name: "Reddit Sentiment", weight: "20%", desc: "NLP analysis with shill detection across 8 subreddits" },
  { icon: Eye, name: "Transparency", weight: "15%", desc: "Response times, documentation, third-party testing" },
  { icon: Star, name: "Order Experience", weight: "10%", desc: "Community reviews on shipping, packaging, service" },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen molecular-bg pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <Shield className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">Independent &middot; Transparent &middot; Free</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            The Trust Layer for{" "}
            <span className="text-gradient">Peptide Research</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-4">
            Independent vendor verification with a 5-pillar scoring system.
            No paid placements — ever. Full methodology is public.
          </p>

          <p className="text-sm text-gray-500 mb-10">
            Built by a small team with a passion for doing things right. Bringing light, one action at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-glow px-8 py-4 bg-emerald text-ink font-semibold text-lg rounded-xl hover:bg-emerald-light flex items-center gap-2"
            >
              Browse Vendor Rankings
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/most-wanted"
              className="px-8 py-4 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Vote on Most Wanted
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Pillars */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-center font-display text-2xl md:text-3xl font-bold text-white mb-10">
            How We Score Vendors
          </h2>
          <div className="space-y-4">
            {pillars.map((p) => (
              <div key={p.name} className="flex items-start gap-4 p-4 bg-ink-2 border border-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center flex-shrink-0">
                  <p.icon className="w-5 h-5 text-emerald" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    <span className="text-xs text-emerald font-medium">{p.weight}</span>
                  </div>
                  <p className="text-sm text-gray-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 text-center mb-12">
            <div>
              <div className="text-3xl font-bold text-gradient mb-1">148+</div>
              <div className="text-sm text-gray-500">Vendors Scored</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-1">12,400+</div>
              <div className="text-sm text-gray-500">COAs Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient mb-1">$0</div>
              <div className="text-sm text-gray-500">To Use</div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              "No paid placements — scores are based on data, not dollars",
              "Full methodology is public — judge for yourself",
              "Community-driven nominations — you decide who gets verified next",
              "Scores update daily with fresh data from Reddit, labs, and reviews",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to check your vendor?
          </h2>
          <p className="text-gray-400 mb-8">
            Search rankings, compare vendors side-by-side, or nominate one we haven&apos;t covered.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-glow flex items-center gap-2 px-8 py-4 bg-emerald text-ink font-semibold rounded-xl hover:bg-emerald-light"
            >
              <Shield className="w-5 h-5" />
              Browse Rankings
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/for-vendors"
              className="flex items-center gap-2 px-8 py-4 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition-all"
            >
              <Users className="w-4 h-4" />
              Are You a Vendor? Claim Free Listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
