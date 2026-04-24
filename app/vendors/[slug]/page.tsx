import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Globe,
  ExternalLink,
  Shield,
  FlaskConical,
  Star,
  ThumbsUp,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Award,
  MessageSquare,
  ShieldCheck,
  Bookmark,
  Share2,
  FileText,
  Zap,
  AlertTriangle,
  BarChart3,
  Target,
  Activity,
  Droplets,
} from "lucide-react";
import { vendors, getVendor } from "@/lib/vendors";
import { getPeptideSlug } from "@/lib/peptides";
import { computeVendorMetrics } from "@/lib/scrapers/scoring";
import { getVendorGrades, GRADE_VALUES } from "@/lib/scrapers/finnrick";
import VendorDetailClient from "./client";
import WriteReviewButton from "./review-button";

export function generateStaticParams() {
  return vendors.map((v) => ({ slug: v.slug }));
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const pillarLabels = {
  coa: { label: "COA Verification", weight: "30%", color: "#10B981" },
  purity: { label: "Purity Testing", weight: "25%", color: "#34D399" },
  sentiment: { label: "Reddit Sentiment", weight: "20%", color: "#6EE7B7" },
  transparency: { label: "Transparency", weight: "15%", color: "#A7F3D0" },
  experience: { label: "Order Experience", weight: "10%", color: "#D1FAE5" },
};

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = getVendor(slug);
  if (!vendor) return notFound();

  const rank = vendors
    .slice()
    .sort((a, b) => b.score - a.score)
    .findIndex((v) => v.slug === slug) + 1;

  // Compute 12-metric trust dashboard
  const metrics = computeVendorMetrics(vendor);
  const finnrickGrades = getVendorGrades(vendor.slug);

  const avgRating =
    vendor.reviews.reduce((acc, r) => acc + r.rating, 0) / vendor.reviews.length;

  return (
    <div className="min-h-screen molecular-bg pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-12 relative z-10">
          {/* Back link */}
          <Link
            href="/#vendors"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All vendors
          </Link>

          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Large score circle */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40 animate-pulse-glow rounded-full">
                <svg width="160" height="160" className="-rotate-90">
                  <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="80" cy="80" r="72" fill="none"
                    stroke="url(#heroScoreGrad)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(vendor.score / 100) * 452.4} 452.4`}
                  />
                  <defs>
                    <linearGradient id="heroScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-white">{vendor.score}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">PVS Score</span>
                </div>
              </div>
            </div>

            {/* Vendor info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                  {vendor.name}
                </h1>
                {vendor.verified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald/10 border border-emerald/20 rounded-full text-xs text-emerald font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald" />
                  Rank #{rank}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {vendor.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Founded {vendor.founded}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {vendor.shipping} shipping
                </span>
              </div>

              <p className="text-gray-400 leading-relaxed max-w-2xl mb-6">
                {vendor.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/go/${vendor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow flex items-center gap-2 px-5 py-2.5 bg-emerald text-ink font-medium rounded-lg hover:bg-emerald-light"
                >
                  <Globe className="w-4 h-4" />
                  Visit Verified Source
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <VendorDetailClient slug={vendor.slug} name={vendor.name} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: "PVS Score", value: String(metrics.finalScore), color: "text-emerald" },
            { icon: FlaskConical, label: "Purity", value: vendor.purity, color: "text-white" },
            { icon: MessageSquare, label: "Sentiment", value: `${vendor.sentiment}%`, color: "text-emerald" },
            { icon: Zap, label: "Consistency", value: String(metrics.consistencyIndex), color: metrics.consistencyIndex >= 80 ? "text-emerald" : "text-yellow-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 bg-ink-2 border border-white/10 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trust Analytics — 12-metric dashboard */}
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald" />
                Trust Analytics
              </h2>

              {/* Top row: Final score + key metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-ink rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Final PVS</p>
                  <p className="text-2xl font-bold text-emerald">{metrics.finalScore}</p>
                  {metrics.riskAdjustment < 0 && (
                    <p className="text-[10px] text-red-400">Risk: {metrics.riskAdjustment}</p>
                  )}
                </div>
                <div className="p-3 bg-ink rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Consistency</p>
                  <p className="text-2xl font-bold text-white">{metrics.consistencyIndex}</p>
                  <p className="text-[10px] text-gray-500">
                    {metrics.consistencyIndex >= 90 ? "⚡ Highly Stable" : metrics.consistencyIndex >= 70 ? "📈 Stable" : "⚠ Volatile"}
                  </p>
                </div>
                <div className="p-3 bg-ink rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">30d Trend</p>
                  <div className="flex items-center justify-center gap-1">
                    {metrics.trend30d > 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald" />
                    ) : metrics.trend30d < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-500" />
                    )}
                    <p className={`text-2xl font-bold ${metrics.trend30d > 0 ? "text-emerald" : metrics.trend30d < 0 ? "text-red-400" : "text-gray-400"}`}>
                      {metrics.trend30d > 0 ? "+" : ""}{metrics.trend30d}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-ink rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Liquidity</p>
                  <p className="text-2xl font-bold text-white">{metrics.liquidityScore}</p>
                  <p className="text-[10px] text-gray-500">{metrics.alternativeVendors} alternatives</p>
                </div>
              </div>

              {/* Event risk warning */}
              {metrics.eventRisk && (
                <div className="mb-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <p className="text-sm text-yellow-400">{metrics.eventRisk}</p>
                </div>
              )}

              {/* Risk flags */}
              {metrics.riskFlags.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Risk Flags</p>
                  {metrics.riskFlags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-red-400">{flag.description}</span>
                      <span className="ml-auto text-xs text-red-400/60">{flag.penalty}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Defect rate */}
              {metrics.defectRate !== null && (
                <div className="mb-4 p-3 bg-ink rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Defect Rate (Finnrick D/E grades)</span>
                    <span className={`text-sm font-bold ${
                      metrics.defectRate <= 3 ? "text-emerald" :
                      metrics.defectRate <= 10 ? "text-yellow-400" :
                      "text-red-400"
                    }`}>
                      {metrics.defectRate}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-ink-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        metrics.defectRate <= 3 ? "bg-emerald" :
                        metrics.defectRate <= 10 ? "bg-yellow-400" :
                        "bg-red-400"
                      }`}
                      style={{ width: `${Math.min(100, metrics.defectRate * 4)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {metrics.defectCount} of {metrics.totalTested} tested batches
                  </p>
                </div>
              )}

              {/* Pillar breakdown (compact) */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Pillar Scores</p>
                <div className="space-y-2.5">
                  {Object.entries(pillarLabels).map(([key, info]) => {
                    const score = vendor.pillars[key as keyof typeof vendor.pillars];
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{info.label} ({info.weight})</span>
                          <span className="text-xs font-semibold text-white">{score}</span>
                        </div>
                        <div className="h-1.5 bg-ink rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${score}%`, backgroundColor: info.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Peer ranks */}
              {metrics.peerRanks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Peer Ranking</p>
                  <div className="flex flex-wrap gap-2">
                    {metrics.peerRanks.slice(0, 6).map((pr) => (
                      <span
                        key={pr.peptide}
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          pr.rank === 1
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : pr.rank <= 3
                            ? "bg-emerald/10 text-emerald border-emerald/20"
                            : "bg-ink-3 text-gray-400 border-white/5"
                        }`}
                      >
                        {pr.peptide}: #{pr.rank}/{pr.total}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Finnrick Grades */}
            {finnrickGrades.length > 0 && (
              <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald" />
                  Finnrick Independent Test Results
                </h2>
                <p className="text-xs text-gray-500 mb-5">
                  Letter grades from{" "}
                  <a href="https://finnrick.com" target="_blank" rel="noopener noreferrer" className="text-emerald hover:text-emerald-light">
                    finnrick.com
                  </a>
                  {" "}— independent peptide testing
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {finnrickGrades.map((g) => {
                    const gradeColor =
                      g.grade === "A" ? "bg-emerald/20 text-emerald border-emerald/30" :
                      g.grade === "B" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      g.grade === "C" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      g.grade === "D" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30";
                    const peptideLink = getPeptideSlug(g.peptideSlug) || getPeptideSlug(g.peptideSlug.replace(/-/g, " "));
                    return (
                      <div key={g.peptideSlug} className="p-3 bg-ink rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          {peptideLink ? (
                            <Link href={`/peptides/${peptideLink}`} className="text-xs text-white font-medium hover:text-emerald transition-colors">
                              {g.peptideSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </Link>
                          ) : (
                            <span className="text-xs text-white font-medium">
                              {g.peptideSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          )}
                          <span className={`text-lg font-bold px-2 py-0.5 rounded-md border ${gradeColor}`}>
                            {g.grade}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">{g.gradeLabel} · Rank #{g.rankInPeptide}</p>
                        {g.badges.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {g.badges.map((b) => (
                              <span key={b} className={`text-[9px] px-1.5 py-0.5 rounded ${
                                b === "premium" ? "bg-emerald/10 text-emerald" :
                                b === "fraud_warning" ? "bg-red-500/10 text-red-400" :
                                "bg-ink-3 text-gray-500"
                              }`}>
                                {b === "premium" ? "🏆 Premium" : b === "fraud_warning" ? "⚠ Warning" : b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <a
                  href={`https://finnrick.com/vendors`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs text-emerald hover:text-emerald-light transition-colors"
                >
                  View on Finnrick <ExternalLink className="w-3 h-3" />
                </a>
              </section>
            )}

            {/* Recent COAs */}
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald" />
                Recent COAs
                <span className="ml-auto text-xs text-gray-500">
                  {vendor.coaCount} total
                </span>
              </h2>
              <div className="space-y-2">
                {vendor.recentCOAs.map((coa) => {
                  const peptideSlug = getPeptideSlug(coa.peptide);
                  return (
                    <div
                      key={coa.batchId}
                      className="flex items-center justify-between p-3 bg-ink rounded-lg hover:bg-ink-3/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-emerald" />
                        </div>
                        <div>
                          {peptideSlug ? (
                            <Link
                              href={`/peptides/${peptideSlug}`}
                              className="text-sm text-white font-medium hover:text-emerald transition-colors"
                            >
                              {coa.peptide}
                            </Link>
                          ) : (
                            <p className="text-sm text-white font-medium">{coa.peptide}</p>
                          )}
                          <p className="text-xs text-gray-500 font-mono">{coa.batchId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{coa.method}</span>
                        <span className="text-sm text-emerald font-medium">{coa.purity}</span>
                        <span className="text-xs text-gray-400 hidden sm:inline">{coa.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reviews */}
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald" />
                  Community Reviews
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(avgRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-700"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-300">
                      {avgRating.toFixed(1)} ({vendor.reviews.length})
                    </span>
                  </div>
                  <WriteReviewButton vendorSlug={vendor.slug} vendorName={vendor.name} />
                </div>
              </div>
              <div className="space-y-4">
                {vendor.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-ink rounded-lg border border-white/5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white">
                            {review.title}
                          </h4>
                          {review.verified && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald/10 text-emerald text-[10px] rounded font-medium">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{review.author}</span>
                          <span>&middot;</span>
                          <span>{formatReviewDate(review.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">
                      {review.body}
                    </p>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Finnrick summary card */}
            {metrics.finnrickSummary && (
              <section className="p-6 bg-ink-2 border border-emerald/10 rounded-xl">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald" />
                  Finnrick Grade
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-emerald font-mono tracking-wider">
                    {metrics.finnrickSummary}
                  </span>
                </div>
                {metrics.finnrickNumericScore !== null && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Numeric: {metrics.finnrickNumericScore}/100</span>
                    <span>&middot;</span>
                    <a
                      href="https://finnrick.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald hover:text-emerald-light inline-flex items-center gap-0.5"
                    >
                      Verified by Finnrick <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </section>
            )}

            {/* Peptide catalog */}
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald" />
                Peptide Catalog
              </h3>
              <div className="flex flex-wrap gap-2">
                {vendor.peptideCatalog.map((p) => {
                  const slug = getPeptideSlug(p);
                  return slug ? (
                    <Link
                      key={p}
                      href={`/peptides/${slug}`}
                      className="px-2.5 py-1 bg-emerald/5 text-emerald text-xs rounded-full border border-emerald/10 hover:bg-emerald/15 hover:border-emerald/30 transition-all"
                    >
                      {p}
                    </Link>
                  ) : (
                    <span
                      key={p}
                      className="px-2.5 py-1 bg-emerald/5 text-emerald/60 text-xs rounded-full border border-emerald/10"
                    >
                      {p}
                    </span>
                  );
                })}
              </div>
            </section>

            {/* Score history */}
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald" />
                Score History
              </h3>
              <div className="flex items-end gap-1 h-24 mb-2">
                {vendor.scoreHistory.map((val, i) => {
                  const max = Math.max(...vendor.scoreHistory);
                  const min = Math.min(...vendor.scoreHistory) - 5;
                  const h = ((val - min) / (max - min)) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-emerald/30 hover:bg-emerald/60 transition-colors cursor-default relative group"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-emerald opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>13 months ago</span>
                <span>Today</span>
              </div>
            </section>

            {/* Testing methods */}
            <section className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald" />
                Testing Methods
              </h3>
              <div className="space-y-2">
                {[
                  { name: "HPLC", desc: "High-Performance Liquid Chromatography", active: vendor.tags.includes("HPLC") },
                  { name: "MS", desc: "Mass Spectrometry", active: vendor.tags.includes("MS") },
                  { name: "COA", desc: "Certificate of Analysis", active: vendor.tags.includes("COA") || vendor.verified },
                ].map((m) => (
                  <div
                    key={m.name}
                    className={`flex items-start gap-3 p-2 rounded-lg ${
                      m.active ? "" : "opacity-40"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        m.active ? "text-emerald" : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm text-white font-medium">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
