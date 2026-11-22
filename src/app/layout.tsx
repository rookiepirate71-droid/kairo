import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Space_Mono } from "next/font/google";
import { SITE_URL, siteUrl, appJsonLd } from "@/lib/seo";
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
    default: "Oraculum — Consult the oracle without leaving your shell",
    template: "%s — Oraculum",
  },
  description:
    "Turn your command line into a place of answers. Pose a question in plain language or Latin-flavored syntax and receive prophecy, precedent and a suggested next command.",
  keywords: [
    "oraculum",
    "terminal oracle",
    "command line",
    "CLI assistant",
    "augury",
    "developer tools",
  ],
  alternates: { canonical: siteUrl("/") },
  openGraph: {
    title: "Oraculum — Consult the oracle without leaving your shell",
    description:
      "Pose a question in plain language or Latin-flavored syntax and receive prophecy, precedent and a suggested next command.",
    type: "website",
    locale: "en_US",
    siteName: "Oraculum",
    url: siteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Oraculum — Consult the oracle without leaving your shell",
    description:
      "Pose a question in plain language or Latin-flavored syntax and receive prophecy, precedent and a suggested next command.",
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
