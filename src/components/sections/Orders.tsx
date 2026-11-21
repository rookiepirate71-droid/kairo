"use client";

import { useId, useState } from "react";
import { PLANS, COMPARISON, numeralFor } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import Accordion from "@/components/ui/Accordion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/utils";

/* Cards place their six blocks on a shared 6-row grid
   (capital / name / blurb / price / features / cta) so every tier's rows
   stay on identical baselines — the brief's 1px alignment criterion. */

/* Column capitals, drawn on a fixed 12-unit grid. Fills come from
   currentColor / --accent / stone so they invert with the card theme
   (bone-on-dark cards, ink-on-sand hero card). Ornament increases with
   tier: Tuscan (plain) < Ionic (scrolls) < Corinthian (acanthus). */
function Capital({ tier }: { tier: "citizen" | "senator" | "emperor" }) {
  return (
    <svg
      viewBox="0 0 72 20"
      className="mx-auto block h-5 w-[72px] text-(--on-surface)"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* abacus (top slab) */}
      <rect x="4" y="0" width="64" height="4" fill="var(--color-stone)" />
      {/* echinus */}
      <rect x="8" y="4" width="56" height="6" fill="currentColor" opacity="0.55" />
      {tier !== "citizen" && <rect x="8" y="4" width="56" height="2" fill="var(--accent)" />}
      {/* necking */}
      <rect x="16" y="10" width="40" height="10" fill="currentColor" />
      <rect x="16" y="10" width="40" height="2" fill="var(--color-stone)" />
      {tier === "senator" && (
        <>
          <rect x="6" y="10" width="10" height="10" fill="currentColor" opacity="0.7" />
          <rect x="56" y="10" width="10" height="10" fill="currentColor" opacity="0.7" />
          <rect x="10" y="12" width="6" height="2" fill="var(--accent)" />
          <rect x="56" y="12" width="6" height="2" fill="var(--accent)" />
        </>
      )}
      {tier === "emperor" && (
        <>
          {/* acanthus leaves */}
          {[-2, 0, 2, 4, 6, 8].map((o) => (
            <rect key={`l${o}`} x={18 + o * 6} y="14" width="4" height="6" fill="var(--accent)" />
          ))}
          <rect x="12" y="10" width="48" height="2" fill="var(--color-terra-deep)" />
        </>
      )}
    </svg>
  );
}

/* Pixel laurel crown badge — gold ground, ink text (≈8:1), fully inside
   the card's padding box. */
function LaurelBadge() {
  return (
    <span className="inline-flex items-center gap-2 bg-gold px-3 py-1.5 rounded-sm">
      <svg viewBox="0 0 20 14" className="h-3.5 w-5" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M4 2h2v2H4zM2 5h2v2H2zM2 8h2v2H2zM4 11h2v2H4zM14 2h2v2h-2zM16 5h2v2h-2zM16 8h2v2h-2zM14 11h2v2h-2z" fill="#0d0c0a" />
        <rect x="8" y="4" width="4" height="7" fill="#0d0c0a" />
      </svg>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
        Most chosen
      </span>
    </span>
  );
}

/* Coin glyph beside prices — 1:1 pixel disc that follows the text colour,
   so it stays visible on both dark and sand cards. */
function Coin() {
  return (
    <svg viewBox="0 0 12 12" className="mr-2 inline-block h-4 w-4 align-baseline text-(--accent)" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="0" width="8" height="12" fill="currentColor" />
      <rect x="0" y="2" width="12" height="8" fill="currentColor" />
      <rect x="2" y="2" width="8" height="8" fill="var(--color-sand)" />
      <rect x="4" y="4" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

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

/* Column capital motif per tier, for the sr-only equivalent. */
const CAPITAL_ALT: Record<string, string> = {
  citizen: "Tuscan column capital (plain)",
  senator: "Ionic column capital (scrolls)",
  emperor: "Corinthian column capital (acanthus)",
};

/* Feature list per plan — dry Roman voice, facts literal. */
const ROMAN_FEATURES: Record<string, string[]> = {
  citizen: [
    "5 seats included",
    "20 data sources",
    "Daily metric refresh",
    "Community auguries (support)",
  ],
  senator: [
    "25 seats included",
    "Unlimited sources",
    "Streaming refresh + alerts",
    "Lineage on every metric",
    "Dedicated augur (support)",
  ],
  emperor: [
    "Unlimited seats",
    "Regional data residency",
    "SSO / SCIM provisioning",
    "Bespoke data rites",
    "Custom onboarding program",
    "SLA with sacrifice clause",
  ],
};

/* Comparison rows feed cards and table from one source (no duplicated copy). */
const TABLE = COMPARISON;

export default function Orders() {
  const [annual, setAnnual] = useState(false);
  const liveId = useId();

  return (
    <section id="orders" className="bg-ink py-28 md:py-36">
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

        {/* Cards: one grid, rows pinned by index. The lifted card translates
            itself, not its row — content stays on the shared baselines. */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch md:[grid-template-rows:1fr]">
          {PLANS.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            const hero = plan.featured;
            return (
              <div
                key={plan.id}
                data-theme={hero ? "light" : undefined}
                className={cn(
                  "relative grid grid-rows-[auto_auto_auto_auto_1fr_auto] grid-cols-1 rounded-sm p-8 pb-10 transition-transform duration-300",
                  "hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--color-gold)]",
                  "focus-within:-translate-y-1 focus-within:shadow-[0_0_0_1px_var(--color-gold)]",
                  hero
                    ? "bg-sand text-ink shadow-raised md:-translate-y-2 md:hover:-translate-y-3"
                    : "border border-stone/40 bg-charcoal/60"
                )}
                style={
                  hero
                    ? ({
                        "--focus-ring": "var(--color-purple)",
                      } as React.CSSProperties)
                    : undefined
                }
              >
                {/* rotating conic gold border on the hero card; static hairline
                    under reduced motion (see globals.css @property --angle) */}
                {hero && <span aria-hidden="true" className="conic-border" />}

                {/* pixel-art column capital + latin subtitle + meander */}
                <div className="sr-only">{CAPITAL_ALT[plan.id]}</div>
                <div className="pt-1">
                  <Capital tier={plan.id as "citizen" | "senator" | "emperor"} />
                  <p className="mt-2 text-center font-mono text-[11px] tracking-[0.3em] text-(--on-surface-muted)">
                    {LATIN_SUBTITLE[plan.id]}
                  </p>
                  <div aria-hidden="true" className="meander-strip mt-3 opacity-30" />
                </div>

                <h3 className="mt-4 text-center font-display text-3xl text-(--on-surface)">
                  {plan.name}
                </h3>
                <p className="mt-2 min-h-[2.5em] text-center text-sm text-(--on-surface-muted)">
                  {plan.blurb}
                </p>
                <p
                  className="mt-6 text-center font-display text-5xl text-(--on-surface) [font-variant-numeric:lining-nums_tabular-nums]"
                >
                  <Coin />
                  {price !== null ? (
                    <>
                      <AnimatedCounter
                        value={price}
                        prefix="$"
                        className="tabular-nums"
                        duration={0.3}
                      />
                      <span className="text-base font-sans text-(--on-surface)"> / mo</span>
                      {annual && (
                        <span className="mt-1 block font-sans text-xs text-(--on-surface-muted)">
                          billed annually
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="italic">By rite</span>
                  )}
                </p>

                <ul className="mt-6 space-y-3 flex-1">
                  {(ROMAN_FEATURES[plan.id] ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-(--on-surface-muted)">
                      <span className="mt-0.5 text-(--accent)" aria-hidden="true">
                        ✦
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    variant={hero ? "primary" : "secondary"}
                    className={cn(
                      "w-full min-h-[48px] rounded-full",
                      "transition-transform duration-200",
                      "hover:scale-[1.03] motion-reduce:transform-none"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </div>

                {hero && (
                  <div className="mt-4 flex justify-center">
                    <LaurelBadge />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SPQR rule below the cards, before the Tabula */}
        <div className="mt-16 max-w-2xl mx-auto">
          <SpqrRule />
        </div>

        {/* Tabula comparison: table on desktop, accordions below 768px,
            both fed from the same COMPARISON rows. */}
        <div className="mt-12 hidden md:block overflow-x-auto">
          <table className="w-full text-sm border border-stone/40 border-collapse">
            <caption className="sr-only">
              Feature comparison across the Citizen, Senator and Emperor plans
            </caption>
            <thead className="sticky top-16 z-10">
              <tr className="bg-charcoal border-b border-stone/40">
                <th
                  scope="col"
                  className="text-left py-4 px-5 font-mono text-[11px] uppercase tracking-[0.2em] text-travertine"
                >
                  Capability
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    scope="col"
                    className={cn(
                      "py-4 px-5 font-display text-xl text-bone text-center",
                      p.featured && "bg-charcoal/80 border-x border-gold/40"
                    )}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE.map((row) => (
                <tr key={row.capability} className="border-b border-stone/25">
                  <th scope="row" className="text-left py-3.5 px-5 font-sans text-travertine">
                    {row.capability}
                  </th>
                  <td className="py-3.5 px-5 text-center text-bone">{row.citizen}</td>
                  <td className="py-3.5 px-5 text-center text-bone bg-oxidized/10">
                    {row.senator}
                  </td>
                  <td className="py-3.5 px-5 text-center text-bone">{row.emperor}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
