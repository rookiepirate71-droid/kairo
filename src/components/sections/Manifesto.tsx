"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { numeralFor } from "@/lib/constants";

const LINES = [
  "We believe a company deserves one surface where every number is true, every chart agrees, and every decision can point at the row that produced it.",
  "Most analytics tools are galleries: beautiful charts, no lineage, no memory, no consequence. Oraculum is a command center — metrics are defined once, alerts fire when they shift, and the 'whose number is right' argument retires itself.",
  "Our customers do not buy dashboards. They join a practice: connect the sources, define the metrics, ask in plain language, and let the lineage speak.",
  "The warehouse does not care about your roadmap. That is not a flaw of the warehouse. It is the entire product philosophy.",
  "We onboard every customer with a working session, not a credit card form. Access is typically live within the week.",
];

export default function Manifesto() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((line) => {
        gsap.fromTo(
          line,
          { opacity: 0.4, y: 8 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: line,
              start: "top 90%",
              end: "top 65%",
              scrub: true,
            },
          },
        );
      });
    }, rootRef);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="manifesto"
      className="travertine-bg text-ink py-28 md:py-40"
    >
      <div className="mx-auto max-w-3xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-terra-deep mb-10">
          {numeralFor("manifesto")} — The Manifesto
        </p>
        <div className="prose-manifesto space-y-6">
          <p>
            <span className="dropcap block" data-line>
              {LINES[0]}
            </span>
          </p>
          {LINES.slice(1).map((line, i) => (
            <p key={i} data-line>
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
