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
  AlertCircle,
  Search,
  ExternalLink,
  ChevronDown,
  Crown,
  TrendingUp,
  BarChart3,
  Settings,
  Loader2,
  ShieldAlert,
  X,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  approveClaim,
  rejectClaim,
  updateVendorTier,
  toggleAdmin,
} from "@/app/actions/admin";
import {
  getActiveAlerts,
  createAlert,
  resolveAlert,
  type VendorAlert,
} from "@/app/actions/alerts";

/* ─── Types ─── */
interface Profile {
  id: string;
  user_id: string;
  vendor_name: string;
  website: string;
  contact_email: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  tier: "free" | "pro" | "enterprise";
  is_admin: boolean;
  pvs_score: number | null;
  rank: number | null;
  claimed_at: string;
  verified_at: string | null;
  upgraded_at: string | null;
  created_at: string;
}

type Tab = "claims" | "vendors" | "alerts" | "settings";
type StatusFilter = "all" | "pending" | "approved" | "rejected";

/* ─── Mock data (used when Supabase isn't configured) ─── */
const mockProfiles: Profile[] = [
  { id: "1", user_id: "u1", vendor_name: "NovaPeptides", website: "https://novapeptides.com", contact_email: "admin@novapeptides.com", message: "Leading peptide supplier", status: "approved", tier: "pro", is_admin: false, pvs_score: 96, rank: 1, claimed_at: "2026-01-15T10:00:00Z", verified_at: "2026-01-17T14:00:00Z", upgraded_at: "2026-02-01T10:00:00Z", created_at: "2026-01-15T10:00:00Z" },
  { id: "2", user_id: "u2", vendor_name: "PeptideWorks", website: "https://peptideworks.com", contact_email: "info@peptideworks.com", message: "Research-grade peptides", status: "approved", tier: "enterprise", is_admin: false, pvs_score: 93, rank: 2, claimed_at: "2026-01-20T08:00:00Z", verified_at: "2026-01-22T11:00:00Z", upgraded_at: "2026-03-01T10:00:00Z", created_at: "2026-01-20T08:00:00Z" },
  { id: "3", user_id: "u3", vendor_name: "BioSynth Labs", website: "https://biosynthlabs.com", contact_email: "contact@biosynthlabs.com", message: "ISO certified lab", status: "approved", tier: "free", is_admin: false, pvs_score: 91, rank: 3, claimed_at: "2026-02-01T12:00:00Z", verified_at: "2026-02-03T09:00:00Z", upgraded_at: null, created_at: "2026-02-01T12:00:00Z" },
  { id: "4", user_id: "u4", vendor_name: "CorePeptide", website: "https://corepeptide.com", contact_email: "hello@corepeptide.com", message: "Fast domestic shipping", status: "pending", tier: "free", is_admin: false, pvs_score: null, rank: null, claimed_at: "2026-04-08T15:00:00Z", verified_at: null, upgraded_at: null, created_at: "2026-04-08T15:00:00Z" },
  { id: "5", user_id: "u5", vendor_name: "Amino Science", website: "https://aminoscience.ca", contact_email: "support@aminoscience.ca", message: "", status: "pending", tier: "free", is_admin: false, pvs_score: null, rank: null, claimed_at: "2026-04-09T10:00:00Z", verified_at: null, upgraded_at: null, created_at: "2026-04-09T10:00:00Z" },
  { id: "6", user_id: "u6", vendor_name: "PureSequence", website: "https://puresequence.eu", contact_email: "info@puresequence.eu", message: "EU-based supplier", status: "pending", tier: "free", is_admin: false, pvs_score: null, rank: null, claimed_at: "2026-04-10T08:00:00Z", verified_at: null, upgraded_at: null, created_at: "2026-04-10T08:00:00Z" },
  { id: "7", user_id: "u7", vendor_name: "FakePeptides Inc", website: "https://fakepep.com", contact_email: "scam@fakepep.com", message: "Best peptides guaranteed", status: "rejected", tier: "free", is_admin: false, pvs_score: null, rank: null, claimed_at: "2026-03-20T14:00:00Z", verified_at: null, upgraded_at: null, created_at: "2026-03-20T14:00:00Z" },
  { id: "8", user_id: "u8", vendor_name: "Admin User", website: "", contact_email: "admin@pepassure.com", message: "", status: "approved", tier: "enterprise", is_admin: true, pvs_score: null, rank: null, claimed_at: "2025-12-01T10:00:00Z", verified_at: "2025-12-01T10:00:00Z", upgraded_at: null, created_at: "2025-12-01T10:00:00Z" },
];

const statusConfig = {
  pending: { icon: Clock, label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  approved: { icon: CheckCircle2, label: "Approved", color: "text-emerald", bg: "bg-emerald/10 border-emerald/20" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const tierColors = {
  free: "bg-ink-3 text-gray-400 border-white/10",
  pro: "bg-emerald/10 text-emerald border-emerald/20",
  enterprise: "bg-gradient-to-r from-emerald/20 to-emerald-light/20 text-emerald border-emerald/30",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Confirm dialog ─── */
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
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
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${confirmColor}`}
          >
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<VendorAlert[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertFormLoading, setAlertFormLoading] = useState(false);

  // Confirm dialog state
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: string;
    action: () => Promise<void>;
  }>({ open: false, title: "", message: "", confirmLabel: "", confirmColor: "", action: async () => {} });

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const res = await supabase.auth.getUser();
      const u = res.data?.user ?? null;
      setUser(u);

      if (u) {
        // Check if admin
        const profileRes = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("user_id", u.id)
          .single();

        if (profileRes.data?.is_admin) {
          setIsAdmin(true);

          // Load all profiles (admin RLS allows this)
          const allRes = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

          if (allRes.data && allRes.data.length > 0) {
            setProfiles(allRes.data);
          } else {
            // Use mock data if no real data
            setProfiles(mockProfiles);
          }

          // Load alerts
          getActiveAlerts().then((a) => setAlerts(a));
        }
      } else {
        // No user — redirect to login (middleware should catch this, but double-check)
        setIsAdmin(false);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: profiles.filter((p) => !p.is_admin).length,
    pending: profiles.filter((p) => p.status === "pending").length,
    approved: profiles.filter((p) => p.status === "approved" && !p.is_admin).length,
    rejected: profiles.filter((p) => p.status === "rejected").length,
    pro: profiles.filter((p) => p.tier === "pro").length,
    enterprise: profiles.filter((p) => p.tier === "enterprise").length,
  }), [profiles]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    let list = profiles.filter((p) => !p.is_admin);
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.vendor_name.toLowerCase().includes(q) ||
          p.contact_email?.toLowerCase().includes(q) ||
          p.website?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [profiles, statusFilter, searchQuery]);

  // Approved vendors only
  const approvedVendors = useMemo(
    () => profiles.filter((p) => p.status === "approved" && !p.is_admin),
    [profiles]
  );

  // Admin users
  const adminUsers = useMemo(
    () => profiles.filter((p) => p.is_admin),
    [profiles]
  );

  const handleApprove = (profile: Profile) => {
    setConfirm({
      open: true,
      title: "Approve Claim",
      message: `Approve "${profile.vendor_name}"? They'll appear as a verified vendor on PepAssure.`,
      confirmLabel: "Approve",
      confirmColor: "bg-emerald hover:bg-emerald-light",
      action: async () => {
        setActionLoading(profile.id);
        await approveClaim(profile.id);
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profile.id
              ? { ...p, status: "approved" as const, verified_at: new Date().toISOString() }
              : p
          )
        );
        setActionLoading(null);
        setConfirm((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleReject = (profile: Profile) => {
    setConfirm({
      open: true,
      title: "Reject Claim",
      message: `Reject "${profile.vendor_name}"? This cannot be easily undone.`,
      confirmLabel: "Reject",
      confirmColor: "bg-red-600 hover:bg-red-500",
      action: async () => {
        setActionLoading(profile.id);
        await rejectClaim(profile.id);
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profile.id ? { ...p, status: "rejected" as const } : p
          )
        );
        setActionLoading(null);
        setConfirm((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleTierChange = async (profile: Profile, tier: "free" | "pro" | "enterprise") => {
    setActionLoading(profile.id);
    await updateVendorTier(profile.id, tier);
    setProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, tier } : p))
    );
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
          <Link
            href="/"
            className="btn-glow inline-flex px-6 py-3 bg-emerald text-white font-medium rounded-lg"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const tabItems: { key: Tab; label: string; icon: typeof FileText; badge?: number }[] = [
    { key: "claims", label: "Claims", icon: FileText, badge: stats.pending },
    { key: "vendors", label: "Vendors", icon: Users },
    { key: "alerts", label: "Alerts", icon: AlertTriangle, badge: alerts.length },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen molecular-bg pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage claims, vendors, and platform settings</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Stats ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Claims", value: stats.total, icon: FileText, color: "text-white" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400" },
            { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="p-5 bg-ink-2 border border-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ─── Tabs ─── */}
        <div className="flex items-center gap-1 mb-8 border-b border-white/5 overflow-x-auto">
          {tabItems.map((tab) => (
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
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 w-5 h-5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab content ─── */}
        <AnimatePresence mode="wait">
          {/* ═══ Claims Tab ═══ */}
          {activeTab === "claims" && (
            <motion.div
              key="claims"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Filters */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                        statusFilter === f
                          ? f === "pending"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : f === "approved"
                            ? "bg-emerald/20 text-emerald border border-emerald/30"
                            : f === "rejected"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald/20 text-emerald border border-emerald/30"
                          : "bg-ink-2 text-gray-500 border border-white/5 hover:border-white/10"
                      }`}
                    >
                      {f}
                      {f !== "all" && (
                        <span className="ml-1.5 text-xs opacity-60">
                          {profiles.filter((p) => p.status === f && !p.is_admin).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search claims..."
                    className="w-full pl-10 pr-4 py-2.5 bg-ink-2 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
                  />
                </div>
              </div>

              {/* Claims table */}
              <div className="bg-ink-2 border border-white/5 rounded-xl overflow-hidden">
                {filteredClaims.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No claims match your filters</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Vendor</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Contact</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Tier</th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Claimed</th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredClaims.map((p, i) => {
                            const st = statusConfig[p.status];
                            return (
                              <motion.tr
                                key={p.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="border-b border-white/5 hover:bg-ink-3/50 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="text-sm font-medium text-white">{p.vendor_name}</p>
                                    <a
                                      href={p.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-gray-500 hover:text-emerald transition-colors inline-flex items-center gap-1"
                                    >
                                      {p.website.replace(/https?:\/\//, "")}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-400">{p.contact_email}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${st.bg} ${st.color}`}>
                                    <st.icon className="w-3 h-3" />
                                    {st.label}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${tierColors[p.tier]}`}>
                                    <Crown className="w-3 h-3" />
                                    {p.tier}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-500">{formatDate(p.claimed_at)}</span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {p.status === "pending" && (
                                    <div className="flex items-center gap-2 justify-end">
                                      <button
                                        onClick={() => handleApprove(p)}
                                        disabled={actionLoading === p.id}
                                        className="px-3 py-1.5 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-medium rounded-lg hover:bg-emerald/20 transition-all disabled:opacity-50"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleReject(p)}
                                        disabled={actionLoading === p.id}
                                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {p.status === "approved" && (
                                    <span className="text-xs text-gray-600">
                                      Verified {p.verified_at ? formatDate(p.verified_at) : ""}
                                    </span>
                                  )}
                                  {p.status === "rejected" && (
                                    <button
                                      onClick={() => handleApprove(p)}
                                      className="px-3 py-1.5 bg-ink-3 border border-white/10 text-gray-400 text-xs font-medium rounded-lg hover:text-white transition-all"
                                    >
                                      Reconsider
                                    </button>
                                  )}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-white/5">
                      {filteredClaims.map((p) => {
                        const st = statusConfig[p.status];
                        return (
                          <div key={p.id} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-white">{p.vendor_name}</p>
                                <p className="text-xs text-gray-500">{p.contact_email}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${st.bg} ${st.color}`}>
                                <st.icon className="w-3 h-3" />
                                {st.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border capitalize ${tierColors[p.tier]}`}>
                                {p.tier}
                              </span>
                              <span>{formatDate(p.claimed_at)}</span>
                            </div>
                            {p.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(p)}
                                  className="flex-1 py-2 bg-emerald/10 border border-emerald/20 text-emerald text-xs font-medium rounded-lg"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(p)}
                                  className="flex-1 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ Vendors Tab ═══ */}
          {activeTab === "vendors" && (
            <motion.div
              key="vendors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Verified Vendors</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {approvedVendors.length} vendors &middot; {stats.pro} Pro &middot; {stats.enterprise} Enterprise
                  </p>
                </div>
              </div>

              <div className="bg-ink-2 border border-white/5 rounded-xl overflow-hidden">
                {approvedVendors.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No verified vendors yet</p>
                  </div>
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
                          <motion.tr
                            key={p.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-white/5 hover:bg-ink-3/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center">
                                  <Shield className="w-4 h-4 text-emerald" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{p.vendor_name}</p>
                                  <p className="text-xs text-gray-500">{p.contact_email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {p.pvs_score ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-emerald">{p.pvs_score}</span>
                                  {p.rank && <span className="text-xs text-gray-500">#{p.rank}</span>}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-600">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${tierColors[p.tier]}`}>
                                <Crown className="w-3 h-3" />
                                {p.tier}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-500">
                                {p.verified_at ? formatDate(p.verified_at) : "—"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <select
                                  value={p.tier}
                                  onChange={(e) => handleTierChange(p, e.target.value as any)}
                                  disabled={actionLoading === p.id}
                                  className="appearance-none bg-ink border border-white/10 text-gray-300 text-xs rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-emerald/30 cursor-pointer disabled:opacity-50"
                                >
                                  <option value="free">Free</option>
                                  <option value="pro">Pro</option>
                                  <option value="enterprise">Enterprise</option>
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

          {/* ═══ Alerts Tab ═══ */}
          {activeTab === "alerts" && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-bold text-white">
                  Vendor Alerts ({alerts.length} active)
                </h3>
                <button
                  onClick={() => setShowAlertForm(!showAlertForm)}
                  className="btn-glow flex items-center gap-2 px-4 py-2 bg-emerald text-white text-sm font-medium rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  New Alert
                </button>
              </div>

              {/* New Alert Form */}
              <AnimatePresence>
                {showAlertForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setAlertFormLoading(true);
                        const formData = new FormData(e.currentTarget);
                        const result = await createAlert(formData);
                        if (result.success) {
                          setShowAlertForm(false);
                          // Refresh alerts
                          const fresh = await getActiveAlerts();
                          setAlerts(fresh);
                        }
                        setAlertFormLoading(false);
                      }}
                      className="p-6 bg-ink-2 border border-white/10 rounded-xl space-y-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Vendor Name *</label>
                          <input
                            name="vendor_name"
                            required
                            className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
                            placeholder="e.g. PeptideGains.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Alert Type</label>
                          <select
                            name="alert_type"
                            className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald/30"
                          >
                            <option value="shutdown">Vendor Shutdown</option>
                            <option value="fda_warning">FDA Warning</option>
                            <option value="fraud_alert">Fraud Alert</option>
                            <option value="quality_issue">Quality Issue</option>
                            <option value="domain_change">Domain Change</option>
                            <option value="acquisition">Acquisition</option>
                            <option value="general">General</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Severity</label>
                          <select
                            name="severity"
                            className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald/30"
                          >
                            <option value="critical">Critical (red banner)</option>
                            <option value="warning">Warning (yellow)</option>
                            <option value="info">Info (blue)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Expires At (optional)</label>
                          <input
                            name="expires_at"
                            type="date"
                            className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Headline *</label>
                        <input
                          name="headline"
                          required
                          className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
                          placeholder="e.g. Vendor Shutdown Alert — Active"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Banner Text (top bar, keep short)</label>
                        <input
                          name="banner_text"
                          className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
                          placeholder="e.g. PeptideGains.com is shutting down May 15, 2026."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Summary *</label>
                        <textarea
                          name="summary"
                          required
                          rows={3}
                          className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30 resize-none"
                          placeholder="Detailed alert description..."
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Alternatives (comma-separated)</label>
                          <input
                            name="alternatives"
                            className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
                            placeholder="Vendor A, Vendor B, Vendor C"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Link URL</label>
                          <input
                            name="link"
                            className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
                            placeholder="/blog/vendor-alert-slug"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Link Text</label>
                        <input
                          name="link_text"
                          className="w-full px-3 py-2 bg-ink border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30"
                          placeholder="View full alert & transfer guide"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAlertForm(false)}
                          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={alertFormLoading}
                          className="btn-glow px-6 py-2 bg-emerald text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                          {alertFormLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Publish Alert
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Alerts List */}
              {alerts.length === 0 ? (
                <div className="text-center py-16">
                  <AlertTriangle className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No active alerts</p>
                  <p className="text-gray-600 text-sm">
                    Publish an alert when a vendor shutdown, FDA warning, or quality issue is detected.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const severityColors = {
                      critical: { bg: "bg-red-950/40 border-red-500/30", text: "text-red-400", badge: "bg-red-500/20 text-red-400" },
                      warning: { bg: "bg-yellow-950/30 border-yellow-500/30", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-400" },
                      info: { bg: "bg-blue-950/30 border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-400" },
                    };
                    const colors = severityColors[alert.severity as keyof typeof severityColors] || severityColors.warning;

                    return (
                      <div
                        key={alert.id}
                        className={`p-5 border rounded-xl ${colors.bg}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <AlertTriangle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className={`text-sm font-bold ${colors.text}`}>{alert.headline}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                                  {alert.severity.toUpperCase()}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-3 text-gray-400">
                                  {alert.alert_type.replace("_", " ")}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 mb-1">{alert.vendor_name}</p>
                              <p className="text-xs text-gray-500 line-clamp-2">{alert.summary}</p>
                              {alert.alternatives.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Alternatives: {alert.alternatives.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              setActionLoading(alert.id);
                              await resolveAlert(alert.id);
                              setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
                              setActionLoading(null);
                            }}
                            disabled={actionLoading === alert.id}
                            className="px-3 py-1.5 text-xs font-medium text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-all flex-shrink-0 disabled:opacity-50"
                          >
                            {actionLoading === alert.id ? "..." : "Resolve"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ Settings Tab ═══ */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Platform stats */}
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald" />
                  Platform Overview
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-ink rounded-lg">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-gray-500 mt-1">Total vendor claims</p>
                  </div>
                  <div className="p-4 bg-ink rounded-lg">
                    <p className="text-2xl font-bold text-emerald">{stats.pro + stats.enterprise}</p>
                    <p className="text-xs text-gray-500 mt-1">Paid subscribers</p>
                  </div>
                  <div className="p-4 bg-ink rounded-lg">
                    <p className="text-2xl font-bold text-white">
                      {stats.total > 0
                        ? `${Math.round((stats.approved / Math.max(stats.total, 1)) * 100)}%`
                        : "0%"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Approval rate</p>
                  </div>
                </div>
              </div>

              {/* Admin users */}
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald" />
                  Admin Users
                </h3>
                {adminUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No admin users found.</p>
                ) : (
                  <div className="space-y-3">
                    {adminUsers.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-3 bg-ink rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-emerald" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">
                              {a.vendor_name || a.contact_email}
                            </p>
                            <p className="text-xs text-gray-500">{a.contact_email}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-emerald/10 text-emerald px-2.5 py-1 rounded-full border border-emerald/20">
                          Admin
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-4">
                  To add/remove admins, run: <code className="text-gray-400">UPDATE profiles SET is_admin = true WHERE user_id = &apos;...&apos;</code>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        confirmColor={confirm.confirmColor}
        onConfirm={confirm.action}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
        loading={actionLoading !== null}
      />
    </div>
  );
}
