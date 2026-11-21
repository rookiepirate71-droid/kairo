"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { TIERS, REVEAL, type TierId } from "@/lib/tiers";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* TierCanvas: per-card WebGL2 liquid-marble reveal.

   - Full-screen triangle (no vertex buffers beyond the built-in one).
   - The card's text is rasterised into two 2D-canvas textures (base bone
     layer, themed tier-foreground layer) using the *computed* font family
     strings, so next/font hashed names are picked up automatically.
   - The reveal front is a radius warped by fbm; wobble amplitude is
     sin(pi * progress) so the edge is organic mid-transition and flat at 0/1.
   - Renders only while animating or revealed; stops otherwise. Pauses
     off-screen; forceContextLoss on unmount. */

const VERT = `#version 300 es
void main() {
  // full-screen triangle from gl_VertexID, no attributes
  vec2 pos = vec2((gl_VertexID << 1) & 2u, gl_VertexID & 2u);
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2  uRes;        // canvas px
uniform float uTime;
uniform float uProgress;   // 0..1 reveal
uniform vec2  uOrigin;     // 0..1, top-down (DOM convention)
uniform vec2  uMouse;      // 0..1, top-down (DOM convention)
uniform vec3  uStoneA;
uniform vec3  uStoneB;
uniform vec3  uVein;
uniform float uStrata;     // 1 = citizen strata
uniform float uSheen;
uniform float uDither[16];
uniform sampler2D uTextBase;   // bone text, transparent bg
uniform sampler2D uTextTheme;  // themed text, transparent bg

out vec4 outColor;

// sin-free hash (Hoskins) — stable on mobile
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y);
}
// domain-warped fbm; OCTAVES is patched per GPU tier
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}
// ridged variant for vein lines
float ridged(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += a * (1.0 - abs(noise(p) * 2.0 - 1.0));
    p *= 2.11;
    a *= 0.5;
  }
  return v;
}
// second-order domain warp — the "liquid" in the marble
vec2 warp(vec2 p) {
  vec2 q = vec2(fbm(p + vec2(0.0, uTime * 0.05)), fbm(p + vec2(5.2, uTime * 0.04)));
  return p + 0.75 * vec2(fbm(p + 4.0 * q), fbm(p + 4.0 * q + 8.3));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);

  // ---- reveal front ----
  // origin/mouse arrive top-down from DOM events; uv space is bottom-up
  vec2 o = vec2(uOrigin.x, 1.0 - uOrigin.y) * vec2(uRes.x / uRes.y, 1.0);
  float aspectDiag = length(vec2(uRes.x / uRes.y, 1.0));
  float wobble = sin(3.14159 * uProgress);           // 0 at both ends
  float dist = distance(p, o);
  vec2 dir = (dist > 0.0001) ? (p - o) / dist : vec2(0.0);
  float warpedDist = dist + wobble * 0.08 * fbm(p * 3.0 + dir * 1.5 + uTime * 0.06);
  float R = uProgress * aspectDiag * 1.05;
  float front = warpedDist - R;                       // <0 behind, >0 ahead
  float inside = 1.0 - smoothstep(0.0, 0.012, front);

  // ---- marble body (only worth computing near/inside the front) ----
  vec3 marble = uStoneA;
  if (inside > 0.001) {
    vec2 w = warp(p * 2.4);
    float body = fbm(w);
    float vein = ridged(w * 1.6 + 3.7);
    vein = pow(clamp(vein, 0.0, 1.0), 6.0);
    // fine secondary veining band: sparse hairline veins over the coarse ones
    float veinFine = pow(clamp(ridged(w * 3.1 + 11.3), 0.0, 1.0), 14.0);
    marble = mix(uStoneA, uStoneB, smoothstep(0.35, 0.75, body));
    marble = mix(marble, uVein, clamp(vein * 0.55 + veinFine * 0.35, 0.0, 1.0));
    if (uStrata > 0.5) {
      // sinusoidal strata for the citizen tier
      float band = 0.5 + 0.5 * sin(w.y * 24.0 + 2.0 * fbm(w * 0.7));
      marble *= 0.92 + 0.08 * band;
    }
    // continuous cursor sheen: soft spotlight that tracks the pointer
    // (aspect-corrected; demo parity with its uM/uMA spotlight)
    vec2 dm = uv - vec2(uMouse.x, 1.0 - uMouse.y);
    dm.x *= uRes.x / uRes.y;
    marble += uSheen * 0.4 * exp(-dot(dm, dm) * 9.0);
  }

  // ---- edge fx: refraction, shadow, highlight, gold leaf, mist ----
  // entrance/exit ease: no edge fx pops at progress 0 or 1
  float pres = smoothstep(0.0, 0.04, uProgress) * (1.0 - smoothstep(0.9, 1.0, uProgress));
  // refraction ripple, decaying behind the front instead of crossing the card
  float ripple = wobble * ${REVEAL.rippleAmp} * sin(front * 70.0 - uTime * 2.0)
               * exp(-abs(front) * 10.0) * pres;
  vec2 textUv = uv + ripple * dir * inside * 0.5; // trailing behind the front
  textUv = clamp(textUv, 0.0, 1.0);

  float shadow = pres * smoothstep(0.0, 0.05, front);  // dark shadow ahead of front
  float highlight = pres * (1.0 - smoothstep(-0.03, 0.0, front)); // bright just behind
  float leaf = pres * (1.0 - smoothstep(0.0, ${REVEAL.leafWidth}, abs(front)));
  // bayer 4x4 dithered mist band ahead of the front, gold
  ivec2 px = ivec2(frag) % 4;
  float bayer = uDither[px.y * 4 + px.x];
  float mist = pres * step(bayer, 0.5) * smoothstep(0.0, 0.09, front) * (1.0 - smoothstep(0.09, 0.14, front));

  // ---- text layers ----
  vec4 textBase = texture(uTextBase, textUv);
  vec4 textTheme = texture(uTextTheme, textUv);
  vec4 text = mix(textBase, textTheme, inside);

  // ---- composite ----
  // base card is transparent (DOM shows through); the flood is opaque marble
  vec4 flood = vec4(marble, 1.0);
  // edge fx live on the flood's rim
  flood.rgb *= (1.0 - 0.35 * shadow * (1.0 - inside)); // shadow ahead
  flood.rgb += 0.30 * highlight * (1.0 - inside);      // highlight behind
  flood.rgb = mix(flood.rgb, uVein, leaf * 0.9);       // gold-leaf line
  flood.rgb = mix(flood.rgb, uVein, mist * 0.35);      // dithered gold mist

  vec3 col = mix(vec3(0.0), flood.rgb, flood.a * inside);
  // text always on top of marble, beneath it the DOM shows base text
  col = mix(col, text.rgb, text.a);
  outColor = vec4(col, inside * flood.a);
}`;

/* Rasterise the card text into a canvas texture. Fonts are read from the
   computed style of the real DOM card, so next/font hashed families are
   picked up without hardcoding. */
function rasteriseText(
  opts: {
    width: number;
    height: number;
    dpr: number;
    fontFamily: string;
    monoFamily: string;
    color: string;
    lines: { text: string; kind: "eyebrow" | "name" | "blurb" | "price" | "feature" | "cta"; y: number }[];
  }
): HTMLCanvasElement {
  const { width, height, dpr, fontFamily, monoFamily, color, lines } = opts;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(width * dpr));
  c.height = Math.max(1, Math.round(height * dpr));
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.scale(dpr, dpr);
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  const S = width / 300; // card design width 300
  for (const line of lines) {
    if (line.kind === "eyebrow" || line.kind === "feature") {
      ctx.font = `11px ${monoFamily}`;
      if (line.kind === "eyebrow") {
        ctx.letterSpacing = "3px";
      }
    } else if (line.kind === "name" || line.kind === "price") {
      ctx.font = `italic 30px ${fontFamily}`;
    } else {
      ctx.font = `13px ${fontFamily}`;
    }
    ctx.fillText(line.text, width / 2, line.y);
    ctx.letterSpacing = "0px";
  }
  void S;
  return c;
}

export default function TierCanvas({
  tier,
  active = false,
  originRef,
  lines,
  width = 0,
  height = 0,
}: {
  tier: TierId;
  active?: boolean;
  originRef: React.RefObject<{ x: number; y: number }>;
  lines: { text: string; kind: "eyebrow" | "name" | "blurb" | "price" | "feature" | "cta"; y: number }[];
  width?: number;
  height?: number;
}): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let teardown: (() => void) | undefined;
    let gl: WebGL2RenderingContext | null = null;

    void (async () => {
      // GPU tier probe: low-end gets fewer fbm octaves
      const glProbe = canvas.getContext("webgl2");
      if (!glProbe) return; // caller shows the DOM fallback
      gl = glProbe;
      const isLowEnd = gl.getExtension("WEBGL_lose_context") === null;
      const OCTAVES = isLowEnd ? 3 : 5;
      const frag = FRAG.replace("OCTAVES", String(OCTAVES));

      const compile = (type: number, src: string): WebGLShader => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
          throw new Error(gl!.getShaderInfoLog(s) ?? "shader compile failed");
        }
        return s;
      };

      let program: WebGLProgram;
      try {
        program = gl!.createProgram()!;
        gl!.attachShader(program, compile(gl!.VERTEX_SHADER, VERT));
        gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, frag));
        gl!.linkProgram(program);
        if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
          throw new Error(gl!.getProgramInfoLog(program) ?? "link failed");
        }
      } catch {
        return; // shader failed: DOM fallback card stays
      }
      if (disposed) return;
      gl!.useProgram(program);

      const dpr = Math.min(window.devicePixelRatio || 1, REVEAL.maxDpr);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl!.viewport(0, 0, canvas.width, canvas.height);

      const U = (n: string) => gl!.getUniformLocation(program, n);
      const loc = {
        res: U("uRes"), time: U("uTime"), prog: U("uProgress"), origin: U("uOrigin"),
        a: U("uStoneA"), b: U("uStoneB"), vein: U("uVein"), strata: U("uStrata"),
        sheen: U("uSheen"), dither: U("uDither[0]"), tb: U("uTextBase"), tt: U("uTextTheme"),
        mouse: U("uMouse"),
      };

      const hex = (h: string): [number, number, number] => {
        const n = parseInt(h.slice(1), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
      };
      const T = TIERS[tier];
      gl!.uniform3fv(loc.a, hex(T.stoneA));
      gl!.uniform3fv(loc.b, hex(T.stoneB));
      gl!.uniform3fv(loc.vein, hex(T.vein));
      gl!.uniform1f(loc.strata, T.strata ? 1 : 0);
      gl!.uniform1f(loc.sheen, REVEAL.sheen);
      const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(n => (n+0.5)/16);
      gl!.uniform1fv(loc.dither, BAYER);

      // text textures: families from the computed style of the canvas itself
      const cs = getComputedStyle(canvas);
      const makeTex = (color: string): WebGLTexture => {
        const c = rasteriseText({
          width, height, dpr,
          fontFamily: cs.fontFamily,
          monoFamily: cs.fontFamily,
          color,
          lines,
        });
        const tex = gl!.createTexture()!;
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, c);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
        return tex;
      };
      const texBase = makeTex(T.textBase);
      const texTheme = makeTex(T.textTheme);
      gl!.uniform1i(loc.tb, 0);
      gl!.uniform1i(loc.tt, 1);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, texBase);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, texTheme);

      // continuous cursor position over the parent card, top-down like origin
      const mouse = { x: originRef.current?.x ?? 0.5, y: originRef.current?.y ?? 0.5 };
      const card = canvas.parentElement;
      const onMove = (e: PointerEvent): void => {
        const r = canvas.getBoundingClientRect();
        if (r.height === 0 || r.width === 0) return;
        mouse.x = (e.clientX - r.left) / r.width;
        mouse.y = (e.clientY - r.top) / r.height;
      };
      card?.addEventListener("pointermove", onMove, { passive: true });

      let raf = 0;
      let last = 0;
      let visible = true;
      const onLost = (e: Event): void => e.preventDefault();
      canvas.addEventListener("webglcontextlost", onLost);

      const tick = (now: number): void => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        const target = active ? 1 : 0;
        const rate = active ? REVEAL.rateIn : REVEAL.rateOut;
        // exponential ease toward the target; origin eased elsewhere
        const p = progressRef.current;
        progressRef.current = p + (target - p) * (1 - Math.exp(-rate * dt));
        if (Math.abs(target - progressRef.current) < 0.001 && !active) {
          progressRef.current = 0;
          // fully collapsed: stop the loop until the next activation
          cancelAnimationFrame(raf);
          raf = 0;
          return;
        }
        if (!visible) return; // offscreen: skip the draw

        gl!.uniform2f(loc.res, canvas.width, canvas.height);
        gl!.uniform1f(loc.time, now / 1000);
        gl!.uniform1f(loc.prog, progressRef.current);
        gl!.uniform2f(loc.origin, originRef.current?.x ?? 0.5, originRef.current?.y ?? 0.5);
        gl!.uniform2f(loc.mouse, mouse.x, mouse.y);
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      };
      const start = (): void => {
        if (raf || disposed) return;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      };

      const io = new IntersectionObserver(([e]) => {
        visible = e?.isIntersecting ?? true;
      });
      io.observe(canvas);
      if (active) start();

      teardown = () => {
        if (raf) cancelAnimationFrame(raf);
        io.disconnect();
        canvas.removeEventListener("webglcontextlost", onLost);
        card?.removeEventListener("pointermove", onMove);
        gl!.deleteTexture(texBase);
        gl!.deleteTexture(texTheme);
        gl!.deleteProgram(program);
        gl!.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.width = 0;
        canvas.height = 0;
      };
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [reduced, tier, active, width, height, lines, originRef]);

  // while inactive the canvas is fully transparent — the DOM card shows
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full rounded-sm opacity-0 transition-opacity duration-300 data-[on=true]:opacity-100"
      data-on={active || undefined}
      style={{ mixBlendMode: "normal" }}
    />
  );
}
