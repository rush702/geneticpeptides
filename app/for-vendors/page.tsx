"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  FileCheck,
  Rocket,
  Zap,
  BarChart3,
  Lock,
  Globe,
  Users,
  FileText,
  Cpu,
  Crown,
  ArrowRight,
  Star,
  TrendingUp,
  Phone,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/AuthModal";
import ClaimModal from "@/components/ClaimModal";
import ContactModal from "@/components/ContactModal";
import { createCheckoutSession } from "@/app/actions/stripe";

/* ─── Pricing tiers ─── */
const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get listed instantly — no documents needed",
    cta: "Claim Free Listing",
    ctaStyle: "border" as const,
    stripePlan: null,
    features: [
      "Vendor profile in 30 seconds",
      "PVS Score — auto-calculated",
      "Community reviews + nominations",
      "No COAs required to start",
      "Basic analytics dashboard",
    ],
  },
  {
    name: "Pro",
    price: "$199",
    period: "/mo",
    description: "Enhanced visibility and insights",
    cta: "Upgrade to Pro",
    ctaStyle: "solid" as const,
    popular: true,
    stripePlan: "pro_monthly" as const,
    features: [
      "Everything in Free",
      "Priority COA verification",
      "Competitor benchmarking",
      "Advanced analytics dashboard",
      "Reddit sentiment tracking",
      "Monthly PDF reports",
      "Badge: Pro Verified",
    ],
  },
  {
    name: "Enterprise",
    price: "$599",
    period: "/mo",
    description: "Full platform power for market leaders",
    cta: "Contact Sales",
    ctaStyle: "gradient" as const,
    stripePlan: "enterprise_monthly" as const,
    features: [
      "Everything in Pro",
      "Real-time COA monitoring",
      "API access (REST + webhooks)",
      "White-label reports",
      "SSO / SAML integration",
      "Dedicated account manager",
      "Custom SLA",
      "Bulk batch verification",
    ],
  },
];

/* ─── Enterprise features grid ─── */
const enterpriseFeatures = [
  {
    icon: FileCheck,
    title: "Real-time COA Monitoring",
    description: "Automated certificate tracking with instant alerts on expiry or discrepancy.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Deep-dive into your PVS score breakdown, trends, and competitive position.",
  },
  {
    icon: Cpu,
    title: "API Access",
    description: "REST API with webhooks for seamless integration into your existing systems.",
  },
  {
    icon: Globe,
    title: "White-label Reports",
    description: "Generate branded verification reports for your customers and partners.",
  },
  {
    icon: Lock,
    title: "SSO / SAML Integration",
    description: "Enterprise-grade authentication with single sign-on for your entire team.",
  },
  {
    icon: Users,
    title: "Dedicated Account Manager",
    description: "Direct line to a peptide industry specialist who knows your business.",
  },
  {
    icon: FileText,
    title: "Bulk Batch Verification",
    description: "Upload and verify hundreds of batch COAs simultaneously with our pipeline.",
  },
  {
    icon: Zap,
    title: "Priority Processing",
    description: "Skip the queue — your verification requests are processed within 2 hours.",
  },
];

/* ─── 3-step timeline — frictionless onboarding ─── */
const steps = [
  {
    icon: Shield,
    title: "Create Your Account",
    description: "Sign up in 30 seconds with just your email. No documents, no paperwork.",
  },
  {
    icon: Zap,
    title: "Claim Your Listing",
    description: "Enter your vendor name and website — that's it. Your profile goes live immediately.",
  },
  {
    icon: Rocket,
    title: "Grow Your Score",
    description: "Upload COAs, collect reviews, and earn badges to boost your PVS score over time. Optional but powerful.",
  },
];

/* ─── Animated counter hook ─── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ═══════════════════════════════════════════════
   FOR VENDORS PAGE
   ═══════════════════════════════════════════════ */
export default function ForVendorsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  // Monthly billing only — no yearly toggle
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const supabase = createClient();

  const vendorCount = useCountUp(148);
  const coaCount = useCountUp(12400);
  const scoreCount = useCountUp(94);

  // Track auth state
  useEffect(() => {
    supabase.auth.getUser().then((res: any) => setUser(res.data?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      // Only update user on actual sign-in, not unconfirmed signup
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "SIGNED_OUT") {
        setUser(session?.user ?? null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleClaimClick = () => {
    if (!user) {
      setAuthOpen(true);
    } else {
      setClaimOpen(true);
    }
  };

  const handleUpgrade = async (plan: any) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setCheckoutLoading(plan);
    const result = await createCheckoutSession(plan);
    if (result.url) {
      window.location.href = result.url;
    }
    setCheckoutLoading(null);
  };

  return (
    <div className="min-h-screen molecular-bg">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full mb-8">
              <Crown className="w-4 h-4 text-emerald" />
              <span className="text-sm text-emerald font-medium">
                No paid placements — ever
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Claim Your Free Listing{" "}
              <span className="text-gradient">&bull;</span>
              <br />
              Grow with Verified Data
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Claim your free listing in 30 seconds — no documents required. Get a PVS
              score, community visibility, and real-time analytics as you grow. COAs are
              optional but boost your score.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleClaimClick}
                className="btn-glow px-8 py-4 bg-emerald text-white font-semibold text-lg rounded-xl hover:bg-emerald-light flex items-center gap-2"
              >
                {user ? "Claim Free Listing Now" : "Sign Up to Claim Your Listing"}
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#pricing"
                className="px-8 py-4 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
              >
                View Pricing
              </a>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto"
          >
            <div ref={vendorCount.ref} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">
                {vendorCount.count}+
              </div>
              <div className="text-sm text-gray-500 mt-1">Vendors Claimed</div>
            </div>
            <div ref={coaCount.ref} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">
                {coaCount.count.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-500 mt-1">COAs Verified</div>
            </div>
            <div ref={scoreCount.ref} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">
                {scoreCount.count}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg Score Lift</div>
            </div>
          </motion.div>

          {/* Urgency: verification queue + recent activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-ink-2 border border-white/10 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald" />
              </span>
              <span className="text-gray-400">
                Verification queue: <strong className="text-white">~48h</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-ink-2 border border-white/10 rounded-full">
              <Clock className="w-3.5 h-3.5 text-emerald" />
              <span className="text-gray-400">
                <strong className="text-white">12 vendors</strong> claimed this week
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 3-Step Timeline ─── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              How It Works
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Three Steps to Verified
            </h2>
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-12 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-emerald/20 via-emerald/40 to-emerald/20" />
              {/* Pulsing dot */}
              <motion.div
                className="absolute top-[42px] w-3 h-3 bg-emerald rounded-full shadow-lg shadow-emerald/50"
                animate={{ left: ["16.67%", "50%", "83.33%", "50%", "16.67%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="grid grid-cols-3 gap-8">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="text-center group"
                  >
                    <div className="relative inline-flex mb-6">
                      <div className="w-24 h-24 rounded-2xl bg-ink-2 border border-white/10 flex items-center justify-center group-hover:border-emerald/30 group-hover:shadow-lg group-hover:shadow-emerald-glow transition-all duration-300">
                        <step.icon className="w-10 h-10 text-emerald group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed max-w-[250px] mx-auto">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="md:hidden space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex gap-5 pb-10 last:pb-0"
              >
                {/* Vertical line */}
                {i < steps.length - 1 && (
                  <div className="absolute top-16 left-7 w-0.5 h-[calc(100%-4rem)] bg-gradient-to-b from-emerald/30 to-emerald/5" />
                )}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-ink-2 border border-white/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-emerald" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-base font-semibold text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Pricing
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Plans That Grow With You
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Start free. Upgrade when you need deeper analytics, priority processing, and enterprise tools.
            </p>
          </div>

          {user ? (
            <>
              {/* Pricing cards — monthly only, cancel anytime */}
              <p className="text-center text-sm text-gray-500 mb-8">
                Billed monthly &middot; Cancel anytime &middot; 14-day free trial on Pro
              </p>

              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {tiers.map((tier, i) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`card-glow relative rounded-2xl p-8 ${
                      tier.popular
                        ? "bg-ink-2 border-2 border-emerald/30 shadow-lg shadow-emerald-glow"
                        : "bg-ink-2 border border-white/10"
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3" /> Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-gray-500">{tier.description}</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          {tier.price}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {tier.period}
                        </span>
                      </div>
                      {tier.name !== "Free" && (
                        <p className="text-xs text-gray-500 mt-1">Cancel anytime</p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {tier.name === "Free" ? (
                      <button
                        onClick={handleClaimClick}
                        className="w-full py-3 border border-emerald/30 text-emerald font-medium rounded-xl hover:bg-emerald/10 transition-all"
                      >
                        {tier.cta}
                      </button>
                    ) : tier.name === "Enterprise" ? (
                      <button
                        onClick={() => setContactOpen(true)}
                        className="btn-glow w-full py-3 bg-gradient-to-r from-emerald to-emerald-light text-white font-semibold rounded-xl"
                      >
                        {tier.cta}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(tier.stripePlan!)}
                        disabled={checkoutLoading !== null}
                        className="btn-glow w-full py-3 bg-emerald text-white font-semibold rounded-xl hover:bg-emerald-light disabled:opacity-50"
                      >
                        {checkoutLoading === tier.stripePlan
                          ? "Redirecting..."
                          : tier.cta}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            /* ─── Logged-out pricing gate ─── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-lg mx-auto text-center py-16 px-8 bg-ink-2 border border-white/10 rounded-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-emerald" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                Sign Up to See Pricing
              </h3>
              <p className="text-gray-400 mb-8">
                Create a free account to view our Pro and Enterprise plans, or claim your free listing right away.
              </p>
              <button
                onClick={() => setAuthOpen(true)}
                className="btn-glow px-8 py-3.5 bg-emerald text-white font-semibold rounded-xl hover:bg-emerald-light flex items-center gap-2 mx-auto"
              >
                Sign Up or Log In
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── Enterprise Features Grid ─── */}
      <section id="enterprise" className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Enterprise Tools
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Lead
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Purpose-built for peptide vendors who want maximum visibility, compliance, and competitive edge.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {enterpriseFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card-glow group p-6 bg-ink-2 border border-white/5 rounded-xl cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mb-4 group-hover:bg-emerald/20 group-hover:scale-110 transition-all duration-300">
                  <feat.icon className="w-6 h-6 text-emerald group-hover:brightness-125 transition-all duration-300" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials / Social Proof ─── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald mb-3">
              Trusted By Vendors
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              What Vendors Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "PepAssure gave us the credibility boost we needed. Our sales increased 40% within 3 months of getting verified.",
                name: "Dr. Sarah Chen",
                role: "CEO, NovaPeptides",
                score: 96,
              },
              {
                quote:
                  "The competitor benchmarking alone is worth the Pro subscription. We can see exactly where we stand in real time.",
                name: "Marcus Rivera",
                role: "Head of Sales, PeptideWorks",
                score: 91,
              },
              {
                quote:
                  "Our Enterprise plan pays for itself. The API integration with our ERP saves us 20+ hours per month.",
                name: "James Okafor",
                role: "CTO, BioSynth Labs",
                score: 98,
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-glow p-6 bg-ink-2 border border-white/5 rounded-xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-emerald fill-emerald" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald/10 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald" />
                    <span className="text-xs font-bold text-emerald">
                      {t.score}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="p-12 bg-ink-2 border border-white/10 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Listed?
              </h2>
              <p className="text-gray-400 mb-4 max-w-md mx-auto">
                Claim your free listing in 30 seconds. No documents, no hassle — your score builds automatically as the community grows.
              </p>
              <p className="text-xs text-gray-500 mb-8">
                Your competitors are already building trust scores. Don&apos;t let them get ahead.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleClaimClick}
                  className="btn-glow px-8 py-4 bg-emerald text-white font-semibold text-lg rounded-xl hover:bg-emerald-light flex items-center gap-2"
                >
                  Claim Your Free Listing
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setContactOpen(true)}
                  className="flex items-center gap-2 px-8 py-4 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Talk to Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Modals ─── */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={() => {
          setAuthOpen(false);
          // Wait for auth state to propagate before opening claim modal
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") {
              setClaimOpen(true);
              subscription.unsubscribe();
            }
          });
          // Fallback: open after brief delay if event doesn't fire (already signed in)
          setTimeout(() => {
            subscription.unsubscribe();
            setClaimOpen(true);
          }, 500);
        }}
      />
      <ClaimModal open={claimOpen} onClose={() => setClaimOpen(false)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
