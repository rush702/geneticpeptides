import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peptide Knowledge Base",
  description:
    "Guides, research updates, and industry news about peptide quality, vendor verification, and the latest in peptide science.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
