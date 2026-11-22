# Oraculum: agent brief (read this first)

## Project
A marketing site for a B2B SaaS called Oraculum ("The AI command center that turns your company's data into decisions"). Concept: ancient Rome meets terminal: marble, columns, laurel, ASCII, dithered pixel art, WebGL. Features are Pillars, pricing tiers are Orders (Citizen, Senator, Emperor), FAQ is the Senate.

Stack: Next.js 15 (App Router), React 19, TypeScript strict (no `any`), Tailwind v4 with CSS-variable tokens, three.js + custom GLSL, GSAP + ScrollTrigger + Lenis, Embla, Zustand, Vitest.

## How to work
1. Read `CLAUDE.md` and follow it for every pass.
2. Do the passes in this order, one branch each, reporting after each before starting the next:
   - `prompts/01-foundation.md`
   - `prompts/02-orb-containment.md` (visible bug: orb leaks into other sections)
   - `prompts/03-temple-legibility.md`
   - `prompts/04-orders-refine.md`
   - `prompts/05-orders-liquid-reveal.md`
   - `prompts/06-iteration-workflow.md` (harness + all remaining passes)
3. The `src/` folder is drop-in reference code. Diff against the repo before copying. Adapt import aliases.
4. `reference/liquid-reveal-demo.html` is the visual source of truth for the pricing-card reveal. Open it in a browser before pass 05.

## Decisions already made (do not revisit without asking)
- Reveal speed default is the slow cinematic 0.3 (`src/lib/reveal-config.ts`).
- The fluid orb's look and spring feel are approved; only its containment is wrong.
- Hover reveal on pricing cards is per-card and tier-themed; other cards never change.
- Gold is only for dark grounds; light bands use terra-deep/purple (see `[data-theme="light"]`).

## Files the author has NOT seen (read them, never assume)
`layout.tsx`, `lib/constants.ts`, `Hero.tsx`, `ParallaxTemple.tsx`, `scroll-progress.tsx`, `Orders.tsx`, the orb/physics component, and the existing `useReducedMotion` and `store/oracle` modules.

## Reporting format after each pass
Changed / Verified (with command output or screenshot paths) / Not verified / Still wrong / Decisions.
