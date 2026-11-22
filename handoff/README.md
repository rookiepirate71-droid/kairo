# Oraculum liquid pack

Hand-off bundle for a coding agent (Claude Code, Cursor, etc.).

## Use it
1. Unzip anywhere (or into the project root as `/handoff`).
2. Tell the agent: "Read `AGENT_BRIEF.md` and follow it."
3. Review each pass's screenshots before telling it to continue.

## What is inside
```
AGENT_BRIEF.md            entry point: context, order of passes, decisions
CLAUDE.md                 standing rules (copy to the repo root)
ITERATION.md              running log template (copy to the repo root)
prompts/
  01-foundation.md              tokens, Lenis, fonts, hero shader fixes
  02-orb-containment.md         keep the fluid orb inside the Access section
  03-temple-legibility.md       text/art collisions, wrong section pill, font fallback
  04-orders-refine.md           alignment, toggle, comparison table, pill overlap
  05-orders-liquid-reveal.md    WebGL2 liquid-marble hover reveal (cinematic default)
  06-iteration-workflow.md      harness, loop, and all remaining passes
reference/
  liquid-reveal-demo.html       standalone working demo (open in a browser)
src/                            drop-in code
  app/globals.css  app/page.tsx
  components/webgl/MarbleScene.tsx
  components/orders/TierCard.tsx
  hooks/useSectionSandbox.ts    confines a physics sandbox to one section
  lib/{reveal-config,tiers,textLayout,tierRevealEngine}.ts  + textLayout.test.ts
  shaders/tierReveal.ts
```

## Reveal speed
The slow-motion feel you approved is now the default: `REVEAL.speed = 0.3` in `src/lib/reveal-config.ts`. The demo has a Speed dropdown (Cinematic default, Fast, Glacial) to compare. `<TierCard speed={1} />` gives the fast version.

## What was and was not verified (be honest with the agent)
Verified here: the demo's JavaScript parses; the TypeScript files without JSX parse; `wrapLines` passes its assertions.
NOT verified: the GLSL has never been compiled in a real browser; the `.tsx` files have not been type-checked or rendered; nothing was run against your project. Pass prompts tell the agent to record real compile, type and screenshot results.
The orb fix (pass 02) is written from two screenshots without seeing the orb's code, so it starts with a diagnosis step.
