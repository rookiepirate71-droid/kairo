"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  EXPLORE_CATEGORIES,
  EXPLORE_ITEMS,
  type ExploreCategory,
  type ExploreItem,
} from "@/lib/constants";
import { asset } from "@/lib/asset";
import Badge from "@/components/ui/Badge";

function PixelThumb({ pixels }: { pixels: string[] }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-charcoal">
      <svg
        viewBox="0 0 8 8"
        className="h-20 w-20"
        role="img"
        aria-label="Pixel-art glyph"
        shapeRendering="crispEdges"
      >
        {pixels.map((row, y) =>
          row.split("").map((bit, x) =>
            bit === "1" ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width="1"
                height="1"
                fill="#a98a44"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}

function Card({ item }: { item: ExploreItem }) {
  return (
    <a
      href="#access"
      className="group block overflow-hidden rounded-sm border border-stone/40 bg-charcoal transition-all duration-200 hover:-translate-y-1 hover:shadow-raised hover:border-oxidized/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
      aria-label={`${item.title} — ${item.category}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image ? (
          <Image
            src={asset(item.image)}
            alt={item.imageAlt ?? item.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
            quality={65}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : item.pixels ? (
          <PixelThumb pixels={item.pixels} />
        ) : null}
        <span className="absolute left-3 top-3">
          <Badge tone={item.category === "Build" ? "gold" : item.category === "Pillar" ? "terra" : "stone"}>
            {item.category}
          </Badge>
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl text-bone group-hover:text-gold transition-colors">
          {item.title}
        </h3>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
          Oraculum · {item.kind}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-travertine">{item.blurb}</p>
      </div>
    </a>
  );
}

export default function ExploreGallery() {
  const [filter, setFilter] = useState<"All" | ExploreCategory>("All");

  const shown = useMemo(
    () =>
      filter === "All"
        ? EXPLORE_ITEMS
        : EXPLORE_ITEMS.filter((i) => i.category === filter),
    [filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: EXPLORE_ITEMS.length };
    for (const item of EXPLORE_ITEMS) {
      c[item.category] = (c[item.category] ?? 0) + 1;
    }
    return c;
  }, []);

  return (
    <div>
      {/* filter chips — operable by keyboard, state in aria-pressed */}
      <div
        className="flex flex-wrap gap-3"
        role="group"
        aria-label="Filter the library by category"
      >
        {EXPLORE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            aria-pressed={filter === cat}
            className={`min-h-[44px] rounded-sm border px-5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
              filter === cat
                ? "border-oxidized bg-oxidized text-ink"
                : "border-stone/50 text-travertine hover:border-oxidized/60 hover:text-bone"
            }`}
          >
            {cat} · {counts[cat] ?? 0}
          </button>
        ))}
      </div>

      <div
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        aria-live="polite"
      >
        {shown.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-stone">
        {shown.length} artifact{shown.length === 1 ? "" : "s"} on display
      </p>
    </div>
  );
}
