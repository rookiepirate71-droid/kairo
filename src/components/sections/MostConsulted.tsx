"use client";

import Image from "next/image";
import {
  EXPLORE_ITEMS,
  numeralFor,
} from "@/lib/constants";

/** Most Consulted strip — mirrors a "most visited" row of the library. */
export default function MostConsulted() {
  const featured = EXPLORE_ITEMS.filter((i) => i.featured).slice(0, 4);

  return (
    <div>
      <h2 className="font-display text-3xl text-bone mb-8">Most Consulted</h2>
      <ul className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {featured.map((item, rank) => (
          <li key={item.id}>
            <a href="#access" className="group flex items-center gap-4 rounded-sm border border-stone/40 bg-charcoal p-3 hover:border-oxidized/50 transition-colors">
              <span className="font-display text-3xl text-stone/70 group-hover:text-oxidized transition-colors" aria-hidden="true">
                {rank + 1}
              </span>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-stone/40">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.imageAlt ?? item.title}
                    fill
                    sizes="48px"
                    quality={50}
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-base text-bone">{item.title}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-stone">
                  Oraculum · {item.kind}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <p className="sr-only">Section {numeralFor("access")}</p>
    </div>
  );
}
