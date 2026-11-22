# PASS 03: Parallax Temple legibility and section-state bugs

Branch: `pass/03-temple-legibility`. Follow CLAUDE.md. Scope: ParallaxTemple.tsx, ScrollProgress, `numeralFor` in lib/constants.ts; layout.tsx fonts only if the font check fails.

Reported at about 1012x622 mid-scroll. Fix in this order:

1. TEXT COLLIDES WITH THE ART. The quote, the "IV: THE TEMPLE" eyebrow and the attribution are drawn over the columns and entablature (cream on cream, gold on bone). Separate the layers: put the text in clear space (sky above the pediment, or a band below the steps) with at least 2rem between the text block and the nearest part of the temple at every width. Add a soft radial ink scrim behind the text as a safety net. Gold is only allowed on a dark ground.
2. STRAY ELEMENT. A dark rectangle with gold, terracotta and purple bars sits in the central intercolumn (looks like a clipped door or UI mock). Either make it an intentional doorway fully inside the frame (aria-hidden, with an accessible text equivalent) or delete it. Record the decision.
3. SECTION STATE MISMATCH. The eyebrow says "IV: THE TEMPLE" while the floating progress pill says "III: Pillars" with the Temple filling the viewport.
   a) Active-section detection is wrong or lagging for the pinned/scrubbed section (likely observing the pin-spacer or a bad threshold). Use the section containing the viewport's vertical centre, or ScrollTrigger `onToggle` for pinned sections.
   b) Numerals look off by one. Derive every numeral (eyebrows, nav, pill) from the index in the NAVIGATED list via `numeralFor`. If SECTION_IDS includes hero or marquee, that is the offset. Report what you find.
4. TYPEFACE. The quote renders as an italic sans (looks like Inter italic), not Cormorant Garamond. Check that `--font-display` resolves through the next/font variable, and that Cormorant is loaded with `style: ["normal","italic"]` and the weights used. Verify with `document.fonts.check` and the computed font-family on the quote.
5. ART DIRECTION (last, after 1 to 4 are verified). The temple is smooth vector with soft gradients but the brief says pixel art. Quantize to the token palette with Bayer ordered dither, `shape-rendering="crispEdges"` or `image-rendering: pixelated`, and snap the floating dust squares to the same pixel grid. Use the empty band below the steps for a ground and foreground layer so depth reads.

SUCCESS CRITERIA (Playwright at 360/768/1024/1440/1920)
- No text bounding box intersects the columns or entablature rects.
- Contrast of quote, eyebrow and attribution against the pixels behind them is at least 4.5:1 (sample the screenshot).
- At scroll 0/25/50/75/100% of the Temple section, the pill label matches the section in view.
- Numerals are sequential with no duplicates between eyebrows and the pill.
- The quote's computed font-family includes the Cormorant variable and italic is a true italic.
- Reduced motion shows a static, legible composition.
OUT OF SCOPE: Hero shader, other sections, palette tokens, copy.
End by listing anything not verified and append to ITERATION.md.
