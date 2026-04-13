import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim Your Free Vendor Listing",
  description:
    "Join 148+ verified peptide vendors on PepAssure. Get your PVS score, verified badges, and real-time analytics — starting at $0. No paid placements.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
