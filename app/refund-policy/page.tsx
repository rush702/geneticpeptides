import Link from "next/link";
import type { Metadata } from "next";
import { RotateCcw, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description:
    "PepAssure subscription refund policy. Learn about our 14-day refund window, cancellation process, and how to request a refund.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen molecular-bg pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
            <RotateCcw className="w-6 h-6 text-emerald" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
              Return &amp; Refund Policy
            </h1>
            <p className="text-sm text-gray-500">Last updated: April 13, 2026</p>
          </div>
        </div>

        <p className="text-gray-400 leading-relaxed mb-12">
          PepAssure is a software-as-a-service platform. We do not sell physical products. This policy covers subscription refunds and account credits.
        </p>

        <div className="prose-dark space-y-10">
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">1. Free Tier</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              The free tier requires no payment and has no refund considerations. You can use it indefinitely with no obligation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">2. Paid Subscriptions (Pro &amp; Enterprise)</h2>
            <div className="space-y-3 text-gray-300 text-[15px] leading-relaxed">
              <p>
                <strong className="text-white">14-day refund window:</strong> If you upgrade to a paid plan and are not satisfied, you may request a full refund within 14 days of your initial payment. No questions asked.
              </p>
              <p>
                <strong className="text-white">After 14 days:</strong> Refunds are evaluated on a case-by-case basis. We generally do not provide refunds for partial billing periods, but we want you to be happy — reach out and we&apos;ll work something out.
              </p>
              <p>
                <strong className="text-white">Annual plans:</strong> Annual subscriptions are eligible for a prorated refund within the first 30 days. After 30 days, you may cancel to prevent renewal but will retain access through the end of the billing period.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">3. How to Request a Refund</h2>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5">
              <li>Email <a href="mailto:billing@pepassure.com" className="text-emerald hover:text-emerald-light">billing@pepassure.com</a> with your account email and reason for refund</li>
              <li>Or use the <Link href="/contact" className="text-emerald hover:text-emerald-light">contact form</Link> and select &ldquo;General Inquiry&rdquo;</li>
              <li>Refunds are processed within 5-10 business days back to your original payment method</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">4. Cancellation</h2>
            <div className="space-y-3 text-gray-300 text-[15px] leading-relaxed">
              <p>
                You can cancel your subscription at any time from your <Link href="/dashboard" className="text-emerald hover:text-emerald-light">vendor dashboard</Link> or by contacting us. When you cancel:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>Your paid features remain active through the end of the current billing period</li>
                <li>Your account automatically reverts to the free tier when the period ends</li>
                <li>Your vendor listing, PVS score, and public data remain intact</li>
                <li>Dashboard analytics history is retained for 90 days after downgrade</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">5. Disputed Charges</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              If you see a charge you don&apos;t recognize, please contact us before filing a dispute with your bank. We can often resolve billing issues faster than the chargeback process, and disputed charges may result in account suspension until resolved.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">6. Service Credits</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              If PepAssure experiences significant downtime or service disruption that materially affects your paid features, we may issue account credits at our discretion. Enterprise customers with custom SLAs receive credits as defined in their agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">Contact</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              Billing questions? Email{" "}
              <a href="mailto:billing@pepassure.com" className="text-emerald hover:text-emerald-light">
                billing@pepassure.com
              </a>
              {" "}or use our{" "}
              <Link href="/contact" className="text-emerald hover:text-emerald-light">
                contact form
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
