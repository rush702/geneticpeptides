import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the PepAssure team. Questions about vendor verification, enterprise plans, or partnership inquiries.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
