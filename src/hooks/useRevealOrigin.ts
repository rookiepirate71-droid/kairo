"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface RevealOrigin {
  /** 0..1 within the card, origin of the flood */
  x: number;
  y: number;
}

/**
 * Tracks where the reveal should flood from: the pointer entry point on
 * pointerenter, or the card centre on keyboard focus / tap. Returns a ref to
 * the current origin plus a ref holding the last event type, so the canvas
 * can distinguish touch taps (which must ignore pointerleave).
 *
 * Listeners attach to the card element itself (pass a ref to it), so
 * `e.currentTarget` is always that card.
 */
export function useRevealOrigin(cardRef: RefObject<HTMLElement | null>) {
  const originRef = useRef<RevealOrigin>({ x: 0.5, y: 0.5 });
  const sourceRef = useRef<"pointer" | "focus" | "tap">("pointer");

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    const handler = (e: PointerEvent | FocusEvent) => {
      const target = e.currentTarget as HTMLElement | null;
      if (!target) return;
      if (e instanceof PointerEvent) {
        if (e.pointerType === "touch") {
          sourceRef.current = "tap";
          const r = target.getBoundingClientRect();
          originRef.current = {
            x: (e.clientX - r.left) / r.width,
            y: (e.clientY - r.top) / r.height,
          };
          return;
        }
        sourceRef.current = "pointer";
        const r = target.getBoundingClientRect();
        originRef.current = {
          x: (e.clientX - r.left) / r.width,
          y: (e.clientY - r.top) / r.height,
        };
      } else {
        // keyboard focus: flood from the near edge, feels like ink pouring in
        sourceRef.current = "focus";
        originRef.current = { x: 0.5, y: 0.85 };
      }
    };
    const opts = { passive: true } as AddEventListenerOptions;
    card.addEventListener("pointermove", handler as EventListener, opts);
    card.addEventListener("focusin", handler as EventListener, opts);
    return () => {
      card.removeEventListener("pointermove", handler as EventListener);
      card.removeEventListener("focusin", handler as EventListener);
    };
  }, [cardRef]);

  return { originRef, sourceRef };
}
