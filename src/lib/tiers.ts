export type TierId = "citizen" | "senator" | "emperor";

export interface Tier {
  id: TierId;
  latin: string;
  name: string;
  tagline: string;
  price: string;
  unit: string;
  features: readonly string[];
  cta: string;
  href: string;
  /** 1 adds sinusoidal strata to the stone (travertine look) */
  strata: 0 | 1;
}

export interface TierPalette {
  stone: string;
  stoneLight: string;
  vein: string;
  ink: string;
  accent: string;
  baseSurface: string;
  baseInk: string;
  baseAccent: string;
}

export const TIERS: readonly Tier[] = [
  {
    id: "citizen",
    latin: "CIVIS",
    name: "Citizen",
    tagline: "One team, one honest dashboard.",
    price: "$400",
    unit: "/ mo",
    features: ["5 seats included", "20 data sources", "Daily metric refresh"],
    cta: "REQUEST ACCESS",
    href: "#access",
    strata: 1,
  },
  {
    id: "senator",
    latin: "SENATOR",
    name: "Senator",
    tagline: "Companies that run the quarter on Oraculum.",
    price: "$1,200",
    unit: "/ mo",
    features: ["25 seats included", "Unlimited sources", "Streaming refresh + alerts"],
    cta: "REQUEST ACCESS",
    href: "#access",
    strata: 0,
  },
  {
    id: "emperor",
    latin: "IMPERATOR",
    name: "Emperor",
    tagline: "The empire: residency, SSO/SCIM, bespoke rites.",
    price: "By rite",
    unit: "",
    features: ["Unlimited seats", "Regional data residency", "SLA with sacrifice clause"],
    cta: "SPEAK TO THE SENATE",
    href: "#access",
    strata: 0,
  },
] as const;

const HEX = /^#[0-9a-f]{6}$/i;

/** Reads tier tokens from CSS (needs `@theme static` so they are always emitted). */
export function readPalette(tier: Tier): TierPalette {
  const cs = getComputedStyle(document.documentElement);
  const get = (token: string, fallback: string): string => {
    const raw = cs.getPropertyValue(token).trim();
    return HEX.test(raw) ? raw : fallback;
  };
  const p = `--tier-${tier.id}`;
  return {
    stone: get(`${p}-stone`, "#cdbb91"),
    stoneLight: get(`${p}-stone-light`, "#f0e8d2"),
    vein: get(`${p}-vein`, "#8f3f22"),
    ink: get(`${p}-ink`, "#0d0c0a"),
    accent: get(`${p}-accent`, "#8f3f22"),
    baseSurface: get("--color-charcoal", "#141210"),
    baseInk: get("--color-bone", "#ede6d6"),
    baseAccent: get("--color-gold", "#c8a45c"),
  };
}
