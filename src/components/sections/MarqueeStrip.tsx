import Marquee from "@/components/ui/Marquee";
import { MARQUEE_ITEMS } from "@/lib/constants";

export default function MarqueeStrip() {
  return (
    <section id="marquee" data-section="marquee" className="section-scope border-y border-stone/30 bg-charcoal py-5">
      <Marquee duration={36}>
        {MARQUEE_ITEMS.map((t, i) => (
          <span
            key={i}
            className="mx-8 font-display text-2xl italic text-oxidized"
          >
            {t}
            <span className="ml-16 text-terracotta not-italic">✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
