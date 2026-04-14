"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Crown,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getMyProfile } from "@/app/actions/auth";
import { createPortalSession, createCheckoutSession } from "@/app/actions/stripe";

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    "Vendor profile + public listing",
    "Auto-calculated PVS score",
    "Community reviews & nominations",
    "Basic analytics dashboard",
  ],
  pro: [
    "Everything in Free",
    "Competitor benchmarking",
    "Weekly score report emails",
    "Advanced analytics & pillar breakdown",
    "Reddit sentiment tracking",
    "Monthly PDF reports",
    "Priority COA verification",
    "Pro Verified badge",
  ],
  enterprise: [
    "Everything in Pro",
    "REST API access with webhooks",
    "White-label PDF reports",
    "SSO / SAML integration",
    "Dedicated account manager",
    "Real-time COA monitoring",
    "Bulk batch verification",
    "2-hour SLA",
  ],
};

export default function BillingPage() {
  const [profile, setProfile] = useState<{
    vendor_name: string;
    tier: string;
    status: string;
    upgraded_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const data = await getMyProfile();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  const tier = profile?.tier ?? "free";
  const features = PLAN_FEATURES[tier] ?? PLAN_FEATURES.free;

  const handlePortal = async () => {
    setPortalLoading(true);
    const result = await createPortalSession();
    if (result.url) {
      window.location.href = result.url;
    } else {
      alert(result.error ?? "Could not open billing portal.");
    }
    setPortalLoading(false);
  };

  const handleUpgrade = async (plan: "pro_monthly" | "enterprise_monthly") => {
    setUpgradeLoading(plan);
    const result = await createCheckoutSession(plan);
    if (result.url) {
      window.location.href = result.url;
    } else {
      alert(result.error ?? "Could not start checkout.");
    }
    setUpgradeLoading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Shield className="w-12 h-12 text-emerald mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Sign in required</h2>
          <p className="text-gray-400 mb-6">You need to sign in to manage billing.</p>
          <Link href="/for-vendors" className="btn-glow inline-flex px-6 py-3 bg-emerald text-white font-medium rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen molecular-bg pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors mb-4 inline-flex items-center gap-1">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-display font-bold text-white mt-2">Billing & Subscription</h1>
          <p className="text-gray-400 mt-1">Manage your plan and payment method.</p>
        </div>

        {/* Current plan card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-ink-2 border border-white/10 rounded-2xl mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-emerald" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Current Plan</p>
                <h2 className="text-xl font-bold text-white capitalize">{tier}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {tier !== "free" && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-ink border border-white/10 text-gray-300 text-sm font-medium rounded-lg hover:bg-ink-3 hover:text-white transition-all disabled:opacity-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  {portalLoading ? "Loading..." : "Manage Subscription"}
                </button>
              )}
            </div>
          </div>

          {/* Feature list */}
          <ul className="space-y-2 mb-6">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {profile.upgraded_at && tier !== "free" && (
            <p className="text-xs text-gray-600">
              Subscribed since {new Date(profile.upgraded_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </motion.div>

        {/* Upgrade options */}
        {tier !== "enterprise" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {tier === "free" ? "Upgrade Your Plan" : "Upgrade to Enterprise"}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {tier === "free" && (
                <div className="p-6 bg-ink-2 border-2 border-emerald/30 rounded-2xl relative">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-emerald" />
                    <h4 className="font-semibold text-white">Pro</h4>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white">$299</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-gray-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> Competitor benchmarking</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> Weekly score reports</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> Advanced analytics</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> Pro Verified badge</li>
                  </ul>
                  <button
                    onClick={() => handleUpgrade("pro_monthly")}
                    disabled={upgradeLoading !== null}
                    className="btn-glow w-full py-3 bg-emerald text-white font-semibold rounded-xl hover:bg-emerald-light disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {upgradeLoading === "pro_monthly" ? "Redirecting..." : (
                      <><ArrowRight className="w-4 h-4" /> Upgrade to Pro</>
                    )}
                  </button>
                </div>
              )}

              <div className="p-6 bg-ink-2 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-emerald" />
                  <h4 className="font-semibold text-white">Enterprise</h4>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">$599</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> API access + webhooks</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> White-label reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> Dedicated account manager</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> SSO / SAML</li>
                </ul>
                <Link
                  href="/contact"
                  className="w-full py-3 border border-emerald/30 text-emerald font-semibold rounded-xl hover:bg-emerald/10 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" /> Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing info note */}
        <p className="mt-8 text-xs text-gray-600 text-center">
          Payments are processed securely by Stripe. Cancel anytime from the subscription portal.
        </p>
        <div className="mt-2 text-center">
          <Link href="/dashboard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
