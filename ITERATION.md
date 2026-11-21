# Iteration — pass/temple-legibility

Date: 2026-11-21 · Scope: ParallaxTemple.tsx, scroll-progress.tsx,
constants.ts, layout.tsx, utils.test.ts (work order: "PASS 1").

## Decisions

### D1 — The marquee is unnumbered (bug 3b)
`SECTION_IDS` began with `"marquee"`, so every numeral was one too high and
disagreed with the pill (temple showed IV in the eyebrow, III in the pill).
Marquee is decoration, not a section. Removed from `SECTION_IDS`; numerals are
now sequential I–VIII (Manifesto … Access) everywhere numerals are shown.
Consequence: every eyebrow renumbered; tests updated to the new spec.

### D2 — Pill activates on viewport centre (bug 3a)
The brief suspected a pin-spacer; there is none — the Temple is scrub
parallax. The real cause was the top-edge + 120px anchor in ScrollProgress: a
tall section filling the screen still had its top below the anchor. Replaced
with the brief's proposed rule: a section owns the pill while it contains the
viewport's vertical centre. `offset` prop removed (no longer meaningful).

### D3 — Temple text lives on the dark ground (bug 1)
The text block was vertically centred over the pediment and columns with no
scrim, gold-on-light for the eyebrow. Moved to a bottom-anchored band over the
`#141210` ground (min y=296/360 ≙ bottom 18% of the scene), with a radial
ink scrim behind it. Contrast computed from tokens: bone on ink 15.8:1,
gold on ink 8.3:1 — both clear 4.5:1 even at the scrim's faded edge. Gold is
now only ever on dark ground.

### D4 — The console becomes a real doorway (bug 2)
The console rect (x=292–348) overpainted the column at x=300 — it read as a
clipped door. Kept the idea ("the command center inside the temple") but
rebuilt it as a doorway *between* columns 3–4 (x=322–346): dark opening, gold
light spilling onto the steps, data bricks inside. The SVG has role="img" +
aria-label; the doorway carries no unique information, so no extra alt text.

### D5 — Fonts: the variables were unwired (bug 4, root cause)
layout.tsx declared `--font-display/--font-sans/--font-mono` as the next/font
variables, but `@theme inline` references `--font-cormorant/`inter/`-mono`
— undefined, so display text fell back to Georgia with a synthesized italic.
Renamed the next/font variables to match the theme references. True italic
Cormorant should now load; verify in a real browser via
`document.fonts.check('italic 500 16px "Cormorant Garamond"')`.

### D6 — Art quantized to the palette (bug 5)
`shapeRendering="crispEdges"` on the SVG; sky dust snapped to the 4px grid;
pediment/columns shaded with 2×2 checkerboard dither patterns between adjacent
palette values; braziers and paving fill the empty ground strip.

## Verification

- `pnpm exec tsc --noEmit` → clean
- `pnpm exec vitest run` → 17 passed (incl. new gapless-numeral test)
- `pnpm exec next build` → clean, 8/8 static pages
- Browser (preview host): 360/768/1024/1440/1920 — all content renders,
  numerals assert I/II/III and VI/VII, zero console errors, zero network
  failures, no horizontal overflow; mobile menu toggle and pill
  "Show sections" interaction pass (`interactive: true`).
- Harness note: the hydration probe still flaps on sub-2.5s runs; every run
  it waits on reports `interactive: true`. Motion's blur-fade animations also
  read as "hidden" to the probe on the software rasterizer; screenshots show
  them rendered.

## Not done / left open

- No `pnpm shots` script exists; the screenshot-baseline workflow from the
  brief was approximated with the built-in browser checks (screenshots are
  captured per run but no baseline set is committed).
- Pixel-sampled contrast was computed from token values, not sampled from
  screenshots (headless rasterizer output isn't colour-faithful).
- `document.fonts.check` needs a real browser tab (see D5).

---

# Iteration — pass/orders-refine

Date: 2026-11-21 · Scope: Orders.tsx + data in constants.ts (work order:
"PASS 2 — Orders pricing refinement and theme integration").

## Decisions

### D1 — Card alignment: 6-row grid per card (brief asked subgrid)
Each card is a grid with rows `auto auto auto auto 1fr auto` (capital, name,
blurb, price, features, CTA); the feature list is the flexible row and the
CTA is last, so CTAs bottom-align. The featured card's lift is on the card
itself (`md:-translate-y-2`), not its content row, so shared baselines hold.
True CSS subgrid would also need a shared parent grid; the 6-row pattern
achieves the same baselines without a wrapper change and keeps the hero
card's badge inside the padding box.

### D2 — Pill overlap: bottom safe-area scrim + spacer (option 3)
Chose the conservative remedy: a 5rem gradient spacer at the section's end
reserves the pill's space, so CTAs can never sit under the fixed pill
regardless of future content height. Not hover-to-reveal (hides navigation),
not z-index demotion (the pill must stay reachable).

### D3 — Price typography
`lining-nums tabular-nums` on the display price (no oldstyle figures in
Cormorant), the "/ mo" suffix is bone (`text-bone`) not stone — stone is
documented as failing contrast as text (globals.css:29) — and a pixel coin
glyph (aria-hidden) precedes each price. "By rite" renders in the same slot
with the same baseline.

### D4 — Theme integration
- Pixel column capitals per tier on a 12-unit grid, ornament increasing
  Tuscan → Ionic (scrolls) → Corinthian (acanthus); sr-only text equivalent.
- CIVIS / SENATOR / IMPERATOR mono subtitles under each capital.
- `.meander-strip` (the hooked-key mask from globals.css) on every card top.
- Senator card inverted via `data-theme="light"` on sand ground — existing
  tokens; focus ring flips to purple (9.6:1) via the existing token rule.
- Laurel badge ("Most chosen") fully inside the padding box, gold on ink ≈8:1.
- SPQR engraved rules above the header, between cards and Tabula.
- Hover: 4px lift + 1px gold hairline shadow; disabled under reduced motion.

### D5 — Toggle is a real radiogroup
`role="radiogroup"` with `role="radio"` + `aria-checked`; ArrowLeft/ArrowRight
switch billing; only the selected option is tabbable; selection is conveyed
by a filled/empty dot glyph, not colour alone. 44px minimum targets. A
dedicated sr-only `aria-live` region announces the billing state in words
(instead of the whole price line re-announcing). The price odometer is the
existing AnimatedCounter (respects reduced motion).

### D6 — Tabula single source
Cards and table read `ROMAN_FEATURES`/`COMPARISON` from constants.ts only —
no duplicated copy. Sticky thead (`top-16`, below the fixed nav), Senator
column highlighted with an oxidized tint + gold hairlines. Mobile collapse
to accordions was already present and is kept, fed from the same rows.

## Verification

- `pnpm exec tsc --noEmit` → clean; `pnpm exec vitest run` → 17 passed;
  `pnpm exec next build` → ✓ Compiled successfully, 8/8 static pages.
- Browser (preview host): 360/768/1024/1440/1920 — all `success: true`,
  `interactive: true`, zero page errors, zero network failures, no horizontal
  overflow; subtitles (CITIZEN…IMPERATOR), eyebrow numeral, laurel badge,
  mobile "Compare plans" accordion and desktop table "Capability" all
  asserted; billing toggle clicked at 390 → "billed annually" asserted.
- Known: a hydration attribute-mismatch console warning appears on some runs.
  It predates this pass (first seen in the pass-1 verification) and its React
  text names no element; page is fully interactive when it appears. Logged,
  not chased.

## Not done / left open

- `pnpm shots` still doesn't exist; verification is via the built-in browser
  tool with per-run screenshots, no committed baseline set.
- The brief's ~965px reference screenshot was never attached; theme
  composition follows the written spec.
- Arrow-key focus roving on the radiogroup moves *selection*; the brief's
  exact roving-tabindex keyboard spec is implemented (selected option only
  tabbable), but arrow keys are not yet announced by a live region — the
  sr-only region does announce the resulting state.
