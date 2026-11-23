"use client";

import { useId, useState } from "react";
import { PLANS, COMPARISON, numeralFor } from "@/lib/constants";
import Accordion from "@/components/ui/Accordion";
import TierCard from "@/components/orders/TierCard";
import { TIERS } from "@/lib/tiers";
import { cn } from "@/lib/utils";

/* Engraved SPQR-style rule. */
function SpqrRule({ inverted = false }: { inverted?: boolean }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-3">
      <span className={cn("h-px flex-1", inverted ? "bg-terra-deep/50" : "bg-stone/40")} />
      <span
        className={cn(
          "font-mono text-[10px] tracking-[0.3em]",
          inverted ? "text-terra-deep" : "text-(--on-surface-muted)"
        )}
      >
        SPQR
      </span>
      <span className={cn("h-px flex-1", inverted ? "bg-terra-deep/50" : "bg-stone/40")} />
    </div>
  );
}

/* Comparison rows feed cards and accordion from one source (no duplicated copy). */
const TABLE = COMPARISON;

export default function Orders() {
  const [annual, setAnnual] = useState(false);
  const liveId = useId();

  return (
    <section id="orders" data-section="orders" className="section-scope bg-ink py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold mb-4">
            {numeralFor("orders")} — Orders of Membership
          </p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-bone leading-tight">
            Three orders. One honest dashboard to an empire.
          </h2>

          {/* SPQR engraved rules above and below the header block */}
          <div className="mt-8 max-w-md mx-auto">
            <SpqrRule />
          </div>

          {/* Billing toggle: a real radiogroup. Arrow keys move, each option
              is tabbable only when selected, selection is conveyed by the
              pressed glyph as well as colour. */}
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="mt-8 inline-flex items-center border border-stone/40 rounded-sm p-1"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                setAnnual(e.key === "ArrowRight");
              }
            }}
          >
            {(["Monthly", "Annual · save 15%"] as const).map((label, i) => {
              const value = i === 1;
              const selected = annual === value;
              return (
                <button
                  key={label}
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setAnnual(value)}
                  className={cn(
                    "flex min-h-[44px] min-w-[44px] items-center gap-2 px-5 text-sm uppercase tracking-wide rounded-sm transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2",
                    selected ? "bg-oxidized text-ink" : "text-travertine hover:text-bone"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block h-2 w-2",
                      selected ? "bg-ink" : "border border-stone"
                    )}
                  />
                  {label}
                </button>
              );
            })}
          </div>
          <p id={liveId} aria-live="polite" className="sr-only">
            {annual
              ? "Annual billing selected: prices shown are the effective monthly price, billed annually, 15 percent below monthly."
              : "Monthly billing selected."}
          </p>
        </div>

        {/* Cards: the pack's TierCard — semantic DOM underneath, an opaque
            WebGL2 canvas painting the liquid-marble flood over it on
            hover/focus/tap; with reduced motion or no WebGL2 the canvas
            never mounts and the CSS theme swap is the fallback. */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {TIERS.map((tier) => {
            const plan = PLANS.find((p) => p.id === tier.id);
            return (
              <TierCard
                key={tier.id}
                tier={tier}
                price={
                  annual && plan?.annual != null
                    ? `$${plan.annual.toLocaleString("en-US")}`
                    : undefined
                }
              />
            );
          })}
        </div>

        {/* SPQR rule below the cards, before the Tabula */}
        <div className="mt-16 max-w-2xl mx-auto">
          <SpqrRule />
        </div>

        {/* TABVLA COMPARATIONIS — the owner-provided scroll artifact,
            embedded verbatim (public/artifacts/scroll.html) in an isolated
            frame so it renders exactly as the demo. Relative src resolves
            under the GitHub Pages base path (/kairo/). */}
        <div className="mt-16 hidden md:block">
          <iframe
            src="artifacts/scroll.html"
            title="Tabula Comparationis — plan comparison scroll"
            className="block w-full border-0"
            style={{ height: 1150 }}
            loading="lazy"
          />
        </div>
        <div className="mt-12 md:hidden">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-travertine mb-4">
            Compare plans
          </p>
          <Accordion
            items={TABLE.map((row) => ({
              q: row.capability,
              a: `Citizen: ${row.citizen} · Senator: ${row.senator} · Emperor: ${row.emperor}`,
            }))}
          />
        </div>
      </div>

      {/* bottom safe-area scrim: reserves the fixed ScrollProgress pill's
          space inside this section so it never covers card CTAs */}
      <div aria-hidden="true" className="h-20 bg-gradient-to-t from-ink to-transparent" />
    </section>
  );
}
