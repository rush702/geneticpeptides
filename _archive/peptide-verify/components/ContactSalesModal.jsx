"use client";

import { useState } from "react";
import { X, ArrowRight, Check, Loader2, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * ContactSalesModal — Enterprise inquiry form
 *
 * Inserts into the `sales_inquiries` table in Supabase.
 *
 * Props:
 *   open    – boolean
 *   onClose – callback
 *   dark    – boolean
 *   user    – Supabase user object (or null)
 */
export default function ContactSalesModal({ open, onClose, dark = true, user }) {
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    email: user?.email || "",
    company: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const textMuted = dark ? "text-gray-400" : "text-gray-500";
  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    dark
      ? "bg-white/5 border-gray-700 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:bg-white/[0.07]"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white"
  }`;

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: insertErr } = await supabase.from("sales_inquiries").insert({
        name: form.name,
        email: form.email,
        company: form.company,
        message: form.message,
        user_id: user?.id || null,
      });
      if (insertErr) throw insertErr;
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSubmitted(false);
    setError("");
    setForm({ name: "", email: user?.email || "", company: "", message: "" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className={`relative w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-2xl ${
        dark ? "bg-[#0D1B2A] border-gray-700/60 shadow-black/40" : "bg-white border-gray-200"
      }`}>
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            dark ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Contact Sales</h3>
                <p className={`text-xs ${textMuted}`}>Enterprise plan — $599/mo or $4,792/year</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "name", label: "Your Name", placeholder: "John Smith", type: "text" },
                { key: "email", label: "Business Email", placeholder: "you@company.com", type: "email" },
                { key: "company", label: "Company / Vendor Name", placeholder: "e.g. Ascension Peptides", type: "text" },
              ].map((field) => (
                <div key={field.key}>
                  <label className={`block text-sm font-medium mb-1.5 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Message <span className={`font-normal ${textMuted}`}>(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your needs..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Send Inquiry
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="font-bold text-xl mb-2">Inquiry Sent!</h3>
            <p className={`text-sm mb-6 max-w-xs mx-auto ${textMuted}`}>
              Our team will reach out to <span className="font-medium text-emerald-400">{form.email}</span> within 1 business day.
            </p>
            <button
              onClick={handleClose}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                dark ? "border-gray-600 text-white hover:bg-white/5" : "border-gray-300 text-gray-900 hover:bg-gray-50"
              }`}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
