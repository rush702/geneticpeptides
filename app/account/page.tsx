"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Key,
  Bell,
  Trash2,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Crown,
  ExternalLink,
  Clock,
  BookmarkCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";
import Link from "next/link";

type Tab = "profile" | "security" | "notifications" | "saved";

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Key },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "saved", label: "Saved Vendors", icon: BookmarkCheck },
];

/* Mock saved vendors */
const mockSavedVendors = [
  { slug: "novapeptides", name: "NovaPeptides", score: 96, savedAt: "Apr 5, 2026" },
  { slug: "peptideworks", name: "PeptideWorks", score: 93, savedAt: "Mar 28, 2026" },
  { slug: "biosynth-labs", name: "BioSynth Labs", score: 91, savedAt: "Mar 15, 2026" },
];

export default function AccountPage() {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const supabase = createClient();

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Notification state
  const [notifScoreAlerts, setNotifScoreAlerts] = useState(true);
  const [notifNewVendors, setNotifNewVendors] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [notifBlogPosts, setNotifBlogPosts] = useState(true);

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  // Saved vendors state
  const [savedVendors, setSavedVendors] = useState(mockSavedVendors);

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      const u = res.data?.user ?? null;
      setUser(u);
      if (u) {
        setDisplayName(u.user_metadata?.display_name || u.email?.split("@")[0] || "");
      }
      setLoading(false);
    });
  }, []);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    await supabase.auth.updateUser({
      data: { display_name: displayName },
    });
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setPasswordSaving(true);
    const result = await supabase.auth.updateUser({ password: newPassword });

    if (result.error) {
      setPasswordError(result.error.message || "Failed to update password.");
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    // In production: call a server action to delete via admin client
    alert("Account deletion requires server-side implementation.");
    setDeleteConfirmOpen(false);
  };

  const handleRemoveSaved = (slug: string) => {
    setSavedVendors((prev) => prev.filter((v) => v.slug !== slug));
  };

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
          <User className="w-12 h-12 text-emerald mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-6">You need to sign in to view your account.</p>
          <Link
            href="/login"
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
      <div className="max-w-4xl mx-auto px-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {displayName || "Your Account"}
            </h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </motion.div>

        {/* Tabs */}
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
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* ═══ Profile Tab ═══ */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald" />
                  Profile Information
                </h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-ink border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={user.email || ""}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Email cannot be changed here.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Account Created
                    </label>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Unknown"}
                    </div>
                  </div>
                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="btn-glow flex items-center gap-2 px-5 py-2.5 bg-emerald text-white font-medium rounded-lg hover:bg-emerald-light disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : profileSaved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {profileSaved ? "Saved" : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Sign out */}
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">Sign Out</h3>
                    <p className="text-sm text-gray-500">Sign out of your account on this device.</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 border border-white/10 text-gray-400 rounded-lg hover:text-white hover:border-white/20 transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Security Tab ═══ */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald" />
                  Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  {passwordError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="p-3 bg-emerald/10 border border-emerald/20 rounded-lg text-sm text-emerald flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Password updated successfully.
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordSaving || !newPassword}
                    className="btn-glow flex items-center gap-2 px-5 py-2.5 bg-emerald text-white font-medium rounded-lg hover:bg-emerald-light disabled:opacity-50"
                  >
                    {passwordSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    Update Password
                  </button>
                </div>
              </div>

              {/* Delete account */}
              <div className="p-6 bg-ink-2 border border-red-500/10 rounded-xl">
                <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
                {deleteConfirmOpen ? (
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400 mb-3">
                      Type <strong>delete my account</strong> to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      className="w-full px-4 py-2 bg-ink border border-red-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/40 mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteText !== "delete my account"}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg disabled:opacity-30 hover:bg-red-500 transition-all"
                      >
                        Delete Forever
                      </button>
                      <button
                        onClick={() => { setDeleteConfirmOpen(false); setDeleteText(""); }}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="px-4 py-2 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ Notifications Tab ═══ */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald" />
                  Email Notifications
                </h3>
                <div className="space-y-4 max-w-lg">
                  {[
                    { label: "Vendor score alerts", desc: "When a vendor you follow changes score significantly", value: notifScoreAlerts, set: setNotifScoreAlerts },
                    { label: "New vendor listings", desc: "When new vendors are verified on PepAssure", value: notifNewVendors, set: setNotifNewVendors },
                    { label: "Weekly digest", desc: "A summary of top-ranked vendors and market trends", value: notifWeeklyDigest, set: setNotifWeeklyDigest },
                    { label: "New blog posts", desc: "When we publish new guides, research, or updates", value: notifBlogPosts, set: setNotifBlogPosts },
                  ].map((pref) => (
                    <div key={pref.label} className="flex items-center justify-between p-3 bg-ink rounded-lg">
                      <div>
                        <p className="text-sm text-white">{pref.label}</p>
                        <p className="text-xs text-gray-500">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => pref.set(!pref.value)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          pref.value ? "bg-emerald" : "bg-ink-3 border border-white/10"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            pref.value ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Saved Vendors Tab ═══ */}
          {activeTab === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-emerald" />
                  Saved Vendors
                </h3>
                {savedVendors.length === 0 ? (
                  <div className="text-center py-8">
                    <BookmarkCheck className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-1">No saved vendors</p>
                    <p className="text-sm text-gray-600 mb-4">Browse vendors and save your favorites.</p>
                    <Link href="/#vendors" className="text-sm text-emerald hover:text-emerald-light transition-colors">
                      Browse Vendors &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedVendors.map((v) => (
                      <div
                        key={v.slug}
                        className="flex items-center justify-between p-4 bg-ink rounded-xl hover:bg-ink-3/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {/* Mini score */}
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
                          <div>
                            <p className="text-sm font-medium text-white">{v.name}</p>
                            <p className="text-xs text-gray-500">Saved {v.savedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/#vendors`}
                            className="p-2 text-gray-500 hover:text-emerald transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleRemoveSaved(v.slug)}
                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
