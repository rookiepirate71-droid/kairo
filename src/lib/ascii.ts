/**
 * Image-to-ASCII conversion, engine-agnostic.
 *
 * `lumaAt` samples brightness in [0, 1] at (x, y); the returned ASCII is
 * rendered dark-on-light, so dark pixels map to dense glyphs and bright
 * pixels to sparse ones.
 */
export const ASCII_RAMP_DARK = "@%#*+=-:. ";

export interface ToAsciiOptions {
  cols?: number;
  aspect?: number;
  ramp?: string;
  lumaAt: (x: number, y: number) => number;
}

export function toAscii({
  cols = 80,
  aspect = 0.5,
  ramp = ASCII_RAMP_DARK,
  lumaAt,
}: ToAsciiOptions): string {
  const charCount = cols * aspect;
  let out = "";
  for (let y = 0; y < charCount; y++) {
    for (let x = 0; x < cols; x++) {
      const luma = lumaAt(x / cols, y / charCount);
      const idx = Math.min(
        ramp.length - 1,
        Math.max(0, Math.floor(luma * ramp.length)),
      );
      out += ramp[idx];
    }
    if (y < charCount - 1) out += "\n";
  }
  return out;
}
