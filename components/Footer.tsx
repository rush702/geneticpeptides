import Link from "next/link";
import { Shield, Mail, ExternalLink } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Vendor Rankings", href: "/" },
      { label: "Peptide Library", href: "/peptides" },
      { label: "Verification API", href: "/api-docs" },
      { label: "Batch Lookup", href: "#" },
    ],
  },
  {
    title: "Vendors",
    links: [
      { label: "Claim Listing", href: "/for-vendors" },
      { label: "Pricing", href: "/for-vendors#pricing" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Enterprise", href: "/for-vendors#enterprise" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Methodology", href: "/methodology" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy#6" },
      { label: "Contact Legal", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-ink-2 molecular-bg">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top section: brand + newsletter */}
        <div className="grid md:grid-cols-2 gap-10 mb-12 pb-12 border-b border-white/5">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                PepAssure
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed max-w-sm">
              Independent peptide vendor verification. No paid placements — ever.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-4 h-4" />
              <a href="mailto:hello@pepassure.com" className="hover:text-emerald transition-colors">
                hello@pepassure.com
              </a>
            </div>
          </div>

          <div className="md:max-w-md md:ml-auto md:w-full">
            <NewsletterSignup />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-emerald transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} PepAssure. All rights reserved. Not affiliated with any vendor.
          </p>
          <p className="text-xs text-gray-600">
            Data updated daily &middot; Independent &middot; Unbiased
          </p>
        </div>
      </div>
    </footer>
  );
}
