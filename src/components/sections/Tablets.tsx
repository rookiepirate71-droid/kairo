"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TABLETS, numeralFor } from "@/lib/constants";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { stoneTexture } from "@/lib/stoneTexture";
import { cn } from "@/lib/utils";

/* tabula ansata: slab widens to pointed wings at mid-height, like the
   carved artifact */
const TABULA_CLIP =
  "polygon(7% 0%, 93% 0%, 100% 50%, 93% 100%, 7% 100%, 0% 50%)";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/* Quote split into words → chars for the staggered carve-in. Words stay
   wrapped so line breaks work; the aria-hidden char layer is doubled by
   an aria-label on the blockquote for screen readers. */
function CarvedText({ text }: { text: string }) {
  let i = 0;
  return (
    <span aria-hidden="true">
      {text.split(" ").map((word, w) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, c) => (
            <span
              key={c}
              className="carve-char"
              style={{ "--ci": `${i++ * 22}ms` } as React.CSSProperties}
            >
              {ch}
            </span>
          ))}
          {w < text.split(" ").length - 1 ? (
            <span
              className="carve-char"
              style={{ "--ci": `${i++ * 22}ms` } as React.CSSProperties}
            >
              {"\u00a0"}
            </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}

/* Gold dust motes rising off the freshly carved letters (active slide
   only, skipped for reduced motion). Web Animations API, self-cleaning. */
function Dust({ active }: { active: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const host = ref.current;
    if (!host || !active || reduced) return;
    const motes: Animation[] = [];
    for (let i = 0; i < 10; i++) {
      const dot = document.createElement("span");
      const size = 2 + Math.random() * 2;
      dot.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:var(--color-oxidized,#a98a44);opacity:0;pointer-events:none;left:${8 + Math.random() * 84}%;bottom:${5 + Math.random() * 30}%`;
      host.appendChild(dot);
      motes.push(
        dot.animate(
          [
            { opacity: 0, transform: "translateY(0)" },
            { opacity: 0.7, offset: 0.25 },
            { opacity: 0, transform: "translateY(-46px)" },
          ],
          {
            duration: 3200 + Math.random() * 2600,
            delay: Math.random() * 4200,
            iterations: Infinity,
          },
        ),
      );
    }
    return () => {
      motes.forEach((a) => a.cancel());
      host.querySelectorAll("span").forEach((d) => d.remove());
    };
  }, [active, reduced]);
  return <span ref={ref} aria-hidden="true" className="absolute inset-0 overflow-hidden" />;
}

/* One carved tablet: procedural sandstone underlay, carved frame,
   lettering that cuts in while the slide is active. */
function TabletSlide({
  quote,
  name,
  role,
  index,
  active,
  carving,
}: {
  quote: string;
  name: string;
  role: string;
  index: number;
  active: boolean;
  carving: boolean;
}) {
  const [texture, setTexture] = useState("");
  useEffect(() => {
    setTexture(stoneTexture(index + 1));
  }, [index]);

  return (
    <figure
      className={cn(
        "relative flex-[0_0_100%] md:flex-[0_0_72%] pl-2 pr-2 transition-all duration-700 ease-[var(--ease-out-expo)]",
        active ? "scale-100 opacity-100" : "scale-[0.95] opacity-50",
      )}
      style={{ clipPath: TABULA_CLIP }}
      aria-hidden={!active}
    >
      <div
        className="relative flex min-h-[300px] flex-col justify-between px-10 py-9 md:min-h-[340px] md:px-12"
        style={texture ? { backgroundImage: `url(${texture})`, backgroundSize: "cover" } : undefined}
      >
        <Dust active={active} />
        {/* inset double-rule frame, as on the carved artifact */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 inset-y-4 border-double border-2 border-terra-deep/50"
        />
        <blockquote
          aria-label={quote}
          className={cn(
            "relative font-display text-xl italic leading-relaxed md:text-2xl",
            carving ? "carving" : "",
            active ? "text-terra-deep" : "text-stone/70",
          )}
        >
          “<CarvedText text={quote} />”
        </blockquote>
        <figcaption className="relative mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-terra-deep/90">
          {name} · {role}
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * Testimonial tablet carousel — the merged Inscriptions + Voices section,
 * restyled as carved tabulae ansatae: procedural stone, letters that cut
 * in, dust, drag + keyboard + dots + Roman counter and progress bar.
 */
export default function Tablets() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selected, setSelected] = useState(0);
  const [sectionRef, inView] = useInView<HTMLElement>({ threshold: 0.3 });
  const reduced = useReducedMotion();

  const pausedRef = useRef(false);
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
    const onDrag = () => {
      pausedRef.current = true;
    };
    emblaApi.on("pointerDown", onDrag);
    emblaApi.on("pointerUp", () => {
      pausedRef.current = false;
    });
    document.addEventListener("keydown", onKey);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", onDrag);
      document.removeEventListener("keydown", onKey);
    };
  }, [emblaApi, prev, next]);

  /* autoplay: 8s, only in view, never for reduced motion, paused while
     hovered, focused or dragged */
  useEffect(() => {
    if (!inView || reduced || !emblaApi) return;
    const id = setInterval(() => {
      if (!pausedRef.current && !document.hidden) emblaApi.scrollNext();
    }, 8000);
    return () => clearInterval(id);
  }, [inView, reduced, emblaApi]);

  const carving = inView && !reduced;
  const progress = ((selected + 1) / TABLETS.length) * 100;

  return (
    <section
      id="tablets"
      data-section="tablets"
      ref={sectionRef}
      className="section-scope travertine-bg text-ink py-28 md:py-36 overflow-hidden"
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        pausedRef.current = false;
      }}
      onFocus={() => {
        pausedRef.current = true;
      }}
      onBlur={() => {
        pausedRef.current = false;
      }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-terra-deep mb-4">
          {numeralFor("tablets")} — Tablets of the Customers
        </p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-14 max-w-xl text-sand drop-shadow-[0_1px_0_rgba(141,111,60,0.25)]">
          Carved by the teams who run their quarter on Oraculum.
        </h2>

        <div
          className="overflow-hidden"
          ref={emblaRef}
          tabIndex={0}
          aria-label="Customer testimonial carousel"
        >
          <div className="flex items-stretch">
            {TABLETS.map((t, i) => (
              <TabletSlide
                key={t.name}
                {...t}
                index={i}
                active={i === selected}
                carving={carving}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-terra-deep/50 text-terra-deep transition-colors hover:bg-terra-deep/10"
          >
            ←
          </button>
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-terra-deep/50 text-terra-deep transition-colors hover:bg-terra-deep/10"
          >
            →
          </button>

          {/* Roman counter + hairline progress bar, as on the artifact */}
          <p className="font-mono text-[11px] tracking-[0.3em] text-ink" aria-live="polite">
            {ROMAN[selected]} / {ROMAN[TABLETS.length - 1]}
          </p>
          <div
            aria-hidden="true"
            className="h-px flex-1 max-w-44 bg-terra-deep/25 overflow-hidden"
          >
            <div
              className="h-full bg-terra-deep transition-all duration-500 ease-[var(--ease-out-expo)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* screen-reader-only slide navigation (visual arrows + keys
             cover pointer users, matching the artifact's sparse chrome) */}
          <div className="sr-only" role="tablist" aria-label="Choose testimonial">
            {TABLETS.map((t, i) => (
              <button
                key={t.name}
                role="tab"
                aria-selected={i === selected}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
