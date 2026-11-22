"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { numeralFor } from "@/lib/constants";

/**
 * The Temple (pass 08): a layered pixel scene — dusk sky with drifting
 * stars, two mountain ranges, the temple with an inner flame, cypress
 * trees and ground haze — drawn on one 160x90 canvas. Scroll scrubs the
 * scene depth (each layer at its own rate); a lamp of light sweeps the
 * columns; pointer position parallaxes the layers horizontally.
 *
 * Engine ported from `handoff/reference/temple-scene-demo.html`.
 */

type RGB = readonly [number, number, number];

function rgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}
function pal(list: string[]): RGB[] {
  return list.map(rgb);
}

const SKY = pal([
  "#0d0c0a",
  "#150b14",
  "#240c1c",
  "#3a1230",
  "#5b1a3a",
  "#8f3f22",
  "#c8a45c",
]);
const MF = pal(["#2e0c1f", "#3a1230", "#4a1a3c", "#6e2144"]); // far mountains
const MN = pal(["#120a12", "#1a0d17", "#241020", "#3a1230"]); // near mountains
const TS = pal([
  "#2b2820",
  "#4a453c",
  "#7d7766",
  "#b3aa92",
  "#d9d0b9",
  "#f1ead9",
]); // travertine
const PU = pal(["#2e0c1f", "#3a1230", "#5b1a3a", "#6e2144", "#8f3f22"]); // purple shadow
const GD = pal(["#7a6330", "#a98a44", "#c8a45c", "#e2c27a"]); // gold
const IN = pal(["#0d0c0a", "#1c1409", "#3a2a12", "#7a5a24", "#c8a45c"]); // interior
const FG = pal(["#0a090a", "#120a12"]); // cypress/ground
const BONE = rgb("#ede6d6");

const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16
);

function hsh(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}
function pick(p: RGB[], v: number, x: number, y: number): RGB {
  let i = Math.floor(v);
  const f = v - i;
  if (i < 0) return p[0]!;
  if (f > BAY[(y & 3) * 4 + (x & 3)]!) i++;
  return p[i > p.length - 1 ? p.length - 1 : i]!;
}

const W = 160,
  H = 90;
const COLX = [44, 57, 70, 82, 95, 108];
function colIdx(tx: number): number {
  for (let i = 0; i < 6; i++) {
    const u = tx - COLX[i]!;
    if (u >= 0 && u <= 7) return i;
  }
  return -1;
}

interface Scene {
  p: number; // scroll progress 0..1
  mx: number; // pointer parallax -1..1 (eased)
  tmx: number; // pointer target
  t: number; // clock
}

function temple(
  s: Scene,
  tx: number,
  ty: number,
  x: number,
  y: number,
  lx: number,
  flick: number
): RGB | null {
  if (ty < 10 || ty > 81) return null;
  const L = 1.5 * Math.exp(-((tx - lx) * (tx - lx)) / 576),
    ax = Math.abs(tx - 80);
  let u: number;
  if (ty <= 23) {
    const hw = 3 + (ty - 10) * 3;
    if (ax > hw) return null;
    if (ty >= 14 && ty <= 22 && ax <= hw - 5) {
      if (ax + Math.abs(ty - 18) <= 2)
        return tx === 80 && ty === 18 ? IN[0]! : pick(GD, 1.6 + L * 0.5, x, y);
      return pick(PU, 1.3 + (ty - 14) * 0.15 + L * 0.5, x, y);
    }
    return pick(TS, 3 + L + (ax > hw - 2 ? 0.5 : 0) + (ty === 10 ? 0.8 : 0), x, y);
  }
  if (ty <= 25) {
    if (tx < 38 || tx > 121) return null;
    return pick(ty === 24 ? GD : TS, ty === 24 ? 1.4 + L : 3.3 + L, x, y);
  }
  if (ty <= 30) {
    if (tx < 42 || tx > 117) return null;
    const m = (tx - 42) % 8;
    if (m >= 1 && m <= 4)
      return pick(TS, 3.1 + L + (m === 1 ? 0.4 : 0) - (m === 4 ? 0.3 : 0), x, y);
    return pick(PU, 0.9 + L * 0.35, x, y);
  }
  if (ty <= 33) {
    if (tx < 42 || tx > 117) return null;
    return pick(TS, 2.5 + L + (ty === 31 ? 0.6 : 0), x, y);
  }
  if (ty <= 72) {
    if (ty <= 36) {
      for (let i = 0; i < 6; i++) {
        const a0 = ty === 36 ? COLX[i]! : COLX[i]! - 1,
          a1 = ty === 36 ? COLX[i]! + 7 : COLX[i]! + 8;
        if (tx >= a0 && tx <= a1)
          return pick(TS, (ty === 36 ? 2.4 : 3.5) + L, x, y);
      }
    } else {
      const i = colIdx(tx);
      if (i >= 0) {
        u = tx - COLX[i]!;
        const tn = (u - 3.5) / 4,
          nz = Math.sqrt(1 - tn * tn),
          sg = lx > tx ? 1 : -1;
        const vv =
          0.7 +
          (nz * 0.55 + tn * sg * 0.6) * 2.6 +
          L -
          (ty - 37) / 36 * 0.4 -
          (u & 1 ? 0.6 : 0);
        return pick(TS, vv, x, y);
      }
    }
    if (tx >= 44 && tx <= 115 && ty >= 34) {
      const fx = tx - 80,
        fy = ty - 66,
        d2 = fx * fx + fy * fy;
      if ((tx === 79 || tx === 80) && ty >= 63 && ty <= 67)
        return pick(GD, (ty < 65 ? 2.6 : 1.6) + (flick - 0.8), x, y);
      return pick(IN, 0.2 + 3.2 * Math.exp(-d2 / 40) * flick, x, y);
    }
    return null;
  }
  if (ty <= 75) {
    if (tx < 40 || tx > 120) return null;
    return pick(TS, 2.4 + L * 0.9 + (ty === 73 ? 0.7 : 0), x, y);
  }
  if (ty <= 78) {
    if (tx < 36 || tx > 124) return null;
    return pick(TS, 2.1 + L * 0.9 + (ty === 76 ? 0.7 : 0), x, y);
  }
  if (tx < 32 || tx > 128) return null;
  return pick(TS, 1.8 + L * 0.9 + (ty === 79 ? 0.7 : 0), x, y);
}

const TR: [number, number, number][] = [
  [12, 26, 6.5],
  [148, 26, 6.5],
  [29, 44, 5],
  [131, 44, 5],
];

function frame(
  s: Scene,
  D: Uint8ClampedArray,
  topF: Float32Array,
  topN: Float32Array
): void {
  const off = (d: number): [number, number] => [
    Math.round(s.mx * d * 4),
    Math.round(-s.p * d * 8),
  ];
  const lx = 10 + s.p * 140 + s.mx * 20;
  const oS = off(0.1),
    oF = off(0.35),
    oN = off(0.55),
    oT = off(0.8),
    oG = off(1.3);
  for (let x = 0; x < W; x++) {
    topF[x] =
      58 +
      oF[1] +
      5 * Math.sin((x - oF[0]) * 0.06 + 1) +
      3 * Math.sin((x - oF[0]) * 0.17) +
      1.6 * Math.sin((x - oF[0]) * 0.43);
    topN[x] =
      67 +
      oN[1] +
      4 * Math.sin((x - oN[0]) * 0.05 + 3) +
      2.4 * Math.sin((x - oN[0]) * 0.21) +
      1.2 * Math.sin((x - oN[0]) * 0.5);
  }
  const flick = 0.8 + 0.2 * Math.sin(s.t * 9) + 0.1 * Math.sin(s.t * 23);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const gx = (x - 80) / 52,
        gy = (y - 80) / 34,
        glow = Math.exp(-(gx * gx + gy * gy)) * (2.8 + 1.6 * s.p);
      let c: RGB;
      const v =
        Math.pow(Math.max(0, Math.min(1, (y - oS[1]) / 78)), 1.5) * 3.1 + glow;
      if (
        v < 1.7 &&
        hsh(x * 1.3 - oS[0], y * 1.7) > 0.9955 &&
        Math.sin(s.t * 2 + hsh(x, y) * 40) > -0.1
      )
        c = BONE;
      else c = pick(SKY, v, x, y);
      if (y >= topF[x]!)
        c = pick(
          MF,
          0.9 + 1.8 * Math.exp(-(y - topF[x]!) / 7) + glow * 0.9,
          x,
          y
        );
      if (y >= topN[x]!)
        c = pick(
          MN,
          0.3 + 1.2 * Math.exp(-(y - topN[x]!) / 6) + glow * 0.4,
          x,
          y
        );
      const fa =
        0.34 *
        Math.max(0, 1 - Math.abs(y - 77) / 9) *
        (0.6 + 0.4 * Math.sin(x * 0.07 + s.t * 0.3));
      if (fa > 0 && hsh(x, y * 3) < fa) c = MF[3]!;
      const tc = temple(s, x - oT[0], y - oT[1], x, y, lx, flick);
      if (tc) c = tc;
      const fxx = x - oG[0],
        fyy = y - oG[1];
      for (let k = 0; k < 4; k++) {
        const tr = TR[k]!;
        if (fyy >= tr[1] && fyy <= 98) {
          const q = (fyy - (tr[1] + 98) / 2) / ((98 - tr[1]) / 2);
          const hw2 =
            tr[2] * Math.sqrt(Math.max(0, 1 - q * q)) + (hsh(fxx, fyy) > 0.82 ? 0.9 : 0);
          if (Math.abs(fxx - tr[0]) <= hw2) c = FG[hsh(fxx * 2, fyy) > 0.7 ? 1 : 0]!;
        }
      }
      if (y >= 86) c = FG[0]!;
      const i = (y * W + x) * 4;
      D[i] = c[0];
      D[i + 1] = c[1];
      D[i + 2] = c[2];
      D[i + 3] = 255;
    }
  }
  for (let k = 0; k < 36; k++) {
    const px = Math.floor((hsh(k, 1) * W + s.t * (2 + hsh(k, 2) * 4)) % W);
    const py = Math.floor(H - ((hsh(k, 3) * H + s.t * (3 + hsh(k, 4) * 5)) % H));
    if (py < 0 || py >= H || Math.sin(s.t * 1.5 + k * 2.3) < 0) continue;
    const cc = k & 1 ? BONE : GD[2]!;
    const i = (py * W + px) * 4;
    D[i] = cc[0];
    D[i + 1] = cc[1];
    D[i + 2] = cc[2];
  }
}

export default function ParallaxTemple() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = canvasRef.current,
      stage = stageRef.current;
    if (!cv || !stage) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.width = W;
    cv.height = H;
    const img = ctx.createImageData(W, H),
      D = img.data;
    const topF = new Float32Array(W),
      topN = new Float32Array(W);
    const s: Scene = { p: 0.35, mx: 0, tmx: 0, t: 0 };

    const draw = () => {
      frame(s, D, topF, topN);
      ctx.putImageData(img, 0, 0);
    };

    let raf = 0,
      last = performance.now(),
      visible = true;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      s.t += dt;
      s.mx += (s.tmx - s.mx) * (1 - Math.exp(-dt * 3));
      draw();
      if (visible && !document.hidden) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    const start = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver((es) => {
      visible = es[0]?.isIntersecting ?? false;
      if (visible && !reduced) start();
    });
    io.observe(cv);
    const onVis = () => {
      if (!document.hidden && visible && !reduced) start();
    };
    document.addEventListener("visibilitychange", onVis);

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      s.tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    };
    const onLeave = () => {
      s.tmx = 0;
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);

    let st: ScrollTrigger | undefined;
    if (reduced) {
      // static final state: fully settled scene, flame unlit motion
      s.p = 0.5;
      draw();
    } else {
      // scrub depth from the section's natural travel through the viewport:
      // no pin, no spacer — the scene parallaxes while it scrolls like any
      // other section, so there is no lock, void or jump
      st = ScrollTrigger.create({
        trigger: stage,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          s.p = self.progress;
        },
      });
      start();
    }
    draw(); // first paint in every mode

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      st?.kill();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
  }, [reduced]);

  return (
    <section id="temple" data-section="temple" className="section-scope bg-ink">
      {/* natural aspect box: the full temple (apex included) is always in
          frame; depth scrubs from scroll, nothing is pinned */}
      <div ref={stageRef} className="overflow-hidden bg-ink">
        <div className="relative aspect-[16/9]">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Pixel-art Greek temple at dusk, lit by an inner flame, with layered mountains and cypress trees"
            className="absolute inset-0 h-full w-full [image-rendering:pixelated]"
          />
        </div>
      </div>

      {/* inscription zone: its own strip below the art, no scrim needed */}
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold mb-4">
          {numeralFor("temple")} — The Temple
        </p>
        <blockquote className="font-display text-[clamp(1.5rem,3.5vw,2.75rem)] italic leading-snug text-bone">
          “The command center is finished when the board agrees — and the
          board has never once agreed.”
        </blockquote>
        <footer className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
          — Praxeas, first customer in residence
        </footer>
      </div>
    </section>
  );
}
