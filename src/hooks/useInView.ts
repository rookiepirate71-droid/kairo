"use client";

import { useEffect, useRef, useState } from "react";

export function useInView<T extends Element>(
  options?: IntersectionObserverInit,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options ?? { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return [ref, inView];
}
