import type { Metadata } from "next";
import { serializeJsonLd } from "@/lib/utils";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dfcgem.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DFCgem | Precision CZ Wholesale Supplier",
  description:
    "B2B cubic zirconia wholesale catalog for India buyers with MOQ, tier prices, quote orders, and manual payment confirmation.",
  openGraph: {
    title: "DFCgem | Precision CZ Wholesale Supplier",
    description:
      "B2B cubic zirconia wholesale catalog for India buyers with MOQ, tier prices, quote orders, and manual payment confirmation.",
    url: SITE_URL,
    siteName: "DFCgem",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DFCgem",
              url: SITE_URL,
              description:
                "B2B cubic zirconia wholesale supplier. Factory-direct CZ stones for jewelry manufacturers.",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                availableLanguage: ["English", "Chinese"],
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
