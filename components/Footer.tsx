import Link from "next/link";
import { Shield, Mail, ExternalLink } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Vendor Rankings", href: "/" },
      { label: "Peptide Library", href: "/peptides" },
      { label: "Most Wanted", href: "/most-wanted" },
      { label: "Methodology", href: "/methodology" },
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
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Cookie Policy", href: "/privacy#6" },
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
              Verified. Every batch. Every source. The trust infrastructure for the peptide economy.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Mail className="w-4 h-4" />
              <a href="mailto:hello@pepassure.com" className="hover:text-emerald transition-colors">
                hello@pepassure.com
              </a>
            </div>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a href="https://twitter.com/PepAssure" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-ink-3 border border-white/10 flex items-center justify-center text-gray-500 hover:text-emerald hover:border-emerald/20 transition-all" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://reddit.com/user/PepAssure_Official" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-ink-3 border border-white/10 flex items-center justify-center text-gray-500 hover:text-emerald hover:border-emerald/20 transition-all" aria-label="Reddit">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              </a>
              <a href="https://instagram.com/pepassure" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-ink-3 border border-white/10 flex items-center justify-center text-gray-500 hover:text-emerald hover:border-emerald/20 transition-all" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
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
          <p className="text-xs text-gray-400" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} PepAssure. All rights reserved. Not affiliated with any vendor.
          </p>
          <p className="text-xs text-gray-400">
            Verified. Every Batch. Every Source. &middot; No paid placements
          </p>
        </div>
      </div>
    </footer>
  );
}
