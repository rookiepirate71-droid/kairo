# PASS 06+: the heavy iteration workflow

## Step 0: one-time harness (no visible UI change)
1. Confirm a clean git repo and tag `baseline`.
2. Add scripts: `typecheck`, `lint`, `test`, `build`, `shots`, `audit`.
3. `shots`: a Playwright script that loads the dev server and saves full-page and per-section screenshots at 360, 768, 1024, 1440 and 1920px (reduced-motion on, WebGL on) to `/.shots/<timestamp>/`, plus a console-error log.
4. `audit`: axe-core, Lighthouse (mobile) and a bundle-size report, written to `/.shots/<timestamp>/audit.md`.
5. ITERATION.md and CLAUDE.md already exist in this pack; keep them updated.

## The loop (every pass)
1. Audit: read code and screenshots; list problems for that concern only.
2. Plan: a numbered plan of at most 5 lines.
3. Implement: smallest diff, on a branch `pass/<n>-<name>`.
4. Verify: typecheck, lint, build, `shots`, `audit`, with a before/after comparison.
5. Report: what changed, what is still wrong, what is not verified.
6. Merge: squash-merge, tag `pass-<n>`, update ITERATION.md.

Pass template:
```
PASS <N>: <CONCERN>. Scope: <files or sections>.
Follow the loop in CLAUDE.md: audit, plan (max 5 lines), implement, verify with shots + audit, report.
Success criteria: <measurable list>.
Out of scope: everything else.
```

## Remaining passes after 01 to 05 (order matters)
7. Brief and copy: one copy deck in `/content/copy.ts`; components read from it. Roman voice, dry humour, benefit-led. (Decide first: SaaS "Oraculum" product copy vs a school concept. The current site reads as a school with no product; the owner's brief is a SaaS.)
8. Information architecture: nav order equals DOM order, numerals from array index, missing sections added (pricing, parallax temple, final CTA).
9. Design tokens: move every hardcoded colour, spacing, duration and z-index to tokens. Pure refactor; screenshots must be pixel-identical.
10. Typography and rhythm: fluid scale with clamp, consistent section padding and max-widths.
11. Section polish, one section per pass: Hero, Manifesto, Pillars, Temple, Tesserae, Inscriptions, Orders, Senate, Final CTA, Footer. First list 3 weak things, then fix them.
12. WebGL and shaders: profile, GPU-tier scaling, disposal, off-screen pause, no-WebGL fallback.
13. Motion: one easing set, one dominant motion per viewport, ScrollTrigger cleanup, Lenis/GSAP ticker sync.
14. Responsive: walk the five widths; fix overflow, clipped text, tap targets under 44px, touch behaviour.
15. Accessibility: axe plus a manual keyboard-only and heading/landmark pass; modal and menu focus traps; carousel and accordion aria.
16. Performance: Lighthouse mobile 95+; image `sizes` (no `w=3840`), font preload, JS split, CLS, LCP.
17. SEO: `metadataBase` from env, canonical, dynamic OG image, JSON-LD (SoftwareApplication, Organization, FAQPage), sitemap, robots; remove every `example.com`.
18. QA: Playwright tests for nav anchors, carousels (drag + keyboard), pricing toggle, FAQ accordion, modal open/close/Esc, reduced motion.
19. Final review: act as a skeptical art director and a senior engineer; list the 10 weakest things; fix the top 5.

## Tweak notes that work
```
Section: Hero. Problem: ASCII reveal radius feels too small and snaps.
Want: radius about 220px at 1440w, smoothstep falloff over 80px, lerp the cursor at 0.12.
Don't touch: headline, particles.
```
Name the section, state the change as a number or a reference, and list what must not change.
