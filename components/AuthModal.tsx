"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Sparkles, Loader2, CheckCircle2, ArrowLeft, RefreshCw, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Tab = "password" | "magic";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuth: () => void;
}

export default function AuthModal({ open, onClose, onAuth }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>("password");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const supabase = createClient();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Listen for auth state changes (user confirms email in another tab)
  useEffect(() => {
    if (!open || !emailSent) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === "SIGNED_IN") {
        onAuth();
        onClose();
      }
    });
    return () => subscription.unsubscribe();
  }, [open, emailSent]);

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (authError) {
          setError(authError.message);
        } else {
          setEmailSent(true);
          setResendCooldown(60);
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError(authError.message);
        } else {
          onAuth();
          onClose();
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) {
        setError(authError.message);
      } else {
        setEmailSent(true);
        setResendCooldown(60);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      if (tab === "magic" || isSignUp) {
        await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
      }
      setResendCooldown(60);
    } catch {
      setError("Failed to resend. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetState = useCallback(() => {
    setEmail("");
    setPassword("");
    setError("");
    setEmailSent(false);
    setResendCooldown(0);
    setLoading(false);
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { resetState(); onClose(); }}
          className="absolute inset-0 bg-black/80 modal-overlay"
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-ink-2 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5">
            <button
              onClick={() => { resetState(); onClose(); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  {emailSent ? "Check Your Email" : isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-sm text-gray-500">
                  {emailSent
                    ? "One click and you're in"
                    : isSignUp
                    ? "Free account — claim your listing next"
                    : "Sign in to your account"}
                </p>
              </div>
            </div>

            {/* Tab switcher (hidden when email sent) */}
            {!emailSent && (
              <div className="flex bg-ink-3 rounded-lg p-1">
                <button
                  onClick={() => { setTab("password"); setError(""); }}
                  className={`flex-1 text-sm py-2 rounded-md transition-all ${
                    tab === "password"
                      ? "bg-emerald/20 text-emerald font-medium"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Email &amp; Password
                </button>
                <button
                  onClick={() => { setTab("magic"); setError(""); }}
                  className={`flex-1 text-sm py-2 rounded-md transition-all ${
                    tab === "magic"
                      ? "bg-emerald/20 text-emerald font-medium"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Magic Link
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* ═══ Email Sent State ═══ */}
              {emailSent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-emerald/10 border-2 border-emerald/20 flex items-center justify-center mx-auto mb-4"
                  >
                    <Mail className="w-8 h-8 text-emerald" />
                  </motion.div>

                  <p className="text-sm text-gray-400 mb-1">
                    We sent a {isSignUp ? "confirmation" : "sign-in"} link to
                  </p>
                  <p className="text-base font-semibold text-white mb-4">{email}</p>

                  {/* Instructions */}
                  <div className="p-3 bg-ink rounded-lg border border-white/5 text-left mb-4 space-y-2">
                    {[
                      "Open the email (check spam/promotions too)",
                      "Click the confirmation link",
                      "You'll be signed in automatically",
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-5 h-5 rounded-full bg-emerald/10 text-emerald text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>

                  {/* Resend + change email */}
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || loading}
                      className="flex items-center gap-1.5 text-emerald hover:text-emerald-light transition-colors font-medium disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
                    </button>
                    <span className="text-gray-700">|</span>
                    <button
                      onClick={() => { setEmailSent(false); setPassword(""); setResendCooldown(0); }}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Different email
                    </button>
                  </div>
                </motion.div>
              ) : tab === "password" ? (
                /* ═══ Password Form ═══ */
                <motion.form
                  key="password"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handlePasswordAuth}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSignUp ? "Create a password (6+ chars)" : "Your password"}
                        className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-glow w-full py-3 bg-emerald text-ink font-semibold rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSignUp ? (
                      <>Create Account</>
                    ) : (
                      <>Sign In</>
                    )}
                  </button>

                  {/* Toggle */}
                  <p className="text-center text-sm text-gray-500">
                    {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                      className="text-emerald hover:text-emerald-light transition-colors font-medium"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </motion.form>
              ) : (
                /* ═══ Magic Link Form ═══ */
                <motion.form
                  key="magic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleMagicLink}
                  className="space-y-4"
                >
                  <div className="p-3 bg-emerald/5 border border-emerald/10 rounded-lg mb-2">
                    <p className="text-xs text-gray-400">
                      <strong className="text-emerald">No password needed.</strong> We&apos;ll email you a sign-in link that works instantly.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-glow w-full py-3 bg-emerald text-ink font-semibold rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Magic Link
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Trust signal */}
            {!emailSent && (
              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-gray-400">
                <Shield className="w-3 h-3" />
                Free forever &middot; No credit card required
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
