"use client";

import { useState } from "react";
import { PILLARS, numeralFor, type Pillar } from "@/lib/constants";

function PixelIcon({ pillar }: { pillar: Pillar }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative h-16 w-16"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* pixel-art rendering of the 8x8 glyph */}
      <svg
        viewBox="0 0 8 8"
        className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${
          hover ? "opacity-0" : "opacity-100"
        }`}
        role="img"
        aria-label={`${pillar.name} icon`}
        shapeRendering="crispEdges"
      >
        {pillar.pixels.map((row, y) =>
          row.split("").map((bit, x) =>
            bit === "1" ? (
              <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#a98a44" />
            ) : null,
          ),
        )}
      </svg>

      {/* ASCII rendering shown on hover/focus */}
      <pre
        className={`absolute inset-0 flex items-center justify-center font-mono text-[8px] leading-[8px] text-gold transition-opacity duration-200 ${
          hover ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        {pillar.ascii}
      </pre>
    </div>
  );
}

/** JSX-built product UI mock: dashboard card with chart, table and prompt box. */
function ProductMock() {
  const bars = [34, 52, 41, 66, 58, 79, 71, 88, 84, 96, 91, 100];
  return (
    <div className="mt-6 rounded-sm border border-stone/40 bg-charcoal p-4 text-left">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          Q3 revenue · lineage on
        </span>
        <span className="font-mono text-[10px] text-oxidized">▲ 12.4%</span>
      </div>
      <div className="flex items-end gap-1 h-16 mb-4" aria-hidden="true">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h}%`,
              background:
                i === bars.length - 1
                  ? "var(--color-terracotta)"
                  : "rgba(169,138,68,0.55)",
            }}
          />
        ))}
      </div>
      <table className="w-full text-[11px] font-mono mb-4" aria-label="Metric breakdown example">
        <tbody>
          <tr className="border-t border-stone/25">
            <td className="py-1.5 text-travertine">Enterprise</td>
            <td className="py-1.5 text-right text-bone">$412k</td>
            <td className="py-1.5 text-right text-oxidized">▲ 8%</td>
          </tr>
          <tr className="border-t border-stone/25">
            <td className="py-1.5 text-travertine">Mid-market</td>
            <td className="py-1.5 text-right text-bone">$238k</td>
            <td className="py-1.5 text-right text-oxidized">▲ 21%</td>
          </tr>
          <tr className="border-t border-stone/25">
            <td className="py-1.5 text-travertine">SMB</td>
            <td className="py-1.5 text-right text-bone">$96k</td>
            <td className="py-1.5 text-right text-terra-deep">▼ 3%</td>
          </tr>
        </tbody>
      </table>
      <div className="flex items-center gap-2 border border-stone/40 rounded-sm px-3 py-2">
        <span className="font-mono text-[11px] text-stone">oracle&gt;</span>
        <span className="font-mono text-[11px] text-bone/80 truncate">
          why did SMB churn spike in August?
        </span>
        <span className="ml-auto font-mono text-[11px] text-oxidized">↵</span>
      </div>
    </div>
  );
}

export default function Pillars() {
  return (
    <section id="pillars" data-section="pillars" className="section-scope coffer-bg py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-oxidized mb-4">
          {numeralFor("pillars")} — The Six Pillars
        </p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-bone mb-14 max-w-xl leading-tight">
          Six pillars hold the product up. All of them are load-bearing.
        </h2>
        <ul className="grid grid-cols-2 gap-px bg-stone/30 md:grid-cols-3 border border-stone/30">
          {PILLARS.map((pillar) => (
            <li
              key={pillar.name}
              className="group bg-ink p-8 md:p-12 hover:bg-charcoal transition-colors duration-300"
            >
              <PixelIcon pillar={pillar} />
              <h3 className="mt-6 font-display text-2xl md:text-3xl text-bone group-hover:text-oxidized transition-colors">
                {pillar.name}
              </h3>
              <p className="mt-3 text-sm text-travertine leading-relaxed">
                {pillar.benefit}
              </p>
              <div className="mt-4 h-px w-8 bg-oxidized/40 group-hover:w-16 transition-all duration-300" />
              {pillar.name === "Corinthian" && <ProductMock />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
