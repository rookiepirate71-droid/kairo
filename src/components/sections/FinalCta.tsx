"use client";

import { useEffect, useRef } from "react";
import FluidOrb from "@/components/ui/fluid-orb";
import { numeralFor } from "@/lib/constants";

/**
 * Final call to action with a magnetic gold button — the button drifts a
 * few pixels toward the cursor while it is near. The transform is applied
 * imperatively (rAF-throttled) so mousemove never re-renders the section.
 */
export default function FinalCta() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const setBtnTransform = (x: number, y: number) => {
    const el = btnRef.current;
    if (!el) return;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onMove = (e: React.MouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setBtnTransform(dx * 0.15, dy * 0.15));
  };

  const onLeave = () => {
    cancelAnimationFrame(rafRef.current);
    setBtnTransform(0, 0);
  };

  return (
    <section id="access" data-section="access" className="section-scope coffer-bg py-32 md:py-44">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="group flex justify-center" aria-hidden="true">
          <div className="relative flex justify-center">
            <span
              className="pointer-events-none absolute inset-[-30%] rounded-full bg-gold/25 opacity-0 blur-2xl transition-opacity duration-300 ease-out group-hover:opacity-100"
            />
            <FluidOrb
              size={170}
              color="#b5532f"
              className="animate-[orb-float_7s_ease-in-out_infinite]"
            />
          </div>
        </div>
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-oxidized mb-6">
          {numeralFor("access")} — The Final Word
        </p>
        <h2 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] text-bone leading-tight">
          The auguries are read. The rest is execution.
        </h2>
        <p className="mt-6 text-travertine max-w-md mx-auto">
          One working session with our team. Your data, live in Oraculum,
          within the week.
        </p>
        <div className="mt-12" onMouseMove={onMove} onMouseLeave={onLeave}>
          <a
            ref={btnRef}
            href="#senate"
            className="inline-flex min-h-[56px] items-center justify-center px-12 bg-gold text-ink font-sans text-base uppercase tracking-wide rounded-sm shadow-raised transition-transform duration-150 ease-out hover:bg-oxidized"
          >
            Request Access
          </a>
        </div>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-stone">
          no credit card · no ceremony (much)
        </p>
      </div>
    </section>
  );
}
