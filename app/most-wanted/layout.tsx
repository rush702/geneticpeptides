import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Most Wanted Vendors",
  description:
    "Vote for the peptide vendors you want verified next. Community-driven nominations and upvotes decide who gets tested.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
