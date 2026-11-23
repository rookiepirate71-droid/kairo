/* Procedural stone / papyrus textures, drawn on an offscreen canvas and
   returned as data URLs. Client-only: callers must render these after
   mount (background-image applied via state), never during SSR. */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Smooth value noise on a coarse lattice, bilinear-interpolated. */
function valueNoiseField(rand: () => number, cells: number): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y <= cells; y++) {
    const row: number[] = [];
    for (let x = 0; x <= cells; x++) row.push(rand());
    grid.push(row);
  }
  return grid;
}

function sampleNoise(
  grid: number[][],
  u: number,
  v: number,
  cells: number,
): number {
  const gx = u * cells;
  const gy = v * cells;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = gx - x0;
  const fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = grid[y0]?.[x0] ?? 0;
  const b = grid[y0]?.[x0 + 1] ?? 0;
  const c = grid[y0 + 1]?.[x0] ?? 0;
  const d = grid[y0 + 1]?.[x0 + 1] ?? 0;
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/* Aged cream parchment-stone: pale ivory ground with soft mottling and
   sparse dark flyspecks (age spots), matching the carved-tabulae
   artifact. One texture per tablet slide. */
export function stoneTexture(seed: number, w = 720, h = 360): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const rand = mulberry32(seed * 7919 + 17);
  const cloud = valueNoiseField(rand, 6);
  const blotch = valueNoiseField(rand, 4);

  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const n = sampleNoise(cloud, u, v, 6);
      const m = sampleNoise(blotch, u, v, 4);
      // pale ivory ground with gentle mottling (very low contrast)
      const shade = (n - 0.5) * 18 + (m - 0.5) * 26;
      const r = 233 + shade;
      const g = 226 + shade;
      const b = 205 + shade * 0.9;
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // flyspecks: sparse small dark age spots, some clustered
  for (let i = 0; i < 90; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 0.6 + rand() * 2.2;
    ctx.fillStyle = `rgba(72, 52, 30, ${0.12 + rand() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // a few larger soft stains
  for (let i = 0; i < 6; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 14 + rand() * 42;
    const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
    g2.addColorStop(0, `rgba(120, 95, 55, ${0.05 + rand() * 0.07})`);
    g2.addColorStop(1, "rgba(120, 95, 55, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return canvas.toDataURL("image/png");
}

/* Papyrus: paler fibre sheet with horizontal fibres, sheet seams,
   stains and a burnt umber rim. Used by the Orders comparison scroll. */
export function papyrusTexture(w = 960, h = 640): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const rand = mulberry32(424242);

  // warm papyrus ground
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#e9dcc0");
  grad.addColorStop(0.5, "#e3d3b0");
  grad.addColorStop(1, "#dcc9a2");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // fibre grain: short horizontal strokes
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < 2400; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const len = 6 + rand() * 26;
    ctx.strokeStyle = rand() > 0.5 ? "#8b6f3c" : "#f3e8cd";
    ctx.lineWidth = 0.6 + rand() * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (rand() - 0.5) * 1.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // age stains: soft radial blotches
  for (let i = 0; i < 9; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 40 + rand() * 130;
    const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
    g2.addColorStop(0, `rgba(150, 112, 58, ${0.06 + rand() * 0.08})`);
    g2.addColorStop(1, "rgba(150, 112, 58, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // sheet seams: vertical glued strips every ~w/6
  ctx.strokeStyle = "rgba(120, 92, 50, 0.28)";
  ctx.lineWidth = 1.4;
  for (let i = 1; i <= 5; i++) {
    const x = Math.round((w / 6) * i) + (rand() - 0.5) * 6;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // burnt rim: dark wash fading inward from each edge
  const rim = 26;
  const edges: Array<[number, number, number, number, [number, number, number, number]]> = [
    [0, 0, w, rim, [rim, rim, rim, 0]],
    [0, h - rim, w, rim, [rim, h - rim, rim, h]],
    [0, 0, rim, h, [rim, 0, 0, 0]],
    [w - rim, 0, rim, h, [w - rim, 0, w, 0]],
  ];
  for (const [x0, y0, cw, ch, [gx0, gy0, gx1, gy1]] of edges) {
    const g3 = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
    g3.addColorStop(0, "rgba(88, 58, 26, 0.4)");
    g3.addColorStop(1, "rgba(88, 58, 26, 0)");
    ctx.fillStyle = g3;
    ctx.fillRect(x0, y0, cw, ch);
  }
  return canvas.toDataURL("image/png");
}
