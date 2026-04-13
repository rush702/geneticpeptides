import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — PepAssure",
  description: "Terms and conditions for using PepAssure.",
};

export default function TermsPage() {
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
            <FileText className="w-6 h-6 text-emerald" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500">Last updated: April 11, 2026</p>
          </div>
        </div>

        <p className="text-gray-400 leading-relaxed mb-12">
          These terms govern your use of PepAssure. By accessing or using our platform, you agree to be bound by them. If you don&apos;t agree, please don&apos;t use the service.
        </p>

        <div className="prose-dark space-y-10">
          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">1. Research Use Only</h2>
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg mb-4">
              <p className="text-sm text-yellow-400/90 leading-relaxed">
                <strong className="text-yellow-400">Important:</strong> PepAssure is an information service for research purposes only. We do not sell peptides, provide medical advice, or endorse any therapeutic use. All information is intended for qualified researchers operating under appropriate institutional oversight.
              </p>
            </div>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              You agree to use our platform only for legitimate research purposes and in compliance with all applicable laws and regulations in your jurisdiction. You are solely responsible for how you use the information we provide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">2. Eligibility</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              You must be at least 18 years old to use PepAssure. By creating an account, you represent that you meet this requirement and have the legal capacity to enter into this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">3. Account Responsibilities</h2>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must provide accurate information during signup and keep it updated</li>
              <li>You are responsible for all activity under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>One account per person — sharing accounts is prohibited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">4. Vendor Listings & Claims</h2>
            <div className="space-y-3 text-gray-300 text-[15px] leading-relaxed">
              <p>
                If you claim a vendor listing, you represent and warrant that you are authorized to act on behalf of the vendor and that all information you submit is accurate.
              </p>
              <p>
                <strong className="text-white">Fraudulent submissions:</strong> Submitting fake COAs, misleading information, or claiming a vendor you don&apos;t represent will result in immediate account termination and delisting. We may report severe fraud to relevant authorities.
              </p>
              <p>
                <strong className="text-white">Score disputes:</strong> Vendors can request score reviews via the dashboard, but PepAssure retains final authority over scoring decisions based on our published methodology.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">5. Subscription & Payments</h2>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5">
              <li>Paid plans (Pro, Enterprise) are billed monthly or yearly in advance</li>
              <li>Payments are processed by Stripe; you agree to Stripe&apos;s terms of service</li>
              <li>Subscriptions auto-renew unless canceled before the renewal date</li>
              <li>Refunds are provided on a case-by-case basis within 14 days of initial payment</li>
              <li>Failed payments may result in downgrading your account to the free tier</li>
              <li>We may change pricing with 30 days notice; existing subscribers keep their rate until renewal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">6. Prohibited Uses</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed mb-3">You agree not to:</p>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5">
              <li>Scrape, bulk-download, or redistribute our data without a commercial license</li>
              <li>Attempt to manipulate scores through fake reviews, shill accounts, or spam</li>
              <li>Reverse-engineer or attempt to bypass our verification systems</li>
              <li>Use the platform to promote products or services unrelated to peptide research</li>
              <li>Upload malicious content, illegal material, or infringe any intellectual property rights</li>
              <li>Impersonate others or misrepresent your affiliation with any person or entity</li>
              <li>Use the platform in any way that violates applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">7. Intellectual Property</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              All content on PepAssure — including the PVS scoring methodology, rankings, articles, designs, and software — is owned by PepAssure or our licensors and protected by copyright and trademark law. You may not copy, reproduce, or create derivative works without permission.
            </p>
            <p className="text-gray-300 text-[15px] leading-relaxed mt-3">
              You retain ownership of content you submit (COAs, vendor info, reviews), but grant us a worldwide, non-exclusive license to display, use, and analyze it as part of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">8. Disclaimers</h2>
            <div className="p-4 bg-ink border border-white/5 rounded-lg space-y-3 text-sm text-gray-400 leading-relaxed">
              <p>
                <strong className="text-white">No warranty:</strong> The service is provided &ldquo;as is&rdquo; without warranties of any kind. We don&apos;t guarantee uninterrupted access, accuracy of every data point, or fitness for any particular purpose.
              </p>
              <p>
                <strong className="text-white">Not medical advice:</strong> Information on PepAssure is not medical, therapeutic, or legal advice. Always consult qualified professionals for health-related decisions.
              </p>
              <p>
                <strong className="text-white">Vendor decisions:</strong> PVS scores are aggregated quality signals. Your decision to order from any vendor is your own, and you assume all associated risks.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              To the maximum extent permitted by law, PepAssure and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">10. Indemnification</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              You agree to indemnify, defend, and hold harmless PepAssure, its operators, affiliates, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorney&apos;s fees) arising from: (a) your use of the platform; (b) your purchasing decisions based on information available through PepAssure; (c) your violation of these terms; (d) any content you submit to the platform, including reviews and claims; or (e) your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">11. Termination</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              We may suspend or terminate your account at any time for violation of these terms, fraudulent activity, or at our discretion. You can delete your account at any time from <Link href="/account" className="text-emerald hover:text-emerald-light">your account settings</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">12. Changes to Terms</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              We may update these terms to reflect changes in our service or legal requirements. Material changes will be announced via email. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">13. Governing Law</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              These terms are governed by the laws of the State of Delaware, USA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">14. Dispute Resolution &amp; Arbitration</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed mb-3">
              Any dispute, controversy, or claim arising out of or relating to these Terms or your use of PepAssure shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules, with the following conditions:
            </p>
            <ul className="space-y-2 text-gray-300 text-[15px] leading-relaxed list-disc pl-5 mb-3">
              <li>Arbitration shall take place in Wilmington, Delaware, or via videoconference at the arbitrator&apos;s discretion.</li>
              <li>The arbitrator&apos;s decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.</li>
              <li><strong className="text-white">Class Action Waiver:</strong> You agree to resolve disputes on an individual basis only. You waive any right to participate in any class action, class arbitration, or representative proceeding against PepAssure.</li>
              <li><strong className="text-white">Small Claims Exception:</strong> Either party may bring an individual action in small claims court if the dispute qualifies.</li>
            </ul>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              This arbitration agreement shall survive termination of your account. If any part of this section is found unenforceable, the remainder shall still apply.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold text-white mb-4">Contact</h2>
            <p className="text-gray-300 text-[15px] leading-relaxed">
              Questions? Email{" "}
              <a href="mailto:legal@pepassure.com" className="text-emerald hover:text-emerald-light">
                legal@pepassure.com
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
