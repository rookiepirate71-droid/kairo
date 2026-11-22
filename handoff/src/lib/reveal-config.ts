/**
 * Tier-card reveal timing.
 *
 * `speed` is a global multiplier on every time-based quantity (easing rates,
 * marble flow time, origin and sheen follow). 0.3 is the "cinematic" feel
 * that was approved in review and is the DEFAULT. Set it to 1 for a snappy
 * ~3.3x faster reveal. Do not change it without asking the owner.
 */
export const REVEAL = {
  speed: 0.3,
  /** exponential ease rates per second, before `speed` is applied */
  rateIn: 2.4,
  rateOut: 3.2,
  originFollow: 8,
  sheenFollow: 6,
  /** snap progress to its target when closer than this */
  snapEpsilon: 0.02,
  maxDpr: 1.5,
} as const;
