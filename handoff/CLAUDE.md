# Iteration rules (standing)

- One concern per pass. Never mix refactors with visual changes.
- Before editing: read every file involved and state the plan in 5 lines or fewer.
- Smallest diff that solves it. No unrelated renames, reformatting or dependency bumps.
- After editing: run typecheck, lint, build, then `pnpm shots`. View the screenshots and compare to the previous run. Fix regressions before reporting.
- Never claim something works without running it. Write "not verified" instead.
- No placeholder text, no TODOs, no `any`, no magic numbers (use lib/constants.ts and CSS tokens).
- Keep reduced-motion, no-WebGL and keyboard paths working in every change.
- Every WebGL/physics change must dispose resources on unmount and pause when off-screen.
- End every pass by appending to ITERATION.md (what changed, what is still wrong) and commit on its own branch: `pass/<number>-<name>`.
- If a request is ambiguous, make the best call, record it under Decisions, and keep going.
- Do NOT change the reveal speed default (REVEAL.speed = 0.3 in src/lib/reveal-config.ts) without asking the owner.
