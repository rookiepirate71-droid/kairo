# PASS 08: the Temple (section III) as a layered pixel scene

Branch: `pass/08-temple-scene`. Follow CLAUDE.md. Supersedes the art-direction item (5) of pass 03; do pass 03's bug fixes (pill, numerals, fonts) first. Visual source of truth: `reference/temple-scene-demo.html` (open it; also `node tools/render-temple.js` and view `tools/out/temple_t0.png` and `temple_t1.png`).

## Findings from the owner's screenshot (about 1917x792)
- The pediment apex is clipped flat at the top of the section (the triangle has no point).
- The quote, the "III: THE TEMPLE" eyebrow and the attribution are drawn over the columns. A dark radial scrim behind them shows up as blobs in the shafts. Gold mono on bone is still hard to read.
- The stray rectangle with gold bars is still in the central gap.
- There is no depth: no sky, mountains, foreground or light. The steps just fade to black.
- The bottom pill is cut off by the viewport edge.

## Design
1. TWO ZONES, no overlap by construction. The scene is the art zone (canvas, 16:9 on desktop, `object-fit: cover` to a 4:5 crop on mobile). The inscription (eyebrow, quote, attribution) lives in its own zone BELOW it on the dark ground, with at least 2rem gap. No scrim, no text over art, ever.
2. Layers at different depths (pixel-snapped offsets, in cells; p = scroll progress 0..1, m = pointer x -1..1):
   sky 0.1, far mountains 0.35, near mountains 0.55, temple 0.8, foreground cypress 1.3. Vertical shift = -p x depth x 8 cells; horizontal = m x depth x 4 cells. Deeper layers move less, closer layers more.
3. Light is the story: dusk sky (Bayer-dithered ramp ink to purple to terracotta to gold) with a horizon glow that grows with p; a lamp of light sweeps across the temple from left to right as p goes 0 to 1 (columns are cylinder-shaded and fluted); an oracle flame flickers in the cella gap between the centre columns; a gold eye emblem sits in the tympanum; stars twinkle; 36 dust motes drift upward; a dithered mist band sits at the base. Replace the stray bars with the flame.
4. Whole pediment always visible: apex at least 10 cells below the canvas top at every p.
5. Scroll scrub: pin the section with ScrollTrigger (scrub 1, tokens for easing), drive p from progress. Pointer parallax is eased (lerp, not snap). Reduced motion: static composition at p = 0.5, no flicker, no motes, no pin. Pause rendering when off-screen (IntersectionObserver) and while the tab is hidden.
6. Pixel rules: low-res canvas (160x90 cells), `image-rendering: pixelated`, palette from tokens, ordered dither only, no blur, no gradients.

## Engineering
- `TempleScene` client component with `useSectionSandbox`-style visibility handling (see `src/hooks/useSectionSandbox.ts`). Typed palettes, no `any`, no magic numbers (constants in `lib/constants.ts`). Allocate `ImageData` once. Dispose listeners on unmount; survive StrictMode.
- Accessibility: the canvas has a role="img" and a descriptive aria-label; the quote is a real `<blockquote>`; heading order unchanged; the pill never overlaps the zone's text.
- Fonts: quote is Cormorant Garamond italic via the next/font variable (true italic, check computed font-family), eyebrow/attribution use the mono variable at 11px minimum with gold only on dark ground.

## SUCCESS CRITERIA (Playwright at 360/768/1024/1440/1920)
- At p = 0 and p = 1 the pediment apex pixel row is not sky-coloured (read the canvas) and the temple's top is at least 8 cells from the canvas top.
- No text element's bounding box intersects the canvas rect; gap at least 32px.
- Layer offsets scale with depth: far mountains move less than the temple, the temple less than the foreground (sample three marker rows at p = 0 and 1).
- Contrast of quote, eyebrow and attribution at least 4.5:1 on their ground (sample pixels).
- No rAF activity while the section is off-screen; no console errors; one canvas only under StrictMode.
- Reduced motion shows the static composition with the lamp mid-temple.
- Screenshots at p = 0, 0.5, 1 for 1440 and 360.
OUT OF SCOPE: other sections, palette values, copy.
End by listing anything not verified and append to ITERATION.md.
