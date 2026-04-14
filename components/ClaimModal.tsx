"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Globe,
  Mail,
  MessageSquare,
  Loader2,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitClaim } from "@/app/actions/claims";

interface ClaimModalProps {
  open: boolean;
  onClose: () => void;
  prefillVendorName?: string;
  prefillWebsite?: string;
}

// Confetti component for success state
function Confetti() {
  const colors = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#FBBF24", "#60A5FA"];
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function ClaimModal({ open, onClose, prefillVendorName, prefillWebsite }: ClaimModalProps) {
  const [vendorName, setVendorName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  // Pre-fill email from auth session + vendor details from props
  useEffect(() => {
    if (open) {
      supabase.auth.getUser().then((res: any) => {
        if (res.data?.user?.email) setContactEmail(res.data.user.email);
      });
      if (prefillVendorName && !vendorName) setVendorName(prefillVendorName);
      if (prefillWebsite && !website) setWebsite(prefillWebsite);
    }
  }, [open]);

  const resetForm = useCallback(() => {
    setVendorName("");
    setWebsite("");
    setMessage("");
    setError("");
    setSuccess(false);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.set("vendorName", vendorName);
    formData.set("website", website);
    formData.set("contactEmail", contactEmail);
    formData.set("message", message);

    const result = await submitClaim(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { resetForm(); onClose(); }}
          className="absolute inset-0 bg-black/80 modal-overlay"
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-ink-2 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5">
            <button
              onClick={() => { resetForm(); onClose(); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  Claim Your Free Listing
                </h2>
                <p className="text-sm text-gray-500">
                  30 seconds — no documents needed
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 relative"
              >
                <Confetti />
                <div className="w-20 h-20 rounded-full bg-emerald/10 border-2 border-emerald/30 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <PartyPopper className="w-10 h-10 text-emerald" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  You&apos;re Listed!
                </h3>
                <p className="text-gray-400 mb-4 max-w-sm mx-auto">
                  <strong className="text-emerald">{vendorName}</strong> is now on PepAssure.
                  Your PVS score will be calculated automatically from community data.
                </p>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Want to boost your score? Upload COAs, respond to reviews, and earn
                  verified badges from your vendor dashboard.
                </p>
                <div className="flex items-center gap-2 justify-center text-sm text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald" />
                  Dashboard access sent to {contactEmail}
                </div>
                <button
                  onClick={() => { resetForm(); onClose(); }}
                  className="mt-6 px-6 py-2.5 bg-emerald/10 border border-emerald/20 text-emerald rounded-lg hover:bg-emerald/20 transition-all"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Vendor Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Vendor Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="Your Peptide Company"
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Website URL <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="yourcompany.com"
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                </div>

                {/* Contact Email (pre-filled) */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white/60 placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                      readOnly
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-600">Pre-filled from your account</p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Message <span className="text-gray-600">(optional)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your products, certifications, etc."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow w-full py-3.5 bg-emerald text-white font-semibold rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Claim"
                  )}
                </button>

                <p className="text-xs text-gray-600 text-center">
                  Free forever &middot; No documents needed &middot; Live instantly
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
