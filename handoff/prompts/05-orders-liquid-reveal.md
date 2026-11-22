# PASS 05: liquid-marble reveal on the pricing cards (WebGL2)

Branch: `pass/05-orders-liquid`. Follow CLAUDE.md. Run after pass 04.

## What it is
Hovering or focusing a pricing card floods ONLY that card with a flowing marble in the tier's own stone, spreading from where the cursor entered. Citizen = travertine with terracotta veins, Senator = deep purple with gold kintsugi veins, Emperor = gilded stone with dark Tyrian veins. The edge is a warped liquid front with refraction ripples that bend the text, a gold-leaf line with sparkles, a Bayer-dithered pixel mist ahead of it, and a cursor sheen once revealed. The card text is painted into the shader, so it recolours exactly at the liquid edge.

## TIMING IS A DECISION, NOT A TODO
The approved feel is the SLOW cinematic one: `REVEAL.speed = 0.3` in `src/lib/reveal-config.ts` (every rate, the marble flow time and the origin/sheen follow are multiplied by it). It is the DEFAULT. Do not "optimise" it to feel snappier. `speed={1}` on `<TierCard>` is available for a fast variant if the owner asks. The open/close tail is long on purpose (about 3s to visually cover the card, about 4s to fully release).

## Files provided (drop-in, adapt import paths if the alias differs)
- `src/shaders/tierReveal.ts`: VERT/FRAG (GLSL ES 3.00). Do not retune constants without a before/after screenshot set.
- `src/lib/tierRevealEngine.ts`: one WebGL2 context per card, shared rAF scheduler, text textures, pointer/focus handling, context loss recovery, `dispose()`.
- `src/lib/reveal-config.ts`, `src/lib/tiers.ts` (data and token-based palette), `src/lib/textLayout.ts` (+ test).
- `src/components/orders/TierCard.tsx`: semantic DOM card with a real CTA link; canvas paints over it; CSS fallback when WebGL2 is missing.
- Tier tokens and `.tier-card` CSS are in `src/app/globals.css` (pass 01).
- `reference/liquid-reveal-demo.html`: standalone working reference. If the integrated result looks different from this file, the integration is wrong.

## Tasks
1. Wire `TierCard` into Orders using the single tiers source array from pass 04. Pass the toggle's price/unit as props (it repaints text without rebuilding GL).
2. Keep the CTA a real `<a>`. The canvas paints its label and border; the DOM link sits on top at `inset-x-4 bottom-4 h-[34px]` (must match `LAYOUT` in the engine).
3. Keyboard: tabbing to the CTA reveals the card (focusin), leaving collapses it (focusout). Touch: tap reveals, tapping outside collapses.
4. Performance: one context per card is fine for 3 cards. If the page already holds 3+ contexts (hero, orb, final CTA), switch to a single shared offscreen renderer with blits. Report the live context count. Cap DPR 1.5 (already set). Report measured ms/frame with one card animating.
5. Fallbacks: no WebGL2 gives `data-gl="off"` and an instant CSS theme swap; reduced motion gives an instant swap with no animation; no-JS shows the dark card legibly.
6. Contrast: sample pixels for every text pair in both layers (base and themed) at progress 0 and 1 (4.5:1). Veins are damped under text in the shader; if a vein still crosses text below 4.5:1, raise the damping, not the vein colour.
7. Do not add vertical layout shift: card height comes from `--tier-card-h`.

## SUCCESS CRITERIA (Playwright, plus screenshots)
- Hovering one card changes only that card (pixel diff of the other two is zero).
- At progress 1 the card is fully themed with no base text visible; at 0 it is pixel-identical to the pre-hover baseline.
- Reveal timing at defaults: `uP` crosses 0.9 between 2.5s and 4s after pointerenter (read it from a dev-only `data-progress` attribute).
- Keyboard Tab reveals; blur collapses; Esc is not required.
- Reduced motion: instant swap, zero running animations.
- Axe: no new violations; screen readers read each card's text exactly once.
- Screenshots at progress 0, 0.25, 0.5, 0.75, 1 for each tier at 1440px, and at 360px for one tier.

OUT OF SCOPE: other sections, palette values, pricing copy.
End by listing anything not verified (the shader was never compiled in a real browser by the author of this pack, so record the compile result) and append to ITERATION.md.
