"use client";

import { useState } from "react";
import { X, Mail, KeyRound, ArrowRight, Loader2, Check, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * AuthModal — Sign up / Log in overlay
 *
 * Supports two modes:
 *   1. Magic link (passwordless email)
 *   2. Email + password
 *
 * Props:
 *   open      – boolean, controls visibility
 *   onClose   – callback to close the modal
 *   onSuccess – callback after successful auth (receives user object)
 *   dark      – boolean, theme toggle
 */
export default function AuthModal({ open, onClose, onSuccess, dark = true }) {
  const supabase = createClient();

  const [mode, setMode] = useState("login");        // "login" | "signup" | "magic"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const textMuted = dark ? "text-gray-400" : "text-gray-500";
  const borderColor = dark ? "border-gray-700" : "border-gray-200";
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    dark
      ? "bg-white/5 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:bg-white/[0.07]"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white"
  }`;

  if (!open) return null;

  function resetState() {
    setError("");
    setLoading(false);
    setMagicSent(false);
  }

  async function handleEmailPassword(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/for-vendors` },
        });
        if (signUpErr) throw signUpErr;
        if (data?.user) onSuccess?.(data.user);
      } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        if (data?.user) onSuccess?.(data.user);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: magicErr } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/for-vendors` },
      });
      if (magicErr) throw magicErr;
      setMagicSent(true);
    } catch (err) {
      setError(err.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-sm rounded-2xl border p-6 sm:p-8 shadow-2xl ${
        dark ? "bg-[#0D1B2A] border-gray-700/60 shadow-black/40" : "bg-white border-gray-200"
      }`}>
        {/* Close */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            dark ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Magic link sent ── */}
        {magicSent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-bold text-xl mb-2">Check Your Email</h3>
            <p className={`text-sm mb-6 max-w-xs mx-auto ${textMuted}`}>
              We sent a magic link to <span className="font-medium text-emerald-400">{email}</span>. Click the link to sign in — no password needed.
            </p>
            <button
              onClick={() => { resetState(); onClose(); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                dark ? "border-gray-600 text-white hover:bg-white/5" : "border-gray-300 text-gray-900 hover:bg-gray-50"
              }`}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {mode === "signup" ? "Create Account" : mode === "magic" ? "Magic Link" : "Welcome Back"}
                </h3>
                <p className={`text-xs ${textMuted}`}>
                  {mode === "signup" ? "Sign up to claim your listing" : mode === "magic" ? "Passwordless sign-in" : "Log in to your account"}
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* ── Magic link form ── */}
            {mode === "magic" ? (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${dark ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Magic Link
                </button>
              </form>
            ) : (
              /* ── Email / password form ── */
              <form onSubmit={handleEmailPassword} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${dark ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${dark ? "text-gray-300" : "text-gray-700"}`}>Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {mode === "signup" ? "Create Account" : "Log In"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className={`flex-1 h-px ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
              <span className={`text-xs ${textMuted}`}>or</span>
              <div className={`flex-1 h-px ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
            </div>

            {/* Mode switchers */}
            <div className="space-y-2">
              {mode !== "magic" && (
                <button
                  onClick={() => { setMode("magic"); setError(""); }}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${
                    dark ? "border-gray-700 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Mail className="w-4 h-4" /> Sign in with Magic Link
                </button>
              )}
              {mode === "magic" && (
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${
                    dark ? "border-gray-700 text-gray-300 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <KeyRound className="w-4 h-4" /> Sign in with Password
                </button>
              )}
              <p className={`text-center text-xs ${textMuted}`}>
                {mode === "login" ? (
                  <>Don't have an account?{" "}
                    <button onClick={() => { setMode("signup"); setError(""); }} className="text-emerald-400 hover:text-emerald-300 font-medium">
                      Sign Up
                    </button>
                  </>
                ) : mode === "signup" ? (
                  <>Already have an account?{" "}
                    <button onClick={() => { setMode("login"); setError(""); }} className="text-emerald-400 hover:text-emerald-300 font-medium">
                      Log In
                    </button>
                  </>
                ) : null}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
