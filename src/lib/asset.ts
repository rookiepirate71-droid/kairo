/** Base path of the deploy (GitHub Pages serves under /kairo). */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public asset path with the deploy base path (GitHub Pages). */
export function asset(path: string): string {
  return path.startsWith("/") ? `${BASE}${path}` : path;
}
