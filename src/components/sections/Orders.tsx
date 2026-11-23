"use client";

import { Fragment, useEffect, useId, useState } from "react";
import { PLANS, COMPARISON, numeralFor } from "@/lib/constants";
import Accordion from "@/components/ui/Accordion";
import TierCard from "@/components/orders/TierCard";
import { TIERS } from "@/lib/tiers";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { papyrusTexture } from "@/lib/stoneTexture";
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

const LATIN_SUBTITLE: Record<string, string> = {
  citizen: "CIVIS",
  senator: "SENATOR",
  emperor: "IMPERATOR",
};

/* Comparison rows feed cards and table from one source (no duplicated copy). */
const TABLE = COMPARISON;

/* Presentational grouping of the capability rows (still one data source). */
const GROUPS: readonly (readonly [string, readonly string[]])[] = [
  ["FVNDAMENTVM — the floor", ["Data sources", "Refresh cadence"]],
  ["SIGNA — what it tells you", ["Metric lineage", "Anomaly alerts"]],
  ["IVRA IMPERII — enterprise law", ["SSO / SCIM", "Data residency"]],
];

/* A cell value: "—" renders as a muted pixel dash, everything else as text
   with a small gold diamond, so absence reads as absence at a glance. */
function CellValue({ value }: { value: string }) {
  if (value === "—") {
    return (
      <span className="inline-flex flex-col items-center gap-1" aria-label="not included">
        <span aria-hidden="true" className="flex gap-0.5">
          <span className="h-0.5 w-3 bg-ink/30" />
        </span>
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="text-terra-deep text-[10px]">
        ✦
      </span>
      {value}
    </span>
  );
}

/* Procedural papyrus underlay: the canvas texture (fibres, seams, stains,
   burnt rim) stretched over the CSS parchment paint. Client-only paint,
   so SSR and the first frame are unchanged. */
function PapyrusLayer() {
  const [tex, setTex] = useState("");
  useEffect(() => {
    setTex(papyrusTexture());
  }, []);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-50 mix-blend-multiply"
      style={tex ? { backgroundImage: `url(${tex})` } : undefined}
    />
  );
}

/* A roller rod: dark lacquered wood bar overhanging the sheet, with
   turned end-knobs. Decorative. While the sheet is still rolled the rod
   is slightly fatter and lower; it slims as the sheet unrolls. */
function RollerRod({ rolled }: { rolled: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative z-10 mx-6 xl:mx-10 transition-all duration-[1400ms] ease-out motion-reduce:transition-none",
        rolled ? "h-7 opacity-100" : "h-4 opacity-80",
      )}
    >
      <span
        className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full border border-stone/30 bg-gradient-to-b from-charcoal via-ink to-charcoal shadow-raised transition-all duration-[1400ms] ease-out motion-reduce:transition-none",
          rolled ? "h-6" : "h-4",
        )}
      />
      <span
        className={cn(
          "absolute -left-2.5 top-1/2 -translate-y-1/2 rounded-full border border-stone/30 bg-gradient-to-b from-charcoal via-ink to-charcoal shadow-raised transition-all duration-[1400ms] ease-out motion-reduce:transition-none",
          rolled ? "h-8 w-8" : "h-6 w-6",
        )}
      />
      <span
        className={cn(
          "absolute -right-2.5 top-1/2 -translate-y-1/2 rounded-full border border-stone/30 bg-gradient-to-b from-charcoal via-ink to-charcoal shadow-raised transition-all duration-[1400ms] ease-out motion-reduce:transition-none",
          rolled ? "h-8 w-8" : "h-6 w-6",
        )}
      />
    </div>
  );
}

/* The volumen: parchment sheet between two rods. The sheet unrolls
   top-to-bottom (clip-path reveal) the first time it scrolls into view;
   prefers-reduced-motion shows it flat. The parchment paint lives on an
   underlayer (.parchment-edge) so the deckle-edge turbulence distorts
   the sheet — not the table text painted on top of it. */
function ScrollSheet({ children }: { children: React.ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const reduced = useReducedMotion();
  const unrolled = inView || reduced;
  return (
    <div ref={ref} data-unrolled={unrolled ? "true" : "false"}>
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <filter id="parchment-edge" x="-5%" y="-3%" width="110%" height="106%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018 0.09"
              numOctaves="5"
              seed="7"
              result="grain"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="grain"
              scale="9"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <RollerRod rolled={unrolled} />
      <div
        className="relative transition-[clip-path] duration-[1400ms] ease-out motion-reduce:transition-none"
        style={{ clipPath: unrolled ? "inset(0 0 0% 0)" : "inset(0 0 99% 0)" }}
      >
        <div
          aria-hidden="true"
          className="parchment-bg parchment-edge shadow-raised absolute -inset-y-1 inset-x-0"
        />
        <PapyrusLayer />
        <div className="relative">{children}</div>
      </div>
      <RollerRod rolled={unrolled} />
    </div>
  );
}

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

        {/* TABVLA COMPARATIONIS — an imperial edict on a parchment volumen:
            the sheet hangs between two wooden roller rods and unrolls
            (clip-path reveal) as it scrolls into view. data-theme="light"
            flips the semantic tokens so ink/sepia replace the dark golds.
            border-separate (not collapse): Chromium paints collapsed
            borders of a sticky thead in the wrong place, which showed
            as an empty floating band. Groups are presentational; the
            rows still come only from COMPARISON. */}
        <div className="mt-16 hidden md:block" data-theme="light">
          <ScrollSheet>
              {/* title cartouche */}
              <div className="flex items-center gap-4 border-b border-ink/20 px-8 py-5 text-ink">
                <div aria-hidden="true" className="meander-strip flex-1 opacity-30" />
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-terra-deep whitespace-nowrap">
                  Tabula Comparationis
                </p>
                <div aria-hidden="true" className="meander-strip flex-1 opacity-30" />
              </div>

              <table className="w-full text-sm border-separate [border-spacing:0]">
                <caption className="sr-only">
                  Feature comparison across the Citizen, Senator and Emperor plans
                </caption>
                <thead className="sticky top-16 z-10">
                  <tr>
                    <th
                      scope="col"
                      className="bg-sand text-left py-4 px-8 font-mono text-[11px] uppercase tracking-[0.25em] text-ink border-b border-ink/30"
                    >
                      Capability
                    </th>
                    {PLANS.map((p) => (
                      <th
                        key={p.id}
                        scope="col"
                        className={cn(
                          "bg-sand py-4 px-5 text-center border-b border-ink/30",
                          p.featured ? "border-x border-terra-deep/40" : ""
                        )}
                      >
                        <span className="sr-only">{p.name}</span>
                        <span aria-hidden="true" className="flex flex-col items-center gap-1.5">
                          <span className="font-display text-xl text-ink">{p.name}</span>
                          <span className="font-mono text-[9px] tracking-[0.3em] text-terra-deep">
                            {LATIN_SUBTITLE[p.id]}
                          </span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    /* ink-in stagger: each body row starts writing as the
                       unrolling edge reaches it (~120ms apart) */
                    let ink = 0;
                    return GROUPS.map(([group, caps]) => (
                      <Fragment key={group}>
                        {/* group subheader row */}
                        <tr>
                          <th
                            scope="colgroup"
                            colSpan={4}
                            className="pt-6 pb-2 px-8 text-left font-mono text-[10px] uppercase tracking-[0.3em] text-terra-deep"
                          >
                            {group}
                          </th>
                        </tr>
                        {TABLE.filter((r) => caps.includes(r.capability)).map((row) => (
                          <tr
                            key={row.capability}
                            className="ink-row group transition-colors hover:bg-oxidized/10"
                            style={{ "--ink-i": `${(ink++ * 120).toString()}ms` } as React.CSSProperties}
                          >
                            <th
                              scope="row"
                              className="text-left py-3.5 px-8 font-sans text-ink group-hover:text-terra-deep border-b border-ink/20 transition-colors"
                            >
                              {row.capability}
                            </th>
                            {(["citizen", "senator", "emperor"] as const).map((tier) => (
                              <td
                                key={tier}
                                className={cn(
                                  "py-3.5 px-5 text-center text-ink border-b border-ink/20",
                                  tier === "senator" &&
                                    "bg-oxidized/10 border-x border-terra-deep/40 group-hover:bg-oxidized/15 transition-colors"
                                )}
                              >
                                <CellValue value={row[tier]} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    ));
                  })()}
                </tbody>
              </table>
          </ScrollSheet>
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
