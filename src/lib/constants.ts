export const HERO_TEXT = "SEVEN VEILS";

export const MANIFESTO_ID = "manifesto";

/**
 * DOM order of the numbered content sections. Roman numerals are generated
 * from the index of this array — they can never skip a number. The marquee
 * strip is unnumbered decoration and deliberately absent.
 */
export const SECTION_IDS = [
  "manifesto",
  "pillars",
  "temple",
  "tesserae",
  "tablets",
  "orders",
  "senate",
  "access",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
] as const;

/** Numeral for a section id, derived from its position in SECTION_IDS. */
export function numeralFor(id: SectionId): string {
  const i = SECTION_IDS.indexOf(id);
  if (i < 0) return "";
  const ones = (i + 1) % 10;
  const tens = Math.floor((i + 1) / 10);
  const TENS = ["", "X", "XX", "C"] as const;
  const ONES = [
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
  ] as const;
  return `${TENS[tens] ?? ""}${ONES[ones] ?? ""}` || ROMAN[i] || "";
}

export interface Pillar {
  name: string;
  benefit: string;
  /** tiny pixel-art glyph drawn on an 8x8 grid; renders as ASCII on hover */
  pixels: string[];
  ascii: string;
}

export const PILLARS: Pillar[] = [
  {
    name: "Doric",
    benefit: "Ingest from 40+ sources — warehouses, event streams, CRM — in minutes.",
    pixels: [
      "00000000",
      "01111110",
      "01000010",
      "01000010",
      "01000010",
      "01000010",
      "01111110",
      "00000000",
    ],
    ascii: "┌──────┐\n│ ▓▓▓▓ │\n│ ▓  ▓ │\n└──────┘",
  },
  {
    name: "Ionic",
    benefit: "Column-aware metrics: define revenue once, every chart agrees.",
    pixels: [
      "00000000",
      "00111100",
      "01111110",
      "00100100",
      "00100100",
      "01111110",
      "00111100",
      "00000000",
    ],
    ascii: " ╭────╮ \n ╰┬──┬╯ \n  │▓▓│  \n ╭┴──┴╮ ",
  },
  {
    name: "Corinthian",
    benefit: "Prompt your data in plain language; get SQL and a chart back.",
    pixels: [
      "00000000",
      "01111110",
      "01011010",
      "01011010",
      "01000010",
      "01100110",
      "01111110",
      "00000000",
    ],
    ascii: "╔══════╗\n║ ╩▓╩ ║\n║ ┌──┐ ║\n╚══════╝",
  },
  {
    name: "Tuscan",
    benefit: "Alerts that fire on metric shifts, not on dashboard refreshes.",
    pixels: [
      "00000000",
      "00100100",
      "01111110",
      "01111110",
      "01111110",
      "00100100",
      "00000000",
      "00000000",
    ],
    ascii: "  ╱╲   \n ╱ ▓▓╲  \n ╲▓▓▓╱  \n  ╲▓╱   ",
  },
  {
    name: "Composite",
    benefit: "Every number carries lineage back to the row that produced it.",
    pixels: [
      "00000000",
      "01111110",
      "01000010",
      "01111110",
      "01011010",
      "01000010",
      "01111110",
      "00000000",
    ],
    ascii: "┌─┬──┬─┐\n│ │▓▓│ │\n├─┴──┴─┤\n└──────┘",
  },
  {
    name: "Caryatid",
    benefit: "SOC 2 Type II, SSO/SCIM, regional data residency — load-bearing.",
    pixels: [
      "00000000",
      "01111110",
      "01011010",
      "01111110",
      "01000010",
      "01000010",
      "01111110",
      "00000000",
    ],
    ascii: "▛▀▀▀▀▀▜\n▌ ▓▓▓ ▐\n▌ ▓▓▓ ▐\n▙▄▄▄▄▄▟",
  },
] as const;

export const TESSERAE = [
  {
    id: "vase",
    title: "The Vase Tessera",
    image: "/generated/tessera-vase.jpg",
    alt: "Black-figure amphora with terracotta warriors on a Tyrian purple ground",
    description:
      "Data modeling workshops for analytics teams. Your warehouse, re-thrown until the schemas hold water.",
  },
  {
    id: "mosaic",
    title: "The Mosaic Tessera",
    image: "/generated/tessera-mosaic.jpg",
    alt: "Roman mosaic of a lion rendered in stone tesserae",
    description:
      "The flagship dashboard build: your KPIs as one composed surface, every tile traced to source.",
  },
  {
    id: "statue",
    title: "The Statue Tessera",
    image: "/generated/tessera-statue.jpg",
    alt: "Marble bust of a senator lit from one side",
    description:
      "Executive reporting carved in silence. One monthly brief, no negotiation with the numbers.",
  },
  {
    id: "emperor",
    title: "The Emperor Tessera",
    image: "/generated/tessera-emperor.jpg",
    alt: "Marble statue of an emperor crowned in gold on a purple ground",
    description:
      "Board-ready command review: the quarter rendered in one screen your directors can read unaided.",
  },
  {
    id: "constellation",
    title: "The Star Tessera",
    image: "/generated/tessera-constellation.jpg",
    alt: "Antique star chart with engraved constellations",
    description:
      "Anomaly charting across the year — seasonality mapped before it surprises you at close.",
  },
  {
    id: "laurel",
    title: "The Laurel Tessera",
    image: "/generated/tessera-laurel.jpg",
    alt: "Golden laurel wreath bound with a purple ribbon",
    description:
      "Onboarding and enablement. Your analysts crowned power users within their first quarter.",
  },
  {
    id: "coin",
    title: "The Coin Tessera",
    image: "/generated/tessera-coin.jpg",
    alt: "Worn Roman denarius coin in raking light",
    description:
      "Revenue attribution: every dollar struck, circulated, lost, found — and read twice.",
  },
] as const;

export interface Plan {
  id: string;
  name: string;
  monthly: number | null;
  annual: number | null;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "citizen",
    name: "Citizen",
    monthly: 400,
    annual: 340,
    blurb: "For a single team that wants one honest dashboard.",
    features: [
      "5 seats included",
      "20 data sources",
      "Daily metric refresh",
      "Community auguries (support)",
    ],
    cta: "Request Access",
  },
  {
    id: "senator",
    name: "Senator",
    monthly: 1200,
    annual: 1020,
    blurb: "For companies that run the quarter on Oraculum.",
    features: [
      "25 seats included",
      "Unlimited sources",
      "Streaming refresh + alerts",
      "Lineage on every metric",
      "Dedicated augur (support)",
    ],
    cta: "Request Access",
    featured: true,
  },
  {
    id: "emperor",
    name: "Emperor",
    monthly: null,
    annual: null,
    blurb: "For the empire: residency, SSO/SCIM, bespoke rites.",
    features: [
      "Unlimited seats",
      "Regional data residency",
      "SSO / SCIM provisioning",
      "Custom onboarding program",
      "SLA with sacrifice clause",
    ],
    cta: "Talk to the Senate",
    featured: false,
  },
] as const;

export const COMPARISON: {
  capability: string;
  citizen: string;
  senator: string;
  emperor: string;
}[] = [
  {
    capability: "Data sources",
    citizen: "20",
    senator: "Unlimited",
    emperor: "Unlimited",
  },
  {
    capability: "Refresh cadence",
    citizen: "Daily",
    senator: "Streaming",
    emperor: "Streaming",
  },
  {
    capability: "Metric lineage",
    citizen: "—",
    senator: "Included",
    emperor: "Included",
  },
  {
    capability: "Anomaly alerts",
    citizen: "—",
    senator: "Included",
    emperor: "Custom rites",
  },
  {
    capability: "SSO / SCIM",
    citizen: "—",
    senator: "—",
    emperor: "Included",
  },
  {
    capability: "Data residency",
    citizen: "—",
    senator: "—",
    emperor: "Regional",
  },
];

export const TABLETS = [
  {
    quote:
      "Oraculum replaced four dashboards and one weekly argument. The lineage view ended the 'whose number is right' debate in a fortnight.",
    name: "Alcmaene Voss",
    role: "VP Data, Meridian Freight",
  },
  {
    quote:
      "I asked it in plain English for cohort retention by plan. It wrote better SQL than our last two hires would admit to.",
    name: "Barus Chen",
    role: "Head of Analytics, Palatine Health",
  },
  {
    quote:
      "The anomaly alert found a broken pricing page at 2am. It paid for the year before the quarter ended.",
    name: "Timon Okafor",
    role: "CFO, Aegina Logistics",
  },
  {
    quote:
      "Our board deck is now one screen. Nobody has asked for a 'quick export' since March.",
    name: "Phaino Marsh",
    role: "Chief of Staff, Corvus Security",
  },
  {
    quote:
      "Migration took an afternoon. The lineage back to source rows is what sold our compliance team.",
    name: "Melitta Sørensen",
    role: "Director of BI, Laurentine Bank",
  },
] as const;

export const FAQ = [
  {
    q: "How is this different from the BI tool we already pay for?",
    a: "Dashboards show you numbers; Oraculum carries decisions. Metrics are defined once, carry lineage to source rows, and alert when they shift — so the tool becomes a record of decisions, not a gallery of charts.",
  },
  {
    q: "How long does implementation actually take?",
    a: "Most teams connect their warehouse and see a first governed dashboard the same day. Full migration from a legacy BI stack averages two weeks, including metric definitions and alerts.",
  },
  {
    q: "Is our data used to train models?",
    a: "No. Your data processes in your region, is never used for training, and every query is logged. SOC 2 Type II and regional residency are available on the Emperor tier.",
  },
  {
    q: "What does 'request access' mean — is there a waitlist?",
    a: "We onboard every customer with a working session, not a credit card form. Requests are answered within one business day and access is typically live within the week.",
  },
  {
    q: "Do you replace our warehouse or data stack?",
    a: "No. Oraculum sits on top of what you already run — Snowflake, BigQuery, Postgres, Redshift, dbt — and reads event streams and SaaS sources alongside them.",
  },
  {
    q: "Is there really a sacrifice clause in the SLA?",
    a: "There is not. It is the only promise in this document we cannot keep, and we are at peace with that.",
  },
];

export const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Pillars", href: "#pillars" },
  { label: "Tesserae", href: "#tesserae" },
  { label: "Tablets", href: "#tablets" },
  { label: "Orders", href: "#orders" },
  { label: "Senate", href: "#senate" },
  { label: "Request Access", href: "#access" },
  { label: "Explore", href: "/explore" },
];

export const MARQUEE_ITEMS = [
  "know thy data",
  "nothing in excess",
  "lineage brings trust",
  "count no one happy",
  "the wiser query",
] as const;

/* ------------------------------------------------------------------ */
/* Explore — the library of artifacts, modeled on a premium gallery    */
/* ------------------------------------------------------------------ */

export type ExploreCategory = "Build" | "Pillar" | "Rite";

export interface ExploreItem {
  id: string;
  title: string;
  category: ExploreCategory;
  /** meta line, rendered as "Oraculum · {kind}" */
  kind: string;
  blurb: string;
  image?: string;
  imageAlt?: string;
  /** 8x8 pixel glyph for non-image cards */
  pixels?: string[];
  /** most-consulted strip on the explore page */
  featured?: boolean;
}

export const EXPLORE_ITEMS: ExploreItem[] = [
  // Builds — the seven tesserae
  ...TESSERAE.map((t) => ({
    id: `build-${t.id}`,
    title: t.title,
    category: "Build" as const,
    kind: t.title.replace("The ", "").replace(" Tessera", ""),
    blurb: t.description,
    image: t.image,
    imageAlt: t.alt,
    featured: t.id === "mosaic" || t.id === "emperor",
  })),
  // Pillars — the six capabilities
  ...PILLARS.map((p) => ({
    id: `pillar-${p.name.toLowerCase()}`,
    title: `${p.name} Engine`,
    category: "Pillar" as const,
    kind: p.name,
    blurb: p.benefit,
    pixels: p.pixels,
    featured: p.name === "Corinthian",
  })),
  // Rites — the four-step workflow, as cards
  {
    id: "rite-connect",
    title: "The Rite of Connection",
    category: "Rite" as const,
    kind: "Connect",
    blurb: "40+ sources bound to one governed layer in an afternoon.",
    pixels: [
      "00000000",
      "00111100",
      "01111110",
      "01011010",
      "01011010",
      "01111110",
      "00111100",
      "00000000",
    ],
    featured: true,
  },
  {
    id: "rite-define",
    title: "The Rite of Definition",
    category: "Rite" as const,
    kind: "Define",
    blurb: "Each metric named once, with lineage carried everywhere.",
    pixels: [
      "00000000",
      "01111110",
      "01000010",
      "01100110",
      "01100110",
      "01000010",
      "01111110",
      "00000000",
    ],
  },
  {
    id: "rite-ask",
    title: "The Rite of Asking",
    category: "Rite" as const,
    kind: "Ask",
    blurb: "Plain language in, governed SQL and a chart out.",
    pixels: [
      "00000000",
      "00100100",
      "01111110",
      "01100110",
      "01100110",
      "01111110",
      "00100100",
      "00000000",
    ],
  },
  {
    id: "rite-hear",
    title: "The Rite of Hearing",
    category: "Rite" as const,
    kind: "Alert",
    blurb: "Metric shifts announced to the owner, not the void.",
    pixels: [
      "00000000",
      "00011000",
      "00111100",
      "01111110",
      "01111110",
      "00100100",
      "00000000",
      "00000000",
    ],
  },
] as const;

export const EXPLORE_CATEGORIES: ("All" | ExploreCategory)[] = [
  "All",
  "Build",
  "Pillar",
  "Rite",
];

/** Numbered flow on the explore page: browse → member → build. */
export const EXPLORE_STEPS = [
  {
    title: "Consult the library",
    body: "Every build, pillar and rite in one gallery, reviewed by the college of augurs.",
    tags: ["Builds", "Pillars", "Rites"],
  },
  {
    title: "Join an order",
    body: "One membership seats your whole team and licenses every artifact for commercial work.",
    tags: ["Citizen", "Senator", "Emperor"],
  },
  {
    title: "Put it to work",
    body: "Dashboards, alerts and lineage live in your warehouse within the week.",
    tags: [".sql", ".yaml", "live"],
  },
] as const;

/* MarbleScene shader/loop tuning. Distances are device px unless noted;
   px values are scaled by dpr where the shader consumes them. */
export const SCENE = {
  maxDpr: 1.75,
  fadeSeconds: 2,
  touchFrameMs: 1000 / 30,
  lensFollow: 8, // 1/s, higher = snappier
  lensVw: 0.15,
  lensMinPx: 140,
  lensMaxPx: 240,
  lensFeatherPx: 90,
  cellDivisor: 140, // cell width = viewport width / this, clamped
  cellMinPx: 8,
  cellMaxPx: 14,
} as const;
