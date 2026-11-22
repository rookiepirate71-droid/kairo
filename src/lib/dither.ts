/** Ordered 4x4 Bayer matrix, normalized to [0, 1). */
export const BAYER_4X4: number[] = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
].map((v) => v / 16);

/**
 * Dither threshold for pixel (x, y): compare a source value against this to
 * decide on/off ink. Wraps for any resolution.
 */
export function bayerThreshold(x: number, y: number): number {
  return BAYER_4X4[(y % 4) * 4 + (x % 4)] ?? 0;
}
