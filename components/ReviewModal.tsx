"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitReview } from "@/app/actions/reviews";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  vendorSlug: string;
  vendorName: string;
  onNeedAuth: () => void;
}

export default function ReviewModal({
  open,
  onClose,
  vendorSlug,
  vendorName,
  onNeedAuth,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = createClient();

  // Check auth when modal opens
  useEffect(() => {
    if (!open) return;
    setAuthChecked(false);
    supabase.auth.getUser().then((res: any) => {
      if (!res.data?.user) {
        onClose();
        onNeedAuth();
      } else {
        setAuthChecked(true);
      }
    });
  }, [open]);

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setTitle("");
    setBody("");
    setError("");
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);
    const result = await submitReview({
      vendor_slug: vendorSlug,
      rating,
      title,
      body,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (!open || !authChecked) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  Review {vendorName}
                </h2>
                <p className="text-sm text-gray-500">Share your research experience</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald/10 border-2 border-emerald/30 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <CheckCircle2 className="w-8 h-8 text-emerald" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  Review Submitted
                </h3>
                <p className="text-gray-400 mb-2 max-w-sm mx-auto">
                  Thanks for your feedback. Your review is pending moderation and will appear on the vendor page once approved.
                </p>
                <div className="flex items-center gap-2 justify-center text-sm text-gray-500 mt-4">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  Typically reviewed within 24 hours
                </div>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2.5 bg-emerald/10 border border-emerald/20 text-emerald rounded-lg hover:bg-emerald/20 transition-all"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Star rating */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Your Rating <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-9 h-9 transition-all ${
                              active
                                ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                                : "text-gray-700"
                            }`}
                          />
                        </button>
                      );
                    })}
                    {rating > 0 && (
                      <span className="ml-3 text-sm text-gray-400">
                        {rating === 5 && "Excellent"}
                        {rating === 4 && "Good"}
                        {rating === 3 && "Average"}
                        {rating === 2 && "Below average"}
                        {rating === 1 && "Poor"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Great COAs, fast shipping"
                    maxLength={80}
                    className="w-full px-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-400">{title.length}/80</p>
                </div>

                {/* Body */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Your Review <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea
                      required
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Share your experience with this vendor. What peptides did you order? How was the purity? Shipping? Documentation?"
                      rows={5}
                      maxLength={1000}
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">Minimum 20 characters</p>
                    <p className="text-xs text-gray-400">{body.length}/1000</p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                  <p className="text-xs text-yellow-400/80 leading-relaxed">
                    Reviews are moderated before publishing. Please be honest and specific. Shill or fake reviews will be removed and may result in account suspension.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || rating === 0 || title.length < 3 || body.length < 20}
                  className="btn-glow w-full py-3.5 bg-emerald text-ink font-semibold rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5" />
                      Submit Review
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
