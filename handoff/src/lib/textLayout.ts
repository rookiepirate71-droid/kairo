/**
 * Greedy word wrap. `measure` returns the rendered width of a string, so the
 * helper stays pure and testable (pass `(s) => ctx.measureText(s).width`).
 * A single word wider than `maxWidth` is kept on its own line, never split.
 */
export function wrapLines(
  measure: (text: string) => number,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && measure(next) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}
