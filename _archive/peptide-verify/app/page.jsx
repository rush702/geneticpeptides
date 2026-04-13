import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Moon, Sun, ExternalLink, Bookmark, FlaskConical, BarChart3, MessageCircle, RefreshCw, ShieldCheck, Check, Star, AlertTriangle, ArrowRight, Menu, X, Mail, ChevronRight, Zap, Database, Brain, TestTube, Award } from "lucide-react";

/* ─── Mock Data ─── */
const VENDORS = [
  { rank: 1, name: "Ascension Peptides", location: "USA", flag: "🇺🇸", verified: true, pvsScore: 96.2, purity: 98, repute: 94, customerService: 95, coa: 97, reddit: 93, peptides: ["BPC-157", "TB-500", "Semaglutide"], description: "Premium US-based vendor with Finnrick-verified purity and fast shipping.", finnrick: true },
  { rank: 2, name: "PureRawz", location: "USA", flag: "🇺🇸", verified: true, pvsScore: 93.8, purity: 96, repute: 92, customerService: 91, coa: 95, reddit: 90, peptides: ["PT-141", "Ipamorelin", "CJC-1295"], description: "Established vendor with extensive product catalog and consistent lab results.", finnrick: true },
  { rank: 3, name: "Peptide Sciences", location: "USA", flag: "🇺🇸", verified: false, pvsScore: 91.5, purity: 94, repute: 90, customerService: 88, coa: 93, reddit: 89, peptides: ["GHK-Cu", "BPC-157", "Melanotan II"], description: "⚠️ Shut down March 2026. Historical data preserved for reference.", finnrick: true, shutdown: true },
  { rank: 4, name: "Bio Peptides UK", location: "UK", flag: "🇬🇧", verified: true, pvsScore: 90.1, purity: 93, repute: 88, customerService: 90, coa: 91, reddit: 86, peptides: ["TB-500", "Sermorelin", "AOD-9604"], description: "Top-rated European vendor with rapid UK/EU delivery and HPLC-verified COAs.", finnrick: false },
  { rank: 5, name: "Paradigm Peptides", location: "USA", flag: "🇺🇸", verified: true, pvsScore: 88.7, purity: 91, repute: 87, customerService: 89, coa: 88, reddit: 85, peptides: ["KPV", "Thymosin Alpha-1", "DSIP"], description: "Reliable mid-tier vendor known for niche peptides and educational content.", finnrick: true },
  { rank: 6, name: "AusPeptides", location: "AU", flag: "🇦🇺", verified: true, pvsScore: 87.3, purity: 90, repute: 85, customerService: 87, coa: 89, reddit: 82, peptides: ["BPC-157", "CJC/Ipamorelin", "MK-677"], description: "Australia's highest-rated research peptide supplier with local lab verification.", finnrick: false },
];

const PILLARS = [
  { key: "purity", label: "Purity", weight: "30%", color: "emerald" },
  { key: "repute", label: "Reputation", weight: "25%", color: "blue" },
  { key: "customerService", label: "Service", weight: "15%", color: "violet" },
  { key: "coa", label: "COA", weight: "20%", color: "amber" },
  { key: "reddit", label: "Reddit", weight: "10%", color: "orange" },
];

const STEPS = [
  { icon: Database, title: "Daily Crawl", desc: "Automated scraping of 350+ vendor sites, pricing, and product catalogs every 24 hours." },
  { icon: FlaskConical, title: "AI COA Parsing", desc: "Machine learning extracts purity %, impurity profiles, and HPLC data from uploaded COAs." },
  { icon: Brain, title: "Reddit BERT Sentiment", desc: "NLP model analyzes 2.4M+ posts from r/Peptides, r/SARMs, and related communities." },
  { icon: TestTube, title: "Finnrick Lab Integration", desc: "Direct API feed from Finnrick testing lab for independent third-party purity verification." },
  { icon: Award, title: "Weighted PVS Score™", desc: "Composite score combining all 5 pillars with transparent, published weights." },
];

const TESTIMONIALS = [
  { quote: "Finally a site that actually tests this stuff — Ascension scores check out. Saved me from ordering from a vendor that turned out to be underdosed.", user: "u/ResearcherX", sub: "r/Peptides" },
  { quote: "The COA parser caught a fake certificate from a vendor I almost ordered from. This tool is genuinely saving people money.", user: "u/LabRat_92", sub: "r/Peptides" },
  { quote: "I run a small research lab and we use PeptideVerify before every bulk order. The Finnrick integration is incredibly useful.", user: "u/PeptidePioneer", sub: "r/ResearchChemicals" },
];

/* ─── Pillar Bar Component ─── */
function PillarBar({ value, colorClass }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-700/50 dark:bg-gray-700/50 light-bg-gray-200 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass} transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  );
}

const pillarColors = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
};

/* ─── Score Circle ─── */
function ScoreCircle({ score, size = "lg" }) {
  const sizeClasses = size === "lg" ? "w-16 h-16 text-xl" : "w-12 h-12 text-base";
  const color = score >= 90 ? "text-emerald-400 border-emerald-500/40" : score >= 80 ? "text-blue-400 border-blue-500/40" : "text-amber-400 border-amber-500/40";
  return (
    <div className={`${sizeClasses} ${color} rounded-full border-2 flex items-center justify-center font-mono font-bold bg-black/20`}>
      {score.toFixed(1)}
    </div>
  );
}

/* ─── Vendor Card ─── */
function VendorCard({ vendor, dark }) {
  const [hovered, setHovered] = useState(false);
  const rankBadge = vendor.rank === 1 ? "🥇" : vendor.rank === 2 ? "🥈" : vendor.rank === 3 ? "🥉" : `#${vendor.rank}`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-xl border transition-all duration-300 ${
        dark
          ? "bg-gray-900/80 border-gray-700/60 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
          : "bg-white border-gray-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
      } ${hovered ? "transform -translate-y-1" : ""} ${vendor.shutdown ? "opacity-60" : ""}`}
    >
      {vendor.shutdown && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          SHUT DOWN
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{rankBadge}</span>
            <ScoreCircle score={vendor.pvsScore} />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-bold text-lg ${dark ? "text-white" : "text-gray-900"}`}>{vendor.name}</h3>
          <span className="text-sm">{vendor.flag}</span>
          {vendor.verified && (
            <span className="flex items-center gap-0.5 text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        <p className={`text-sm mb-3 ${dark ? "text-gray-400" : "text-gray-500"}`}>{vendor.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {vendor.peptides.map((p) => (
            <span key={p} className={`text-xs px-2 py-0.5 rounded-full ${dark ? "bg-blue-500/10 text-blue-300 border border-blue-500/20" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
              {p}
            </span>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          {PILLARS.map((p) => (
            <div key={p.key} className="flex items-center gap-2">
              <span className={`text-xs w-16 ${dark ? "text-gray-500" : "text-gray-400"}`}>{p.label}</span>
              <div className="flex-1">
                <PillarBar value={vendor[p.key]} colorClass={pillarColors[p.color]} />
              </div>
              <span className={`text-xs font-mono w-6 text-right ${dark ? "text-gray-400" : "text-gray-500"}`}>{vendor[p.key]}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-700/30">
          {vendor.finnrick && (
            <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <FlaskConical className="w-3 h-3" /> Finnrick Results
            </a>
          )}
          <div className="flex-1" />
          {!vendor.shutdown && (
            <>
              <button className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 ${dark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                <Bookmark className="w-3 h-3" /> Save
              </button>
              <a href="#" className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-1">
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page Component ─── */
export default function PeptideVerifyHomepage() {
  const [dark, setDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bg = dark ? "bg-[#0A1428]" : "bg-gray-50";
  const text = dark ? "text-white" : "text-gray-900";
  const textMuted = dark ? "text-gray-400" : "text-gray-500";
  const cardBg = dark ? "bg-gray-900/60" : "bg-white";
  const borderColor = dark ? "border-gray-700/50" : "border-gray-200";

  const filters = ["All", "USA", "Europe", "Australia", "Verified Only"];

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-300`}>
      {/* ═══ Background Texture ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className={`absolute inset-0 w-full h-full ${dark ? "opacity-[0.03]" : "opacity-[0.02]"}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mol-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill={dark ? "#10B981" : "#3B82F6"} />
              <line x1="30" y1="30" x2="60" y2="0" stroke={dark ? "#10B981" : "#3B82F6"} strokeWidth="0.5" />
              <line x1="30" y1="30" x2="0" y2="60" stroke={dark ? "#10B981" : "#3B82F6"} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mol-grid)" />
        </svg>
      </div>

      {/* ═══ 1. STICKY HEADER ═══ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? (dark ? "bg-[#0A1428]/95 backdrop-blur-xl shadow-lg shadow-black/20" : "bg-white/95 backdrop-blur-xl shadow-lg") : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">PeptideVerify</span>
              </div>
              <span className={`hidden sm:inline text-xs ${textMuted} border-l ${borderColor} pl-2 ml-1`}>AI-Verified Rankings</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { label: "Rankings", items: ["All Vendors", "USA", "Europe", "Australia", "Verified Only"] },
                { label: "Methodology" },
                { label: "Resources", items: ["Blog", "COA Guide", "Finnrick Explainer"] },
                { label: "For Vendors" },
                { label: "API" },
                { label: "About" },
              ].map((item) => (
                <div key={item.label} className="relative group">
                  <button className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${dark ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                    {item.label}
                    {item.items && <ChevronDown className="w-3 h-3 opacity-50" />}
                  </button>
                  {item.items && (
                    <div className={`absolute top-full left-0 mt-1 w-48 rounded-xl py-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${dark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
                      {item.items.map((sub) => (
                        <a key={sub} href="#" className={`block px-4 py-2 text-sm ${dark ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                          {sub}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${dark ? "bg-white/5 border-gray-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-400"}`}>
                <Search className="w-4 h-4" />
                <input type="text" placeholder="Search vendors..." className="bg-transparent text-sm outline-none w-40 placeholder:text-gray-500" />
              </div>
              <a href="#rankings" className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
                Browse All
              </a>
              <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg transition-colors ${dark ? "text-gray-400 hover:text-yellow-400 hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {/* Mobile menu */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Trust micro-signal */}
          <div className={`hidden sm:flex items-center gap-2 pb-2 text-xs ${textMuted}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Updated 3h 42m ago &bull; No paid placements
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t ${dark ? "bg-[#0A1428] border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="px-4 py-4 space-y-2">
              {["Rankings", "Methodology", "Resources", "For Vendors", "API", "About"].map((item) => (
                <a key={item} href="#" className={`block px-3 py-2 rounded-lg text-sm ${dark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"}`}>
                  {item}
                </a>
              ))}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mt-2 ${dark ? "bg-white/5 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
                <Search className="w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search vendors..." className="bg-transparent text-sm outline-none flex-1 placeholder:text-gray-500" />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══ 2. HERO SECTION ═══ */}
      <section className="relative pt-32 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Know Before You Buy.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                  Rank Before You're Ranked.
                </span>
              </h1>
              <p className={`text-lg sm:text-xl max-w-2xl ${textMuted}`}>
                Independent AI rankings of 350+ peptide research vendors. Daily updated with 6,102+ Finnrick lab tests, 2.4M Reddit posts, and AI-parsed COAs.
              </p>

              {/* Alert Box */}
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${dark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"}`}>
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-semibold ${dark ? "text-red-300" : "text-red-700"}`}>
                    Peptide Sciences &amp; Science.bio have shut down (March/Jan 2026).
                  </p>
                  <a href="#" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 mt-1">
                    View affected vendors <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Trust Bar */}
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { icon: Check, text: "No paid placements", color: "text-emerald-400" },
                  { icon: FlaskConical, text: "6,102 Lab Tests", color: "text-blue-400" },
                  { icon: BarChart3, text: "2.4M Reddit Posts", color: "text-violet-400" },
                  { icon: RefreshCw, text: "Updated every 24h", color: "text-amber-400" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-sm">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className={textMuted}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a href="#rankings" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30">
                  Browse All Rankings <ArrowRight className="w-4 h-4" />
                </a>
                <div className={`flex items-center rounded-xl border overflow-hidden ${dark ? "bg-white/5 border-gray-700" : "bg-white border-gray-200"}`}>
                  <div className="flex items-center gap-2 px-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-transparent text-sm outline-none py-3 w-40 placeholder:text-gray-500"
                    />
                  </div>
                  <button className="px-4 py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
                    Get Daily Alerts
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column — Dashboard Mockup */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className={`rounded-2xl border p-5 space-y-3 ${dark ? "bg-gray-900/80 border-gray-700/60 shadow-2xl shadow-black/30" : "bg-white border-gray-200 shadow-2xl"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${textMuted}`}>TOP VENDORS — LIVE</span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Updated
                  </span>
                </div>
                {VENDORS.slice(0, 3).map((v) => (
                  <div key={v.name} className={`flex items-center gap-3 p-3 rounded-xl border ${dark ? "bg-black/20 border-gray-800" : "bg-gray-50 border-gray-100"}`}>
                    <span className="text-lg">{v.rank === 1 ? "🥇" : v.rank === 2 ? "🥈" : "🥉"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{v.name}</span>
                        <span className="text-xs">{v.flag}</span>
                        {v.verified && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {PILLARS.map((p) => (
                          <div key={p.key} className="flex-1 h-1 rounded-full bg-gray-700/50 overflow-hidden">
                            <div className={`h-full rounded-full ${pillarColors[p.color]}`} style={{ width: `${v[p.key]}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{v.pvsScore}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. TOP VENDORS GRID ═══ */}
      <section id="rankings" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold">Top Peptide Research Vendors</h2>
              <p className={`mt-2 ${textMuted}`}>Updated every 4 hours &bull; Ranked by PVS Score™</p>
            </div>
            <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
              View full rankings <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === f
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : dark
                    ? "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    : "bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
            <div className="flex-1" />
            <select className={`px-3 py-2 rounded-lg text-sm border ${dark ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-600"}`}>
              <option>Highest Score</option>
              <option>Newest Data</option>
              <option>Price</option>
            </select>
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VENDORS.map((v) => (
              <VendorCard key={v.name} vendor={v} dark={dark} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. HOW IT WORKS / METHODOLOGY ═══ */}
      <section className={`py-16 sm:py-24 border-t border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">How PeptideVerify Scores Vendors</h2>
            <p className={`mt-3 max-w-2xl mx-auto ${textMuted}`}>
              Our transparent, 5-pillar methodology combines automated data collection with independent lab verification.
            </p>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-12">
            {STEPS.map((step, i) => (
              <div key={step.title} className={`relative p-5 rounded-xl border ${dark ? "bg-gray-900/60 border-gray-700/50" : "bg-white border-gray-200"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${dark ? "bg-emerald-500/10" : "bg-emerald-50"}`}>
                  <step.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div className={`absolute -top-3 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${dark ? "bg-emerald-600 text-white" : "bg-emerald-500 text-white"}`}>
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className={`text-sm ${textMuted}`}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Pillar Weights */}
          <div className={`rounded-2xl border p-6 sm:p-8 ${dark ? "bg-gray-900/60 border-gray-700/50" : "bg-white border-gray-200"}`}>
            <h3 className="font-bold text-lg mb-5 text-center">PVS Score™ Pillar Weights</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {PILLARS.map((p) => (
                <div key={p.key} className="flex flex-col items-center gap-2">
                  <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-bold text-lg ${
                    p.color === "emerald" ? "border-emerald-500 text-emerald-400" :
                    p.color === "blue" ? "border-blue-500 text-blue-400" :
                    p.color === "violet" ? "border-violet-500 text-violet-400" :
                    p.color === "amber" ? "border-amber-500 text-amber-400" :
                    "border-orange-500 text-orange-400"
                  } ${dark ? "bg-black/20" : "bg-gray-50"}`}>
                    {p.weight}
                  </div>
                  <span className={`text-sm font-medium ${textMuted}`}>{p.label}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1">
                Full Methodology <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. TRUST & SOCIAL PROOF ═══ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Built for Researchers, by Researchers</h2>
            <p className={`mt-3 max-w-2xl mx-auto ${textMuted}`}>
              Trusted by the peptide research community for transparent, independent vendor verification.
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`p-6 rounded-xl border ${dark ? "bg-gray-900/60 border-gray-700/50" : "bg-white border-gray-200"}`}>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className={`text-sm mb-4 leading-relaxed ${dark ? "text-gray-300" : "text-gray-600"}`}>"{t.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${dark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                    {t.user.charAt(2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.user}</p>
                    <p className={`text-xs ${textMuted}`}>{t.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Featured / Team */}
          <div className={`rounded-2xl border p-6 sm:p-8 ${dark ? "bg-gray-900/60 border-gray-700/50" : "bg-white border-gray-200"}`}>
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-bold text-lg mb-3">Independent & Lab-Backed</h3>
                <p className={`text-sm mb-4 ${textMuted}`}>
                  Founded by Christopher Bray, PeptideVerify operates with full editorial independence. No vendor can pay for a higher ranking — scores are derived entirely from data.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "r/Peptides Community", icon: MessageCircle },
                    { label: "Finnrick Lab Partner", icon: FlaskConical },
                    { label: "PeptideVerify.co.uk", icon: ShieldCheck },
                  ].map((badge) => (
                    <span key={badge.label} className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${dark ? "bg-white/5 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                      <badge.icon className="w-3 h-3 text-emerald-400" /> {badge.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`flex flex-col items-center sm:items-end gap-3 p-6 rounded-xl ${dark ? "bg-black/20" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold">Trust & Compliance</span>
                </div>
                <div className={`text-xs text-center sm:text-right space-y-1 ${textMuted}`}>
                  <p>Data encrypted in transit &amp; at rest</p>
                  <p>GDPR compliant</p>
                  <p className="font-medium text-amber-400">For research use only. Not for human consumption.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. FOR VENDORS ═══ */}
      <section className={`py-16 sm:py-24 border-t ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">For Vendors</h2>
            <p className={`mt-3 max-w-lg mx-auto ${textMuted}`}>
              Claim your listing and let your data speak for itself. No pay-to-play — ever.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className={`rounded-2xl border p-6 ${dark ? "bg-gray-900/60 border-gray-700/50" : "bg-white border-gray-200"}`}>
              <div className="mb-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${dark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>FREE</span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">$0</span>
                <span className={`text-sm ${textMuted}`}>/forever</span>
              </div>
              <ul className={`space-y-2 mb-6 text-sm ${textMuted}`}>
                {["Basic listing with PVS Score™", "Automated data crawling", "Reddit sentiment tracking", "Monthly score email digest"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-semibold text-sm border transition-colors ${dark ? "border-gray-600 text-white hover:bg-white/5" : "border-gray-300 text-gray-900 hover:bg-gray-50"}`}>
                Claim Free Listing
              </button>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border-2 border-emerald-500/50 p-6 relative bg-gradient-to-b from-emerald-500/5 to-transparent">
              <div className="absolute -top-3 left-6">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-white">MOST POPULAR</span>
              </div>
              <div className="mb-4 mt-2">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">ENTERPRISE</span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">$299</span>
                <span className={`text-sm ${textMuted}`}>/month</span>
              </div>
              <ul className={`space-y-2 mb-6 text-sm ${textMuted}`}>
                {[
                  "Everything in Free",
                  "Priority COA review & badge",
                  "Competitor comparison dashboard",
                  "API access & webhook alerts",
                  "Dedicated account manager",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20">
                Talk to Sales
              </button>
              <p className={`text-center text-xs mt-3 ${textMuted}`}>14-day money-back &bull; Cancel anytime &bull; No contracts</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 7. FOOTER ═══ */}
      <footer className={`py-12 border-t ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">PeptideVerify</span>
              </div>
              <p className={`text-sm ${textMuted}`}>
                AI-Verified Peptide Rankings. Independent, lab-backed, no paid placements.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
              <ul className={`space-y-2 text-sm ${textMuted}`}>
                {["Rankings", "Methodology", "Blog", "API Documentation"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-emerald-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Resources</h4>
              <ul className={`space-y-2 text-sm ${textMuted}`}>
                {["COA Guide", "Finnrick Explainer", "Vendor FAQ", "Community"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-emerald-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className={`space-y-2 text-sm ${textMuted}`}>
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-emerald-400 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`pt-6 border-t ${borderColor} flex flex-col sm:flex-row items-center justify-between gap-3`}>
            <p className={`text-xs ${textMuted}`}>
              &copy; 2026 PeptideVerify &bull; Independent &bull; Not affiliated with any vendor
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className={`text-xs ${textMuted} hover:text-emerald-400`}>contact@peptideverify.com</a>
              <a href="#" className={`${textMuted} hover:text-white`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className={`${textMuted} hover:text-orange-400`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49-.09-.83-.17-2.1.04-3 .18-.82 1.18-5.01 1.18-5.01s-.3-.6-.3-1.49c0-1.4.81-2.44 1.82-2.44.86 0 1.27.64 1.27 1.41 0 .86-.55 2.15-.83 3.34-.24 1 .5 1.81 1.48 1.81 1.78 0 3.14-1.87 3.14-4.58 0-2.39-1.72-4.07-4.18-4.07-2.85 0-4.52 2.14-4.52 4.35 0 .86.33 1.78.75 2.28a.3.3 0 01.07.29c-.08.31-.25 1-.28 1.14-.05.19-.15.23-.35.14-1.31-.61-2.13-2.52-2.13-4.06 0-3.31 2.41-6.35 6.94-6.35 3.65 0 6.48 2.6 6.48 6.07 0 3.62-2.28 6.53-5.45 6.53-1.06 0-2.07-.55-2.41-1.21l-.66 2.5c-.24.91-.88 2.06-1.31 2.75A10 10 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
