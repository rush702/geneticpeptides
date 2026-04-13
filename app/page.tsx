"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  FileCheck,
  Microscope,
  TrendingUp,
  Users,
  Search,
  X,
  GitCompareArrows,
  ChevronDown,
  MapPin,
  Clock,
  FlaskConical,
  MessageSquare,
  Command,
  AlertTriangle,
  Ban,
  TestTubes,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { vendors, type Vendor } from "@/lib/vendors";
import { getActiveAlerts, type VendorAlert } from "@/app/actions/alerts";

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
    description: "Zero affiliate links. Zero commissions. No paid placements. Rankings based on data alone.",
  },
];

/* ─── Sort options ─── */
type SortKey = "score" | "purity" | "name" | "sentiment";
const sortOptions: { key: SortKey; label: string }[] = [
  { key: "score", label: "PVS Score" },
  { key: "purity", label: "Purity" },
  { key: "name", label: "Name" },
  { key: "sentiment", label: "Sentiment" },
];

/* ─── Filter options ─── */
const tagFilters = ["All", "HPLC", "MS", "COA"];

/* ─── Fallback alert (used when Supabase table doesn't exist yet) ─── */
const fallbackAlerts: VendorAlert[] = [
  {
    id: "fallback-1",
    vendor_name: "PeptideGains.com",
    vendor_slug: "peptidegains",
    alert_type: "shutdown",
    severity: "critical",
    headline: "Vendor Shutdown Alert — Active",
    summary:
      "PeptideGains.com is ceasing operations on May 15, 2026. Customers with open orders should contact them immediately.",
    banner_text: "PeptideGains.com is shutting down May 15, 2026.",
    alternatives: ["Ascension Peptides", "Limitless Life Nootropics", "Peptide Partners"],
    link: "/blog/vendor-shutdown-peptidegains",
    link_text: "View full alert & transfer guide",
    is_active: true,
    published_at: "2026-04-12T00:00:00Z",
    expires_at: null,
    created_at: "2026-04-12T00:00:00Z",
  },
];

/* ─── Trust badges ─── */
const trustBadges = [
  { icon: Ban, label: "Zero affiliate links" },
  { icon: Ban, label: "Zero commissions" },
  { icon: TestTubes, label: "6,102 Lab Tests" },
  { icon: MessageSquare, label: "2.4M Reddit Posts" },
  { icon: RefreshCw, label: "24h Data Refresh" },
  { icon: FlaskConical, label: "Finnrick Certified" },
];

/* ─── Score circle ─── */
function ScoreCircle({ score }: { score: number }) {
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r="22" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 138.2} 138.2`}
          className="drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
        {score}
      </span>
    </div>
  );
}

/* ─── Compare bar stat ─── */
function CompareStat({
  label,
  values,
  best,
  format,
}: {
  label: string;
  values: (string | number)[];
  best: number;
  format?: (v: string | number) => string;
}) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `120px repeat(${values.length}, 1fr)` }}>
      <div className="text-sm text-gray-500 flex items-center">{label}</div>
      {values.map((v, i) => (
        <div
          key={i}
          className={`text-center text-sm font-medium py-2 rounded-lg ${
            i === best
              ? "text-emerald bg-emerald/10 border border-emerald/20"
              : "text-gray-300 bg-ink border border-white/5"
          }`}
        >
          {format ? format(v) : v}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOMEPAGE
   ═══════════════════════════════════════════════ */
export default function HomePage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [tagFilter, setTagFilter] = useState("All");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<VendorAlert[]>(fallbackAlerts);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch alerts from Supabase (falls back to hardcoded if table doesn't exist)
  useEffect(() => {
    getActiveAlerts().then((alerts) => {
      if (alerts.length > 0) {
        setActiveAlerts(alerts);
      }
      // If empty, keep fallback alerts
    });
  }, []);

  // Cmd+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (e.key === "Escape") {
        searchRef.current?.blur();
        setSearchFocused(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Filter + sort vendors
  const filtered = useMemo(() => {
    let list = [...vendors];

    // Text search
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          v.specialties.some((s) => s.toLowerCase().includes(q)) ||
          v.location.toLowerCase().includes(q)
      );
    }

    // Tag filter
    if (tagFilter !== "All") {
      list = list.filter((v) => v.tags.includes(tagFilter));
    }

    // Verified only
    if (showVerifiedOnly) {
      list = list.filter((v) => v.verified);
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.score - a.score;
        case "purity":
          return parseFloat(b.purity) - parseFloat(a.purity);
        case "name":
          return a.name.localeCompare(b.name);
        case "sentiment":
          return b.sentiment - a.sentiment;
        default:
          return 0;
      }
    });

    return list;
  }, [query, sortBy, tagFilter, showVerifiedOnly]);

  // Compare vendors
  const compareVendors = useMemo(
    () => vendors.filter((v) => compareList.includes(v.slug)),
    [compareList]
  );

  const toggleCompare = (slug: string) => {
    setCompareList((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 3
        ? [...prev, slug]
        : prev
    );
  };

  const findBest = (key: keyof Vendor) => {
    let bestIdx = 0;
    compareVendors.forEach((v, i) => {
      const curr = typeof v[key] === "string" ? parseFloat(v[key] as string) : (v[key] as number);
      const best = typeof compareVendors[bestIdx][key] === "string"
        ? parseFloat(compareVendors[bestIdx][key] as string)
        : (compareVendors[bestIdx][key] as number);
      if (curr > best) bestIdx = i;
    });
    return bestIdx;
  };

  return (
    <div className="min-h-screen molecular-bg">
      {/* ─── Top Alert Banner ─── */}
      {activeAlerts.length > 0 && (
        <div className={`border-b ${
          activeAlerts[0].severity === "critical"
            ? "bg-gradient-to-r from-red-900/80 via-red-800/70 to-red-900/80 border-red-500/30"
            : activeAlerts[0].severity === "warning"
            ? "bg-gradient-to-r from-yellow-900/60 via-yellow-800/50 to-yellow-900/60 border-yellow-500/30"
            : "bg-gradient-to-r from-blue-900/60 via-blue-800/50 to-blue-900/60 border-blue-500/30"
        }`}>
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
              activeAlerts[0].severity === "critical" ? "text-yellow-400" : "text-yellow-500"
            }`} />
            <span className="text-gray-200">
              <strong className="text-white">Notice:</strong>{" "}
              {activeAlerts[0].banner_text || `${activeAlerts[0].vendor_name} — ${activeAlerts[0].headline}`}
            </span>
            {activeAlerts[0].link && (
              <Link
                href={activeAlerts[0].link}
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                See recommended alternatives and transition guide
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-emerald/10 border border-blue-500/20 rounded-full mb-8">
            <span className="text-sm text-blue-400 font-medium">AI-POWERED</span>
            <span className="text-gray-600">&middot;</span>
            <span className="text-sm text-emerald font-medium">INDEPENDENT</span>
            <span className="text-gray-600">&middot;</span>
            <span className="text-sm text-emerald font-medium">TRANSPARENT</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-2">
            Know Before You Buy.
          </h1>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-gradient">Rank Before You&apos;re Ranked.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The only independent peptide vendor ranking engine — powered by real lab data, community intelligence, and AI-verified COAs. Zero affiliate links. Zero commissions. Refreshed every 24 hours.
          </p>

          {/* ─── Hero Search Bar ─── */}
          <div className="max-w-xl mx-auto mb-6">
            <div
              className={`relative group transition-all duration-300 ${
                searchFocused
                  ? "ring-2 ring-emerald/40 shadow-lg shadow-emerald-glow"
                  : ""
              } rounded-xl`}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald transition-colors" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={`Search ${vendors.length} vendors, peptides, or COAs...`}
                className="w-full pl-12 pr-24 py-4 bg-ink-2 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30 transition-all text-base"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-ink-3 border border-white/10 rounded-md text-[11px] text-gray-500">
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="#vendors"
              className="btn-glow px-8 py-4 bg-emerald text-white font-semibold text-lg rounded-xl hover:bg-emerald-light inline-flex items-center gap-2"
            >
              Search
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              href="/for-vendors"
              className="px-8 py-4 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Claim Your Listing
            </Link>
          </div>

          {/* ─── Vendor Alert Cards ─── */}
          {activeAlerts.map((alert) => {
            const isShutdown = alert.alert_type === "shutdown";
            const isCritical = alert.severity === "critical";
            const cardBg = isCritical
              ? "bg-red-950/40 border-red-500/30"
              : alert.severity === "warning"
              ? "bg-yellow-950/30 border-yellow-500/30"
              : "bg-blue-950/30 border-blue-500/30";
            const iconColor = isCritical ? "text-red-400" : alert.severity === "warning" ? "text-yellow-400" : "text-blue-400";
            const iconBg = isCritical ? "bg-red-500/20" : alert.severity === "warning" ? "bg-yellow-500/20" : "bg-blue-500/20";

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-xl mx-auto mb-4"
              >
                <div className={`p-5 border rounded-xl text-left ${cardBg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-bold mb-1.5 ${iconColor}`}>{alert.headline}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-2">
                        {alert.summary}
                        {alert.alternatives.length > 0 && (
                          <> Top-ranked alternatives: {alert.alternatives.join(", ")}.</>
                        )}
                      </p>
                      {alert.link && (
                        <Link
                          href={alert.link}
                          className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                        >
                          {alert.link_text || "View full alert"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* ─── Trust Badges ─── */}
          <div className="max-w-2xl mx-auto p-4 bg-ink-2/50 border border-white/5 rounded-xl">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {trustBadges.map((badge, i) => (
                <span key={badge.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <badge.icon className="w-3.5 h-3.5 text-gray-500" />
                  {badge.label}
                  {i < trustBadges.length - 1 && <span className="text-gray-700 ml-4">&middot;</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Vendors ─── */}
      <section id="vendors" className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Vendor Rankings
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Top Verified Vendors
            </h2>
          </div>

          {/* ─── Toolbar: filters + sort + compare toggle ─── */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            {/* Left: tag filters */}
            <div className="flex flex-wrap items-center gap-2">
              {tagFilters.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tag)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tagFilter === tag
                      ? "bg-emerald/20 text-emerald border border-emerald/30"
                      : "bg-ink-2 text-gray-500 border border-white/5 hover:border-white/10 hover:text-gray-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showVerifiedOnly
                    ? "bg-emerald/20 text-emerald border border-emerald/30"
                    : "bg-ink-2 text-gray-500 border border-white/5 hover:border-white/10 hover:text-gray-300"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Only
              </button>
            </div>

            {/* Right: sort + compare button */}
            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="appearance-none bg-ink-2 border border-white/10 text-gray-300 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-emerald/30 cursor-pointer"
                >
                  {sortOptions.map((o) => (
                    <option key={o.key} value={o.key}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Compare toggle */}
              {compareList.length >= 2 && (
                <button
                  onClick={() => setCompareOpen(true)}
                  className="btn-glow flex items-center gap-2 px-4 py-2 bg-emerald text-white text-sm font-medium rounded-lg"
                >
                  <GitCompareArrows className="w-4 h-4" />
                  Compare ({compareList.length})
                </button>
              )}
            </div>
          </div>

          {/* ─── Inline search (within vendor section) ─── */}
          <div className="relative mb-6 md:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter vendors..."
              className="w-full pl-10 pr-4 py-2.5 bg-ink-2 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
            />
          </div>

          {/* ─── Vendor grid ─── */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No vendors found</p>
              <p className="text-gray-600 text-sm">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setTagFilter("All");
                  setShowVerifiedOnly(false);
                }}
                className="mt-4 text-emerald text-sm hover:text-emerald-light transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((v) => {
                  const isSelected = compareList.includes(v.slug);
                  return (
                    <motion.div
                      key={v.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`card-glow group bg-ink-2 border rounded-xl relative ${
                        isSelected
                          ? "border-emerald/40 ring-1 ring-emerald/20"
                          : "border-white/5"
                      }`}
                    >
                      {/* Compare checkbox */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleCompare(v.slug);
                        }}
                        className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-emerald border-emerald text-white"
                            : "border-white/10 text-transparent hover:border-white/30 hover:text-gray-600"
                        }`}
                        title={
                          isSelected
                            ? "Remove from compare"
                            : compareList.length >= 3
                            ? "Max 3 vendors"
                            : "Add to compare"
                        }
                      >
                        <GitCompareArrows className="w-3.5 h-3.5" />
                      </button>

                      <Link href={`/vendors/${v.slug}`} className="block p-6">
                      <div className="flex items-start justify-between mb-4 pr-8">
                        <div>
                          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-emerald transition-colors">
                            {v.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            {v.verified && (
                              <span className="flex items-center gap-1 text-xs text-emerald">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" /> {v.location}
                            </span>
                          </div>
                        </div>
                        <ScoreCircle score={v.score} />
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Purity</p>
                          <p className="text-sm font-medium text-white">{v.purity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">COAs</p>
                          <p className="text-sm font-medium text-white">{v.coaCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Sentiment</p>
                          <p className="text-sm font-medium text-white">{v.sentiment}%</p>
                        </div>
                      </div>

                      {/* Tags + shipping */}
                      <div className="flex items-center justify-between">
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
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" /> {v.shipping}
                        </span>
                      </div>

                      {/* Specialties */}
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex flex-wrap gap-1.5">
                          {v.specialties.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-2 py-0.5 bg-ink-3 text-gray-400 rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Results count */}
          {filtered.length > 0 && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Showing {filtered.length} of {vendors.length} vendors
              {query && (
                <>
                  {" "}matching &ldquo;<span className="text-gray-400">{query}</span>&rdquo;
                </>
              )}
            </p>
          )}
        </div>
      </section>

      {/* ─── Features ─── */}
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

      {/* ─── CTA ─── */}
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

      {/* ─── Compare Panel (slide-up overlay) ─── */}
      <AnimatePresence>
        {compareOpen && compareVendors.length >= 2 && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompareOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 modal-overlay"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 top-[10vh] md:inset-x-[10vw] z-[61] bg-ink-2 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                    <GitCompareArrows className="w-5 h-5 text-emerald" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-white">
                      Compare Vendors
                    </h2>
                    <p className="text-sm text-gray-500">
                      Side-by-side comparison of {compareVendors.length} vendors
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCompareOpen(false)}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Vendor names + scores header */}
                <div
                  className="grid gap-4 mb-2"
                  style={{ gridTemplateColumns: `120px repeat(${compareVendors.length}, 1fr)` }}
                >
                  <div />
                  {compareVendors.map((v) => (
                    <div key={v.slug} className="text-center">
                      <div className="flex justify-center mb-2">
                        <ScoreCircle score={v.score} />
                      </div>
                      <h3 className="text-sm font-semibold text-white">{v.name}</h3>
                      {v.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="h-px bg-white/5" />

                {/* Comparison rows */}
                <CompareStat
                  label="PVS Score"
                  values={compareVendors.map((v) => v.score)}
                  best={findBest("score")}
                />
                <CompareStat
                  label="Purity"
                  values={compareVendors.map((v) => v.purity)}
                  best={findBest("purity")}
                />
                <CompareStat
                  label="Sentiment"
                  values={compareVendors.map((v) => v.sentiment)}
                  best={findBest("sentiment")}
                  format={(v) => `${v}%`}
                />
                <CompareStat
                  label="COAs"
                  values={compareVendors.map((v) => v.coaCount)}
                  best={findBest("coaCount")}
                />
                <CompareStat
                  label="Shipping"
                  values={compareVendors.map((v) => v.shipping)}
                  best={(() => {
                    let b = 0;
                    compareVendors.forEach((v, i) => {
                      if (parseInt(v.shipping) < parseInt(compareVendors[b].shipping)) b = i;
                    });
                    return b;
                  })()}
                />
                <CompareStat
                  label="Location"
                  values={compareVendors.map((v) => v.location)}
                  best={-1}
                />
                <CompareStat
                  label="Founded"
                  values={compareVendors.map((v) => v.founded)}
                  best={(() => {
                    let b = 0;
                    compareVendors.forEach((v, i) => {
                      if (parseInt(v.founded) < parseInt(compareVendors[b].founded)) b = i;
                    });
                    return b;
                  })()}
                />

                <div className="h-px bg-white/5" />

                {/* Testing methods */}
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `120px repeat(${compareVendors.length}, 1fr)` }}
                >
                  <div className="text-sm text-gray-500 flex items-center">Methods</div>
                  {compareVendors.map((v) => (
                    <div key={v.slug} className="flex flex-wrap gap-1.5 justify-center">
                      {v.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 bg-emerald/10 text-emerald rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Specialties */}
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `120px repeat(${compareVendors.length}, 1fr)` }}
                >
                  <div className="text-sm text-gray-500 flex items-center">Specialties</div>
                  {compareVendors.map((v) => (
                    <div key={v.slug} className="flex flex-wrap gap-1 justify-center">
                      {v.specialties.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 bg-ink-3 text-gray-400 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => {
                    setCompareList([]);
                    setCompareOpen(false);
                  }}
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Clear comparison
                </button>
                <button
                  onClick={() => setCompareOpen(false)}
                  className="px-4 py-2 bg-emerald/10 border border-emerald/20 text-emerald text-sm font-medium rounded-lg hover:bg-emerald/20 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Floating Compare Bar (when vendors selected but panel closed) ─── */}
      <AnimatePresence>
        {compareList.length > 0 && !compareOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-ink-2/95 backdrop-blur-xl border border-emerald/20 rounded-2xl shadow-xl shadow-black/30"
          >
            <GitCompareArrows className="w-4 h-4 text-emerald" />
            <span className="text-sm text-gray-300">
              <span className="text-white font-semibold">{compareList.length}</span>
              {" "}vendor{compareList.length > 1 ? "s" : ""} selected
            </span>

            {compareList.length >= 2 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="btn-glow px-4 py-1.5 bg-emerald text-white text-sm font-medium rounded-lg"
              >
                Compare
              </button>
            )}

            <button
              onClick={() => setCompareList([])}
              className="p-1 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
