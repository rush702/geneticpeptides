"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserPlus,
  Globe,
  MessageSquare,
  FlaskConical,
  Star,
  CheckCircle2,
  Loader2,
  ArrowRight,
  TrendingUp,
  Shield,
} from "lucide-react";
import { submitNomination } from "@/app/actions/nominations";

const POPULAR_PEPTIDES = [
  "BPC-157", "Semaglutide", "Tirzepatide", "TB-500", "GHK-Cu",
  "CJC-1295", "Ipamorelin", "NAD+", "Epithalon", "Selank",
  "PT-141", "KPV", "Retatrutide", "AOD-9604", "MOTS-c",
];

export default function NominatePage() {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [reason, setReason] = useState("");
  const [selectedPeptides, setSelectedPeptides] = useState<string[]>([]);
  const [experience, setExperience] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const togglePeptide = (p: string) => {
    setSelectedPeptides((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitNomination({
      nomineeName: name,
      nomineeWebsite: website,
      reason,
      peptidesRequested: selectedPeptides,
      nominatorExperience: experience || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen molecular-bg pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <UserPlus className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">Nominate a Vendor</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Request a <span className="text-gradient">Vendor Review</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Tell us which vendors you use and want to see verified. Your nominations help
            us prioritize testing and build trust for the community.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-8 bg-ink-2 border border-emerald/20 rounded-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <CheckCircle2 className="w-8 h-8 text-emerald" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-3">
              Nomination Submitted
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              <strong className="text-emerald">{name}</strong> is now on the community queue.
              Other researchers can upvote your nomination to help prioritize testing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/most-wanted"
                className="btn-glow flex items-center gap-2 px-6 py-3 bg-emerald text-white font-semibold rounded-xl"
              >
                <TrendingUp className="w-4 h-4" />
                View Leaderboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setName("");
                  setWebsite("");
                  setReason("");
                  setSelectedPeptides([]);
                  setExperience(0);
                }}
                className="px-6 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-all"
              >
                Nominate Another
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 bg-ink-2 border border-white/5 rounded-2xl space-y-5">
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald" />
                Vendor Details
              </h2>

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
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paradigm Peptides, Amino Asylum"
                  className="w-full px-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://vendor-website.com"
                    className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                  />
                </div>
              </div>

              {/* Why */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Why should we review them?
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us about your experience, why this vendor matters, or why the community needs this review..."
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Peptides */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  <FlaskConical className="w-3.5 h-3.5 inline mr-1" />
                  Which peptides have you ordered from them?
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_PEPTIDES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePeptide(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedPeptides.includes(p)
                          ? "bg-emerald/20 text-emerald border border-emerald/30"
                          : "bg-ink-3 text-gray-500 border border-white/5 hover:border-white/10 hover:text-gray-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience rating */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Your overall experience (optional)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setExperience(star === experience ? 0 : star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= experience
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-700"
                        }`}
                      />
                    </button>
                  ))}
                  {experience > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      {experience}/5
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name}
              className="btn-glow w-full py-4 bg-emerald text-white font-semibold text-lg rounded-xl hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Submit Nomination
                </>
              )}
            </button>

            <p className="text-xs text-gray-600 text-center">
              No paid placements — ever. Nominations are community-driven and
              help us prioritize which vendors to verify next.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
