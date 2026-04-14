"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  TrendingUp,
  FileCheck,
  MessageSquare,
  BarChart3,
  Upload,
  FileText,
  Zap,
  Crown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Star,
  RefreshCw,
  Download,
  Users,
  Target,
  Award,
  Lock,
  Settings,
  LayoutGrid,
  Bell,
  Activity,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile } from "@/app/actions/auth";
import { getDashboardData, getScorePlaybook, type DashboardData, type PlaybookItem } from "@/app/actions/dashboard";
import { getMyCOAs } from "@/app/actions/coa";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import UploadCOAModal from "@/components/dashboard/UploadCOAModal";
import COATable, { type COARecord } from "@/components/dashboard/COATable";
import ActivityFeed, { type ActivityItem } from "@/components/dashboard/ActivityFeed";
import SettingsPanel from "@/components/dashboard/SettingsPanel";

/* ─── Score circle SVG ─── */
function ScoreCircle({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ animation: "score-fill 1.5s ease-out" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">PVS Score</span>
      </div>
    </div>
  );
}

/* ─── Sparkline ─── */
function Sparkline({ data, color = "#10B981" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((val, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full"
          style={{
            height: `${((val - min) / range) * 100}%`,
            minHeight: "4px",
            backgroundColor: color,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Static pillar icon/color config (scores come from server) ─── */
const pillarConfig = [
  { name: "COA Verification",    icon: FileCheck,    color: "#10B981" },
  { name: "Reddit Sentiment",    icon: MessageSquare, color: "#34D399" },
  { name: "Purity Testing",      icon: Shield,        color: "#6EE7B7" },
  { name: "Vendor Transparency", icon: Star,          color: "#A7F3D0" },
  { name: "Order Experience",    icon: Users,         color: "#D1FAE5" },
];

const sentimentWords = [
  { word: "reliable", size: 24, opacity: 1 },
  { word: "fast shipping", size: 20, opacity: 0.9 },
  { word: "pure", size: 28, opacity: 1 },
  { word: "good COAs", size: 18, opacity: 0.8 },
  { word: "legit", size: 22, opacity: 0.9 },
  { word: "responsive", size: 16, opacity: 0.7 },
  { word: "trusted", size: 26, opacity: 1 },
  { word: "quality", size: 20, opacity: 0.85 },
  { word: "professional", size: 15, opacity: 0.7 },
];

/* ─── Tab types ─── */
type Tab = "overview" | "coas" | "activity" | "settings";

const tabs: { key: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "coas", label: "COAs", icon: FileCheck },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "settings", label: "Settings", icon: Settings },
];

/* ═══════════════════════════════════════════════
   VENDOR DASHBOARD
   ═══════════════════════════════════════════════ */
function DashboardContent() {
  const searchParams = useSearchParams();
  const upgradedPlan = searchParams.get("upgraded") === "true" ? searchParams.get("plan") : null;
  const isStub = searchParams.get("stub") === "true";
  const [upgradeBanner, setUpgradeBanner] = useState(!!upgradedPlan);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [timeRange, setTimeRange] = useState<"30d" | "90d">("30d");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [coas, setCoas] = useState<COARecord[]>([]);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [playbook, setPlaybook] = useState<PlaybookItem[]>([]);
  const [profile, setProfile] = useState<{
    vendor_name: string;
    tier: string;
    status: string;
    website: string;
    contact_email?: string;
  } | null>(null);
  const supabase = createClient();

  const trendData = timeRange === "30d"
    ? (dashData?.trendData30 ?? [])
    : (dashData?.trendData90 ?? []);

  useEffect(() => {
    async function loadData() {
      const res = await supabase.auth.getUser();
      const u = res.data?.user ?? null;
      setUser(u);

      if (u) {
        const [profileData, dash, coaList, pb] = await Promise.all([
          getMyProfile(),
          getDashboardData(),
          getMyCOAs(),
          getScorePlaybook(),
        ]);
        if (profileData) setProfile(profileData);
        if (dash) setDashData(dash);
        setCoas(coaList);
        setPlaybook(pb);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const pvsScore = dashData?.pvsScore ?? 0;
  const rank = dashData?.rank ?? 0;
  const totalVendors = dashData?.totalVendors ?? 0;
  const scoreDelta = dashData?.scoreDelta ?? 0;
  const tier = profile?.tier || "free";
  const vendorName = profile?.vendor_name || "Your Vendor";

  // Merge pillar scores from server with static icon/color config
  const pillars = pillarConfig.map((cfg, i) => ({
    ...cfg,
    weight: dashData?.pillars[i]?.weight ?? "",
    score: dashData?.pillars[i]?.score ?? 0,
  }));

  const handleCOAUpload = (coa: { peptideName: string; batchId: string; fileName: string }) => {
    const newCOA: COARecord = {
      id: `new-${Date.now()}`,
      peptideName: coa.peptideName,
      batchId: coa.batchId,
      fileName: coa.fileName,
      status: "pending",
      uploadedAt: "Just now",
    };
    setCoas((prev) => [newCOA, ...prev]);
  };

  const pendingCount = coas.filter((c) => c.status === "pending").length;
  const verifiedCount = coas.filter((c) => c.status === "verified").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Shield className="w-12 h-12 text-emerald mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You need to sign in to view your dashboard.</p>
          <Link
            href="/for-vendors"
            className="btn-glow inline-flex px-6 py-3 bg-emerald text-white font-medium rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen molecular-bg pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* ─── Upgrade Success Banner ─── */}
        <AnimatePresence>
          {upgradeBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-emerald/10 border border-emerald/30 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-emerald" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {isStub ? "Upgrade simulation complete" : "Welcome to your new plan!"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isStub
                      ? "Stripe isn't configured yet — add your keys in Vercel to enable real checkout."
                      : "Your subscription is active. Pro/Enterprise features are now unlocked."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUpgradeBanner(false)}
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-8"
        >
          <div className="flex-shrink-0 animate-pulse-glow rounded-full">
            <ScoreCircle score={pvsScore} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                {vendorName}
              </h1>
              {profile?.status === "approved" && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald/10 border border-emerald/20 rounded-full text-xs text-emerald font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
              {profile?.status === "pending" && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs text-yellow-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Pending Review
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-3">
              Rank <span className="text-white font-semibold">#{rank}</span> of {totalVendors} vendors
              &nbsp;&middot;&nbsp;
              <span className="capitalize">{tier}</span> plan
            </p>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 text-sm ${scoreDelta >= 0 ? "text-emerald" : "text-red-400"}`}>
                <TrendingUp className="w-4 h-4" />
                <span>{scoreDelta >= 0 ? "+" : ""}{scoreDelta} pts last 30d</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <FileCheck className="w-4 h-4" />
                <span>{verifiedCount} verified COAs</span>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{pendingCount} pending</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUploadOpen(true)}
              className="btn-glow flex items-center gap-2 px-5 py-2.5 bg-emerald text-white font-medium rounded-xl hover:bg-emerald-light"
            >
              <Upload className="w-4 h-4" />
              Upload COA
            </button>
            <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
              tier === "enterprise"
                ? "bg-gradient-to-r from-emerald/20 to-emerald-light/20 border border-emerald/30 text-emerald"
                : tier === "pro"
                ? "bg-emerald/10 border border-emerald/20 text-emerald"
                : "bg-ink-3 border border-white/10 text-gray-400"
            }`}>
              <Crown className="w-4 h-4" />
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </div>
          </div>
        </motion.div>

        {/* ─── Tab navigation ─── */}
        <div className="flex items-center gap-1 mb-8 border-b border-white/5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-emerald border-emerald"
                  : "text-gray-500 border-transparent hover:text-gray-300 hover:border-white/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "coas" && pendingCount > 0 && (
                <span className="ml-1 w-5 h-5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab content ─── */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "COAs Uploaded", value: String(coas.length), sub: `${verifiedCount} verified`, icon: FileCheck, sparkData: [2, 3, 1, 4, 2, 3, 5, 2, 4, coas.length] },
                  { label: "Purity Score", value: `${dashData?.pillars[2]?.score ?? 0}`, sub: "out of 100", icon: Shield, sparkData: [60, 65, 68, 70, 72, 75, 76, 78, 80, dashData?.pillars[2]?.score ?? 0] },
                  { label: "Reddit Sentiment", value: `${dashData?.pillars[1]?.score ?? 0}%`, sub: "positive", icon: MessageSquare, sparkData: [50, 55, 58, 60, 63, 66, 68, 70, 72, dashData?.pillars[1]?.score ?? 0] },
                  { label: "Listing Views", value: (dashData?.pageViewsThisMonth ?? 0).toLocaleString(), sub: "this month", icon: Users, sparkData: [10, 12, 15, 18, 14, 20, 22, 19, 25, dashData?.pageViewsThisMonth ?? 0] },
                ].map((stat) => (
                  <div key={stat.label} className="card-glow p-5 bg-ink-2 border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center">
                        <stat.icon className="w-4 h-4 text-emerald" />
                      </div>
                      <Sparkline data={stat.sparkData} />
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{stat.label}</span>
                      <span className="text-xs text-emerald">{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* 5-Pillar Breakdown */}
                <div className="lg:col-span-2 p-6 bg-ink-2 border border-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald" />
                    PVS Score Breakdown
                  </h3>
                  <div className="space-y-4">
                    {pillars.map((p) => (
                      <div key={p.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <p.icon className="w-4 h-4 text-emerald" />
                            <span className="text-sm text-gray-300">{p.name}</span>
                            <span className="text-xs text-gray-600">({p.weight})</span>
                          </div>
                          <span className="text-sm font-semibold text-white">{p.score}</span>
                        </div>
                        <div className="h-2 bg-ink rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.score}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trend Chart */}
                <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald" />
                      Score Trend
                    </h3>
                    <div className="flex bg-ink rounded-lg p-0.5">
                      {(["30d", "90d"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setTimeRange(r)}
                          className={`px-3 py-1 text-xs rounded-md transition-all ${
                            timeRange === r
                              ? "bg-emerald/20 text-emerald"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-40">
                    {trendData.map((val, i) => {
                      const max = Math.max(...trendData);
                      const min = Math.min(...trendData) - 10;
                      const height = ((val - min) / (max - min)) * 100;
                      return (
                        <motion.div
                          key={`${timeRange}-${i}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.4, delay: i * 0.02 }}
                          className="flex-1 rounded-t-sm bg-emerald/30 hover:bg-emerald/60 transition-colors cursor-default group relative"
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-emerald opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {val}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-600">{timeRange === "30d" ? "30d ago" : "90d ago"}</span>
                    <span className="text-xs text-gray-600">Today</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Reputation Insights */}
                <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald" />
                    Reputation Insights
                  </h3>
                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Negative</span>
                      <span className="text-xs text-gray-500">Positive</span>
                    </div>
                    <div className="h-3 bg-ink rounded-full overflow-hidden flex">
                      <div className="h-full bg-red-500/50" style={{ width: "8%" }} />
                      <div className="h-full bg-yellow-500/50" style={{ width: "10%" }} />
                      <div className="h-full bg-emerald" style={{ width: "82%" }} />
                    </div>
                    <p className="text-sm text-emerald mt-2 font-medium">82% Positive Sentiment</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sentimentWords.map((w) => (
                      <span
                        key={w.word}
                        className="px-3 py-1.5 bg-emerald/5 border border-emerald/10 rounded-full text-emerald transition-all hover:bg-emerald/15 hover:scale-105 cursor-default"
                        style={{ fontSize: w.size * 0.55, opacity: w.opacity }}
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Competitor Benchmarking */}
                <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald" />
                    Competitor Benchmarking
                    {tier === "free" && (
                      <span className="ml-auto text-xs bg-emerald/10 text-emerald px-2 py-0.5 rounded-full">Pro+</span>
                    )}
                  </h3>
                  {tier === "free" ? (
                    <div className="text-center py-8">
                      <Lock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-4">Upgrade to Pro to see how you stack up.</p>
                      <Link href="/for-vendors#pricing" className="text-sm text-emerald hover:text-emerald-light transition-colors">
                        View Plans &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {competitors.map((c) => (
                        <div
                          key={c.name}
                          className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                            c.you ? "bg-emerald/10 border border-emerald/20" : "bg-ink hover:bg-ink-3"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            c.rank === 1 ? "bg-yellow-500/20 text-yellow-400" : c.you ? "bg-emerald/20 text-emerald" : "bg-ink-3 text-gray-500"
                          }`}>
                            {c.rank}
                          </span>
                          <span className={`flex-1 text-sm ${c.you ? "text-white font-semibold" : "text-gray-400"}`}>
                            {c.name}
                            {c.you && <span className="ml-1 text-xs text-emerald">(You)</span>}
                          </span>
                          <div className="w-20 h-1.5 bg-ink-3 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-emerald" style={{ width: `${c.score}%` }} />
                          </div>
                          <span className={`text-sm font-semibold ${c.you ? "text-emerald" : "text-gray-400"}`}>
                            {c.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Score Improvement Playbook */}
              {playbook.length > 0 && (
                <div className="mb-8 p-6 bg-ink-2 border border-white/5 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald" />
                    Score Playbook
                  </h3>
                  <p className="text-xs text-gray-500 mb-5">Top actions to improve your PVS score this week</p>
                  <div className="space-y-3">
                    {playbook.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                          item.priority === "high"
                            ? "bg-emerald/5 border-emerald/20"
                            : item.priority === "medium"
                            ? "bg-yellow-500/5 border-yellow-500/10"
                            : "bg-ink border-white/5"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                          item.priority === "high" ? "bg-emerald/20 text-emerald" :
                          item.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-gray-700 text-gray-400"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200">{item.action}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.pillar}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald flex-shrink-0">{item.estimatedGain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald" />
                  Quick Actions
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Upload, label: "Upload COA", description: "Add a new certificate of analysis", onClick: () => setUploadOpen(true) },
                    { icon: FileText, label: "Generate Report", description: "Export your latest PVS report", onClick: () => alert("Report generation coming soon") },
                    { icon: RefreshCw, label: "Request Re-score", description: "Trigger a manual score refresh", onClick: () => alert("Re-score requested") },
                    { icon: Download, label: "Embed Badge", description: "Get your embeddable PVS score badge", onClick: () => window.open(`/api/badge/${profile?.vendor_slug ?? ""}`, "_blank") },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className="card-glow group p-5 bg-ink-2 border border-white/5 rounded-xl text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-3 group-hover:bg-emerald/20 group-hover:scale-110 transition-all duration-300">
                        <action.icon className="w-5 h-5 text-emerald" />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1">{action.label}</h4>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enterprise Upsell */}
              {tier !== "enterprise" && (
                <div className="relative overflow-hidden p-8 bg-ink-2 border border-emerald/20 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald/5 via-transparent to-emerald/5 pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-8 h-8 text-emerald" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-display font-bold text-white mb-2">
                        {tier === "free" ? "Unlock Pro Features" : "Upgrade to Enterprise"}
                      </h3>
                      <p className="text-gray-400 text-sm max-w-lg">
                        {tier === "free"
                          ? "Get competitor benchmarking, priority COA verification, advanced analytics, and more."
                          : "Get API access, SSO, white-label reports, dedicated account manager, and custom SLA."}
                      </p>
                    </div>
                    <Link
                      href="/for-vendors#pricing"
                      className="btn-glow flex-shrink-0 px-6 py-3 bg-emerald text-white font-semibold rounded-xl hover:bg-emerald-light flex items-center gap-2"
                    >
                      {tier === "free" ? "Upgrade to Pro" : "Go Enterprise"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "coas" && (
            <motion.div
              key="coas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Certificates of Analysis</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {coas.length} total &middot; {verifiedCount} verified &middot; {pendingCount} pending
                  </p>
                </div>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="btn-glow flex items-center gap-2 px-5 py-2.5 bg-emerald text-white font-medium rounded-xl hover:bg-emerald-light"
                >
                  <Upload className="w-4 h-4" />
                  Upload COA
                </button>
              </div>

              <div className="bg-ink-2 border border-white/5 rounded-xl p-4">
                <COATable coas={coas} />
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-white">Activity Feed</h2>
                <p className="text-sm text-gray-500 mt-1">Recent events and notifications</p>
              </div>

              <div className="bg-ink-2 border border-white/5 rounded-xl p-4">
                <ActivityFeed items={initialActivity} />
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-white">Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your vendor profile and preferences</p>
              </div>

              <SettingsPanel
                profile={{
                  vendor_name: vendorName,
                  website: profile?.website || "",
                  contact_email: profile?.contact_email,
                  tier,
                }}
                userEmail={user?.email || ""}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload COA Modal */}
      <UploadCOAModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleCOAUpload}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
