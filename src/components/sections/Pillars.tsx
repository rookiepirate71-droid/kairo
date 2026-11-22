"use client";

import { useEffect, useRef } from "react";
import { ORDERS, plateNumeral } from "@/lib/orders";
import { REVEAL } from "@/lib/reveal-config";
import { numeralFor } from "@/lib/constants";

/**
 * Specimen plates (pass 07): each pillar is a drafted column of its order.
 * At rest a dotted drafting outline; on hover/focus marble pours down the
 * shaft from the capital (wavy liquid front, Bayer-dithered edge, gold-leaf
 * line, sparkles), then part labels fade in with leader lines.
 *
 * Engine ported from `handoff/reference/pillars-plates-demo.html`; orders
 * 3-5 (Tuscan, Composite, Caryatid) extend the sil()/shade() switch.
 */

const SPEED = REVEAL.speed; // cinematic multiplier, shared with the tier cards
const RATE_IN = 2.4;
const RATE_OUT = 3.2;
const SNAP = 0.02;
const CELL = 3;
const PLATE_H = 174; // px, fixed --plate-h so all six plates share one height
const REST_LIGHT = -0.45;

type RGB = readonly [number, number, number];

function rgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

const PAL: RGB[] = [
  "#2b2820",
  "#4a453c",
  "#7d7766",
  "#b3aa92",
  "#d9d0b9",
  "#f1ead9",
].map(rgb);
const GOLD = rgb("#c8a45c");
const BONE = rgb("#f1ead9");
const GHE = rgb("#5a5446");
const GHF = rgb("#1a1813");

/* Bayer 4x4 ordered-dither thresholds, normalised */
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16
);

function hash(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}
function vn(x: number, y: number): number {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi;
  const sx = xf * xf * (3 - 2 * xf),
    sy = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi),
    b = hash(xi + 1, yi),
    c = hash(xi, yi + 1),
    d = hash(xi + 1, yi + 1);
  const t1 = a + (b - a) * sx,
    t2 = c + (d - c) * sx;
  return t1 + (t2 - t1) * sy;
}
function dith(v: number, x: number, y: number): number {
  let i = Math.floor(v);
  const f = v - i;
  if (i < 0) return 0;
  if (f > BAY[(y & 3) * 4 + (x & 3)]!) i++;
  return i > 5 ? 5 : i;
}

/* K kinds: 1 fluted shaft, 2 flat slab, 3 curved (echinus/torus/bell),
   4 volute ring, 5 acanthus, 6 dark egg hole, 7 drape pleat (Caryatid),
   8 flesh (Caryatid head/neck/arms) */
let K = 0,
  U = 0,
  HW = 1,
  PER = 3;

function sil(o: number, x: number, y: number, cx: number): void {
  const dx = x - cx,
    ax = dx < 0 ? -dx : dx;
  K = 0;
  U = dx;
  if (o <= 2) {
    silClassical(o, ax, y);
    return;
  }
  if (o === 3) {
    silTuscan(ax, y);
    return;
  }
  if (o === 4) {
    silComposite(ax, y);
    return;
  }
  silCaryatid(ax, y);
}

function put(kind: number, hw: number): void {
  K = kind;
  HW = hw;
}

function silClassical(o: number, ax: number, y: number): void {
  let h: number, dd: number;
  if (y >= 49) {
    h = y < 52 ? 20 : y < 55 ? 24 : 28;
    if (ax <= h) put(2, h);
    return;
  }
  if (o > 0 && y >= 44) {
    h = y === 46 ? 7 : 9;
    if (ax <= h) put(y === 46 ? 2 : 3, h);
    return;
  }
  if (o === 0) {
    if (y >= 6 && y <= 7) {
      if (ax <= 12) put(2, 12);
      return;
    }
    if (y >= 8 && y <= 10) {
      h = 8 + (10 - y);
      if (ax <= h) put(3, h);
      return;
    }
    if (y === 11) {
      if (ax <= 8) put(2, 8);
      return;
    }
    if (y >= 12) {
      if (ax <= 8) put(1, 8);
    }
    return;
  }
  if (o === 1) {
    if (y === 6) {
      if (ax <= 11) put(2, 11);
      return;
    }
    if (y >= 7 && y <= 13) {
      dd = Math.hypot(ax - 11, y - 10);
      if (dd <= 3.4 && (dd >= 2 || dd <= 0.8)) {
        put(4, 3);
        return;
      }
    }
    if (y >= 7 && y <= 8) {
      if (ax <= 14) put(2, 14);
      return;
    }
    if (y >= 9 && y <= 11) {
      if (ax <= 8) put(y === 10 && ax % 3 === 1 ? 6 : 3, 8);
      return;
    }
    if (y === 12) {
      if (ax <= 7) put(2, 7);
      return;
    }
    if (y >= 13 && y <= 43) {
      if (ax <= 7) put(1, 7);
    }
    return;
  }
  // o === 2 (Corinthian)
  if (y >= 4 && y <= 5) {
    h = 13 - (y - 4);
    if (ax <= h) put(2, h);
    return;
  }
  if (y >= 6 && y <= 10) {
    dd = Math.hypot(ax - 11, y - 8);
    if (dd <= 2.8 && dd >= 1.4) {
      put(4, 3);
      return;
    }
  }
  if (y >= 6 && y <= 16) {
    h = 12 - Math.round((y - 6) * 0.5);
    if (ax <= h) {
      if (y === 12 && (ax + 1) % 5 >= 4) return;
      if (y === 9 && (ax + 2) % 6 >= 4) return;
      put(y >= 9 ? 5 : 3, h);
    }
    return;
  }
  if (y === 17) {
    if (ax <= 7) put(2, 7);
    return;
  }
  if (y >= 18 && y <= 43) {
    if (ax <= 6) put(1, 6);
  }
}

/** Tuscan: plain smooth shaft (no flutes), torus base, unadorned capital. */
function silTuscan(ax: number, y: number): void {
  let h: number;
  if (y >= 49) {
    h = y < 52 ? 20 : y < 55 ? 24 : 28;
    if (ax <= h) put(2, h);
    return;
  }
  if (y >= 45) {
    h = y === 46 ? 7 : y === 47 ? 8 : 9;
    if (ax <= h) put(y >= 46 ? 3 : 2, h);
    return;
  }
  if (y >= 6 && y <= 7) {
    if (ax <= 12) put(2, 12);
    return;
  }
  if (y >= 8 && y <= 10) {
    h = 8 + (10 - y);
    if (ax <= h) put(3, h);
    return;
  }
  if (y === 11) {
    if (ax <= 9) put(2, 9);
    return;
  }
  if (y >= 12 && y <= 43) {
    if (ax <= 9) put(2, 9); // kind 2 = smooth: no fluting in shade()
  }
}

/** Composite: Ionic volutes sitting on a Corinthian acanthus bell. */
function silComposite(ax: number, y: number): void {
  let h: number, dd: number;
  if (y >= 49) {
    h = y < 52 ? 20 : y < 55 ? 24 : 28;
    if (ax <= h) put(2, h);
    return;
  }
  if (y >= 44) {
    h = y === 46 ? 7 : 9;
    if (ax <= h) put(y === 46 ? 2 : 3, h);
    return;
  }
  if (y === 6) {
    if (ax <= 11) put(2, 11);
    return;
  }
  if (y >= 7 && y <= 10) {
    dd = Math.hypot(ax - 11, y - 9);
    if (dd <= 3.4 && (dd >= 2 || dd <= 0.8)) {
      put(4, 3);
      return;
    }
  }
  if (y >= 7 && y <= 8) {
    if (ax <= 14) put(2, 14);
    return;
  }
  if (y >= 9 && y <= 18) {
    h = 12 - Math.round((y - 9) * 0.5);
    if (ax <= h) {
      if (y >= 12 && y <= 16 && (ax + 1) % 5 >= 4) return;
      put(y >= 12 ? 5 : 3, h);
    }
    return;
  }
  if (y === 19) {
    if (ax <= 7) put(2, 7);
    return;
  }
  if (y >= 20 && y <= 43) {
    if (ax <= 6) put(1, 6);
  }
}

/** Caryatid: a draped standing figure replaces the shaft, carrying a
 * basket capital. Abstract at 3px cells — reads as a figure, not a face. */
function silCaryatid(ax: number, y: number): void {
  let h: number;
  if (y >= 49) {
    h = y < 52 ? 18 : y < 55 ? 22 : 26;
    if (ax <= h) put(2, h);
    return;
  }
  if (y >= 44) {
    h = y === 46 ? 6 : 8;
    if (ax <= h) put(y === 46 ? 2 : 3, h);
    return;
  }
  // basket capital resting on the head (top of the plate)
  if (y <= 1) {
    if (ax <= 12) put(2, 12);
    return;
  }
  if (y >= 2 && y <= 4) {
    h = 11 - (y - 2);
    if (ax <= h) put(3, h);
    return;
  }
  // head below the basket
  if (y === 5) {
    if (ax <= 4) put(8, 4);
    return;
  }
  if (y === 6) {
    if (ax <= 5) put(8, 5);
    return;
  }
  if (y === 7) {
    if (ax <= 3) put(8, 3);
    return;
  }
  // neck, shoulders, arms
  if (y === 8) {
    if (ax <= 2) put(8, 2);
    return;
  }
  if (y === 9) {
    if (ax <= 8) put(8, 8);
    return;
  }
  // draped peplum over the body, one relaxed leg in the pleat phase
  if (y >= 10 && y <= 43) {
    put(7, y < 15 ? 9 : 8);
  }
}

let GV = false;
function shade(o: number, x: number, y: number, lx: number, t: number): number {
  const tt = U / (HW + 0.5);
  let v: number, lam: number;
  const tcl = tt > 1 ? 1 : tt < -1 ? -1 : tt;
  const nz = Math.sqrt(1 - tcl * tcl);
  GV = false;
  if (K === 6) return 0.3;
  if (K === 4) return 3.6 + 0.6 * Math.sin(x * 1.7 + y * 1.1);
  if (K === 8) {
    // flesh: gentle cylinder, no flutes
    lam = tcl * lx + nz * 0.7;
    if (lam < 0) lam = 0;
    return 1.6 + lam * 2.6;
  }
  if (K === 7) {
    // drapery: hard vertical pleats
    const pleat = Math.sin((x + (y >= 12 ? 1.5 : 0)) * 2.1);
    return 1.5 + pleat * 0.9 + nz * 0.8 + tcl * lx * 0.4;
  }
  if (K === 2) v = 3.3 + lx * tcl * 0.7;
  else {
    lam = tcl * lx + nz * 0.7;
    if (lam < 0) lam = 0;
    v = 0.5 + lam * 3.6;
    if (K === 1) {
      const ph = ((U + HW) % PER + PER) % PER;
      v +=
        PER === 3
          ? [0.7, -0.5, -0.9][ph]!
          : [0.3, -0.5, -0.9, -0.5][ph]!;
    } else if (K === 5) {
      v += 0.7 * Math.sin(U * 1.2 + (y >= 12 ? 1.5 : 0));
    }
  }
  const n = vn(x * 0.12, y * 0.08 + t * 0.03);
  if (Math.abs(n - 0.5) < 0.03) v -= 0.8;
  GV = Math.abs(vn(x * 0.09 + 7, y * 0.06 + t * 0.02) - 0.5) < 0.014;
  return v;
}

interface PlateState {
  root: HTMLElement;
  plate: HTMLElement;
  cv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  svg: SVGSVGElement;
  o: number;
  P: number;
  tgt: number;
  lx: number;
  tlx: number;
  dirty: boolean;
  Wc: number;
  Hc: number;
  kind: Uint8Array;
  u: Int8Array;
  hw: Uint8Array;
  edge: Uint8Array;
  img: ImageData;
}

function layout(c: PlateState): void {
  const pw = c.plate.clientWidth || 200;
  c.Wc = Math.max(40, Math.floor(pw / CELL));
  c.Hc = Math.floor(PLATE_H / CELL);
  const n = c.Wc * c.Hc,
    cx = Math.floor(c.Wc / 2);
  c.kind = new Uint8Array(n);
  c.u = new Int8Array(n);
  c.hw = new Uint8Array(n);
  c.edge = new Uint8Array(n);
  for (let y = 0; y < c.Hc; y++)
    for (let x = 0; x < c.Wc; x++) {
      sil(c.o, x, y, cx);
      const i = y * c.Wc + x;
      c.kind[i] = K;
      c.u[i] = U;
      c.hw[i] = HW;
    }
  for (let y = 0; y < c.Hc; y++)
    for (let x = 0; x < c.Wc; x++) {
      const i = y * c.Wc + x;
      if (!c.kind[i]) continue;
      if (
        x === 0 ||
        y === 0 ||
        x === c.Wc - 1 ||
        y === c.Hc - 1 ||
        !c.kind[i - 1] ||
        !c.kind[i + 1] ||
        !c.kind[i - c.Wc] ||
        !c.kind[i + c.Wc]
      )
        c.edge[i] = 1;
    }
  c.cv.width = c.Wc;
  c.cv.height = c.Hc;
  c.cv.style.width = `${c.Wc * CELL}px`;
  c.cv.style.height = `${c.Hc * CELL}px`;
  c.cv.style.left = `${(pw - c.Wc * CELL) / 2}px`;
  c.img = c.ctx.createImageData(c.Wc, c.Hc);
  labels(c, pw);
  c.dirty = true;
}

function labels(c: PlateState, pw: number): void {
  const NS = "http://www.w3.org/2000/svg";
  const svg = c.svg,
    cxp = pw / 2;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute("viewBox", `0 0 ${pw} ${PLATE_H}`);
  const defs = ORDERS[c.o]!.labels;
  defs.forEach((l, i) => {
    const side = l.side === "L" ? -1 : 1;
    const y = l.cellY * CELL + CELL / 2;
    const ex = cxp + side * l.cellDist * CELL;
    const tx = cxp + side * (l.cellDist * CELL + 18);
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "plate-lab");
    g.style.transitionDelay = `${i * 220}ms`;
    const ln = document.createElementNS(NS, "line");
    ln.setAttribute("x1", `${ex + side * 2}`);
    ln.setAttribute("x2", `${tx - side * 3}`);
    ln.setAttribute("y1", `${y}`);
    ln.setAttribute("y2", `${y}`);
    ln.setAttribute("stroke", "#7d7766");
    ln.setAttribute("stroke-width", "1");
    const tx2 = document.createElementNS(NS, "text");
    tx2.setAttribute("x", `${tx}`);
    tx2.setAttribute("y", `${y + 3.5}`);
    tx2.setAttribute("text-anchor", side < 0 ? "end" : "start");
    tx2.setAttribute("fill", "#c9c1ae");
    tx2.setAttribute("font-size", "10");
    tx2.setAttribute("letter-spacing", "1");
    tx2.setAttribute("font-family", "var(--font-mono), ui-monospace, monospace");
    tx2.textContent = l.text;
    g.appendChild(ln);
    g.appendChild(tx2);
    svg.appendChild(g);
  });
}

let tm = 0;

function render(c: PlateState): void {
  const Wc = c.Wc,
    Hc = c.Hc,
    d = c.img.data,
    P = c.P,
    t = tm,
    lx = c.lx,
    amp = 0.25 + 0.75 * Math.sin(Math.PI * Math.min(P, 1));
  PER = c.o === 0 ? 3 : 4;
  for (let y = 0; y < Hc; y++)
    for (let x = 0; x < Wc; x++) {
      const i = y * Wc + x,
        o4 = i * 4,
        k = c.kind[i];
      if (!k) {
        d[o4 + 3] = 0;
        continue;
      }
      K = k;
      U = c.u[i]!;
      HW = c.hw[i]!;
      const fy =
        P * (Hc + 14) -
        7 +
        amp * (1.6 * Math.sin(x * 0.32 + t * 2.2) + 0.8 * Math.sin(x * 0.8 - t * 1.6));
      let col: RGB;
      if (y <= fy) {
        if (y > fy - 1.2 && P < 0.97) col = GOLD;
        else {
          const v = shade(c.o, x, y, lx, t);
          col = GV ? GOLD : PAL[dith(v, x, y)]!;
          if (y > fy - 4 && hash(x, y + Math.floor(t * 6)) > 0.94) col = BONE;
        }
      } else {
        if (y <= fy + 3.5 && BAY[(y & 3) * 4 + (x & 3)]! > (y - fy) / 3.5)
          col = PAL[4]!;
        else col = c.edge[i] && ((x + y) & 1) === 0 ? GHE : GHF;
      }
      d[o4] = col[0];
      d[o4 + 1] = col[1];
      d[o4 + 2] = col[2];
      d[o4 + 3] = 255;
    }
  c.ctx.putImageData(c.img, 0, 0);
}

/** Product demo panel: the dashboard mock leaves the Corinthian card. */
function ProductMock() {
  const bars = [34, 52, 41, 66, 58, 79, 71, 88, 84, 96, 91, 100];
  return (
    <div className="mt-12 rounded-sm border border-stone/40 bg-charcoal p-6 md:p-8 text-left">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          Q3 revenue · lineage on
        </span>
        <span className="font-mono text-[10px] text-oxidized">▲ 12.4%</span>
      </div>
      <div className="flex items-end gap-1 h-20 mb-5" aria-hidden="true">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${h}%`,
              background:
                i === bars.length - 1
                  ? "var(--color-terracotta)"
                  : "rgba(169,138,68,0.55)",
            }}
          />
        ))}
      </div>
      <table className="w-full text-[11px] font-mono mb-5" aria-label="Metric breakdown example">
        <tbody>
          <tr className="border-t border-stone/25">
            <td className="py-1.5 text-travertine">Enterprise</td>
            <td className="py-1.5 text-right text-bone">$412k</td>
            <td className="py-1.5 text-right text-oxidized">▲ 8%</td>
          </tr>
          <tr className="border-t border-stone/25">
            <td className="py-1.5 text-travertine">Mid-market</td>
            <td className="py-1.5 text-right text-bone">$238k</td>
            <td className="py-1.5 text-right text-oxidized">▲ 21%</td>
          </tr>
          <tr className="border-t border-stone/25">
            <td className="py-1.5 text-travertine">SMB</td>
            <td className="py-1.5 text-right text-bone">$96k</td>
            <td className="py-1.5 text-right text-terra-deep">▼ 3%</td>
          </tr>
        </tbody>
      </table>
      <div className="flex items-center gap-2 border border-stone/40 rounded-sm px-3 py-2">
        <span className="font-mono text-[11px] text-stone">oracle&gt;</span>
        <span className="font-mono text-[11px] text-bone/80 truncate">
          why did SMB churn spike in August?
        </span>
        <span className="ml-auto font-mono text-[11px] text-oxidized">↵</span>
      </div>
    </div>
  );
}

export default function Pillars() {
  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards: PlateState[] = [];
    let raf = 0;
    let last = performance.now();

    root.querySelectorAll<HTMLElement>("[data-order]").forEach((el) => {
      const plate = el.querySelector<HTMLElement>(".plate-canvas-box");
      const cv = el.querySelector<HTMLCanvasElement>(".plate-canvas");
      const svg = el.querySelector<SVGSVGElement>(".plate-svg");
      if (!plate || !cv || !svg) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      cards.push({
        root: el,
        plate,
        cv,
        ctx,
        svg,
        o: Number(el.dataset.order),
        P: 0,
        tgt: 0,
        lx: REST_LIGHT,
        tlx: REST_LIGHT,
        dirty: true,
        Wc: 0,
        Hc: 0,
        kind: new Uint8Array(0),
        u: new Int8Array(0),
        hw: new Uint8Array(0),
        edge: new Uint8Array(0),
        img: ctx.createImageData(1, 1),
      });
    });

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = dt * SPEED;
      let live = false;
      tm += dt * 0.5;
      for (const c of cards) {
        const prev = c.P;
        if (reduce) {
          c.P = c.tgt;
          c.lx = c.tlx;
        } else {
          c.P +=
            (c.tgt - c.P) * (1 - Math.exp(-s * (c.tgt ? RATE_IN : RATE_OUT)));
          if (Math.abs(c.tgt - c.P) < SNAP) c.P = c.tgt;
          c.lx += (c.tlx - c.lx) * (1 - Math.exp(-dt * 5));
        }
        if (c.P > 0 || c.P !== prev || c.dirty) {
          render(c);
          c.dirty = false;
        }
        c.root.classList.toggle("plate-on", c.P > 0.55);
        c.root.dataset.progress = c.P.toFixed(3); // dev-only instrumentation
        if (!reduce && (c.P > 0 || c.P !== c.tgt)) live = true;
      }
      raf = live ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const cleanups: (() => void)[] = [];
    for (const c of cards) {
      const enter = (e: PointerEvent) => {
        if (e.pointerType === "touch") return; // touch uses tap toggle
        c.tgt = 1;
        kick();
      };
      const move = (e: PointerEvent) => {
        const r = c.root.getBoundingClientRect();
        c.tlx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      };
      const leave = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        c.tgt = 0;
        c.tlx = REST_LIGHT;
        kick();
      };
      const focusIn = () => {
        c.tgt = 1;
        kick();
      };
      const focusOut = () => {
        c.tgt = 0;
        c.tlx = REST_LIGHT;
        kick();
      };
      // touch: tap pours, tapping outside releases
      const tap = (e: PointerEvent) => {
        if (e.pointerType !== "touch") return;
        c.tgt = c.tgt ? 0 : 1;
        kick();
      };
      const outside = (e: PointerEvent) => {
        if (e.pointerType !== "touch") return;
        if (!c.root.contains(e.target as Node) && c.tgt) {
          c.tgt = 0;
          kick();
        }
      };
      c.root.addEventListener("pointerenter", enter);
      c.root.addEventListener("pointermove", move);
      c.root.addEventListener("pointerleave", leave);
      c.root.addEventListener("focusin", focusIn);
      c.root.addEventListener("focusout", focusOut);
      c.root.addEventListener("pointerdown", tap);
      document.addEventListener("pointerdown", outside);
      const ro = new ResizeObserver(() => {
        layout(c);
        kick();
      });
      ro.observe(c.plate);
      layout(c);
      cleanups.push(() => {
        c.root.removeEventListener("pointerenter", enter);
        c.root.removeEventListener("pointermove", move);
        c.root.removeEventListener("pointerleave", leave);
        c.root.removeEventListener("focusin", focusIn);
        c.root.removeEventListener("focusout", focusOut);
        c.root.removeEventListener("pointerdown", tap);
        document.removeEventListener("pointerdown", outside);
        ro.disconnect();
      });
    }
    if (reduce) {
      // static final state: fully poured, labelled, lamp at rest
      for (const c of cards) {
        c.P = 1;
        render(c);
        c.root.classList.add("plate-on");
      }
    }
    kick();

    return () => {
      for (const fn of cleanups) fn();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
  }, []);

  return (
    <section
      id="pillars"
      data-section="pillars"
      className="section-scope coffer-bg py-28 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-oxidized mb-4">
          {numeralFor("pillars")} — The Six Pillars
        </p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-bone mb-14 max-w-xl leading-tight">
          Six pillars hold the product up. All of them are load-bearing.
        </h2>

        <ul ref={rootRef} className="grid grid-cols-1 gap-px bg-stone/30 sm:grid-cols-2 lg:grid-cols-3 border border-stone/30">
          {ORDERS.map((o, i) => (
            <li
              key={o.name}
              data-order={o.order}
              tabIndex={0}
              role="group"
              aria-label={`${o.name}: ${o.benefit}`}
              className="plate-card group bg-ink p-8 md:p-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone mb-2">
                {plateNumeral(i)}
              </p>
              <h3 className="font-display text-2xl md:text-3xl text-bone transition-colors duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)]">
                {o.name}
              </h3>
              <p className="mt-2 text-sm text-travertine leading-relaxed max-w-[36ch]">
                {o.benefit}
              </p>
              <p className="sr-only">{o.sr}</p>
              <div
                className="plate-canvas-box relative mt-3 h-[174px]"
                aria-hidden="true"
              >
                <canvas className="plate-canvas absolute top-0 [image-rendering:pixelated]" />
                <svg className="plate-svg absolute inset-0 h-full w-full overflow-visible pointer-events-none" />
              </div>
            </li>
          ))}
        </ul>

        <ProductMock />
      </div>
    </section>
  );
}
