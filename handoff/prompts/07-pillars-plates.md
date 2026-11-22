# PASS 07: Pillars (section II) as specimen plates

Branch: `pass/07-pillars-plates`. Follow CLAUDE.md. Run after pass 05. Visual source of truth: `reference/pillars-plates-demo.html` (open it; also run `node tools/render-pillars.js` and view `tools/out/pillars.png`).

## Findings from the owner's screenshots
- The pixel icons are generic shapes: a square outline for Doric, a chip for Ionic, a "U" for Corinthian, and Caryatid reads as a robot face. None of them looks like the column order it names.
- Hover only lightens the card and turns the title gold. No art, no motion worth watching.
- Rows are as tall as the card holding the dashboard mock, so the other cards have a large dead void under the text.
- The floating "II: Pillars" pill sits over the middle of a card.
- The dev overlay shows "1 Issue" (Next.js). Open it, identify the cause (hydration, key warning, image sizes, etc.), fix it or report it.

## Design: each pillar is a specimen plate from an architectural treatise
- Card text on top: mono plate numeral ("PLATE I"), serif name, one-line benefit.
- Under the text, a drafted column of that order fills the former void: at rest it is a dotted drafting outline (dark, quiet). On hover or focus, marble POURS from the capital down the shaft (wavy liquid front, Bayer-dithered leading edge, one gold-leaf pixel line at the front, sparkle pixels), then 4 part labels fade in with leader lines ("ABACUS", "ECHINUS", "FLUTES", ...).
- The cylinder lighting follows the pointer's x across the card (rest = light from upper left). Marble has dark veins and rare gold kintsugi veins. Fluting differs per order.
- Pixel-art rules: low-res canvas, cell = 3 CSS px, `image-rendering: pixelated`, Bayer 4x4 ordered dither, palette only from tokens (stone ramp of 6, gold, bone). No anti-aliasing, no smooth gradients.

## Six orders (reference file implements Doric, Ionic, Corinthian)
Add the other three with the same `sil()/shade()` structure:
- Tuscan: plain smooth shaft (no flutes), simple torus base, unadorned capital. The "least ornament" plate.
- Composite: Ionic volutes sitting on a Corinthian acanthus bell.
- Caryatid: a draped standing figure replaces the shaft (head, shoulders, vertical drapery pleats, one relaxed leg), carrying a basket-shaped capital. Keep it abstract at 3px cells; read as a figure, not a face. Never a smiley.
Order, copy and labels live in one source array (`lib/orders.ts`): numeral, name, benefit copy, label list. The existing site copy stays unless the owner changes it.

## Layout
- 3x2 grid, equal-height plates (CSS subgrid or a fixed `--plate-h`), so no card has a void. The dashboard mock ("Q3 revenue, lineage on, oracle> prompt") leaves the Corinthian card and becomes its own full-width "Oracle console" panel below the grid, still built in JSX. It is a product demo, not a pillar.
- The ScrollProgress pill must not cover card text here (collapse it to a dot while it overlaps).

## Engineering
- `PillarPlate` client component; one shared rAF loop for all plates; run only while a plate is animating or poured; typed arrays allocated once per layout; no per-frame allocations; dispose observers on unmount; ResizeObserver relayout.
- Timing uses the same cinematic multiplier: `REVEAL.speed = 0.3` (`src/lib/reveal-config.ts`); same easing rates. Do not tune it faster without asking.
- Accessibility: canvases and SVG labels are `aria-hidden`; each card exposes an sr-only sentence naming the parts ("Doric capital: abacus, echinus, fluted shaft, no base"). Card is focusable; focus triggers the pour; visible gold focus ring; label text at least 4.5:1 on the card surface.
- Reduced motion: show the fully poured, labelled plate statically. Touch: tap pours, tapping outside releases.
- No WebGL needed (canvas 2D), so there is no fallback path beyond the reduced-motion state.

## SUCCESS CRITERIA (Playwright at 360/768/1024/1440/1920)
- All six plates share the same height at every desktop width; no card has more than 24px of empty vertical space.
- No text overlaps any plate art or the pill.
- Pour timing at defaults: progress crosses 0.9 between 2.5s and 4s after pointerenter (dev-only `data-progress`).
- Labels become visible after progress 0.55 and are never clipped by the card at 1024 and 1440.
- Keyboard Tab pours; blur releases; reduced motion shows the final state with no running animation.
- Contrast of every label and body text pair at least 4.5:1 (sample pixels).
- "1 Issue" overlay is gone or documented.
- Screenshots: each order at rest, 50% and 100% poured at 1440, plus one at 360.
OUT OF SCOPE: other sections, palette values, copy rewrites.
End by listing anything not verified and append to ITERATION.md.
