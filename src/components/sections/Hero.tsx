"use client";

import { useEffect, useRef, useState } from "react";
import HeroCanvas from "@/components/webgl/HeroCanvas";
import { Button } from "@/components/ui/Button";
import DemoModal from "@/components/ui/DemoModal";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useOracleStore } from "@/store/oracle";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { progress } = useScrollProgress();
  const [demoOpen, setDemoOpen] = useState(false);
  const consult = useOracleStore((s) => s.consult);

  useEffect(() => {
    consult();
  }, [consult]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      <HeroCanvas />

      <div
        aria-hidden="true"
        className="absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 52%, rgba(13,12,10,0.72) 0%, rgba(13,12,10,0.35) 55%, transparent 100%)",
        }}
      />

      <div
        className="relative z-10 px-6 text-center"
        style={{
          transform: `translateY(${progress * 120}px)`,
          opacity: Math.max(0, 1 - progress * 2.2),
        }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-oxidized mb-6">
          The AI command center for company data
        </p>
        <h1
          aria-label="Oraculum"
          className="font-display text-[clamp(3.5rem,12vw,9rem)] leading-none text-bone"
        >
          <span aria-hidden="true">
            ORACV<span className="text-terracotta">·</span>VM
          </span>
        </h1>
        <p className="mt-6 font-display text-xl italic text-travertine max-w-md mx-auto">
          Turn your company&rsquo;s data into decisions — lineage on every
          number, alerts on every shift, one surface for the whole republic.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#access">
            <Button>Request Access</Button>
          </a>
          <Button variant="secondary" onClick={() => setDemoOpen(true)}>
            Watch the Rite
          </Button>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-marble"
        style={{ opacity: Math.max(0, 1 - progress * 4) }}
        aria-hidden="true"
      >
        scroll ↓
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
