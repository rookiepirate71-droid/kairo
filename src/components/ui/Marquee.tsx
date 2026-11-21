"use client";

import { Children, useEffect, useRef } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  /** seconds per full loop */
  duration?: number;
  className?: string;
}

/**
 * Pure-CSS infinite marquee. Children are duplicated once and the track
 * translated by -50% so the loop is seamless. Pauses on hover and collapses
 * to a static row under prefers-reduced-motion.
 */
export default function Marquee({ children, duration = 30, className = "" }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.setProperty("--marquee-duration", `${duration}s`);
  }, [duration]);

  const items = Children.toArray(children);

  return (
    <div
      className={`group overflow-hidden whitespace-nowrap ${className}`}
      role="marquee"
      aria-label="scrolling inscriptions"
    >
      <div
        ref={trackRef}
        className="inline-flex w-max animate-[marquee_var(--marquee-duration)_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {items.map((child, i) => (
          <span key={`a-${i}`} className="inline-flex">
            {child}
          </span>
        ))}
        <span aria-hidden="true" className="inline-flex">
          {items.map((child, i) => (
            <span key={`b-${i}`} className="inline-flex">
              {child}
            </span>
          ))}
        </span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
