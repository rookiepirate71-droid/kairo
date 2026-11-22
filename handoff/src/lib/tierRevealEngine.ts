import { FRAG, VERT } from "@/shaders/tierReveal";
import { REVEAL } from "@/lib/reveal-config";
import { wrapLines } from "@/lib/textLayout";
import type { Tier, TierPalette } from "@/lib/tiers";

type Vec3 = [number, number, number];

interface FontStack {
  voice: string;
  sans: string;
  mono: string;
}

export interface EngineOptions {
  tier: Tier;
  palette: TierPalette;
  /** time multiplier, see lib/reveal-config.ts */
  speed: number;
  reducedMotion: boolean;
  price?: string;
  unit?: string;
}

const UNIFORMS = [
  "uRes", "uO", "uM", "uT", "uP", "uS", "uMA", "uD",
  "uBase", "uBg", "uBg2", "uVein", "uTB", "uTT",
] as const;
type UniformName = (typeof UNIFORMS)[number];

/** Card layout in CSS px. The DOM CTA link must match CTA_* so it overlays the drawn box. */
const LAYOUT = {
  pad: 16,
  latinY: 32,
  nameY: 70,
  taglineY: 96,
  line: 17,
  priceY: 176,
  featuresY: 208,
  featureGap: 7,
  ctaH: 34,
} as const;

/* ---------- shared scheduler: one rAF loop for every card ---------- */
const engines = new Set<TierRevealEngine>();
let raf = 0;
let last = 0;

function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  let live = false;
  for (const e of engines) if (e.step(dt)) live = true;
  raf = live ? requestAnimationFrame(frame) : 0;
}

function wake(): void {
  if (raf) return;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

/* ---------- helpers ---------- */
function toVec3(hex: string): Vec3 {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("createShader failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown";
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

/** next/font hashes family names, so read the resolved stacks from real elements. */
function resolveFonts(host: HTMLElement): FontStack {
  const probe = (className: string, fallback: string): string => {
    const span = document.createElement("span");
    span.className = className;
    span.setAttribute("aria-hidden", "true");
    span.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
    host.appendChild(span);
    const family = getComputedStyle(span).fontFamily;
    span.remove();
    return family || fallback;
  };
  return {
    voice: probe("font-display", "Georgia, serif"),
    sans: probe("font-sans", "system-ui, sans-serif"),
    mono: probe("font-mono", "ui-monospace, monospace"),
  };
}

function setSpacing(ctx: CanvasRenderingContext2D, value: string): void {
  if ("letterSpacing" in ctx) ctx.letterSpacing = value;
}

export class TierRevealEngine {
  private readonly canvas = document.createElement("canvas");
  private readonly gl: WebGL2RenderingContext;
  private readonly textures: WebGLTexture[] = [];
  private readonly loc = {} as Record<UniformName, WebGLUniformLocation | null>;
  private readonly ro: ResizeObserver;
  private fonts: FontStack;
  private program: WebGLProgram | null = null;
  private price: string;
  private unit: string;

  private dpr = 1;
  private w = 1;
  private h = 1;
  private bufW = 1;
  private bufH = 1;

  private p = 0;
  private target = 0;
  private ox = 0;
  private oy = 0;
  private tox = 0;
  private toy = 0;
  private mx = 0;
  private my = 0;
  private ma = 0;
  private tma = 0;
  private time = 0;
  private dirty = true;

  constructor(
    private readonly host: HTMLElement,
    private readonly opt: EngineOptions,
  ) {
    this.price = opt.price ?? opt.tier.price;
    this.unit = opt.unit ?? opt.tier.unit;
    this.fonts = resolveFonts(host);

    const gl = this.canvas.getContext("webgl2", { antialias: false });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;

    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:1";
    this.build();
    host.insertBefore(this.canvas, host.firstChild);

    this.canvas.addEventListener("webglcontextlost", this.onLost);
    this.canvas.addEventListener("webglcontextrestored", this.onRestored);
    host.addEventListener("pointerenter", this.onEnter);
    host.addEventListener("pointermove", this.onMove);
    host.addEventListener("pointerleave", this.onLeave);
    host.addEventListener("focusin", this.onFocusIn);
    host.addEventListener("focusout", this.onFocusOut);
    document.addEventListener("pointerdown", this.onDocDown);

    engines.add(this);
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(host);
  }

  /** Repaint text textures, e.g. after web fonts finish loading. */
  repaint(): void {
    this.fonts = resolveFonts(this.host);
    this.paintText();
    this.dirty = true;
    wake();
  }

  /** Swap price/unit (monthly/annual toggle) without rebuilding the GL context. */
  setContent(content: { price?: string; unit?: string }): void {
    const price = content.price ?? this.price;
    const unit = content.unit ?? this.unit;
    if (price === this.price && unit === this.unit) return;
    this.price = price;
    this.unit = unit;
    this.paintText();
    this.dirty = true;
    wake();
  }

  /** Advance one frame. Returns true while the engine still needs frames. */
  step(rawDt: number): boolean {
    const s = rawDt * this.opt.speed;
    const prev = this.p;
    if (this.opt.reducedMotion) {
      this.p = this.target;
      this.ox = this.tox;
      this.oy = this.toy;
      this.ma = this.tma;
    } else {
      this.time += s;
      const k = (rate: number): number => 1 - Math.exp(-s * rate);
      this.p += (this.target - this.p) * k(this.target ? REVEAL.rateIn : REVEAL.rateOut);
      if (Math.abs(this.target - this.p) < REVEAL.snapEpsilon) this.p = this.target;
      this.ox += (this.tox - this.ox) * k(REVEAL.originFollow);
      this.oy += (this.toy - this.oy) * k(REVEAL.originFollow);
      this.ma += (this.tma - this.ma) * k(REVEAL.sheenFollow);
    }
    if (this.p > 0 || this.p !== prev || this.dirty) {
      this.draw();
      this.dirty = false;
    }
    return !this.opt.reducedMotion && (this.p > 0 || this.p !== this.target);
  }

  dispose(): void {
    engines.delete(this);
    this.ro.disconnect();
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.host.removeEventListener("pointerenter", this.onEnter);
    this.host.removeEventListener("pointermove", this.onMove);
    this.host.removeEventListener("pointerleave", this.onLeave);
    this.host.removeEventListener("focusin", this.onFocusIn);
    this.host.removeEventListener("focusout", this.onFocusOut);
    document.removeEventListener("pointerdown", this.onDocDown);
    const { gl } = this;
    this.textures.forEach((t) => gl.deleteTexture(t));
    if (this.program) gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // free the context slot now
    this.canvas.remove();
  }

  /* ---------- GL setup ---------- */
  private build(): void {
    const { gl, opt } = this;
    const program = gl.createProgram();
    if (!program) throw new Error("createProgram failed");
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link failed: ${gl.getProgramInfoLog(program) ?? "unknown"}`);
    }
    this.program = program;
    gl.useProgram(program);
    for (const name of UNIFORMS) this.loc[name] = gl.getUniformLocation(program, name);

    this.textures.length = 0;
    for (let unit = 0; unit < 2; unit++) {
      const tex = gl.createTexture();
      if (!tex) throw new Error("createTexture failed");
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.textures.push(tex);
    }
    gl.uniform1i(this.loc.uTB, 0);
    gl.uniform1i(this.loc.uTT, 1);
    gl.uniform1f(this.loc.uS, opt.tier.strata);
    gl.uniform3fv(this.loc.uBase, toVec3(opt.palette.baseSurface));
    gl.uniform3fv(this.loc.uBg, toVec3(opt.palette.stone));
    gl.uniform3fv(this.loc.uBg2, toVec3(opt.palette.stoneLight));
    gl.uniform3fv(this.loc.uVein, toVec3(opt.palette.vein));
  }

  private readonly resize = (): void => {
    const r = this.host.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, REVEAL.maxDpr);
    this.w = r.width;
    this.h = r.height;
    this.bufW = Math.round(r.width * this.dpr);
    this.bufH = Math.round(r.height * this.dpr);
    this.canvas.width = this.bufW;
    this.canvas.height = this.bufH;
    this.gl.viewport(0, 0, this.bufW, this.bufH);
    this.gl.uniform1f(this.loc.uD, this.dpr);
    this.paintText();
    this.dirty = true;
    wake();
  };

  /* ---------- text textures ---------- */
  private paintText(): void {
    const { gl, opt } = this;
    const layers: ReadonlyArray<[number, string, string]> = [
      [0, opt.palette.baseInk, opt.palette.baseAccent],
      [1, opt.palette.ink, opt.palette.accent],
    ];
    for (const [unit, ink, accent] of layers) {
      const c = document.createElement("canvas");
      c.width = Math.round(this.w * this.dpr);
      c.height = Math.round(this.h * this.dpr);
      const ctx = c.getContext("2d");
      if (!ctx) continue;
      ctx.scale(this.dpr, this.dpr);
      this.drawLayout(ctx, ink, accent);
      gl.activeTexture(gl.TEXTURE0 + unit);
      const tex = this.textures[unit];
      if (!tex) continue;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    }
  }

  private drawLayout(ctx: CanvasRenderingContext2D, ink: string, accent: string): void {
    const { tier } = this.opt;
    const { pad, line } = LAYOUT;
    const inner = this.w - pad * 2;
    const measure = (s: string): number => ctx.measureText(s).width;
    const f = this.fonts;

    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.8;
    ctx.font = `11px ${f.mono}`;
    setSpacing(ctx, "1.8px");
    ctx.fillText(tier.latin, pad, LAYOUT.latinY);

    ctx.globalAlpha = 1;
    setSpacing(ctx, "0px");
    ctx.font = `26px ${f.voice}`;
    ctx.fillText(tier.name, pad, LAYOUT.nameY);

    ctx.font = `12px ${f.sans}`;
    ctx.globalAlpha = 0.85;
    let y: number = LAYOUT.taglineY;
    for (const l of wrapLines(measure, tier.tagline, inner)) {
      ctx.fillText(l, pad, y);
      y += line;
    }

    ctx.globalAlpha = 1;
    ctx.font = `32px ${f.voice}`;
    ctx.fillText(this.price, pad, LAYOUT.priceY);
    const priceW = measure(this.price);
    if (this.unit) {
      ctx.font = `12px ${f.sans}`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(this.unit, pad + priceW + 6, LAYOUT.priceY);
      ctx.globalAlpha = 1;
    }

    ctx.font = `12px ${f.sans}`;
    y = LAYOUT.featuresY;
    for (const feature of tier.features) {
      ctx.fillStyle = accent;
      ctx.fillRect(pad, y - 8, 5, 5);
      ctx.fillStyle = ink;
      for (const l of wrapLines(measure, feature, inner - 13)) {
        ctx.fillText(l, pad + 13, y);
        y += line;
      }
      y += LAYOUT.featureGap;
    }

    const ctaTop = this.h - pad - LAYOUT.ctaH;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad + 0.5, ctaTop + 0.5, inner - 1, LAYOUT.ctaH - 1);
    ctx.font = `11px ${f.mono}`;
    setSpacing(ctx, "1.8px");
    ctx.textAlign = "center";
    ctx.fillText(tier.cta, this.w / 2, ctaTop + 21);
    ctx.textAlign = "left";
    setSpacing(ctx, "0px");
  }

  private draw(): void {
    const { gl, loc } = this;
    gl.uniform2f(loc.uRes, this.bufW, this.bufH);
    gl.uniform2f(loc.uO, this.ox, this.oy);
    gl.uniform2f(loc.uM, this.mx, this.my);
    gl.uniform1f(loc.uT, this.time);
    gl.uniform1f(loc.uP, this.p);
    gl.uniform1f(loc.uMA, this.ma);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ---------- input ---------- */
  private local(e: PointerEvent): [number, number] {
    const r = this.host.getBoundingClientRect();
    return [(e.clientX - r.left) * this.dpr, (r.height - (e.clientY - r.top)) * this.dpr];
  }

  private readonly onEnter = (e: PointerEvent): void => {
    const [x, y] = this.local(e);
    this.tox = x;
    this.toy = y;
    this.mx = x;
    this.my = y;
    if (this.p < 0.01) {
      this.ox = x;
      this.oy = y;
    }
    this.target = 1;
    this.tma = 1;
    wake();
  };

  private readonly onMove = (e: PointerEvent): void => {
    const [x, y] = this.local(e);
    this.mx = x;
    this.my = y;
    if (this.target === 1 && this.p < 0.01) {
      this.ox = x;
      this.oy = y;
      this.tox = x;
      this.toy = y;
    }
  };

  private readonly onLeave = (e: PointerEvent): void => {
    if (e.pointerType === "touch") return; // touch collapses on outside tap
    const [x, y] = this.local(e);
    this.tox = x;
    this.toy = y;
    this.target = 0;
    this.tma = 0;
    wake();
  };

  private readonly onFocusIn = (): void => {
    this.tox = this.bufW * 0.5;
    this.toy = this.bufH * 0.62;
    if (this.p < 0.01) {
      this.ox = this.tox;
      this.oy = this.toy;
    }
    this.target = 1;
    wake();
  };

  private readonly onFocusOut = (e: FocusEvent): void => {
    if (e.relatedTarget instanceof Node && this.host.contains(e.relatedTarget)) return;
    this.target = 0;
    this.tma = 0;
    wake();
  };

  private readonly onDocDown = (e: PointerEvent): void => {
    if (e.pointerType !== "touch") return;
    if (e.target instanceof Node && this.host.contains(e.target)) return;
    this.target = 0;
    this.tma = 0;
    wake();
  };

  private readonly onLost = (e: Event): void => {
    e.preventDefault(); // allows webglcontextrestored
  };

  private readonly onRestored = (): void => {
    this.build();
    this.resize();
  };
}
