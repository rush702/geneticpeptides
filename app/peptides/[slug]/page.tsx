import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FlaskConical,
  Clock,
  Dna,
  BookOpen,
  Shield,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Info,
} from "lucide-react";
import { peptides, getPeptide, getVendorsForPeptide } from "@/lib/peptides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const peptide = getPeptide(slug);
  if (!peptide) return { title: "Peptide Not Found | PepAssure" };
  const vendors = getVendorsForPeptide(peptide.name);
  const description = `Compare ${vendors.length} verified vendor${vendors.length !== 1 ? "s" : ""} selling ${peptide.name}. Independent PVS scores, COA verification, and purity data. Research-grade sourcing guide.`;
  return {
    title: `${peptide.name} — Verified Vendors & Research Info | PepAssure`,
    description,
    openGraph: {
      title: `${peptide.name} | PepAssure`,
      description,
      type: "website",
      url: `https://pepassure.com/peptides/${slug}`,
    },
    alternates: {
      canonical: `https://pepassure.com/peptides/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return peptides.map((p) => ({ slug: p.slug }));
}

export default async function PeptideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const peptide = getPeptide(slug);
  if (!peptide) return notFound();

  const vendors = getVendorsForPeptide(peptide.name);

  return (
    <div className="min-h-screen molecular-bg pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        {/* Back link */}
        <Link
          href="/peptides"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All peptides
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-2.5 py-1 text-xs font-medium bg-emerald/10 text-emerald rounded-full border border-emerald/20">
              {peptide.category}
            </span>
            <span className="text-xs text-gray-500">Research Peptide</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {peptide.name}
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-3xl">
            {peptide.description}
          </p>
          {peptide.synonyms.length > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              Also known as: {peptide.synonyms.join(", ")}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Technical info */}
          <div className="lg:col-span-2 space-y-6">
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Dna className="w-5 h-5 text-emerald" />
                Technical Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-ink rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Molecular Weight</p>
                  <p className="text-sm text-white font-mono">{peptide.molecularWeight}</p>
                </div>
                <div className="p-4 bg-ink rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Half-Life</p>
                  <p className="text-sm text-white">{peptide.halfLife}</p>
                </div>
                <div className="p-4 bg-ink rounded-lg sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sequence</p>
                  <p className="text-sm text-emerald font-mono break-all">{peptide.sequence}</p>
                </div>
                <div className="p-4 bg-ink rounded-lg sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Common Research Doses</p>
                  <p className="text-sm text-white">{peptide.commonDoses}</p>
                </div>
              </div>
            </section>

            {/* Research areas */}
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald" />
                Research Areas
              </h2>
              <div className="flex flex-wrap gap-2">
                {peptide.researchAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1.5 bg-emerald/5 text-emerald text-sm rounded-full border border-emerald/10"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400/80 leading-relaxed">
                For research purposes only. PepAssure provides vendor information as a verification service and does not endorse or recommend any specific use. Consult qualified research protocols and institutional review boards.
              </p>
            </div>
          </div>

          {/* Right: Vendors */}
          <div>
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl sticky top-24">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald" />
                Available From
                <span className="ml-auto text-xs text-gray-500">
                  {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}
                </span>
              </h3>

              {vendors.length === 0 ? (
                <p className="text-sm text-gray-500">No verified vendors currently sell this peptide.</p>
              ) : (
                <div className="space-y-2">
                  {vendors.map((v, i) => (
                    <Link
                      key={v.slug}
                      href={`/vendors/${v.slug}`}
                      className="group flex items-center gap-3 p-3 bg-ink rounded-lg hover:bg-ink-3/50 transition-all"
                    >
                      {/* Rank */}
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          i === 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : i === 1
                            ? "bg-gray-400/20 text-gray-300"
                            : i === 2
                            ? "bg-amber-700/20 text-amber-500"
                            : "bg-ink-3 text-gray-500"
                        }`}
                      >
                        {i + 1}
                      </span>

                      {/* Mini score circle */}
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <svg width="40" height="40" className="-rotate-90">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                          <circle
                            cx="20" cy="20" r="16" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={`${(v.score / 100) * 100.5} 100.5`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {v.score}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-emerald transition-colors truncate">
                          {v.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {v.verified && (
                            <span className="flex items-center gap-0.5 text-emerald">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {v.location}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-white/5">
                Ranked by PVS Score — our independent verification quality metric.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
