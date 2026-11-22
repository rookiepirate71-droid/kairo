# PASS 02: confine the fluid orb to the Access section

Branch: `pass/02-orb-containment`. Follow CLAUDE.md.

## Bug (from owner screenshots)
The fluid orb (3D blob with spring/collision physics) belongs ONLY in the final Access section ("VIII: The final word"). It currently shows up in the viewport while the user is in other sections (seen top-left under the nav while Access is still below the fold). Everything else about it is approved: do not change its look, materials, springs or feel.

## Most likely cause (verify, do not assume)
The physics world and the canvas are tied to the browser tab, not the section:
- canvas is `position: fixed` (or portaled to `document.body`) and sized to the viewport
- walls/bounds are built from `window.innerWidth/innerHeight`
- pointer position uses `clientX/clientY` directly
- the physics step and render loop run for the whole page lifetime, with no visibility gating

Grep for: `position: fixed`, `fixed inset-0`, `createPortal`, `window.innerWidth`, `window.innerHeight`, `Bounds`, `walls`, `requestAnimationFrame`, `addEventListener("pointermove"|"scroll"|"resize"`, `Engine.create`/`World`/spring code.

## Fix: make the section the world
Use `src/hooks/useSectionSandbox.ts` from this pack (ResizeObserver + IntersectionObserver + section-local pointer coordinates).

1. DOM: the canvas lives INSIDE the section.
   ```tsx
   <section id="access" ref={ref} className="relative isolate overflow-clip" style={{ touchAction: "pan-y" }}>
     <canvas aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full" />
     <div className="relative z-10">{/* heading, copy, CTA */}</div>
   </section>
   ```
   No `position: fixed` and no portal to body. `isolate` keeps the negative z-index inside the section; `overflow-clip` (or `contain: paint`) makes it physically impossible to draw outside.
2. World bounds = section box. On `onResize({width,height})`: rebuild the four static walls (thickness at least 200px, placed outside the box) from the section size, clamp any body that is now outside back inside, and resize the renderer to the section, not the window. Camera/projection uses the section aspect.
3. Pointer: use `onPointer(x, y, inside)` (section-local px). When `inside` is false, release any grab and zero the cursor force. Do not read `window` pointer events. Do not use page scroll as a physics input (an optional scroll-velocity nudge is allowed only while the section is visible).
4. Visibility gating: in `onVisibleChange(false)` stop BOTH the physics step and the render loop (cancel rAF, no timers). On `true`, resume; if the orb was off-screen for more than about 2s, re-spawn it near the top of the section with the existing drop-in so the entrance replays. Zero GPU work while another section is in view.
5. Optional (only if the heading/CTA were meant to collide): build static colliders from `[data-collider]` elements, converted to section-local rects, rebuilt on resize and after fonts load.
6. Lifecycle: one renderer; on unmount cancel rAF, remove listeners, dispose geometry/material/textures/renderer and call `forceContextLoss()`. Must survive React StrictMode double-mount and route changes without a second orb or a leaked context. If the hero already owns a WebGL context, keep the total under 3.
7. Reduced motion: render the orb once at rest inside the section, no physics step.
8. Touch: `touch-action: pan-y` on the section so dragging the orb never blocks page scroll; only capture the pointer on the orb itself.

## Also fix if confirmed in the screenshots
- The floating "VIII: Access" pill covers the last line of the headline ("The rest is execution."). Reserve bottom space in this section, or fade the pill while it overlaps text.
- At about 1010px wide the nav logo ("ORACV·VM") appears to collide with the first link. Check 768 to 1100px and fix the nav layout.

## SUCCESS CRITERIA (Playwright, 360/768/1024/1440/1920)
- Scroll through the page in 200px steps. In every step where the Access section's rect does not intersect the viewport, `canvas.getContext` render calls = 0 and rAF callbacks from the sandbox = 0 (spy on `requestAnimationFrame` and `WebGLRenderingContext.drawArrays/drawElements`).
- At every scroll position while visible, the orb's projected screen bounding box is fully inside the section's bounding rect (screenshot diff + a numeric check through an exposed `data-orb-rect` debug attribute in dev).
- Resize from 1440 to 360 while the section is visible: the orb stays inside, walls rebuild, no console errors.
- Pointer leaves the section: the grab/force clears within one frame.
- StrictMode: exactly one canvas and one WebGL context exist for the section.
- Reduced motion: static orb, zero animation frames.
- Save screenshots with the section at 0%, 50% and 100% in view, plus two other sections with NO orb visible.

OUT OF SCOPE: orb appearance, spring constants, copy, other sections.
End by listing anything not verified and append to ITERATION.md.
