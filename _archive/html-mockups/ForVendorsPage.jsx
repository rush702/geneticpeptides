"use client";

import { useState, useEffect } from "react";
import {
  Search, ChevronDown, Moon, Sun, ExternalLink, ShieldCheck, Check, ArrowRight,
  Menu, X, Mail, ChevronRight, Zap, Database, Brain, FlaskConical, BarChart3,
  RefreshCw, MessageCircle, FileText, Users, LineChart, Bell, Beaker, Palette,
  GitCompare, Headphones, Clock, BadgeCheck, Send, KeyRound, UserCheck, LogOut, Loader2, User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "@/components/AuthModal";
import ContactSalesModal from "@/components/ContactSalesModal";
import { submitVendorClaim } from "./actions";

/* ═══════════════════════════════════════════
   SHARED NAV DATA
   ═══════════════════════════════════════════ */
const NAV_ITEMS = [
  { label: "Rankings", href: "/", items: ["All Vendors", "USA", "Europe", "Australia", "Verified Only"] },
  { label: "Methodology", href: "/methodology" },
  { label: "Resources", href: "#", items: ["Blog", "COA Guide", "Finnrick Explainer"] },
  { label: "For Vendors", href: "/for-vendors", active: true },
  { label: "API", href: "/api" },
  { label: "About", href: "/about" },
];

/* ═══════════════════════════════════════════
   PRICING DATA
   ═══════════════════════════════════════════ */
const FREE_FEATURES = [
  "Public profile + Verified badge",
  "Daily PVS Score™ updates",
  "Community sentiment summary",
  "Finnrick grade display",
  "Basic pricing comparison",
  "COA upload & parsing",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Full PVS Score™ breakdown dashboard",
  "COA upload & AI verification portal",
  "Reddit & forum mention alerts",
  "Competitor score comparison (top 3)",
  "Monthly analytics PDF report",
  "Weekly score digest & movement alerts",
];

const ENTERPRISE_FEATURES_SHORT = [
  "Everything in Pro",
  "Full API data access & webhooks",
  "White-label PDF reporting",
  "Competitor benchmarking suite (top 10)",
  "Dedicated account manager",
  "Custom research reports",
  "Priority Finnrick testing",
  "Advanced analytics dashboard",
  "Priority support & alerts",
];

/* ═══════════════════════════════════════════
   8 ENTERPRISE FEATURE CARDS
   ═══════════════════════════════════════════ */
const ENTERPRISE_CARDS = [
  {
    icon: Database,
    title: "Full API Data Access",
    desc: "Real-time PVS Scores, historical trends, raw sentiment data, and configurable webhooks. Build integrations that keep your systems in sync.",
  },
  {
    icon: Palette,
    title: "White-Label Reporting",
    desc: "Generate branded PDF reports with your logo and colors — perfect for sharing with clients, investors, or regulatory bodies.",
  },
  {
    icon: GitCompare,
    title: "Competitor Benchmarking Suite",
    desc: "Private dashboard comparing your scores against your top 5 competitors across all 5 pillars, updated daily with trend lines.",
  },
  {
    icon: Users,
    title: "Dedicated Account Manager",
    desc: "Personal Slack channel with your account manager plus quarterly strategy calls to optimize your listing and reputation.",
  },
  {
    icon: FileText,
    title: "Custom Research Reports",
    desc: "On-demand market sentiment analysis or COA benchmarking reports tailored to your product line and competitive landscape.",
  },
  {
    icon: Beaker,
    title: "Custom Finnrick Data Integration",
    desc: "Priority batch testing slots with Finnrick labs plus early access to new testing methodologies before public release.",
  },
  {
    icon: LineChart,
    title: "Advanced Analytics Dashboard",
    desc: "Score history with drill-downs, sentiment word clouds, anomaly detection alerts, and exportable data visualizations.",
  },
  {
    icon: Headphones,
    title: "Priority Support & Alerts",
    desc: "Guaranteed 24-hour response time, customizable notification triggers, and direct escalation path for urgent issues.",
  },
];

/* ═══════════════════════════════════════════
   CLAIM PROCESS STEPS
   ═══════════════════════════════════════════ */
const CLAIM_STEPS = [
  {
    icon: Send,
    num: "1",
    title: "Claim Your Listing",
    desc: "Submit your vendor name, website URL, and contact email. We'll match you to your existing public profile.",
  },
  {
    icon: KeyRound,
    num: "2",
    title: "Verify Ownership",
    desc: "Confirm ownership via email verification or by adding a DNS TXT record to your domain. Takes under 5 minutes.",
  },
  {
    icon: UserCheck,
    num: "3",
    title: "Unlock & Edit Profile",
    desc: "Access your Verified badge, upload COAs, edit your description, and unlock analytics — instantly.",
  },
];

/* ═══════════════════════════════════════════
   FEATURE CARD COMPONENT
   ═══════════════════════════════════════════ */
function FeatureCard({ icon: Icon, title, desc, dark }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative p-6 rounded-xl border transition-all duration-300 cursor-default
        ${dark
          ? "bg-gray-900/80 border-gray-700/60 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
          : "bg-white border-gray-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
        } ${hovered ? "transform -translate-y-1" : ""}`}
    >
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300 ${
        dark ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : "bg-emerald-50 group-hover:bg-emerald-100"
      }`}>
        <Icon className="w-5 h-5 text-emerald-500 transition-all duration-300 group-hover:text-emerald-400 group-hover:scale-110" />
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className={`text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */
export default function ForVendorsPage() {
  const supabase = createClient();

  // ── UI State ──
  const [dark, setDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);

  // ── Auth State ──
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // ── Claim Form State ──
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({ vendorName: "", website: "", contactEmail: "", message: "" });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimError, setClaimError] = useState("");

  // ── Contact Sales State ──
  const [salesOpen, setSalesOpen] = useState(false);

  // ── Scroll listener ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Auth listener — check session on mount + subscribe to changes ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthLoading(false);
      if (user) setClaimForm((f) => ({ ...f, contactEmail: user.email }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) setClaimForm((f) => ({ ...f, contactEmail: u.email }));
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Handle "Claim" button click — gate behind auth ──
  function handleClaimClick() {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setClaimOpen(true);
  }

  // ── Handle claim form submission via Server Action ──
  async function handleClaimSubmit(e) {
    e.preventDefault();
    setClaimError("");
    setClaimSubmitting(true);

    const formData = new FormData();
    formData.append("vendorName", claimForm.vendorName);
    formData.append("website", claimForm.website);
    formData.append("contactEmail", claimForm.contactEmail);
    formData.append("message", claimForm.message);

    const result = await submitVendorClaim(formData);

    if (result.success) {
      setClaimSubmitted(true);
    } else {
      setClaimError(result.error);
    }
    setClaimSubmitting(false);
  }

  // ── Sign out ──
  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const bg = dark ? "bg-[#0A1428]" : "bg-gray-50";
  const text = dark ? "text-white" : "text-gray-900";
  const textMuted = dark ? "text-gray-400" : "text-gray-500";
  const cardBg = dark ? "bg-gray-900/60" : "bg-white";
  const borderColor = dark ? "border-gray-700/50" : "border-gray-200";

  const proPrice = billingAnnual ? 79 : 99;
  const proAnnualTotal = 950;
  const proAnnualSavings = 238;
  const enterprisePrice = billingAnnual ? 239 : 299;
  const annualTotal = 2870;
  const enterpriseAnnualSavings = 718;

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-300`}>

      {/* ─── Background Texture ─── */}
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

      {/* ═══════════════════════════════════════
          1. STICKY HEADER
         ═══════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? dark ? "bg-[#0A1428]/95 backdrop-blur-xl shadow-lg shadow-black/20" : "bg-white/95 backdrop-blur-xl shadow-lg"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">PeptideVerify</span>
              <span className={`hidden sm:inline text-xs ${textMuted} border-l ${borderColor} pl-2 ml-1`}>AI-Verified Rankings</span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="relative group">
                  <a
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${
                      item.active
                        ? "text-emerald-400"
                        : dark ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                    {item.items && <ChevronDown className="w-3 h-3 opacity-50" />}
                  </a>
                  {item.items && (
                    <div className={`absolute top-full left-0 mt-1 w-48 rounded-xl py-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                      dark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
                    }`}>
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
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${dark ? "bg-white/5 border-gray-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-400"}`}>
                <Search className="w-4 h-4" />
                <input type="text" placeholder="Search vendors..." className={`bg-transparent text-sm outline-none w-40 placeholder:text-gray-500 ${text}`} />
              </div>
              <a href="/#rankings" className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
                Browse All
              </a>

              {/* Auth indicator */}
              {!authLoading && (
                user ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                      <User className="w-3 h-3" />
                      <span className="max-w-[120px] truncate">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className={`p-1.5 rounded-lg transition-colors ${dark ? "text-gray-500 hover:text-red-400 hover:bg-white/5" : "text-gray-400 hover:text-red-500 hover:bg-gray-100"}`}
                      title="Sign out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      dark ? "text-gray-300 border border-gray-700 hover:bg-white/5" : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Sign In
                  </button>
                )
              )}

              <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg transition-colors ${dark ? "text-gray-400 hover:text-yellow-400 hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
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
              {NAV_ITEMS.map((item) => (
                <a key={item.label} href={item.href} className={`block px-3 py-2 rounded-lg text-sm ${
                  item.active ? "text-emerald-400 font-medium" : dark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50"
                }`}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════
          2. HERO SECTION
         ═══════════════════════════════════════ */}
      <section className="relative pt-32 sm:pt-40 pb-12 sm:pb-16 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-sm font-medium bg-emerald-500/5 border-emerald-500/20 text-emerald-400">
            <BadgeCheck className="w-4 h-4" /> For Vendors
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            Claim Your Free Listing.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              Grow with Verified Data.
            </span>
          </h1>
          <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${textMuted}`}>
            Every vendor is automatically listed from public data. Claim to unlock your Verified badge, analytics, and advanced tools. No paid placements — ever.
          </p>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <div className={`border-y ${borderColor}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {[
              { icon: Check, label: "No paid placements", color: "text-emerald-400" },
              { icon: FlaskConical, label: "6,102 Lab Tests", color: "text-blue-400" },
              { icon: BarChart3, label: "2.4M Reddit Posts", color: "text-violet-400" },
              { icon: Brain, label: "Independent AI rankings", color: "text-amber-400" },
              { icon: RefreshCw, label: "14-day money-back on paid plans", color: "text-rose-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className={textMuted}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          3. PRICING COMPARISON
         ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className={`max-w-lg mx-auto ${textMuted}`}>
              Start free and upgrade when you need deeper insights. Your score is never influenced by your plan.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm font-medium ${!billingAnnual ? text : textMuted}`}>Monthly</span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${billingAnnual ? "bg-emerald-500" : dark ? "bg-gray-700" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${billingAnnual ? "translate-x-6" : ""}`} />
              </button>
              <span className={`text-sm font-medium ${billingAnnual ? text : textMuted}`}>
                Annual <span className="text-emerald-400 font-bold ml-1">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {/* ── Free Tier ── */}
            <div className={`rounded-2xl border p-7 flex flex-col ${cardBg} ${borderColor}`}>
              <div className="mb-5">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${dark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}>FREE</span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold">$0</span>
              </div>
              <p className={`text-sm mb-6 ${textMuted}`}>Free forever — no credit card required</p>
              <ul className="space-y-3 mb-8 flex-grow">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleClaimClick}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm border transition-all hover:scale-[1.01] ${
                  dark ? "border-gray-600 text-white hover:bg-white/5" : "border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                {user ? "Claim Free Listing" : "Sign Up / Log In to Claim"}
              </button>
            </div>

            {/* ── Pro Tier (Mid) ── */}
            <div className="relative rounded-2xl border-2 border-emerald-500/50 p-7 bg-gradient-to-b from-emerald-500/5 to-transparent flex flex-col">
              <div className="absolute -top-3.5 left-7">
                <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-5 mt-1">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">PRO</span>
              </div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold">${proPrice}</span>
                <span className={`text-sm ${textMuted}`}>/month</span>
              </div>
              {billingAnnual ? (
                <p className={`text-sm mb-6 ${textMuted}`}>
                  ${proAnnualTotal.toLocaleString()}/year &bull; <span className="text-emerald-400 font-medium">Save ${proAnnualSavings}/year (20%)</span>
                </p>
              ) : (
                <p className={`text-sm mb-6 ${textMuted}`}>or ${proAnnualTotal}/year billed annually — save 20%</p>
              )}
              <ul className="space-y-3 mb-8 flex-grow">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleClaimClick}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 hover:scale-[1.01]"
              >
                Start Pro Plan →
              </button>
              <p className={`text-center text-xs mt-3 ${textMuted}`}>
                14-day money-back &bull; Cancel anytime
              </p>
            </div>

            {/* ── Enterprise Tier ── */}
            <div className={`relative rounded-2xl border p-7 flex flex-col ${cardBg} ${borderColor}`}>
              <div className="mb-5">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${dark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-700"}`}>ENTERPRISE</span>
              </div>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold">${enterprisePrice}</span>
                <span className={`text-sm ${textMuted}`}>/month</span>
              </div>
              {billingAnnual ? (
                <p className={`text-sm mb-6 ${textMuted}`}>
                  ${annualTotal.toLocaleString()}/year &bull; <span className="text-emerald-400 font-medium">Save ${enterpriseAnnualSavings}/year (20%)</span>
                </p>
              ) : (
                <p className={`text-sm mb-6 ${textMuted}`}>or ${annualTotal.toLocaleString()}/year billed annually — save 20%</p>
              )}
              <ul className="space-y-3 mb-8 flex-grow">
                {ENTERPRISE_FEATURES_SHORT.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${dark ? "text-gray-300" : "text-gray-600"}`}>
                    <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSalesOpen(true)}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm border transition-all hover:scale-[1.01] ${
                  dark ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/10" : "border-amber-400 text-amber-700 hover:bg-amber-50"
                }`}
              >
                Talk to Sales
              </button>
              <p className={`text-center text-xs mt-3 ${textMuted}`}>
                14-day money-back &bull; Cancel anytime &bull; No contracts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. ENTERPRISE FEATURE CARDS (2×4 grid)
         ═══════════════════════════════════════ */}
      <section className={`py-16 sm:py-24 border-t ${borderColor}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Enterprise Features in Detail</h2>
            <p className={`max-w-lg mx-auto ${textMuted}`}>
              Every tool you need to monitor, benchmark, and grow your vendor reputation — backed by real data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {ENTERPRISE_CARDS.map((card) => (
              <FeatureCard key={card.title} icon={card.icon} title={card.title} desc={card.desc} dark={dark} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. CLAIM PROCESS TIMELINE
         ═══════════════════════════════════════ */}
      <section className={`py-16 sm:py-24 border-t ${borderColor}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Get Verified in 3 Steps</h2>
            <p className={`max-w-lg mx-auto ${textMuted}`}>
              The entire process takes under 10 minutes. No paperwork, no phone calls.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div className={`hidden sm:block absolute top-[3.25rem] left-[16.67%] right-[16.67%] h-0.5 ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-500/30 rounded-full" />
            </div>

            {CLAIM_STEPS.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 z-10 border-4 ${
                  dark ? "bg-[#0A1428] border-emerald-500/30" : "bg-gray-50 border-emerald-500/30"
                }`}>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 mb-1">STEP {step.num}</span>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className={`text-sm leading-relaxed ${textMuted}`}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA below steps */}
          <div className="text-center mt-10">
            <button
              onClick={handleClaimClick}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 hover:scale-[1.02]"
            >
              {user ? "Claim Your Listing Now" : "Sign Up to Claim"} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. GUARANTEE BANNER
         ═══════════════════════════════════════ */}
      <section className={`border-t border-b ${borderColor}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className={`rounded-2xl border p-8 sm:p-10 text-center ${
            dark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
          }`}>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Risk-Free Guarantee</h3>
            <p className={`max-w-md mx-auto mb-6 ${textMuted}`}>
              Try Enterprise for 14 days. If it doesn't deliver value, get a full refund — no questions asked.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: Clock, label: "14-day money-back" },
                { icon: Zap, label: "Cancel anytime" },
                { icon: FileText, label: "No contracts" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm font-medium">
                  <item.icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. FOOTER
         ═══════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════
          AUTH MODAL (login / signup / magic link)
         ═══════════════════════════════════════ */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        dark={dark}
        onSuccess={(u) => {
          setUser(u);
          setAuthModalOpen(false);
          // Auto-open claim form after successful auth
          setClaimForm((f) => ({ ...f, contactEmail: u.email }));
          setClaimOpen(true);
        }}
      />

      {/* ═══════════════════════════════════════
          CONTACT SALES MODAL (Enterprise)
         ═══════════════════════════════════════ */}
      <ContactSalesModal
        open={salesOpen}
        onClose={() => setSalesOpen(false)}
        dark={dark}
        user={user}
      />

      {/* ═══════════════════════════════════════
          CLAIM FORM MODAL (auth-gated)
         ═══════════════════════════════════════ */}
      {claimOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setClaimOpen(false); setClaimSubmitted(false); setClaimError(""); }}
          />

          {/* Modal */}
          <div className={`relative w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
            dark ? "bg-[#0D1B2A] border-gray-700/60 shadow-black/40" : "bg-white border-gray-200"
          }`}>
            {/* Close button */}
            <button
              onClick={() => { setClaimOpen(false); setClaimSubmitted(false); setClaimError(""); }}
              className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${dark ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
            >
              <X className="w-5 h-5" />
            </button>

            {!claimSubmitted ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Claim Your Listing</h3>
                    <p className={`text-xs ${textMuted}`}>Takes under 2 minutes</p>
                  </div>
                </div>

                {/* Logged-in indicator */}
                <div className={`flex items-center gap-2 mb-5 px-3 py-2 rounded-lg text-xs ${dark ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/10" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                  <Check className="w-3 h-3" />
                  Signed in as <span className="font-medium">{user?.email}</span>
                </div>

                {/* Error */}
                {claimError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {claimError}
                  </div>
                )}

                {/* Form — submits via Server Action */}
                <form onSubmit={handleClaimSubmit} className="space-y-4">
                  {[
                    { key: "vendorName", label: "Vendor / Company Name", placeholder: "e.g. Ascension Peptides", type: "text", required: true },
                    { key: "website", label: "Website URL", placeholder: "https://yoursite.com", type: "url", required: true },
                    { key: "contactEmail", label: "Contact Email", placeholder: "you@yourcompany.com", type: "email", required: true },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className={`block text-sm font-medium mb-1.5 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={claimForm[field.key]}
                        onChange={(e) => setClaimForm({ ...claimForm, [field.key]: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                          dark
                            ? "bg-white/5 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:bg-white/[0.07]"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white"
                        }`}
                      />
                    </div>
                  ))}

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                      Message <span className={`font-normal ${textMuted}`}>(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Anything we should know..."
                      value={claimForm.message}
                      onChange={(e) => setClaimForm({ ...claimForm, message: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors resize-none ${
                        dark
                          ? "bg-white/5 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:bg-white/[0.07]"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white"
                      }`}
                    />
                  </div>

                  <p className={`text-xs ${textMuted}`}>
                    We'll verify domain ownership and activate your Verified badge. Status: <span className="text-amber-400 font-medium">pending</span> until verified.
                  </p>

                  <button
                    type="submit"
                    disabled={claimSubmitting}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {claimSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Submit Claim
                  </button>
                </form>
              </>
            ) : (
              /* ── Success State ── */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-bold text-xl mb-2">Claim Submitted!</h3>
                <p className={`text-sm mb-6 max-w-xs mx-auto ${textMuted}`}>
                  We'll verify your ownership shortly. You'll receive a confirmation at <span className="font-medium text-emerald-400">{claimForm.contactEmail}</span>.
                </p>
                <button
                  onClick={() => {
                    setClaimOpen(false);
                    setClaimSubmitted(false);
                    setClaimError("");
                    setClaimForm({ vendorName: "", website: "", contactEmail: user?.email || "", message: "" });
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    dark ? "border-gray-600 text-white hover:bg-white/5" : "border-gray-300 text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
