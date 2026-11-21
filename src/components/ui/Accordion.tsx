"use client";

import { useState } from "react";

export default function Accordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-stone/40 border-y border-stone/40">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-trigger-${i}`}
              className="w-full min-h-[44px] flex items-center justify-between py-4 text-left font-display text-xl text-ink hover:text-terra-deep transition-colors"
            >
              <span>{item.q}</span>
              <span
                className={`font-mono text-oxidized transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-40 pb-4" : "max-h-0"}`}
            >
              <p className="text-sm text-charcoal/90 leading-relaxed">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
