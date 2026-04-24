"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Send,
  User,
  Tag,
  Loader2,
  CheckCircle2,
  Building2,
  Newspaper,
  Bug,
  HelpCircle,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";

type Category = "general" | "vendor" | "enterprise" | "press" | "bug";

const categories: { key: Category; label: string; icon: typeof HelpCircle; description: string }[] = [
  { key: "general", label: "General Inquiry", icon: HelpCircle, description: "Questions about PepAssure, our methodology, or the platform" },
  { key: "vendor", label: "Vendor Question", icon: Building2, description: "Listing, claiming, or about your vendor profile" },
  { key: "enterprise", label: "Enterprise Sales", icon: Shield, description: "API access, SSO, white-label, custom integrations" },
  { key: "press", label: "Press & Media", icon: Newspaper, description: "Media inquiries, interviews, or partnership requests" },
  { key: "bug", label: "Bug Report", icon: Bug, description: "Something not working? Let us know" },
];

const faqs = [
  {
    q: "How long does vendor verification take?",
    a: "Typically 24-48 hours for standard claims. Enterprise-tier reviews are prioritized.",
  },
  {
    q: "Can I pay to improve my PVS score?",
    a: "No. Paid tiers unlock dashboard tools and analytics but never influence scores. Our methodology is public and independent.",
  },
  {
    q: "How often are scores updated?",
    a: "Daily. COA verification, sentiment analysis, and community data flow in continuously.",
  },
  {
    q: "Do you sell peptides?",
    a: "No. PepAssure is an independent verification service. We never handle product ourselves.",
  },
];

export default function ContactPage() {
  const [category, setCategory] = useState<Category>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitContactForm({
      name,
      email,
      subject,
      message,
      category,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setCategory("general");
    setSuccess(false);
    setError("");
  };

  return (
    <div className="min-h-screen molecular-bg pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-6">
            <Mail className="w-4 h-4 text-emerald" />
            <span className="text-sm text-emerald font-medium">Contact Us</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Let&apos;s <span className="text-gradient">Talk</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Questions, feedback, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 bg-ink-2 border border-emerald/20 rounded-2xl text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <CheckCircle2 className="w-8 h-8 text-emerald" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">
                  Message Sent
                </h2>
                <p className="text-gray-400 mb-6">
                  Thanks, {name.split(" ")[0] || "friend"}. We&apos;ll get back to you within 1 business day.
                </p>
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-emerald/10 border border-emerald/20 text-emerald rounded-lg hover:bg-emerald/20 transition-all"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-6 bg-ink-2 border border-white/5 rounded-2xl space-y-5"
              >
                <h2 className="text-lg font-display font-bold text-white mb-1">
                  Send us a message
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  We typically respond within 24 hours on business days.
                </p>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    What&apos;s this about?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setCategory(c.key)}
                        className={`flex items-start gap-2 p-3 rounded-lg text-left border transition-all ${
                          category === c.key
                            ? "bg-emerald/10 border-emerald/30 text-white"
                            : "bg-ink border-white/5 text-gray-400 hover:border-white/10"
                        }`}
                      >
                        <c.icon
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            category === c.key ? "text-emerald" : "text-gray-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">{c.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@company.com"
                        className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary"
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      className="w-full pl-10 pr-4 py-3 bg-ink border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/20 transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow w-full py-3.5 bg-emerald text-ink font-semibold rounded-lg hover:bg-emerald-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact info */}
            <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h3 className="text-base font-semibold text-white mb-4">Other ways to reach us</h3>
              <div className="space-y-3">
                <a
                  href="mailto:hello@pepassure.com"
                  className="flex items-center gap-3 p-3 bg-ink rounded-lg hover:bg-ink-3/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-emerald" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-white group-hover:text-emerald transition-colors">
                      hello@pepassure.com
                    </p>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-3 bg-ink rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Response Time</p>
                    <p className="text-sm text-white">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="p-6 bg-ink-2 border border-white/5 rounded-xl">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald" />
                Quick Answers
              </h3>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.q} className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-white mb-1">{faq.q}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/methodology"
                className="mt-4 inline-flex items-center gap-1 text-xs text-emerald hover:text-emerald-light transition-colors"
              >
                Read full methodology
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
