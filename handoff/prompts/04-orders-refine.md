# PASS 04: Orders (pricing) layout, toggle and theme relation

Branch: `pass/04-orders-refine`. Follow CLAUDE.md. Scope: Orders.tsx and children, comparison table, ScrollProgress (overlap only).
Run this BEFORE pass 05. Pass 05 replaces the card hover/visual treatment, so here do not style hover states or an inverted highlighted card.

1. ALIGNMENT. Use CSS subgrid (or a shared grid with named rows) so tier name, tagline, price, CTA and feature list start at the same y across all three cards at every desktop width. The highlighted tier is lifted with transform/padding only; its content stays on the shared rows. Equal left/right gutters; nothing overflows horizontally at 768 to 1024.
2. FLOATING PILL OVERLAP. The "VI: Orders" pill sits over card content. Collapse it to a dot, fade it while scrolling inside a card, or reserve a safe bottom inset in this section. It must never cover readable or interactive content.
3. PRICE TYPOGRAPHY. Prices use oldstyle figures ("$1,200" reads like "$I,2oo"). Set `font-variant-numeric: lining-nums tabular-nums` on prices and numbers. "/ mo" must be marble or bone at 4.5:1 on ink, not stone. "By rite" sits on the same baseline as the other prices.
4. THEME RELATION (decorations sit OUTSIDE the card as separate aria-hidden elements so they do not fight pass 05):
   - A pixel-art column capital above each card on a fixed pixel grid in token colours with `shape-rendering="crispEdges"`: Tuscan (plain) Citizen, Ionic (scrolls) Senator, Corinthian (acanthus) Emperor. sr-only text equivalent.
   - A `.meander-strip` between capital and card.
   - Replace the text-only "MOST CHOSEN" badge with a pixel laurel-crown badge: gold bg, ink text (about 8:1), fully inside the card padding.
   - Engraved SPQR-style rules above and below the section.
5. BILLING TOGGLE. Rebuild as a two-option radiogroup (arrow keys, visible gold focus ring, selected state not conveyed by colour alone). Switching crossfades prices over 300ms with `--ease-out-expo`. Annual = 15% off, shows the effective monthly price with "billed annually" beneath, announced through an `aria-live="polite"` region. Emperor stays "By rite". Reduced motion swaps instantly. The price value must be a prop the card can take (pass 05's TierCard accepts `price` and `unit`).
6. COMPARISON TABLE ("Tabula"). Sticky header at desktop widths; below 768px one accordion per tier. One source array feeds the cards and the table (no duplicated copy). Highlight the Senator column consistently.
7. SMALL ITEMS. All small mono text at least 4.5:1. Tap targets at least 44px. No layout shift when the toggle changes.

SUCCESS CRITERIA (Playwright)
- At 1024/1440/1920 the top y of name, price, CTA and first bullet is identical across the three cards (1px tolerance).
- No horizontal overflow at any tested width; equal card gutters.
- The pill never intersects a card's text or CTA at any scroll position in the section.
- Price elements compute to `lining-nums`; every text pair in the section is at least 4.5:1 (sample pixels).
- Toggle works by keyboard alone, the live region announces the new price, annual = monthly x 0.85 rounded to whole dollars.
- At 360px the comparison collapses to accordions with no horizontal scroll.
- Reduced motion: no animation; final states render statically.
OUT OF SCOPE: Hero shader, other sections, palette values, nav.
End by listing anything not verified and append to ITERATION.md.
