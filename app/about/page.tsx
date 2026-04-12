import Link from "next/link";
import {
  Shield,
  Scale,
  Eye,
  Database,
  Zap,
  Users,
  Target,
  Heart,
  Award,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const values = [
  {
    icon: Scale,
    title: "Independent",
    description:
      "We accept no payment from vendors in exchange for rankings. Paid tiers unlock dashboard tools, but never influence scores.",
  },
  {
    icon: Eye,
    title: "Transparent",
    description:
      "Our full scoring methodology is public. Vendors know exactly what moves their score — and so do researchers.",
  },
  {
    icon: Database,
    title: "Data-Driven",
    description:
      "Every score component is measurable. We aggregate COAs, lab results, community sentiment, and order experience into a single metric.",
  },
  {
    icon: Heart,
    title: "Researcher-First",
    description:
      "We exist to help researchers find vendors they can trust. Every decision we make prioritizes research quality over growth metrics.",
  },
];

const team = [
  { name: "Dr. Elena Marsh", role: "Chief Science Officer", bio: "Former analytical chemist with 12 years of experience in peptide purity testing and mass spectrometry." },
  { name: "Marcus Chen", role: "Head of Data Science", bio: "Built the PVS scoring pipeline and NLP systems. Previously at a biotech data analytics firm." },
  { name: "Alex Rivera", role: "Product Lead", bio: "Focused on researcher experience and building tools that actually get used. Former research platform PM." },
  { name: "Jordan Hayes", role: "Market Analyst", bio: "Tracks industry trends, vendor consolidation, and regulatory changes across global peptide markets." },
];

const milestones = [
  { year: "2024", title: "Founded", description: "Started as a Google Doc ranking peptide vendors. Grew into a research community favorite." },
  { year: "2025", title: "PVS v1 Launched", description: "First data-driven scoring system published with 5-pillar methodology." },
  { year: "2026 Q1", title: "Platform Launch", description: "Full vendor dashboard, claim system, and API for enterprise researchers." },
  { year: "2026 Q2", title: "API Access", description: "Public verification API for labs, forums, and research platforms." },
];

const stats = [
  { value: "148+", label: "Vendors verified" },
  { value: "12,400+", label: "COAs analyzed" },
  { value: "5", label: "Scoring pillars" },
  { value: "0", label: "Paid placements" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen molecular-bg pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <Shield className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">About PepAssure</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            The Trust Infrastructure for the{" "}
            <span className="text-gradient">Peptide Economy</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We built PepAssure because the peptide industry is evolving from gray market to mainstream medicine — and whoever owns the verification layer shapes the future.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {/* Mission */}
        <section className="py-16 border-b border-white/5">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Our Mission
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              Make Quality Verifiable
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-4 text-gray-400 leading-relaxed">
            <p>
              The research peptide market grew faster than its quality infrastructure. Vendors claim 99% purity, publish screenshots instead of COAs, and community forums cycle through hot takes faster than evidence can catch up. Meanwhile, researchers are left comparing Reddit threads to make critical sourcing decisions.
            </p>
            <p>
              We built PepAssure to fix that. Every vendor listed on our platform is evaluated against the same five-pillar scoring system — from COA verification to community sentiment to order experience. The full methodology is public. The data is updated daily. And we take no money from the vendors we rank.
            </p>
            <p className="text-white">
              Our goal is simple: <strong className="text-emerald">researchers should be able to trust what they order</strong>.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 border-b border-white/5">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Our Values
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              What We Stand For
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="card-glow p-6 bg-ink-2 border border-white/5 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-emerald" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-b border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  {s.value}
                </div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="py-16 border-b border-white/5">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Who We Are
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              The Team
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex items-start gap-4 p-5 bg-ink-2 border border-white/5 rounded-xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-emerald">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{member.name}</h3>
                  <p className="text-xs text-emerald mb-2">{member.role}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 border-b border-white/5">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Our Story
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Milestones
            </h2>
          </div>
          <div className="relative max-w-2xl mx-auto space-y-8">
            <div className="absolute top-0 left-[15px] w-0.5 h-full bg-gradient-to-b from-emerald via-emerald/40 to-transparent" />
            {milestones.map((m, i) => (
              <div key={m.year} className="relative flex gap-6 pl-1">
                <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-ink-2 border-2 border-emerald flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald" />
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-xs text-emerald font-semibold uppercase tracking-wider mb-1">
                    {m.year}
                  </p>
                  <h3 className="text-base font-semibold text-white mb-1">{m.title}</h3>
                  <p className="text-sm text-gray-400">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to explore?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Browse vendor rankings, read our methodology, or get in touch with the team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-glow flex items-center gap-2 px-6 py-3 bg-emerald text-white font-semibold rounded-xl hover:bg-emerald-light"
            >
              <TrendingUp className="w-4 h-4" />
              Browse Vendors
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
