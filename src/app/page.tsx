import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import MarqueeStrip from "@/components/sections/MarqueeStrip";
import Manifesto from "@/components/sections/Manifesto";
import Pillars from "@/components/sections/Pillars";
import ParallaxTemple from "@/components/sections/ParallaxTemple";
import Tesserae from "@/components/sections/Tesserae";
import Tablets from "@/components/sections/Tablets";
import Orders from "@/components/sections/Orders";
import Senate from "@/components/sections/Senate";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/sections/Footer";
import ScrollProgress from "@/components/ui/scroll-progress";
import { numeralFor, type SectionId } from "@/lib/constants";

const NAVIGATED = [
  "manifesto",
  "pillars",
  "temple",
  "tesserae",
  "tablets",
  "orders",
  "senate",
  "access",
] as const satisfies readonly SectionId[];

const NAV_SECTIONS = NAVIGATED.map((id) => ({
  id,
  label: `${numeralFor(id)} — ${id.charAt(0).toUpperCase()}${id.slice(1)}`,
}));

export default function Page() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-modal) focus:bg-oxidized focus:text-ink focus:px-4 focus:py-2 focus:rounded-sm"
      >
        Skip to content
      </a>
      <Nav />
      <ScrollProgress
        sections={NAV_SECTIONS}
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-(--z-nav) -translate-x-1/2"
      />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <MarqueeStrip />
        <Manifesto />
        <Pillars />
        <ParallaxTemple />
        <Tesserae />
        <Tablets />
        <Orders />
        <Senate />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
