"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from "react";
import { TierRevealEngine } from "@/lib/tierRevealEngine";
import { REVEAL } from "@/lib/reveal-config";
import { readPalette, type Tier } from "@/lib/tiers";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TierCardProps {
  tier: Tier;
  /** override for the billing toggle, e.g. "$1,020" */
  price?: string;
  unit?: string;
  /** defaults to the cinematic 0.3, see lib/reveal-config.ts */
  speed?: number;
}

type GlMode = "pending" | "on" | "off";

/**
 * The semantic card (heading, text, real CTA link) is always in the DOM.
 * When WebGL2 works, an opaque canvas paints over it and the link stays
 * clickable on top. Otherwise CSS swaps the theme instantly (see globals.css).
 * Height comes from --tier-card-h, never from the canvas.
 */
export default function TierCard({
  tier,
  price,
  unit,
  speed = REVEAL.speed,
}: TierCardProps): ReactElement {
  const hostRef = useRef<HTMLElement>(null);
  const engineRef = useRef<TierRevealEngine | null>(null);
  const [mode, setMode] = useState<GlMode>("pending");
  const reduced = useReducedMotion();
  const shownPrice = price ?? tier.price;
  const shownUnit = unit ?? tier.unit;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    try {
      const engine = new TierRevealEngine(host, {
        tier,
        palette: readPalette(tier),
        speed,
        reducedMotion: reduced,
        price: shownPrice,
        unit: shownUnit,
      });
      engineRef.current = engine;
      setMode("on");
      void document.fonts.ready.then(() => engine.repaint());
      return () => {
        engine.dispose();
        engineRef.current = null;
      };
    } catch {
      setMode("off");
      return undefined;
    }
    // price/unit are pushed by the effect below; rebuilding GL for them would be wasteful
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, speed, reduced]);

  // declared after the effect above so it also re-applies after an engine rebuild
  useEffect(() => {
    engineRef.current?.setContent({ price: shownPrice, unit: shownUnit });
  }, [shownPrice, shownUnit, tier, speed, reduced]);

  const vars = {
    "--tb": `var(--tier-${tier.id}-stone)`,
    "--tf": `var(--tier-${tier.id}-ink)`,
  } as CSSProperties;

  return (
    <article ref={hostRef} data-gl={mode} className="tier-card" style={vars}>
      <div className="tier-card__body flex h-full flex-col gap-3 p-4">
        <p className="font-mono text-[11px] tracking-[0.16em] opacity-80">{tier.latin}</p>
        <h3 className="font-display text-[26px] leading-none font-normal">{tier.name}</h3>
        <p className="text-xs leading-[17px] opacity-85">{tier.tagline}</p>
        <p className="font-display text-[32px] leading-none [font-variant-numeric:lining-nums_tabular-nums]">
          {shownPrice}
          {shownUnit ? <span className="ml-1.5 font-sans text-xs opacity-70">{shownUnit}</span> : null}
        </p>
        <ul className="flex flex-col gap-[7px] text-xs leading-[17px]">
          {tier.features.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden="true" className="mt-[5px] size-[5px] flex-none bg-current opacity-80" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <a
        href={tier.href}
        className="tier-card__cta absolute inset-x-4 bottom-4 z-[2] flex h-[34px] items-center justify-center border border-current font-mono text-[11px] tracking-[0.16em]"
      >
        {tier.cta}
      </a>
    </article>
  );
}
