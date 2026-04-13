import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PepAssure — Independent Peptide Vendor Verification",
    template: "%s | PepAssure",
  },
  description:
    "Unbiased peptide vendor rankings, COA verification, and quality scores across 148+ vendors and 12+ research peptides. No paid placements — ever.",
  keywords: [
    "peptide vendors",
    "peptide verification",
    "COA verification",
    "peptide quality",
    "research peptides",
    "PVS score",
    "vendor rankings",
    "peptide purity",
    "BPC-157",
    "semaglutide",
  ],
  metadataBase: new URL("https://pepassure.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PepAssure",
    title: "PepAssure — Independent Peptide Vendor Verification",
    description:
      "Unbiased peptide vendor rankings powered by COA verification, purity testing, and community sentiment. 148+ vendors scored.",
    url: "https://pepassure.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "PepAssure — Independent Peptide Vendor Verification",
    description:
      "Unbiased peptide vendor rankings powered by COA verification, purity testing, and community sentiment.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA4_ID}');`,
              }}
            />
          </>
        )}
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');fbq('track','PageView');`,
            }}
          />
        )}
      </head>
      <body className="min-h-screen bg-ink text-gray-200 font-sans antialiased" suppressHydrationWarning>
        <Nav />
        <main className="pt-20">{children}</main>
        <Footer />
        {/* Tidio Live Chat — set NEXT_PUBLIC_TIDIO_KEY in env vars */}
        {process.env.NEXT_PUBLIC_TIDIO_KEY && (
          <script
            src={`//code.tidio.co/${process.env.NEXT_PUBLIC_TIDIO_KEY}.js`}
            async
          />
        )}
      </body>
    </html>
  );
}
