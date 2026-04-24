"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle2, Send, AlertCircle } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await subscribeNewsletter(email);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setEmail("");
      // Auto-reset success state after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    }
    setLoading(false);
  };

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Newsletter
      </h4>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
        Monthly updates on vendor rankings, peptide research, and platform features.
      </p>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-emerald/10 border border-emerald/20 rounded-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0" />
            <p className="text-sm text-emerald">Subscribed! Check your inbox.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-ink-3 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/30 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="flex-shrink-0 px-3 py-2 bg-emerald text-ink rounded-lg hover:bg-emerald-light disabled:opacity-50 transition-all"
                aria-label="Subscribe"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            {error && (
              <div className="flex items-start gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <p className="text-[10px] text-gray-400">
              No spam, unsubscribe anytime.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
