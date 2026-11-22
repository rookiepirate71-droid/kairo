import type { Metadata } from "next";
import { asset, BASE as BASE_PATH } from "@/lib/asset";

/**
 * Origin only (no base path). CI sets NEXT_PUBLIC_SITE_URL to the real
 * deploy origin (e.g. the GitHub Pages origin); the localhost fallback is
 * for `next dev` and never reaches production.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Absolute URL for a site path, including the GitHub Pages base path. */
export function siteUrl(path = "/"): string {
  return `${SITE_URL}${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

export function seoFor(
  title: string,
  description: string,
  image = "/generated/tessera-mosaic.jpg",
  path = "/",
): Metadata {
  const url = siteUrl(path);
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
        url: siteUrl("/"),
        logo: asset("/opengraph-image"),
      },
      {
        "@type": "SoftwareApplication",
        name: "Oraculum",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description:
          "A terminal oracle: pose a question in plain language and receive prophecy, precedent and a suggested next command.",
        url: siteUrl("/"),
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
