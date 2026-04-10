"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  ChevronDown,
  RefreshCw,
  Download,
  Users,
  Target,
  Award,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

/* ─── Score circle SVG component ─── */
function ScoreCircle({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ animation: "score-fill 1.5s ease-out" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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

/* ─── Mini trend sparkline (CSS-based) ─── */
function Sparkline({ data, color = "#10B981" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((val, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-300"
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

/* ─── 5-pillar breakdown data ─── */
const pillars = [
  { name: "COA Verification", weight: "30%", score: 95, icon: FileCheck, color: "#10B981" },
  { name: "Reddit Sentiment", weight: "20%", score: 82, icon: MessageSquare, color: "#34D399" },
  { name: "Purity Testing", weight: "25%", score: 91, icon: Shield, color: "#6EE7B7" },
  { name: "Vendor Transparency", weight: "15%", score: 88, icon: Star, color: "#A7F3D0" },
  { name: "Order Experience", weight: "10%", score: 76, icon: Users, color: "#D1FAE5" },
];

/* ─── Mock data ─── */
const trendData = [72, 74, 73, 78, 80, 79, 82, 85, 84, 86, 88, 87, 89, 91, 90];
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
  { word: "pricey", size: 14, opacity: 0.5 },
];

const competitors = [
  { name: "Your Vendor", score: 91, rank: 3, you: true },
  { name: "Competitor A", score: 96, rank: 1, you: false },
  { name: "Competitor B", score: 93, rank: 2, you: false },
  { name: "Competitor C", score: 87, rank: 4, you: false },
  { name: "Competitor D", score: 82, rank: 5, you: false },
];

const quickActions = [
  { icon: Upload, label: "Upload COA", description: "Add a new certificate of analysis", color: "emerald" },
  { icon: FileText, label: "Generate Report", description: "Export your latest PVS report", color: "emerald" },
  { icon: RefreshCw, label: "Request Re-score", description: "Trigger a manual score refresh", color: "emerald" },
  { icon: Download, label: "Download Badge", description: "Get your verified badge assets", color: "emerald" },
];

/* ═══════════════════════════════════════════════
   VENDOR DASHBOARD
   ═══════════════════════════════════════════════ */
export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"30d" | "90d">("30d");
  const [profile, setProfile] = useState<{
    vendor_name: string;
    tier: string;
    status: string;
    website: string;
  } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const res = await supabase.auth.getUser();
      const u = res.data?.user ?? null;
      setUser(u);

      if (u) {
        const profileRes = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", u.id)
          .single();

        if (profileRes.data) {
          setProfile(profileRes.data);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  // Mock score — in production this comes from a scores table
  const pvsScore = 91;
  const rank = 3;
  const totalVendors = 148;
  const tier = profile?.tier || "free";
  const vendorName = profile?.vendor_name || "Your Vendor";

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
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-10"
        >
          {/* Score circle */}
          <div className="flex-shrink-0 animate-pulse-glow rounded-full">
            <ScoreCircle score={pvsScore} />
          </div>

          {/* Vendor info */}
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-emerald">
                <TrendingUp className="w-4 h-4" />
                <span>+7 pts last 30d</span>
              </div>
            </div>
          </div>

          {/* Quick tier badge */}
          <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            tier === "enterprise"
              ? "bg-gradient-to-r from-emerald/20 to-emerald-light/20 border border-emerald/30 text-emerald"
              : tier === "pro"
              ? "bg-emerald/10 border border-emerald/20 text-emerald"
              : "bg-ink-3 border border-white/10 text-gray-400"
          }`}>
            <Crown className="w-4 h-4" />
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </div>
        </motion.div>

        {/* ─── Quick Stats ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Finnrick Grade",
              value: "A+",
              sub: "Top 5%",
              icon: Award,
              sparkData: [85, 87, 88, 90, 89, 92, 93, 91, 94, 95],
            },
            {
              label: "COAs Uploaded",
              value: "24",
              sub: "3 this month",
              icon: FileCheck,
              sparkData: [2, 3, 1, 4, 2, 3, 5, 2, 4, 3],
            },
            {
              label: "Reddit Sentiment",
              value: "82%",
              sub: "Positive",
              icon: MessageSquare,
              sparkData: [70, 72, 75, 73, 78, 80, 79, 82, 84, 82],
            },
            {
              label: "Competitor Gap",
              value: "+5",
              sub: "vs avg",
              icon: Target,
              sparkData: [2, 3, 4, 3, 5, 4, 6, 5, 5, 5],
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card-glow p-5 bg-ink-2 border border-white/5 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center">
                  <stat.icon className="w-4.5 h-4.5 text-emerald" />
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
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* ─── 5-Pillar Breakdown ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-6 bg-ink-2 border border-white/5 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald" />
              PVS Score Breakdown
            </h3>
            <div className="space-y-4">
              {pillars.map((p) => (
                <div key={p.name} className="group">
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
          </motion.div>

          {/* ─── Trend Chart ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 bg-ink-2 border border-white/5 rounded-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald" />
                Score Trend
              </h3>
              <div className="flex bg-ink rounded-lg p-0.5">
                <button
                  onClick={() => setTimeRange("30d")}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    timeRange === "30d"
                      ? "bg-emerald/20 text-emerald"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  30d
                </button>
                <button
                  onClick={() => setTimeRange("90d")}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    timeRange === "90d"
                      ? "bg-emerald/20 text-emerald"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  90d
                </button>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1.5 h-40">
              {trendData.map((val, i) => {
                const max = Math.max(...trendData);
                const min = Math.min(...trendData) - 10;
                const height = ((val - min) / (max - min)) * 100;
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: i * 0.03 }}
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
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* ─── Reputation Insights ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-ink-2 border border-white/5 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald" />
              Reputation Insights
            </h3>

            {/* Sentiment gauge */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex-1">
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
            </div>

            {/* Word cloud */}
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
          </motion.div>

          {/* ─── Competitor Benchmarking ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-6 bg-ink-2 border border-white/5 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald" />
              Competitor Benchmarking
              {tier === "free" && (
                <span className="ml-auto text-xs bg-emerald/10 text-emerald px-2 py-0.5 rounded-full">
                  Pro+
                </span>
              )}
            </h3>

            {tier === "free" ? (
              <div className="text-center py-8">
                <Lock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">
                  Upgrade to Pro to see how you stack up against competitors.
                </p>
                <Link
                  href="/for-vendors#pricing"
                  className="text-sm text-emerald hover:text-emerald-light transition-colors"
                >
                  View Plans &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {competitors.map((c, i) => (
                  <div
                    key={c.name}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      c.you
                        ? "bg-emerald/10 border border-emerald/20"
                        : "bg-ink hover:bg-ink-3"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        c.rank === 1
                          ? "bg-yellow-500/20 text-yellow-400"
                          : c.you
                          ? "bg-emerald/20 text-emerald"
                          : "bg-ink-3 text-gray-500"
                      }`}
                    >
                      {c.rank}
                    </span>
                    <span className={`flex-1 text-sm ${c.you ? "text-white font-semibold" : "text-gray-400"}`}>
                      {c.name}
                      {c.you && <span className="ml-1 text-xs text-emerald">(You)</span>}
                    </span>
                    <div className="w-20 h-1.5 bg-ink-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${c.you ? "text-emerald" : "text-gray-400"}`}>
                      {c.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── Quick Actions ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald" />
            Quick Actions
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
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
        </motion.div>

        {/* ─── Enterprise Upsell (for Free/Pro users) ─── */}
        {tier !== "enterprise" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative overflow-hidden p-8 bg-ink-2 border border-emerald/20 rounded-2xl"
          >
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
                    ? "Get competitor benchmarking, priority COA verification, advanced analytics, and more with our Pro plan."
                    : "Get API access, SSO, white-label reports, dedicated account manager, and custom SLA with Enterprise."}
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
          </motion.div>
        )}
      </div>
    </div>
  );
}

