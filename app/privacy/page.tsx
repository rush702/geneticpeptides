import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — PepAssure",
  description: "How PepAssure collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen molecular-bg pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500">Last updated: April 11, 2026</p>
          </div>
        </div>

        <p className="text-gray-400 leading-relaxed mb-12">
          PepAssure (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights.
        </p>

        <div className="prose-dark space-y-10">
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">1. Information We Collect</h2>
            <div className="space-y-3 text-gray-300 text-[15px] leading-relaxed">
              <p><strong className="text-white">Account information:</strong> When you create an account, we collect your email address and any optional profile information you provide (display name, vendor details, etc.).</p>
              <p><strong className="text-white">Vendor claims:</strong> If you claim a vendor listing, we collect the vendor name, website URL, contact email, and any supporting documentation (COAs, lab reports).</p>
              <p><strong className="text-white">Usage data:</strong> We log basic analytics such as page views, referrers, and device type. We do not use fingerprinting or cross-site tracking.</p>
              <p><strong className="text-white">Payment data:</strong> Subscription payments are processed by Stripe. We never store your full card details on our servers — only the last 4 digits and expiry for display purposes.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">2. How We Use Your Data</h2>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5">
              <li>Authenticate you and provide access to the dashboard, account, and admin features</li>
              <li>Verify vendor claims and generate Peptide Verification Scores</li>
              <li>Send transactional emails (account notifications, COA status, billing)</li>
              <li>Send product updates if you&apos;ve opted in via your account notification preferences</li>
              <li>Diagnose bugs and improve the platform</li>
              <li>Prevent abuse, spam, and fraudulent activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">3. Data Sharing</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed mb-3">
              We do not sell your personal data. We share data only with:
            </p>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5">
              <li><strong className="text-white">Service providers:</strong> Supabase (authentication + database), Stripe (payments), Vercel (hosting)</li>
              <li><strong className="text-white">Legal compliance:</strong> When required by law, court order, or to prevent harm</li>
              <li><strong className="text-white">Aggregated analytics:</strong> Non-personally-identifiable aggregate data may be published in industry reports</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">4. Public Information</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              Vendor listings, PVS scores, and submitted reviews are public by design — that&apos;s how the platform provides value to researchers. When you claim a vendor listing, the vendor name, website, and score breakdown become part of the public vendor directory. Your personal account email is never displayed publicly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">5. Your Rights</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed mb-3">
              You can at any time:
            </p>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5">
              <li>Access and export your account data from <Link href="/account" className="text-emerald hover:text-emerald-light">your account settings</Link></li>
              <li>Update or correct your profile information</li>
              <li>Delete your account (permanently removes all personal data)</li>
              <li>Opt out of marketing emails via notification preferences</li>
              <li>Request a copy of any data we hold about you by emailing privacy@pepassure.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">6. California Privacy Rights (CCPA)</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed mb-3">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5 mb-3">
              <li><strong className="text-white">Right to Know</strong> — You may request the categories and specific pieces of personal information we have collected about you.</li>
              <li><strong className="text-white">Right to Delete</strong> — You may request that we delete the personal information we have collected from you, subject to legal exceptions.</li>
              <li><strong className="text-white">Right to Opt-Out of Sale</strong> — We do not sell your personal information. We do not share your personal information with third parties for their direct marketing purposes.</li>
              <li><strong className="text-white">Right to Non-Discrimination</strong> — We will not discriminate against you for exercising any of your CCPA rights.</li>
            </ul>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              To exercise any of these rights, email <a href="mailto:privacy@pepassure.com" className="text-emerald hover:text-emerald-light">privacy@pepassure.com</a> with the subject line &ldquo;CCPA Request.&rdquo; We will respond within 45 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">7. Cookies</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              We use essential cookies for authentication sessions. We do not use third-party advertising cookies, tracking pixels, or analytics cookies that identify you personally. Your browser settings can block cookies, but this will prevent you from signing in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">8. Data Retention</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              Account data is retained while your account is active. If you delete your account, personal data is removed within 30 days except where retention is required by law (e.g., financial records). Public vendor data and aggregated analytics remain on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">9. Security</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              We use industry-standard security practices: encrypted connections (TLS), encrypted storage, row-level security on the database, and scoped access tokens. No system is 100% secure — if we detect a breach that affects your data, we will notify you promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">10. International Users &amp; GDPR</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed mb-3">
              PepAssure is operated from the United States. If you are located in the European Economic Area (EEA) or United Kingdom, the following applies:
            </p>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5 mb-3">
              <li><strong className="text-white">Lawful Basis for Processing:</strong> We process your data under: (a) <em>contract performance</em> for account creation and billing; (b) <em>legitimate interests</em> for platform analytics, fraud prevention, and service improvement; (c) <em>consent</em> for marketing emails and newsletter subscriptions.</li>
              <li><strong className="text-white">International Transfers:</strong> Your data is transferred to the United States where our service providers (Supabase, Stripe, Vercel) operate. These providers maintain Standard Contractual Clauses (SCCs) as approved by the European Commission to ensure adequate protection of your data.</li>
              <li><strong className="text-white">Your GDPR Rights:</strong> In addition to the rights in Section 5, you may object to processing based on legitimate interests, request restriction of processing, and lodge a complaint with your local supervisory authority.</li>
            </ul>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              For GDPR-related requests, email <a href="mailto:privacy@pepassure.com" className="text-emerald hover:text-emerald-light">privacy@pepassure.com</a> with the subject line &ldquo;GDPR Request.&rdquo;
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              We may update this policy from time to time. Material changes will be announced via email to account holders and highlighted at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">Contact</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              Questions about this policy? Email{" "}
              <a href="mailto:privacy@pepassure.com" className="text-emerald hover:text-emerald-light">
                privacy@pepassure.com
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
