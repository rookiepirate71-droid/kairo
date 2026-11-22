"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface SandboxSize {
  width: number;
  height: number;
}

export interface SandboxHandlers {
  /** Section size in CSS px. Rebuild walls and colliders here. Fires on mount and on every resize. */
  onResize: (size: SandboxSize) => void;
  /** true while any part of the section is on screen. Start or stop the physics step AND the render loop. */
  onVisibleChange: (visible: boolean) => void;
  /**
   * Pointer in SECTION-LOCAL px (origin = section top-left, y down).
   * `inside` is false when the pointer left the section: release any grab or force.
   */
  onPointer?: (x: number, y: number, inside: boolean) => void;
}

/**
 * Confines an interactive physics sandbox (the Access-section orb) to ONE section.
 *
 * Why this exists: a fixed, viewport-sized canvas with window-sized walls lets the
 * body roam over every section. Instead the world is the section box: sizes come
 * from a ResizeObserver on the section, pointer coordinates are converted to
 * section-local space at event time (so scrolling cannot desync them), and
 * visibility comes from an IntersectionObserver so nothing runs off screen.
 *
 * Pointer events are listened for on the section itself, so the canvas can stay
 * `pointer-events: none` and never blocks text selection or the CTA.
 */
export function useSectionSandbox(
  sectionRef: RefObject<HTMLElement | null>,
  handlers: SandboxHandlers,
): void {
  // keep the latest handlers without re-subscribing observers on every render
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const measure = (): void => {
      const r = el.getBoundingClientRect();
      latest.current.onResize({ width: r.width, height: r.height });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();

    const io = new IntersectionObserver(([entry]) => {
      if (entry) latest.current.onVisibleChange(entry.isIntersecting);
    });
    io.observe(el);

    const toLocal = (e: PointerEvent): [number, number] => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const onMove = (e: PointerEvent): void => {
      const [x, y] = toLocal(e);
      latest.current.onPointer?.(x, y, true);
    };
    const onLeave = (e: PointerEvent): void => {
      const [x, y] = toLocal(e);
      latest.current.onPointer?.(x, y, false);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    el.addEventListener("pointercancel", onLeave, { passive: true });

    return () => {
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
      latest.current.onVisibleChange(false);
    };
  }, [sectionRef]);
}
