/* Per-tier stone palette + motion tuning for the liquid-marble card reveal.
   Colours are read from CSS tokens at runtime where possible; these fallbacks
   match globals.css exactly (@theme static keeps them resolveable). */

export type TierId = "citizen" | "senator" | "emperor";

export interface TierTokens {
  id: TierId;
  /** marble body, dark side of the front */
  stoneA: string;
  /** marble body, light side of the front */
  stoneB: string;
  /** vein colour */
  vein: string;
  /** base-layer text colour (bone) */
  textBase: string;
  /** themed-layer text colour (tier foreground) */
  textTheme: string;
  /** sinusoidal strata, Citizen only */
  strata: boolean;
}

export const TIERS: Record<TierId, TierTokens> = {
  citizen: {
    id: "citizen",
    stoneA: "#3a3428",
    stoneB: "#6b5f45",
    vein: "#a87b36",
    textBase: "#ede6d6",
    textTheme: "#f2ead8",
    strata: true,
  },
  senator: {
    id: "senator",
    stoneA: "#5b1a3a",
    stoneB: "#8f3f22",
    vein: "#b08441",
    textBase: "#ede6d6",
    textTheme: "#141210",
    strata: false,
  },
  emperor: {
    id: "emperor",
    stoneA: "#141210",
    stoneB: "#4a453c",
    vein: "#a87b36",
    textBase: "#ede6d6",
    textTheme: "#c8a45c",
    strata: false,
  },
};

/** Reveal motion: exponential ease rates (1/s). In is faster than out. */
export const REVEAL = {
  rateIn: 1.85,
  rateOut: 2.46,
  /** front wobble frequency multiplier */
  wobbleFreq: 6.0,
  /** refraction ripple amplitude, in texture-space units */
  rippleAmp: 0.012,
  /** gold-leaf line width, texture units */
  leafWidth: 0.006,
  /** cursor sheen strength 0..1 */
  sheen: 0.25,
  /** dpr cap for the card canvases */
  maxDpr: 1.5,
} as const;

/** Bayer 4x4 ordered dither matrix, normalised to (n + 0.5) / 16. */
export const BAYER4 = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
].map((n) => (n + 0.5) / 16);
