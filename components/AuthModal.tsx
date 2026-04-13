"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Sparkles, Loader2 } from "lucide-react";
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
  const [magicSent, setMagicSent] = useState(false);
  const supabase = createClient();

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message);
      } else if (isSignUp) {
        // Don't close modal — user needs to confirm email first
        setMagicSent(true);
      } else {
        onAuth();
        onClose();
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
        setMagicSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setEmail("");
    setPassword("");
    setError("");
    setMagicSent(false);
    setLoading(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { resetState(); onClose(); }}
          className="absolute inset-0 bg-black/80 modal-overlay"
        />

        {/* Modal */}
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
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isSignUp ? "Start your free vendor listing" : "Sign in to your account"}
                </p>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-ink-3 rounded-lg p-1">
              <button
                onClick={() => { setTab("password"); setError(""); }}
                className={`flex-1 text-sm py-2 rounded-md transition-all ${
                  tab === "password"
                    ? "bg-emerald/20 text-emerald font-medium"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Email & Password
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
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {magicSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-emerald" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
                <p className="text-sm text-gray-400 mb-1">
                  We sent a {isSignUp ? "confirmation" : "sign-in"} link to <strong className="text-white">{email}</strong>
                </p>
                <p className="text-xs text-gray-500 mb-4">Click the link in the email to continue. It expires in 1 hour.</p>
                <button
                  onClick={() => { setMagicSent(false); setEmail(""); setPassword(""); }}
                  className="text-sm text-emerald hover:text-emerald-light transition-colors font-medium"
                >
                  Use a different email
                </button>
              </div>
            ) : tab === "password" ? (
              <form onSubmit={handlePasswordAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow w-full py-3 bg-emerald text-white font-medium rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSignUp ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow w-full py-3 bg-emerald text-white font-medium rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
              </form>
            )}

            {/* Toggle sign up / sign in */}
            {tab === "password" && (
              <p className="mt-4 text-center text-sm text-gray-500">
                {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="text-emerald hover:text-emerald-light transition-colors font-medium"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
