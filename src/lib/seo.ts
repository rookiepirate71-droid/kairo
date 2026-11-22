import type { Metadata } from "next";
import { asset } from "@/lib/asset";

/** Base URL: set NEXT_PUBLIC_SITE_URL in production; fallback keeps dev sane. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://oraculum.example.com";

export function seoFor(
  title: string,
  description: string,
  image = "/generated/tessera-mosaic.jpg",
): Metadata {
  const url = `${SITE_URL}/`;
  const ogImage = asset(image);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Oraculum",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Organization + SoftwareApplication structured data. */
export function appJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Oraculum",
        url: SITE_URL,
        logo: `${SITE_URL}/opengraph-image`,
        sameAs: [],
      },
      {
        "@type": "SoftwareApplication",
        name: "Oraculum",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "The AI command center that turns company data into decisions — governed metrics, lineage, anomaly alerts and plain-language analysis.",
        offers: {
          "@type": "Offer",
          price: "400",
          priceCurrency: "USD",
        },
      },
    ],
  };
}

/** FAQPage structured data for the Senate accordion. */
export function faqJsonLd(faq: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
