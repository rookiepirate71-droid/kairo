import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Space_Mono } from "next/font/google";
import { SITE_URL, appJsonLd } from "@/lib/seo";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  // variable names must match the references in @theme inline (globals.css)
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Oraculum — The AI Command Center for Company Data",
    template: "%s — Oraculum",
  },
  description:
    "Turn company data into decisions: governed metrics with lineage, anomaly alerts, and plain-language analysis on one surface.",
  keywords: [
    "oraculum",
    "business intelligence",
    "analytics platform",
    "data lineage",
    "AI analytics",
    "dashboards",
  ],
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: "Oraculum — The AI Command Center for Company Data",
    description:
      "Governed metrics with lineage, anomaly alerts, and plain-language analysis on one surface.",
    type: "website",
    locale: "en_US",
    siteName: "Oraculum",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Oraculum — The AI Command Center for Company Data",
    description:
      "Governed metrics with lineage, anomaly alerts, and plain-language analysis on one surface.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} bg-ink text-bone antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}
