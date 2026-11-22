"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import { PLANS, COMPARISON, numeralFor } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import Accordion from "@/components/ui/Accordion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import TierCanvas from "@/components/webgl/TierCanvas";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/* Cards place their six blocks on a shared 6-row grid
   (capital / name / blurb / price / features / cta) so every tier's rows
   stay on identical baselines — the brief's 1px alignment criterion. */

/* Column capitals at 3px pixel resolution (96×30 grid), fills from
   currentColor / --accent / stone so they invert with the card theme.
   Ornament increases with tier: Tuscan (plain, sturdy) < Ionic (volutes)
   < Corinthian (two ranks of acanthus). Decorative only. */
function Capital({ tier }: { tier: "citizen" | "senator" | "emperor" }) {
  const P = 3; // pixel unit
  let seq = 0;
  const px = (x: number, y: number, w: number, h: number, fill: string, o?: number) => (
    <rect key={`p${seq++}`} x={x * P} y={y * P} width={w * P} height={h * P} fill={fill} opacity={o} />
  );
  const INK = "var(--color-stone)";
  const BODY = "currentColor";
  const GOLD = "var(--accent)";
  const DEEP = "var(--color-terra-deep)";

  return (
    <svg
      viewBox="0 0 96 30"
      className="mx-auto block h-8 w-24 text-(--on-surface)"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* ─ abacus + echinus (shared) ─ */}
      {px(4, 0, 24, 2, INK)}
      {px(6, 2, 20, 2, BODY, 0.9)}
      {tier !== "citizen" && px(6, 2, 20, 1, GOLD)}

      {tier === "citizen" && (
        <>
          {/* Tuscan: plain cushion, soft taper, four flutes */}
          {px(8, 4, 16, 3, BODY)}
          {px(10, 7, 12, 2, BODY, 0.8)}
          {px(12, 9, 8, 5, BODY)}
          {px(14, 9, 1, 5, INK, 0.55)}
          {px(17, 9, 1, 5, INK, 0.55)}
          {px(20, 9, 1, 5, INK, 0.55)}
          {px(23, 9, 1, 5, INK, 0.55)}
        </>
      )}

      {tier === "senator" && (
        <>
          {/* Ionic: egg-and-dart channel between two volutes */}
          {px(9, 4, 10, 2, BODY)}
          {px(12, 6, 4, 3, BODY, 0.85)}
          {[11, 13, 15].map((x) => px(x, 6, 1, 2, GOLD))}
          {/* volute left: concentric pixel spiral */}
          {([[4, 6, 5, 5], [5, 7, 3, 3], [6, 8, 1, 1]] as const).map(([x, y, w, h], i) =>
            px(x, y, w, h, i === 2 ? GOLD : BODY, i === 2 ? 1 : 0.85)
          )}
          {/* volute right (mirrored) */}
          {([[19, 6, 5, 5], [20, 7, 3, 3], [23, 8, 1, 1]] as const).map(([x, y, w, h], i) =>
            px(x, y, w, h, i === 2 ? GOLD : BODY, i === 2 ? 1 : 0.85)
          )}
          {/* fluted shaft stub */}
          {px(12, 9, 8, 5, BODY)}
          {px(14, 9, 1, 5, INK, 0.55)}
          {px(17, 9, 1, 5, INK, 0.55)}
        </>
      )}

      {tier === "emperor" && (
        <>
          {/* Corinthian: two ranks of acanthus + corner volutes + fleuron */}
          {px(10, 4, 12, 2, BODY)}
          {px(11, 6, 10, 2, BODY, 0.8)}
          {/* upper rank (4 leaves, offset) */}
          {[13, 16, 19, 22].map((x) => (
            <g key={`u${x}`}>
              {px(x, 8, 2, 2, GOLD)}
              {px(x, 10, 1, 1, DEEP)}
            </g>
          ))}
          {/* lower rank (5 leaves, wider) */}
          {[12, 15, 18, 21, 24].map((x) => (
            <g key={`l${x}`}>
              {px(x - 1, 11, 3, 2, GOLD)}
              {px(x, 13, 1, 2, DEEP)}
            </g>
          ))}
          {/* corner volutes */}
          {px(9, 9, 2, 2, BODY, 0.9)}
          {px(25, 9, 2, 2, BODY, 0.9)}
          {/* fleuron */}
          {px(19, 5, 2, 1, GOLD)}
          {/* fluted shaft stub */}
          {px(14, 15, 8, 4, BODY)}
          {px(16, 15, 1, 4, INK, 0.55)}
          {px(19, 15, 1, 4, INK, 0.55)}
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

/* One tier card: DOM content plus (on WebGL2 devices) the liquid-marble
   reveal canvas. State per card: hovered (pointer), focused (keyboard),
   tapped (touch). The DOM text is the accessible, selectable, SEO-visible
   truth; the canvas paints over it only while the flood covers the card. */
function RevealCard({
  plan,
  hero,
  price,
  annual,
}: {
  plan: (typeof PLANS)[number];
  hero: boolean;
  price: number | null;
  annual: boolean;
}) {
  const [state, setState] = useState<"idle" | "active">("idle");
  const [webgl2, setWebgl2] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const sourceRef = useRef<"pointer" | "focus" | "tap">("pointer");
  void sourceRef;

  // probe WebGL2 once
  useEffect(() => {
    const probe = document.createElement("canvas").getContext("webgl2");
    setWebgl2(probe !== null);
    probe?.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);

  const setOriginFromEvent = (e: React.PointerEvent | React.FocusEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if ("clientX" in e && typeof e.clientX === "number" && e.clientX >= 0) {
      const pe = e as React.PointerEvent;
      if (pe.pointerType === "touch") sourceRef.current = "tap";
      else sourceRef.current = "pointer";
      originRef.current = {
        x: (pe.clientX - r.left) / r.width,
        y: (pe.clientY - r.top) / r.height,
      };
    } else {
      sourceRef.current = "focus";
      originRef.current = { x: 0.5, y: 0.85 };
    }
  };

  const active = state === "active";
  return (
    <div
      ref={cardRef}
      tabIndex={0}
      data-theme={hero ? "light" : undefined}
      aria-label={`${plan.name} plan: ${plan.blurb}`}
      onPointerEnter={(e) => {
        setOriginFromEvent(e);
        setState("active");
      }}
      onPointerLeave={() => {
        if (sourceRef.current === "tap") return; // touch: ignore leave
        setState("idle");
      }}
      onFocus={(e) => {
        setOriginFromEvent(e);
        setState("active");
      }}
      onBlur={() => setState("idle")}
      onClick={(e) => {
        // touch tap: origin from tap, reveal until blur
        const el = cardRef.current;
        if (!el || e.clientX === 0) return;
        const r = el.getBoundingClientRect();
        sourceRef.current = "tap";
        originRef.current = {
          x: (e.clientX - r.left) / r.width,
          y: (e.clientY - r.top) / r.height,
        };
        setState("active");
      }}
      className={cn(
        "group relative grid grid-rows-[auto_auto_auto_auto_1fr_auto] grid-cols-1 rounded-sm p-8 pb-10 outline-none transition-transform duration-300",
        "hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--color-gold)]",
        "focus-visible:-translate-y-1 focus-visible:shadow-[0_0_0_1px_var(--color-gold)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2",
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
      {/* rotating conic gold border on the hero card; static hairline under
          reduced motion (see globals.css @property --angle) */}
      {hero && <span aria-hidden="true" className="conic-border" />}

      {/* liquid-marble reveal (skipped entirely without WebGL2 / reduced
          motion — the DOM card below is the fallback and the truth) */}
      {webgl2 && (
        <TierCanvas
          tier={plan.id as "citizen" | "senator" | "emperor"}
          active={active}
          originRef={originRef}
        />
      )}

      {/* pixel-art column capital + latin subtitle + meander */}
      <div className="sr-only">{CAPITAL_ALT[plan.id]}</div>
      <div className="pt-1">
        <Capital tier={plan.id as "citizen" | "senator" | "emperor"} />
        <p data-gl-line className="mt-2 text-center font-mono text-[11px] tracking-[0.3em] text-(--on-surface-muted)">
          {LATIN_SUBTITLE[plan.id]}
        </p>
        <div aria-hidden="true" className="meander-strip mt-3 opacity-30" />
      </div>

      <h3 data-gl-line className="mt-4 text-center font-display text-3xl text-(--on-surface)">
        {plan.name}
      </h3>
      <p data-gl-line className="mt-2 min-h-[2.5em] text-center text-sm text-(--on-surface-muted)">
        {plan.blurb}
      </p>
      <p
        className="mt-6 text-center font-display text-5xl text-(--on-surface) [font-variant-numeric:lining-nums_tabular-nums]"
      >
        <Coin />
        {price !== null ? (
          <>
            <span data-gl-line className="tabular-nums">
              <AnimatedCounter
                value={price}
                prefix="$"
                className="tabular-nums"
                duration={0.3}
              />
            </span>
            <span data-gl-line className="text-base font-sans text-(--on-surface)"> / mo</span>
            {annual && (
              <span data-gl-line className="mt-1 block font-sans text-xs text-(--on-surface-muted)">
                billed annually
              </span>
            )}
          </>
        ) : (
          <span data-gl-line className="italic">By rite</span>
        )}
      </p>

      <ul className="mt-6 space-y-3 flex-1">
        {(ROMAN_FEATURES[plan.id] ?? []).map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-(--on-surface-muted)">
            <span className="mt-0.5 text-(--accent)" aria-hidden="true">
              ✦
            </span>
            <span data-gl-line>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          data-gl-line
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
}

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

/* A roller rod: dark lacquered wood bar overhanging the sheet, with
   turned end-knobs. Decorative. */
function RollerRod() {
  return (
    <div aria-hidden="true" className="relative z-10 mx-6 h-6 xl:mx-10">
      <span className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 rounded-full border border-stone/30 bg-gradient-to-b from-charcoal via-ink to-charcoal shadow-raised" />
      <span className="absolute -left-2.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-stone/30 bg-gradient-to-b from-charcoal via-ink to-charcoal shadow-raised" />
      <span className="absolute -right-2.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-stone/30 bg-gradient-to-b from-charcoal via-ink to-charcoal shadow-raised" />
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
    <div ref={ref}>
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
      <RollerRod />
      <div
        className="relative transition-[clip-path] duration-[1400ms] ease-out motion-reduce:transition-none"
        style={{ clipPath: unrolled ? "inset(0 0 0% 0)" : "inset(0 0 99% 0)" }}
      >
        <div
          aria-hidden="true"
          className="parchment-bg parchment-edge shadow-raised absolute -inset-y-1 inset-x-0"
        />
        <div className="relative">{children}</div>
      </div>
      <RollerRod />
    </div>
  );
}

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
            itself, not its row — content stays on the shared baselines.
            On WebGL2 devices each card carries a TierCanvas that floods the
            card with liquid marble from the pointer entry point on
            hover/focus/tap; without WebGL2 or with reduced motion the plain
            DOM card with the CSS theme swap is the fallback (no canvas). */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch md:[grid-template-rows:1fr]">
          {PLANS.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            const hero = plan.featured === true;
            return (
              <RevealCard
                key={plan.id}
                plan={plan}
                hero={hero}
                price={price}
                annual={annual}
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
                  {GROUPS.map(([group, caps]) => (
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
                          className="group transition-colors hover:bg-oxidized/10"
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
                  ))}
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
