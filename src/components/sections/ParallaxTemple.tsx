"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { numeralFor } from "@/lib/constants";

/**
 * Layered pixel-art temple rendered as SVG rects; layers translate at
 * different rates under ScrollTrigger scrub.
 */
export default function ParallaxTemple() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    // reduced motion: no layers move, the settled scene stays fully legible
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-layer='sky']", {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to("[data-layer='temple']", {
        yPercent: 4,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to("[data-layer='steps']", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: rootRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, rootRef);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced]);

  const skyRects = Array.from({ length: 40 }, (_, i) => ({
    x: (i * 83) % 640,
    y: ((i * 37) % 120) + 20,
    s: 4 + ((i * 13) % 3) * 2,
  }));

  return (
    <section
      ref={rootRef}
      id="temple"
      data-section="temple"
      className="section-scope relative h-[70vh] min-h-[480px] overflow-hidden bg-ink"
      aria-label="Pixel-art temple with the command center inside"
    >
      <svg
        viewBox="0 0 640 360"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Layered pixel-art illustration of a Roman temple housing a glowing data command center"
        shapeRendering="crispEdges"
      >
        <defs>
          {/* 2x2 checkerboards = ordered-dither mid tones between two palette colours */}
          <pattern id="dither-bone-trav" width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill="#ede6d6" />
            <rect width="1" height="1" fill="#d6c6a1" />
            <rect x="1" y="1" width="1" height="1" fill="#d6c6a1" />
          </pattern>
          <pattern id="dither-trav-ink" width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill="#d6c6a1" />
            <rect width="1" height="1" fill="#b3a17c" />
            <rect x="1" y="1" width="1" height="1" fill="#b3a17c" />
          </pattern>
        </defs>
        {/* sky layer */}
        <g data-layer="sky">
          <rect width="640" height="360" fill="#0d0c0a" />
          {skyRects.map((r, i) => (
            <rect
              key={i}
              x={r.x - (r.x % 4)}
              y={r.y - (r.y % 4)}
              width={r.s}
              height={r.s}
              fill={i % 7 === 0 ? "#c8a45c" : "#4a453c"}
              opacity="0.8"
            />
          ))}
        </g>

        {/* temple layer */}
        <g data-layer="temple">
          {/* pediment, dither-shaded toward the left light source */}
          <polygon points="320,40 460,110 180,110" fill="#e7dfcd" />
          <polygon points="320,40 460,110 320,110" fill="url(#dither-bone-trav)" />
          <polygon points="320,52 436,106 204,106" fill="#5b1a3a" />
          {/* entablature, dithered underside */}
          <rect x="180" y="110" width="280" height="14" fill="#d6c6a1" />
          <rect x="180" y="120" width="280" height="4" fill="url(#dither-trav-ink)" />
          {/* columns */}
          {[200, 250, 300, 350, 400, 440].map((x) => (
            <g key={x}>
              <rect x={x} y="124" width="18" height="130" fill="#ede6d6" />
              <rect x={x + 3} y="124" width="3" height="130" fill="#d6c6a1" />
              <rect x={x + 12} y="124" width="3" height="130" fill="url(#dither-bone-trav)" />
            </g>
          ))}
          {/* the doorway between the middle columns: dark opening, gold
              light spilling out of the command center within */}
          <rect x="322" y="150" width="24" height="104" fill="#141210" />
          <rect x="322" y="150" width="24" height="4" fill="#b3a17c" />
          <rect x="326" y="162" width="16" height="8" fill="#a98a44" />
          <rect x="326" y="176" width="10" height="6" fill="#b5532f" />
          <rect x="326" y="188" width="14" height="6" fill="#a98a44" />
          <rect x="326" y="200" width="8" height="6" fill="#6e2144" />
          <rect x="326" y="212" width="12" height="4" fill="#c8a45c" />
          {/* light spill on the floor before the doorway */}
          <rect x="318" y="254" width="32" height="4" fill="#a98a44" opacity="0.5" />
        </g>

        {/* steps layer */}
        <g data-layer="steps">
          <rect x="150" y="254" width="340" height="14" fill="#d6c6a1" />
          <rect x="130" y="268" width="380" height="14" fill="#e7dfcd" />
          <rect x="110" y="282" width="420" height="14" fill="#ede6d6" />
          <rect x="0" y="296" width="640" height="64" fill="#141210" />
          {/* foreground paving and braziers on the dark ground band */}
          {[0, 64, 128, 192, 256, 320, 384, 448, 512, 576].map((x) => (
            <rect key={x} x={x + 4} y="300" width="56" height="4" fill="#4a453c" opacity="0.6" />
          ))}
          {[32, 160, 288, 416, 544].map((x) => (
            <rect key={x} x={x + 4} y="312" width="56" height="4" fill="#4a453c" opacity="0.4" />
          ))}
          {[96, 528].map((x) => (
            <g key={x}>
              <rect x={x} y="292" width="4" height="4" fill="#b5532f" />
              <rect x={x - 4} y="284" width="12" height="8" fill="#b5532f" opacity="0.7" />
              <rect x={x - 8} y="278" width="20" height="6" fill="#c8a45c" opacity="0.35" />
            </g>
          ))}
        </g>
      </svg>

      {/* page-wide edge fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

      {/* text band: anchored on the dark ground, radial scrim guarantees a
          dark backdrop so bone/gold text holds ≥4.5:1 at every width */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-6 pb-10 sm:pb-14">
        <div className="relative max-w-2xl text-center">
          <div
            aria-hidden="true"
            className="absolute -inset-x-16 -inset-y-10 -z-10 bg-[radial-gradient(ellipse_60%_75%_at_50%_50%,var(--color-ink)_35%,transparent_75%)]"
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold mb-4">
            {numeralFor("temple")} — The Temple
          </p>
          <blockquote className="font-display text-[clamp(1.5rem,3.5vw,2.75rem)] italic leading-snug text-bone">
            “The command center is finished when the board agrees — and the
            board has never once agreed.”
          </blockquote>
          <footer className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
            — Praxeas, first customer in residence
          </footer>
        </div>
      </div>
    </section>
  );
}
