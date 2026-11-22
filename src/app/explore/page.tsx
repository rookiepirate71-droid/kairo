import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import ExploreGallery from "@/components/sections/ExploreGallery";
import MostConsulted from "@/components/sections/MostConsulted";
import { seoFor } from "@/lib/seo";
import { EXPLORE_STEPS } from "@/lib/constants";

export const metadata: Metadata = {
  ...seoFor(
    "Explore the Library of Oraculum",
    "Every build, pillar and rite in one gallery — seven tesserae, six engines, four rites. Browse the library, join an order, put it to work.",
    "/generated/tessera-mosaic.jpg",
    "/explore/",
  ),
};

export default function ExplorePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-oxidized focus:text-ink focus:px-4 focus:py-2 focus:rounded-sm"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="bg-ink">
        <section data-section="explore-hero" className="section-scope mx-auto max-w-7xl px-6 pt-36 pb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-oxidized mb-4">
            The Library
          </p>
          <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] text-bone leading-tight max-w-2xl">
            Explore every artifact of the school.
          </h1>
          <p className="mt-5 max-w-xl text-travertine">
            Builds, pillars and rites — each one reviewed by the college of
            augurs, licensed for your whole republic, live within the week.
          </p>
        </section>

        <section data-section="explore-gallery" className="section-scope mx-auto max-w-7xl px-6 pb-24">
          <ExploreGallery />
        </section>

        <section data-section="explore-most-consulted" className="section-scope border-y border-stone/30 bg-charcoal/60 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <MostConsulted />
          </div>
        </section>

        <section data-section="explore-steps" className="section-scope mx-auto max-w-7xl px-6 py-24">
          <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] text-bone mb-12">
            From browse to build, in days.
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {EXPLORE_STEPS.map((step, i) => (
              <li key={step.title} className="border-t-2 border-oxidized/50 pt-6">
                <span className="font-mono text-xs text-oxidized">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl text-bone">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-travertine">{step.body}</p>
                <div className="mt-4 flex gap-2">
                  {step.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-stone/50 rounded-sm px-2 py-0.5 font-mono text-[10px] text-stone"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-16 text-center">
            <Link
              href="/#access"
              className="inline-flex min-h-[56px] items-center justify-center px-12 bg-gold text-ink font-sans text-base uppercase tracking-wide rounded-sm shadow-raised hover:bg-oxidized transition-colors"
            >
              Request Access
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
