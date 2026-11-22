# PASS 01: foundation (tokens, scroll, fonts, hero shader)

Branch: `pass/01-foundation`. Follow CLAUDE.md.

The `src/` folder in this pack holds corrected versions of three files. Merge them into the project; do NOT blindly overwrite. Diff first, keep any project-specific rules that are not in the pack, and report every conflict.

1. `src/app/globals.css`
   - Fixes: Lenis-safe smooth scroll, no border-radius on :focus-visible, surface-aware focus ring (gold on dark, purple on `[data-theme="light"]`), a real meander mask, `@theme static` so WebGL/inline styles can read tokens, `@theme inline` for next/font variables, tier tokens, `.tier-card` styles.
   - Add `data-theme="light"` to every light band (Manifesto and any sand/travertine section). Without it the gold focus ring and bone text fail contrast there.
2. `src/app/page.tsx`: removes the unused `SECTION_IDS` import, makes `<main>` focusable for the skip link, uses `--z-*` tokens, adds a bottom safe-area inset to ScrollProgress.
3. `src/components/webgl/MarbleScene.tsx`: fixes the DPR bug (uniforms now in device pixels), async setup leak on unmount/StrictMode, adds a real glyph-atlas ASCII pass with a cursor lens, pauses off-screen, reduced-motion static frame, WebGL failure fallback.
4. `layout.tsx` (read it; I have not seen it). Confirm all of:
   - `Cormorant_Garamond` with `style: ["normal","italic"]`, weights actually used, `variable: "--font-cormorant"`
   - `Inter` with `variable: "--font-inter"`, `Space_Mono` with `variable: "--font-space-mono"`
   - all three `.variable` classes on `<html>`
   - `export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" }`
   If any name differs, change the `@theme inline` block to match, not the other way around.
5. Lenis: anchor links must call `lenis.scrollTo(hash, { offset: -navHeightPx })`; CSS scroll-margin does not apply under Lenis.

SUCCESS CRITERIA
- typecheck, lint and build pass.
- `document.fonts.check("26px Cormorant Garamond")`-style checks via computed font-family on a heading show the Cormorant stack, not a fallback.
- Keyboard tab shows a visible focus ring on both dark and light sections.
- Hero: no console errors; lens follows the cursor; reduced-motion shows one static ASCII frame; no WebGL shows the CSS fallback.
- Report anything not verified.
