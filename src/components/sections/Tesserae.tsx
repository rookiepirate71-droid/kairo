"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect } from "react";
import { useOracleStore } from "@/store/oracle";
import { TESSERAE, numeralFor } from "@/lib/constants";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";

const IMAGE_SIZES = "(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 85vw";

export default function Tesserae() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const { activeOrder, openOrder, closeOrder } = useOracleStore();
  const active = activeOrder !== null ? TESSERAE[activeOrder] : null;

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // arrow-key support whenever the carousel has focus
  useEffect(() => {
    if (!emblaApi) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [emblaApi, prev, next]);

  return (
    <section id="tesserae" className="bg-ink py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-oxidized mb-4">
              {numeralFor("tesserae")} — Tesserae
            </p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-bone leading-tight max-w-xl">
              Seven stones, one command center. Each one a build, not a demo.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge>Drag, tap, or arrow keys</Badge>
            <button
              onClick={prev}
              aria-label="Previous tessera"
              className="min-h-[44px] min-w-[44px] border border-oxidized/60 text-oxidized rounded-sm hover:bg-oxidized/10 transition-colors"
            >
              ←
            </button>
            <button
              onClick={next}
              aria-label="Next tessera"
              className="min-h-[44px] min-w-[44px] border border-oxidized/60 text-oxidized rounded-sm hover:bg-oxidized/10 transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef} tabIndex={0} aria-label="Tesserae carousel">
          <div className="flex gap-6">
            {TESSERAE.map((item, i) => (
              <button
                key={item.id}
                onClick={() => openOrder(i)}
                className="group relative min-w-0 flex-[0_0_78%] sm:flex-[0_0_45%] lg:flex-[0_0_28%] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
                aria-label={`Open ${item.title}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-stone/40">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes={IMAGE_SIZES}
                    quality={70}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-bone">
                    {String(i + 1).padStart(2, "0")} — {item.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal open={active !== null} onClose={closeOrder} title={active?.title ?? ""}>
        {active && (
          <div>
            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={active.image}
                alt={active.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 85vw"
                quality={70}
                className="object-cover"
              />
            </div>
            <p className="text-sm leading-relaxed text-travertine">{active.description}</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-oxidized">
              Included in every tier — see Orders
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
