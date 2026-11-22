"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface ScrollProgress {
  /** page scroll progress 0..1 */
  progress: number;
  /** pixels scrolled */
  y: number;
}

export function useScrollProgress(): ScrollProgress {
  const reduced = useReducedMotion();
  const [state, setState] = useState<ScrollProgress>({ progress: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        setState({
          progress: max > 0 ? window.scrollY / max : 0,
          y: window.scrollY,
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return state;
}
