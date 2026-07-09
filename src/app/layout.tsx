import type { Metadata } from "next";
import {
  PUBLIC_CONTACT_EMAIL,
  PUBLIC_SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";
import { serializeJsonLd } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${PUBLIC_SITE_NAME} | Hearts and Arrows CZ`,
  description:
    "20 years of Hearts and Arrows cubic zirconia manufacturing, with round colorless CZ in standard and custom sizes.",
  openGraph: {
    title: `${PUBLIC_SITE_NAME} | Hearts and Arrows CZ`,
    description:
      "20 years of Hearts and Arrows cubic zirconia manufacturing, with round colorless CZ in standard and custom sizes.",
    url: SITE_URL,
    siteName: PUBLIC_SITE_NAME,
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
              name: PUBLIC_SITE_NAME,
              url: SITE_URL,
              description:
                "Hearts and Arrows cubic zirconia factory specializing in round colorless 5A CZ.",
              email: PUBLIC_CONTACT_EMAIL,
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                email: PUBLIC_CONTACT_EMAIL,
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
