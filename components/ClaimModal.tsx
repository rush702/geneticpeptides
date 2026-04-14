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
  ArrowRight,
  ArrowLeft,
  Shield,
  BarChart3,
  FileCheck,
  Rocket,
  ExternalLink,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { submitClaim } from "@/app/actions/claims";

interface ClaimModalProps {
  open: boolean;
  onClose: () => void;
  prefillVendorName?: string;
  prefillWebsite?: string;
}

/* ─── Confetti ─── */
function Confetti() {
  const colors = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#FBBF24", "#60A5FA"];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
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

/* ─── Step indicator ─── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current
                ? "bg-emerald text-white"
                : i === current
                ? "bg-emerald/20 text-emerald border-2 border-emerald"
                : "bg-ink-3 text-gray-600 border border-white/10"
            }`}
          >
            {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`w-8 h-0.5 transition-all duration-300 ${
                i < current ? "bg-emerald" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ClaimModal({ open, onClose, prefillVendorName, prefillWebsite }: ClaimModalProps) {
  const [step, setStep] = useState(0); // 0=form, 1=review, 2=success
  const [vendorName, setVendorName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

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
    setStep(0);
    setLoading(false);
  }, []);

  const handleNext = () => {
    setError("");
    if (!vendorName.trim()) {
      setError("Vendor name is required.");
      return;
    }
    if (!website.trim()) {
      setError("Website URL is required.");
      return;
    }
    setStep(1);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.set("vendorName", vendorName.trim());
    formData.set("website", website.trim());
    formData.set("contactEmail", contactEmail);
    formData.set("message", message.trim());

    const result = await submitClaim(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      setStep(0);
    } else {
      setStep(2);
      setLoading(false);
    }
  };

  if (!open) return null;

  const stepLabels = ["Details", "Review", "Done"];

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
          {/* Header with step indicator */}
          <div className="p-6 pb-4 border-b border-white/5">
            <button
              onClick={() => { resetForm(); onClose(); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white">
                    {step === 2 ? "You're Listed!" : "Claim Your Listing"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {stepLabels[step]} &middot; Step {Math.min(step + 1, 3)} of 3
                  </p>
                </div>
              </div>
              <StepIndicator current={step} total={3} />
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ═══ Step 0: Form ═══ */}
              {step === 0 && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
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
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                        Website <span className="text-red-400">*</span>
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

                    {/* Contact Email (pre-filled, read-only) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                        Contact Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          value={contactEmail}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white/60 focus:outline-none transition-all cursor-not-allowed"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-600">From your account</p>
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
                          placeholder="Products, certifications, anything we should know..."
                          rows={2}
                          className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="btn-glow w-full mt-6 py-3.5 bg-emerald text-white font-semibold rounded-lg hover:bg-emerald-light flex items-center justify-center gap-2 text-base"
                  >
                    Review &amp; Submit
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* ═══ Step 1: Review & Confirm ═══ */}
              {step === 1 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <p className="text-sm text-gray-400 mb-4">
                    Confirm your details. You can edit after claiming.
                  </p>

                  {/* Review card */}
                  <div className="p-4 bg-ink rounded-xl border border-white/5 space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">{vendorName}</p>
                        <p className="text-xs text-gray-500">{website}</p>
                      </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Mail className="w-3.5 h-3.5" />
                      {contactEmail}
                    </div>
                    {message && (
                      <div className="flex items-start gap-2 text-xs text-gray-400">
                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{message}</span>
                      </div>
                    )}
                  </div>

                  {/* What happens next */}
                  <div className="p-4 bg-emerald/5 border border-emerald/10 rounded-xl mb-6">
                    <p className="text-xs font-semibold text-emerald uppercase tracking-wider mb-3">What happens next</p>
                    <div className="space-y-2.5">
                      {[
                        { icon: Clock, text: "Admin reviews your claim within 24-48 hours" },
                        { icon: BarChart3, text: "Your PVS score is calculated from community data" },
                        { icon: Shield, text: "You get dashboard access to manage your listing" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                          <item.icon className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setStep(0); setError(""); }}
                      className="flex-1 py-3 border border-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-glow flex-[2] py-3 bg-emerald text-white font-semibold rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Confirm &amp; Submit
                          <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ Step 2: Success ═══ */}
              {step === 2 && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4 relative"
                >
                  <Confetti />
                  <div className="w-20 h-20 rounded-full bg-emerald/10 border-2 border-emerald/30 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <PartyPopper className="w-10 h-10 text-emerald" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    Claim Submitted!
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                    <strong className="text-emerald">{vendorName}</strong> is pending review.
                    We&apos;ll verify your details and activate your listing within 24-48 hours.
                  </p>

                  {/* Next steps cards */}
                  <div className="space-y-2 mb-6 text-left">
                    {[
                      { icon: Mail, title: "Check your email", desc: `Confirmation sent to ${contactEmail}` },
                      { icon: BarChart3, title: "Score calculation starts", desc: "We'll analyze COAs, community data, and reviews" },
                      { icon: Rocket, title: "Dashboard unlocks on approval", desc: "Upload COAs, track your score, benchmark competitors" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.15 }}
                        className="flex items-start gap-3 p-3 bg-ink rounded-lg border border-white/5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-emerald" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href="/dashboard"
                      onClick={() => { resetForm(); onClose(); }}
                      className="flex-1 py-3 bg-emerald/10 border border-emerald/20 text-emerald font-medium rounded-lg hover:bg-emerald/20 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => { resetForm(); onClose(); }}
                      className="flex-1 py-3 border border-white/10 text-gray-400 font-medium rounded-lg hover:bg-white/5 transition-all text-sm"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer trust signals */}
          {step < 2 && (
            <div className="px-6 pb-4">
              <p className="text-[11px] text-gray-600 text-center">
                Free forever &middot; No credit card &middot; No documents needed &middot; Review within 48h
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
