import Image from "next/image";
import { asset } from "@/lib/asset";
import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Orders",
    links: [
      { label: "Citizen", href: "#orders" },
      { label: "Senator", href: "#orders" },
      { label: "Emperor", href: "#orders" },
    ],
  },
  {
    title: "School",
    links: [
      { label: "Manifesto", href: "#manifesto" },
      { label: "Pillars", href: "#pillars" },
      { label: "Tesserae", href: "#tesserae" },
      { label: "Explore", href: "/explore" },
    ],
  },
  {
    title: "Senate",
    links: [
      { label: "Tablets", href: "#tablets" },
      { label: "FAQ", href: "#senate" },
      { label: "Request Access", href: "#access" },
    ],
  },
];

const SOCIALS = [
  { label: "X", icon: "/icons/simple-icons-x-ede6d6.svg", href: "https://x.com" },
  {
    label: "LinkedIn",
    icon: "/icons/simple-icons-linkedin-ede6d6.svg",
    href: "https://linkedin.com",
  },
  {
    label: "YouTube",
    icon: "/icons/simple-icons-youtube-ede6d6.svg",
    href: "https://youtube.com",
  },
];

/**
 * Cinematic full-bleed footer at viewport scale: the cliff-temple dusk
 * fills a tall section, brand and columns rest on the calm open sky of
 * the artwork's left side, and the ruin side stays clear.
 */
export default function Footer() {
  return (
    <footer data-section="footer" className="section-scope relative min-h-[88vh] overflow-hidden bg-ink">
      {/* top fade: the page above dissolves into the scene, no hard seam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-40"
        style={{
          background:
            "linear-gradient(180deg, #0d0c0a 0%, rgba(13,12,10,0.55) 55%, rgba(13,12,10,0) 100%)",
        }}
      />

      {/* full-bleed artwork, anchored so the whole composition reads */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/generated/footer-cliff-bright.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          className="object-cover object-center"
        />
        {/* scrim: left third over open water/sky, plus mid band so the
            School/Senate columns clear the bright temple behind them */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(13,12,10,0.45) 0%, rgba(13,12,10,0.30) 38%, rgba(13,12,10,0.34) 62%, rgba(13,12,10,0.22) 80%, rgba(13,12,10,0.05) 100%)",
          }}
        />
        {/* soft radial boost behind the right columns */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 42% 55% at 78% 48%, rgba(13,12,10,0.38) 0%, rgba(13,12,10,0.18) 55%, transparent 100%)",
          }}
        />
        {/* bottom legal strip support */}
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(13,12,10,0.8) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col px-8 pt-40 pb-8 md:px-12 md:pt-56">
        <div className="grid flex-1 items-start gap-16 md:grid-cols-[1.1fr_1.6fr]">
          {/* brand block — larger, Solmara scale */}
          <div>
            <p className="font-display text-5xl text-bone md:text-6xl">
              ORACV<span className="text-terracotta">·</span>VM
            </p>
            <p className="mt-7 max-w-sm text-lg leading-relaxed text-bone/90">
              Oraculum is the AI command center for company data. Every metric
              governed, every number with lineage, no hidden formulas.
            </p>
            <div className="mt-9 flex items-center gap-6">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="opacity-90 transition-opacity hover:opacity-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(s.icon)} alt="" width={22} height={22} />
                </a>
              ))}
            </div>
          </div>

          {/* link columns — roomier, pushed right of the text zone */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:pt-2"
          >
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-display text-2xl text-bone">{col.title}</h3>
                <ul className="mt-7 space-y-5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link
                          href={l.href}
                          className="text-base text-bone/85 transition-colors hover:text-gold"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          className="text-base text-bone/85 transition-colors hover:text-gold"
                        >
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* legal strip */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-bone/20 pt-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/75">
            Founded on lineage
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/75">
            © {new Date().getFullYear()} Oraculum. All decisions reserved.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/75">
            Components by{" "}
            <a
              href="https://rareui.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-bone/40 underline-offset-4 transition-colors hover:text-gold"
            >
              Rare UI
            </a>
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/75">
            SOC 2 Type II · Regional residency
          </p>
        </div>
      </div>
    </footer>
  );
}
