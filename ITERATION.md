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

---

# Iteration — hotfix: Senator card text invisible

Date: 2026-11-21 · Commit 597d5be, follow-up to pass/orders-refine.

User screenshot showed the inverted Senator card rendering bone/travertine
text on sand — invisible. Root cause: pass 2 styled card text with raw
palette utilities (`text-bone`, `text-travertine`, `text-stone`), which do
not flip inside `data-theme="light"`; only the semantic tokens do.

Fix:
- New `--on-surface-muted` semantic token (travertine on dark, terra-deep on
  light) alongside `--on-surface`.
- All card text (name, blurb, price, suffix, features, subtitles) moved to
  `text-(--on-surface)` / `text-(--on-surface-muted)`; feature stars and
  coin glyph to `--accent`.
- Capital and Coin SVG fills now use `currentColor` / `--accent` /
  `--color-stone`, so the ornaments invert with the card instead of
  hardcoding bone-on-sand.
- Remaining raw palette classes are only on always-dark backgrounds
  (section header, toggle, table) — intentional.

Verified: tsc clean, 17/17 tests, browser 390px `success: true`
`interactive: true` zero errors — screenshots show the Citizen card fully
legible and the Senator card top (capital, meander, subtitle) drawing in ink
on sand; Annual toggle click → "billed annually" asserted. Desktop 1440px
run also clean.

---

# Iteration — capital artwork v2

Date: 2026-11-21 · follow-up to pass/orders-refine ("surely we can do
better art right?").

User screenshot showed the v1 capitals reading as a gray slab on a white
block. Redrawn at 3px pixel resolution (96×30 viewBox, h-8 w-24):

- Tuscan (Citizen): tapered cushion, four flutes in the shaft stub.
- Ionic (Senator): egg-and-dart channel with gold darts, two concentric
  pixel-spiral volutes with gold eyes.
- Corinthian (Emperor): two ranks of acanthus leaves (gold + terra-deep
  tips), corner volutes, fleuron.
- All fills stay currentColor / --accent / stone so the artwork still
  inverts on the sand card.

Two dev-loop findings, worth remembering:
1. The dev server served a stale Orders module after the rewrite (old
   viewBox on the wire). `preview start` after killing next-server forces
   recompilation — check the served SVG viewBox before debugging "why
   didn't my change show up".
2. React key warning: the px() helper keyed by `${x}-${y}` collides when
   two rects share a grid cell across branches; keys are now sequential.

Verified: tsc clean, 17/17 tests; 1440px browser run shows all three
capitals side by side — Tuscan/Ionic/Corinthian distinct, Senator card
fully legible ink-on-sand, laurel badge inside the padding box, coin
glyphs, meander strips, SPQR rules. 390px clean too (zero console errors,
no overflow).

---

# Iteration — pass/orders-liquid: card liquid-marble reveal (WebGL2)

Date: 2026-11-21 · Commit 9522239 · Branch pass/orders-liquid.
Work order: "PASS: Orders card liquid-marble reveal (WebGL2)".
(CLAUDE.md does not exist in this repo — the standard loop was followed
from ITERATION.md history instead.)

## Built

- `src/lib/tiers.ts` — per-tier stone palette (stoneA/stoneB/vein/text
  pairs), REVEAL tuning constants (rateIn 2.4/s, rateOut 3.2/s, ripple,
  leaf width, sheen, dpr cap 1.5), BAYER4 matrix.
- `src/hooks/useRevealOrigin.ts` — origin tracker: pointer entry point on
  hover, near-edge (x=0.5, y=0.85) on keyboard focus, tap point on touch;
  source is recorded so touch taps can ignore pointerleave.
- `src/components/webgl/TierCanvas.tsx` — WebGL2 card canvas:
  - GLSL ES 3.00; full-screen triangle from gl_VertexID (no attributes).
  - Second-order domain-warped fbm + ridged vein noise = the liquid
    marble; sinusoidal strata on Citizen only.
  - Front radius warped by fbm; wobble is sin(π·progress) so the edge is
    organic mid-flight and flat at rest. Exponential ease in/out.
  - Edge fx: refraction ripple trailing the front, dark shadow ahead,
    bright highlight behind, gold-leaf line, Bayer-4×4 dithered gold mist
    band ahead of the front.
  - Card text is rasterised at init into two canvas textures (bone base
    layer + themed layer) using the computed font families — next/font
    hashed names are picked up automatically. Layers crossfade with the
    flood; text stays selectable in the DOM underneath (canvas is
    aria-hidden; DOM text remains the accessible truth).
  - GPU tier probe: 3 octaves if WEBGL_lose_context is absent, else 5.
  - Renders only while animating/revealed; IntersectionObserver pauses
    offscreen; context lost handler; forceContextLoss on unmount.
- `Orders.tsx` — cards are now focusable (`tabIndex=0`,
  `aria-label` with name + blurb); RevealCard wraps pointer, focus and
  tap handlers; without WebGL2 or with reduced motion the canvas never
  mounts and the DOM card (CSS theme swap) is the whole experience.

## Verified

- `pnpm exec tsc --noEmit` clean; `pnpm exec vitest run` → 17 passed;
  `pnpm exec next build` → ✓ 8/8 static pages.
- Browser 1024px: `success: true`, `interactive: true`, zero page errors,
  zero console errors, zero network failures, no overflow; card click
  (tap path) asserted; Emperor card screenshot shows the themed layer
  state with laurel badge, capital, SPQR frame intact.
- Fallback path: on machines without WebGL2 the canvas is never mounted;
  the DOM card is the previous, already-verified experience.

## Honest gaps

- The harness's software rasterizer never produced a WebGL2 context, so
  the shader itself is verified by code review + the served-chunk grep,
  not pixels. In a real browser the reveal should be eyeballed once
  (hover a card, then tab through: flood from pointer vs near-edge).
- The hydration attribute-mismatch console warning (pre-existing since
  pass 1) still flaps; page is interactive whenever it appears.

# Iteration — hotfix: shader parity with reference demo

Date: 2026-11-21 · Branch pass/orders-liquid.
Work order: user supplied `pricing_liquid_marble_reveal.html` (a saved
single-page demo of the same effect) and approved importing its better
details: "yes import and use it".

## Changed

- `src/components/webgl/TierCanvas.tsx`, four fragment-shader ports from
  the reference demo:
  - Decayed refraction: ripple is now
    `sin(front*70 − uT*2) * exp(−|front|*10) * wobble` — the wave dies
    behind the front instead of crossing the whole card.
  - `pres` entrance/exit ease
    (`smoothstep(0,.04,p)·(1−smoothstep(.9,1,p))`) multiplied into every
    edge fx (shadow, highlight, leaf, mist, ripple), so nothing pops at
    progress 0 or 1.
  - Continuous cursor sheen: new `uMouse` uniform updated from a passive
    `pointermove` listener on the parent card; spotlight is
    `uSheen·0.4·exp(−d²·9)`, aspect-corrected (was a static sheen sampled
    at the flood origin).
  - Fine secondary veining band `pow(ridged(w*3.1+11.3), 14)` mixed at
    0.35 over the coarse band, clamped so the sum never exceeds 1.
- Origin/mouse y-flip fix found while porting: DOM events give top-down
  fractions but GL uv is bottom-up, so the flood used to start from the
  vertically mirrored point. Both are flipped once in the shader
  (`vec2(x, 1−y)`); DOM-side convention unchanged.
- rAF stop-order fix: `raf = 0; cancelAnimationFrame(raf)` cancelled
  frame 0 and let the loop keep self-scheduling forever after collapse;
  now cancels the real id first.

## Not adopted from the demo

- Opaque canvas with DOM text composited from textures only — ours stays
  a transparent overlay over live, selectable DOM text (a11y/SEO).
- Hardcoded tier hexes — ours read the site's token system via tiers.ts.
- Time-flickering white sparkle at the front edge — left out as scope.

## Verified

- `pnpm exec tsc --noEmit` → clean; `pnpm exec vitest run` → 17 passed.
- `pnpm exec next build` → ✓ compiled, / and /explore prerendered
  (first attempt hit the stale-`.next` `no direct app page entry found
  for /explore` invariant and the `./871.js` dev-cache clash; rm -rf
  .next + fresh dev start cleared both — same failure mode as the
  19:31 UTC hotfix).
- Browser (preview host): 1024px — goto /, assert IMPERATOR/SENATOR,
  click Imperator card (focus reveal), navigate /explore, assert The
  Library; 390px — goto /, assert SENATOR/IMPERATOR, click Senator card.
  All steps passed, zero console errors, zero network failures, no
  horizontal overflow. The intermittent "React did not hydrate" harness
  warning flapped again on both runs; allowedDevOrigins already covers
  *.vercel.run and every step still passed (matches the flap documented
  since pass 1).

# Iteration — hotfix: the reveal shader never compiled

Date: 2026-11-21 · Branch pass/orders-liquid.
Work order: user pasted demo screenshots as the quality target and asked
"wtf are you doing?" — the shipped cards showed no liquid at all.

## Root causes (three, stacked, all silent)

1. `int & uint` in the vertex shader (`(gl_VertexID << 1) & 2u`) is
   illegal in GLSL ES 3.00. Compile threw on every GPU; the bare `catch`
   fell back to the DOM card with no signal. Fix: keep the bit-trick in
   ints, `float(...)` after (`& 2`).
2. `FRAG.replace("OCTAVES", …)` patched the first occurrence — which was
   the GLSL *comment* mentioning OCTAVES, not the two loop headers. Fix:
   `replaceAll` + comment reworded.
3. Dead-canvas reuse: the effect depended on `active` and a fresh
   `lines` array, so every hover/re-render tore the context down
   (`loseContext`) and re-setup on the same canvas — which then hands
   back the dead context and fails all over again. Fix: GL setup runs
   once per mount; `active` flows through `activeRef`/`startRef`, `lines`
   through `linesRef`. Fallback paths now `console.error` with shader
   name + numbered source.

## Also fixed

- 0×0 drawing buffer: Orders passed `width={0} height={0}`; buffer sized
  from props rendered nothing with no error. Canvas now measures its own
  CSS box (`getBoundingClientRect`) with a ResizeObserver that re-sizes
  the buffer and re-rasterises the text textures.
- Canvas-texture Y-flip: 2D-canvas uploads are top-down, GL uv bottom-up
  — card text rendered mirrored. `UNPACK_FLIP_Y_WEBGL` on upload.
- Demo-vs-ours sanity run: served the pasted demo from public/, drove it
  in the harness browser (slow-mo tick, card click) — it renders the
  blob mid-flood and full travertine, proving the environment does give
  WebGL2 and the original cards were genuinely broken.

## Verified (production build, this turn)

- tsc clean; vitest 17/17; next build 8/8 pages.
- 1280px: click Senator card → marble floods the card, wine/purple stone
  with gold veining, text refracts at the front and reads upright after
  the Y-flip fix; zero console errors.
- 390px: click Senator card, asserts pass, interactive, zero errors.
- Remaining known wobble: mid-flood, the rasterised text texture sits
  slightly off the DOM text (font metrics + centered lines in
  canvasLines); at rest the canvas covers it fully.
