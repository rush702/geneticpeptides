"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  ChevronDown,
  Crown,
  BarChart3,
  Settings,
  Loader2,
  ShieldAlert,
  Star,
  MessageSquare,
  TrendingUp,
  ChevronUp,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  approveClaim,
  rejectClaim,
  updateVendorTier,
  toggleAdmin,
  approveReview,
  rejectReview,
  updateNominationStatus,
} from "@/app/actions/admin";

/* ─── Types ─── */
interface Profile {
  id: string;
  user_id: string;
  vendor_name: string;
  website_url: string;
  contact_email: string;
  message: string;
  status: "pending" | "verified" | "rejected";
  tier: "free" | "pro" | "enterprise";
  is_admin: boolean;
  pvs_score: number | null;
  rank: number | null;
  claimed_at: string;
  verified_at: string | null;
  upgraded_at: string | null;
  created_at: string;
}

interface Review {
  id: string;
  vendor_slug: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  author_name: string;
  status: "pending" | "approved" | "rejected"; // reviews use 'approved' not 'verified'
  created_at: string;
}

interface Nomination {
  id: string;
  nominee_name: string;
  nominee_website: string | null;
  nominee_slug: string;
  status: "pending" | "under_review" | "queued_for_testing" | "verified" | "rejected";
  reason: string | null;
  peptides_requested: string[];
  created_at: string;
  vote_count?: number;
}

type Tab = "claims" | "vendors" | "reviews" | "nominations" | "settings";
type StatusFilter = "all" | "pending" | "verified" | "rejected";

/* ─── Mock data ─── */
const mockProfiles: Profile[] = [
  { id: "1", user_id: "u1", vendor_name: "NovaPeptides", website_url: "https://novapeptides.com", contact_email: "admin@novapeptides.com", message: "Leading peptide supplier with ISO certification", status: "verified", tier: "pro", is_admin: false, pvs_score: 96, rank: 1, claimed_at: "2026-01-15T10:00:00Z", verified_at: "2026-01-17T14:00:00Z", upgraded_at: "2026-02-01T10:00:00Z", created_at: "2026-01-15T10:00:00Z" },
  { id: "2", user_id: "u2", vendor_name: "PeptideWorks", website_url: "https://peptideworks.com", contact_email: "info@peptideworks.com", message: "Research-grade peptides", status: "verified", tier: "enterprise", is_admin: false, pvs_score: 93, rank: 2, claimed_at: "2026-01-20T08:00:00Z", verified_at: "2026-01-22T11:00:00Z", upgraded_at: "2026-03-01T10:00:00Z", created_at: "2026-01-20T08:00:00Z" },
  { id: "3", user_id: "u3", vendor_name: "BioSynth Labs", website_url: "https://biosynthlabs.com", contact_email: "contact@biosynthlabs.com", message: "", status: "verified", tier: "free", is_admin: false, pvs_score: 91, rank: 3, claimed_at: "2026-02-01T12:00:00Z", verified_at: "2026-02-03T09:00:00Z", upgraded_at: null, created_at: "2026-02-01T12:00:00Z" },
  { id: "4", user_id: "u4", vendor_name: "CorePeptide", website_url: "https://corepeptide.com", contact_email: "hello@corepeptide.com", message: "Fast domestic shipping, all batches HPLC tested", status: "pending", tier: "free", is_admin: false, pvs_score: null, rank: null, claimed_at: "2026-04-08T15:00:00Z", verified_at: null, upgraded_at: null, created_at: "2026-04-08T15:00:00Z" },
  { id: "5", user_id: "u5", vendor_name: "Amino Science", website_url: "https://aminoscience.ca", contact_email: "support@aminoscience.ca", message: "", status: "pending", tier: "free", is_admin: false, pvs_score: null, rank: null, claimed_at: "2026-04-09T10:00:00Z", verified_at: null, upgraded_at: null, created_at: "2026-04-09T10:00:00Z" },
  { id: "6", user_id: "u6", vendor_name: "PureSequence", website_url: "https://puresequence.eu", contact_email: "info@puresequence.eu", message: "EU-based supplier with GMP certification", status: "pending", tier: "free", is_admin: false, pvs_score: null, rank: null, claimed_at: "2026-04-10T08:00:00Z", verified_at: null, upgraded_at: null, created_at: "2026-04-10T08:00:00Z" },
  { id: "7", user_id: "u7", vendor_name: "FakePeptides Inc", website_url: "https://fakepep.com", contact_email: "scam@fakepep.com", message: "Best peptides guaranteed", status: "rejected", tier: "free", is_admin: false, pvs_score: null, rank: null, claimed_at: "2026-03-20T14:00:00Z", verified_at: null, upgraded_at: null, created_at: "2026-03-20T14:00:00Z" },
  { id: "8", user_id: "u8", vendor_name: "Admin User", website_url: "", contact_email: "admin@pepassure.com", message: "", status: "verified", tier: "enterprise", is_admin: true, pvs_score: null, rank: null, claimed_at: "2025-12-01T10:00:00Z", verified_at: "2025-12-01T10:00:00Z", upgraded_at: null, created_at: "2025-12-01T10:00:00Z" },
];

const mockReviews: Review[] = [
  { id: "r1", vendor_slug: "novapeptides", user_id: "u10", rating: 5, title: "Excellent purity and fast shipping", body: "Ordered BPC-157 and TB-500. Both came with full COAs. Purity matched claims. Shipping took 2 days.", author_name: "ResearcherMike", status: "pending", created_at: "2026-04-10T14:00:00Z" },
  { id: "r2", vendor_slug: "peptideworks", user_id: "u11", rating: 4, title: "Good quality, slow support", body: "Products are great but customer support took 3 days to respond to my question about reconstitution.", author_name: "LabTech22", status: "pending", created_at: "2026-04-11T09:00:00Z" },
  { id: "r3", vendor_slug: "biosynthlabs", user_id: "u12", rating: 2, title: "Suspicious COA", body: "The COA looked like a template. Purity numbers were oddly round. Would not order again until verified.", author_name: "SkepticalSam", status: "pending", created_at: "2026-04-12T11:00:00Z" },
];

const mockNominations: Nomination[] = [
  { id: "n1", nominee_name: "Paradigm Peptides", nominee_website: "https://paradigmpeptides.com", nominee_slug: "paradigm-peptides", status: "under_review", reason: "Popular vendor, needs independent verification", peptides_requested: ["BPC-157", "Semaglutide"], created_at: "2026-04-05T10:00:00Z", vote_count: 187 },
  { id: "n2", nominee_name: "Amino Asylum", nominee_website: "https://aminoasylum.com", nominee_slug: "amino-asylum", status: "queued_for_testing", reason: null, peptides_requested: ["TB-500", "BPC-157"], created_at: "2026-04-06T08:00:00Z", vote_count: 156 },
  { id: "n3", nominee_name: "Trident Peptides", nominee_website: "https://tridentpeptides.com", nominee_slug: "trident-peptides", status: "pending", reason: "UK-based, frequently recommended on Reddit", peptides_requested: ["Tirzepatide", "Retatrutide"], created_at: "2026-04-08T12:00:00Z", vote_count: 87 },
];

const statusConfig = {
  pending: { icon: Clock, label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  verified: { icon: CheckCircle2, label: "Verified", color: "text-emerald", bg: "bg-emerald/10 border-emerald/20" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const nominationStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  under_review: { label: "Under Review", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  queued_for_testing: { label: "Queued for Testing", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  verified: { label: "Verified", color: "bg-emerald/10 text-emerald border-emerald/20" },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const tierColors = {
  free: "bg-ink-3 text-gray-400 border-white/10",
  pro: "bg-emerald/10 text-emerald border-emerald/20",
  enterprise: "bg-gradient-to-r from-emerald/20 to-emerald-light/20 text-emerald border-emerald/30",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Confirm dialog ─── */
function ConfirmDialog({
  open, title, message, confirmLabel, confirmColor, onConfirm, onCancel, loading,
}: {
  open: boolean; title: string; message: string; confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div onClick={onCancel} className="absolute inset-0 bg-black/60 modal-overlay" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm bg-ink-2 border border-white/10 rounded-2xl shadow-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${confirmColor}`}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════ */
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("claims");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<{
    open: boolean; title: string; message: string; confirmLabel: string; confirmColor: string; action: () => Promise<void>;
  }>({ open: false, title: "", message: "", confirmLabel: "", confirmColor: "", action: async () => {} });

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const res = await supabase.auth.getUser();
      const u = res.data?.user ?? null;
      setUser(u);

      if (u) {
        // Check admin via user_roles table
        const roleRes = await supabase.from("user_roles").select("role").eq("user_id", u.id).single();
        if (roleRes.data?.role === "admin") {
          setIsAdmin(true);

          // Load profiles
          const allRes = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
          setProfiles(allRes.data && allRes.data.length > 0 ? allRes.data : mockProfiles);

          // Load reviews
          const reviewRes = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
          setReviews(reviewRes.data && reviewRes.data.length > 0 ? reviewRes.data : mockReviews);

          // Load nominations
          const nomRes = await supabase.from("nominations").select("*").order("created_at", { ascending: false });
          setNominations(nomRes.data && nomRes.data.length > 0 ? nomRes.data : mockNominations);
        }
      } else {
        // Demo mode
        setIsAdmin(true);
        setProfiles(mockProfiles);
        setReviews(mockReviews);
        setNominations(mockNominations);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: profiles.filter((p) => !p.is_admin).length,
    pending: profiles.filter((p) => p.status === "pending").length,
    approved: profiles.filter((p) => p.status === "verified" && !p.is_admin).length,
    rejected: profiles.filter((p) => p.status === "rejected").length,
    pro: profiles.filter((p) => p.tier === "pro").length,
    enterprise: profiles.filter((p) => p.tier === "enterprise").length,
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
    activeNominations: nominations.filter((n) => n.status !== "rejected" && n.status !== "verified").length,
  }), [profiles, reviews, nominations]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    let list = profiles.filter((p) => !p.is_admin);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.vendor_name.toLowerCase().includes(q) || p.contact_email?.toLowerCase().includes(q) || p.website_url?.toLowerCase().includes(q));
    }
    return list;
  }, [profiles, statusFilter, searchQuery]);

  const approvedVendors = useMemo(() => profiles.filter((p) => p.status === "verified" && !p.is_admin), [profiles]);
  const adminUsers = useMemo(() => profiles.filter((p) => p.is_admin), [profiles]);

  // Claim actions
  const handleApprove = (profile: Profile) => {
    setConfirm({
      open: true, title: "Approve Claim",
      message: `Approve "${profile.vendor_name}"? They'll appear as a verified vendor.`,
      confirmLabel: "Approve", confirmColor: "bg-emerald hover:bg-emerald-light",
      action: async () => {
        setActionLoading(profile.id);
        await approveClaim(profile.id);
        setProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, status: "verified" as const } : p));
        setActionLoading(null);
        setConfirm((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleReject = (profile: Profile) => {
    setConfirm({
      open: true, title: "Reject Claim",
      message: `Reject "${profile.vendor_name}"?`,
      confirmLabel: "Reject", confirmColor: "bg-red-600 hover:bg-red-500",
      action: async () => {
        setActionLoading(profile.id);
        await rejectClaim(profile.id);
        setProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, status: "rejected" as const } : p));
        setActionLoading(null);
        setConfirm((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleTierChange = async (profile: Profile, tier: "free" | "pro" | "enterprise") => {
    setActionLoading(profile.id);
    await updateVendorTier(profile.id, tier);
    setProfiles((prev) => prev.map((p) => (p.id === profile.id ? { ...p, tier } : p)));
    setActionLoading(null);
  };

  // Review actions
  const handleApproveReview = (review: Review) => {
    setConfirm({
      open: true, title: "Approve Review",
      message: `Publish "${review.title}" by ${review.author_name}?`,
      confirmLabel: "Approve", confirmColor: "bg-emerald hover:bg-emerald-light",
      action: async () => {
        setActionLoading(review.id);
        await approveReview(review.id);
        setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, status: "approved" as const } : r));
        setActionLoading(null);
        setConfirm((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleRejectReview = (review: Review) => {
    setConfirm({
      open: true, title: "Reject Review",
      message: `Reject "${review.title}" by ${review.author_name}? This review won't be published.`,
      confirmLabel: "Reject", confirmColor: "bg-red-600 hover:bg-red-500",
      action: async () => {
        setActionLoading(review.id);
        await rejectReview(review.id);
        setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, status: "rejected" as const } : r));
        setActionLoading(null);
        setConfirm((c) => ({ ...c, open: false }));
      },
    });
  };

  // Nomination actions
  const handleNominationStatus = async (nomination: Nomination, status: Nomination["status"]) => {
    setActionLoading(nomination.id);
    await updateNominationStatus(nomination.id, status);
    setNominations((prev) => prev.map((n) => n.id === nomination.id ? { ...n, status } : n));
    setActionLoading(null);
  };

  // Admin toggle
  const handleToggleAdmin = async (profile: Profile) => {
    setActionLoading(profile.id);
    await toggleAdmin(profile.id, !profile.is_admin);
    setProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, is_admin: !p.is_admin } : p));
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don&apos;t have admin privileges.</p>
          <Link href="/" className="btn-glow inline-flex px-6 py-3 bg-emerald text-white font-medium rounded-lg">Go Home</Link>
        </div>
      </div>
    );
  }

  const tabItems: { key: Tab; label: string; icon: typeof FileText; badge?: number }[] = [
    { key: "claims", label: "Claims", icon: FileText, badge: stats.pending },
    { key: "vendors", label: "Vendors", icon: Users },
    { key: "reviews", label: "Reviews", icon: Star, badge: stats.pendingReviews },
    { key: "nominations", label: "Nominations", icon: TrendingUp, badge: stats.activeNominations },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen molecular-bg pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage claims, vendors, reviews, and nominations</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Claims", value: stats.total, icon: FileText, color: "text-white" },
            { label: "Pending Claims", value: stats.pending, icon: Clock, color: "text-yellow-400" },
            { label: "Pending Reviews", value: stats.pendingReviews, icon: Star, color: "text-blue-400" },
            { label: "Active Nominations", value: stats.activeNominations, icon: TrendingUp, color: "text-emerald" },
          ].map((s) => (
            <div key={s.label} className="p-5 bg-ink-2 border border-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-2"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-white/5 overflow-x-auto">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key ? "text-emerald border-emerald" : "text-gray-500 border-transparent hover:text-gray-300 hover:border-white/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className="ml-1 w-5 h-5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center justify-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* ═══ Claims Tab ═══ */}
          {activeTab === "claims" && (
            <motion.div key="claims" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {/* Filters */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  {(["all", "pending", "verified", "rejected"] as StatusFilter[]).map((f) => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                        statusFilter === f
                          ? f === "pending" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : f === "verified" ? "bg-emerald/20 text-emerald border border-emerald/30"
                            : f === "rejected" ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald/20 text-emerald border border-emerald/30"
                          : "bg-ink-2 text-gray-500 border border-white/5 hover:border-white/10"
                      }`}
                    >
                      {f}
                      {f !== "all" && <span className="ml-1.5 text-xs opacity-60">{profiles.filter((p) => p.status === f && !p.is_admin).length}</span>}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search claims..."
                    className="w-full pl-10 pr-4 py-2.5 bg-ink-2 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30" />
                </div>
              </div>

              {/* Claims list */}
              <div className="bg-ink-2 border border-white/5 rounded-xl overflow-hidden">
                {filteredClaims.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No claims match your filters</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredClaims.map((p, i) => {
                      const st = statusConfig[p.status];
                      const hasMessage = p.message && p.message.trim().length > 0;
                      const isExpanded = expandedMessage === p.id;
                      return (
                        <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          className="p-4 hover:bg-ink-3/50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-white">{p.vendor_name}</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${st.bg} ${st.color}`}>
                                  <st.icon className="w-3 h-3" />{st.label}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${tierColors[p.tier]}`}>
                                  <Crown className="w-3 h-3" />{p.tier}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span>{p.contact_email}</span>
                                {p.website_url && (
                                  <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-emerald transition-colors">
                                    {p.website_url.replace(/https?:\/\//, "").replace(/\/$/, "")}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <span>{formatDate(p.created_at)}</span>
                                {hasMessage && (
                                  <button onClick={() => setExpandedMessage(isExpanded ? null : p.id)} className="inline-flex items-center gap-1 text-emerald hover:text-emerald-light transition-colors">
                                    <MessageSquare className="w-3 h-3" />
                                    {isExpanded ? "Hide message" : "View message"}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {p.status === "pending" && (
                                <>
                                  <button onClick={() => handleApprove(p)} disabled={actionLoading === p.id}
                                    className="px-3 py-1.5 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-medium rounded-lg hover:bg-emerald/20 transition-all disabled:opacity-50">Approve</button>
                                  <button onClick={() => handleReject(p)} disabled={actionLoading === p.id}
                                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50">Reject</button>
                                </>
                              )}
                              {p.status === "verified" && <span className="text-xs text-gray-600">Verified {p.verified_at ? formatDate(p.verified_at) : ""}</span>}
                              {p.status === "rejected" && (
                                <button onClick={() => handleApprove(p)} className="px-3 py-1.5 bg-ink-3 border border-white/10 text-gray-400 text-xs font-medium rounded-lg hover:text-white transition-all">Reconsider</button>
                              )}
                            </div>
                          </div>
                          {/* Expandable message */}
                          {hasMessage && isExpanded && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-3 bg-ink rounded-lg border border-white/5">
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vendor Message</p>
                              <p className="text-sm text-gray-300 leading-relaxed">{p.message}</p>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ Vendors Tab ═══ */}
          {activeTab === "vendors" && (
            <motion.div key="vendors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Verified Vendors</h2>
                  <p className="text-sm text-gray-500 mt-1">{approvedVendors.length} vendors &middot; {stats.pro} Pro &middot; {stats.enterprise} Enterprise</p>
                </div>
              </div>
              <div className="bg-ink-2 border border-white/5 rounded-xl overflow-hidden">
                {approvedVendors.length === 0 ? (
                  <div className="text-center py-12"><Users className="w-10 h-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No verified vendors yet</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Vendor</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Score</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Tier</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Verified</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Change Tier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedVendors.map((p, i) => (
                          <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                            className="border-b border-white/5 hover:bg-ink-3/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center"><Shield className="w-4 h-4 text-emerald" /></div>
                                <div><p className="text-sm font-medium text-white">{p.vendor_name}</p><p className="text-xs text-gray-500">{p.contact_email}</p></div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {p.pvs_score ? (
                                <div className="flex items-center gap-2"><span className="text-sm font-bold text-emerald">{p.pvs_score}</span>{p.rank && <span className="text-xs text-gray-500">#{p.rank}</span>}</div>
                              ) : <span className="text-sm text-gray-600">&mdash;</span>}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${tierColors[p.tier]}`}><Crown className="w-3 h-3" />{p.tier}</span>
                            </td>
                            <td className="py-3 px-4"><span className="text-sm text-gray-500">{p.verified_at ? formatDate(p.verified_at) : "&mdash;"}</span></td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <select value={p.tier} onChange={(e) => handleTierChange(p, e.target.value as any)} disabled={actionLoading === p.id}
                                  className="appearance-none bg-ink border border-white/10 text-gray-300 text-xs rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-emerald/30 cursor-pointer disabled:opacity-50">
                                  <option value="free">Free</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ Reviews Tab ═══ */}
          {activeTab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Review Moderation</h2>
                  <p className="text-sm text-gray-500 mt-1">{stats.pendingReviews} pending &middot; {reviews.filter(r => r.status === "approved").length} approved &middot; {reviews.filter(r => r.status === "rejected").length} rejected</p>
                </div>
              </div>
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="bg-ink-2 border border-white/5 rounded-xl text-center py-12">
                    <Star className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No reviews yet</p>
                  </div>
                ) : (
                  reviews.map((review, i) => {
                    const st = statusConfig[review.status] || statusConfig.pending;
                    return (
                      <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-5 bg-ink-2 border border-white/5 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-white">{review.title}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${st.bg} ${st.color}`}>
                                <st.icon className="w-3 h-3" />{st.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, j) => (
                                  <Star key={j} className={`w-3 h-3 ${j < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                                ))}
                              </div>
                              <span>by {review.author_name}</span>
                              <span>for <strong className="text-gray-300">{review.vendor_slug}</strong></span>
                              <span>{formatDate(review.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">{review.body}</p>
                          </div>
                          {review.status === "pending" && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => handleApproveReview(review)} disabled={actionLoading === review.id}
                                className="px-3 py-1.5 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-medium rounded-lg hover:bg-emerald/20 transition-all disabled:opacity-50">Publish</button>
                              <button onClick={() => handleRejectReview(review)} disabled={actionLoading === review.id}
                                className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50">Reject</button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ Nominations Tab ═══ */}
          {activeTab === "nominations" && (
            <motion.div key="nominations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Nominations</h2>
                  <p className="text-sm text-gray-500 mt-1">{nominations.length} total &middot; {stats.activeNominations} active</p>
                </div>
              </div>
              <div className="space-y-3">
                {nominations.length === 0 ? (
                  <div className="bg-ink-2 border border-white/5 rounded-xl text-center py-12">
                    <TrendingUp className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No nominations yet</p>
                  </div>
                ) : (
                  nominations.map((nom, i) => {
                    const nst = nominationStatusConfig[nom.status] || nominationStatusConfig.pending;
                    return (
                      <motion.div key={nom.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-5 bg-ink-2 border border-white/5 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-white">{nom.nominee_name}</h3>
                              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${nst.color}`}>{nst.label}</span>
                              {nom.vote_count != null && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  <ChevronUp className="w-3 h-3" />{nom.vote_count} votes
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                              {nom.nominee_website && (
                                <a href={nom.nominee_website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-emerald transition-colors">
                                  <Globe className="w-3 h-3" />{nom.nominee_website.replace(/https?:\/\//, "").replace(/\/$/, "")}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <span>{formatDate(nom.created_at)}</span>
                            </div>
                            {nom.reason && <p className="text-xs text-gray-400 mb-2">{nom.reason}</p>}
                            <div className="flex flex-wrap gap-1">
                              {nom.peptides_requested.map((p) => (
                                <span key={p} className="text-[10px] px-2 py-0.5 bg-ink-3 text-gray-400 rounded-full">{p}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <select value={nom.status} onChange={(e) => handleNominationStatus(nom, e.target.value as Nomination["status"])}
                                disabled={actionLoading === nom.id}
                                className="appearance-none bg-ink border border-white/10 text-gray-300 text-xs rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-emerald/30 cursor-pointer disabled:opacity-50">
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="queued_for_testing">Queued for Testing</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ Settings Tab ═══ */}
          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-8">
              {/* Platform stats */}
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald" />Platform Overview</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-ink rounded-lg"><p className="text-2xl font-bold text-white">{stats.total}</p><p className="text-xs text-gray-500 mt-1">Total vendor claims</p></div>
                  <div className="p-4 bg-ink rounded-lg"><p className="text-2xl font-bold text-emerald">{stats.pro + stats.enterprise}</p><p className="text-xs text-gray-500 mt-1">Paid subscribers</p></div>
                  <div className="p-4 bg-ink rounded-lg">
                    <p className="text-2xl font-bold text-white">{stats.total > 0 ? `${Math.round((stats.approved / Math.max(stats.total, 1)) * 100)}%` : "0%"}</p>
                    <p className="text-xs text-gray-500 mt-1">Approval rate</p>
                  </div>
                </div>
              </div>

              {/* Admin users */}
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald" />Admin Users</h3>
                {adminUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No admin users found.</p>
                ) : (
                  <div className="space-y-3">
                    {adminUsers.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-ink rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-emerald" /></div>
                          <div>
                            <p className="text-sm text-white font-medium">{a.vendor_name || a.contact_email}</p>
                            <p className="text-xs text-gray-500">{a.contact_email}</p>
                          </div>
                        </div>
                        <button onClick={() => handleToggleAdmin(a)} disabled={actionLoading === a.id}
                          className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">
                          {actionLoading === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Remove Admin"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Promote vendor to admin */}
                {approvedVendors.filter(v => !v.is_admin).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Promote Vendor to Admin</p>
                    <div className="space-y-2">
                      {approvedVendors.filter(v => !v.is_admin).map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-3 bg-ink rounded-lg">
                          <div>
                            <p className="text-sm text-white">{v.vendor_name}</p>
                            <p className="text-xs text-gray-500">{v.contact_email}</p>
                          </div>
                          <button onClick={() => handleToggleAdmin(v)} disabled={actionLoading === v.id}
                            className="text-xs bg-emerald/10 text-emerald px-3 py-1.5 rounded-lg border border-emerald/20 hover:bg-emerald/20 transition-all disabled:opacity-50">
                            {actionLoading === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Make Admin"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={confirm.open} title={confirm.title} message={confirm.message}
        confirmLabel={confirm.confirmLabel} confirmColor={confirm.confirmColor}
        onConfirm={confirm.action} onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
        loading={actionLoading !== null}
      />
    </div>
  );
}
