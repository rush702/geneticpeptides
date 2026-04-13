import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peptide Library",
  description:
    "Browse research peptides including BPC-157, Semaglutide, TB-500, and more. See which verified vendors carry each peptide, ranked by PVS score.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
