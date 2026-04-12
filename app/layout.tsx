import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "PepAssure — Verified. Every Batch. Every Source.",
  description:
    "The trust infrastructure for the peptide economy. Independent verification, 12-metric PVS scoring, Finnrick lab grades, and community-driven vendor rankings across 200+ vendors and 15+ peptides. No paid placements — ever.",
  keywords: [
    "peptide verification",
    "peptide vendor rankings",
    "COA verification",
    "Finnrick grades",
    "PVS score",
    "peptide quality",
    "research peptides",
    "compounding pharmacy verification",
    "peptide trust",
    "batch verification",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink text-gray-200 font-sans antialiased">
        <Nav />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
