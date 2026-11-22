"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { TABLETS, numeralFor } from "@/lib/constants";

/**
 * Testimonial tablet carousel — the merged Inscriptions + Voices section.
 * Each quote is carved on a tablet; maxims stay in the marquee only.
 */
export default function Tablets() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      emblaApi.off("select", onSelect);
      document.removeEventListener("keydown", onKey);
    };
  }, [emblaApi, prev, next]);

  return (
    <section id="tablets" data-section="tablets" className="section-scope travertine-bg text-ink py-28 md:py-36 overflow-hidden">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-terra-deep mb-4">
          {numeralFor("tablets")} — Tablets of the Customers
        </p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-14 max-w-xl">
          Carved by the teams who run their quarter on Oraculum.
        </h2>

        <div className="overflow-hidden" ref={emblaRef} tabIndex={0} aria-label="Customer testimonial carousel">
          <div className="flex">
            {TABLETS.map((t) => (
              <figure
                key={t.name}
                className="flex-[0_0_100%] md:flex-[0_0_60%] border-l-4 border-terra-deep/50 bg-sand/60 px-8 py-10 mr-8 rounded-sm"
              >
                <blockquote className="font-display text-xl md:text-2xl italic leading-snug text-ink">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-terra-deep">
                  {t.name} · {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="min-h-[44px] min-w-[44px] border border-terra-deep/60 text-terra-deep rounded-sm hover:bg-terra-deep/10 transition-colors"
          >
            ←
          </button>
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="min-h-[44px] min-w-[44px] border border-terra-deep/60 text-terra-deep rounded-sm hover:bg-terra-deep/10 transition-colors"
          >
            →
          </button>
          <div className="flex gap-2" role="tablist" aria-label="Choose testimonial">
            {TABLETS.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === selected}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === selected ? "w-8 bg-terra-deep" : "w-2 bg-terra-deep/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
