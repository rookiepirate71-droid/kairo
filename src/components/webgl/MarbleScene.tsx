"use client";

import { useEffect, useRef, type ReactElement } from "react";
import type * as ThreeNs from "three";
import { SCENE } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Three = typeof ThreeNs;

const GLYPHS = " .:-=+*#%@"; // dark to bright
const BRAND_WORD = "ORACV·VM"; // spelled across the hero in glyph cells
const BRAND_LETTERS = "ORACV·M"; // unique glyphs of the word, for the letter atlas
const GLYPH_W = 16;
const GLYPH_H = 32; // 1:2 cells, like a terminal

/* Shown until the first frame, and permanently if WebGL is unavailable. */
const FALLBACK_BG =
  "radial-gradient(ellipse 70% 55% at 50% 40%, color-mix(in oklab, var(--color-bone) 16%, transparent), transparent 70%), var(--color-ink)";

const VERT = /* glsl */ `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFade;     // 0 = plain marble, 1 = full ascii
  uniform float uDpr;
  uniform vec2  uRes;      // drawing-buffer px (matches gl_FragCoord)
  uniform vec2  uCell;     // glyph cell size, device px
  uniform vec2  uMouse;    // lens centre, device px, origin bottom-left
  uniform float uRadius;   // device px
  uniform float uFeather;  // device px
  uniform vec3  uGround;
  uniform vec3  uMarble;
  uniform vec3  uGold;
  uniform sampler2D uAtlas;
  uniform sampler2D uLetters;
  uniform sampler2D uWord;

  const float RAMP = ${GLYPHS.length}.0;
  const float LETTERS = ${BRAND_LETTERS.length}.0;

  // sin-free hash (Hoskins): stable on mobile GPUs
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
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  // ridged variant for kintsugi vein lines (port from TierCanvas)
  float ridged(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * (1.0 - abs(noise(p) * 2.0 - 1.0));
      p *= 2.11;
      a *= 0.5;
    }
    return v;
  }

  // first-order flow warp: the field advects itself over time, so the ascii
  // glyphs and the lens marble both move like liquid instead of drifting
  vec2 flow(vec2 p) {
    vec2 q = vec2(fbm(p + vec2(0.0, uTime * 0.05)), fbm(p + vec2(5.2, uTime * 0.04)));
    return p + 0.75 * vec2(fbm(p + 4.0 * q), fbm(p + 4.0 * q + 8.3));
  }

  // marble vein field, 0..1, aspect-corrected. This is the image's luminance.
  float vein(vec2 uv) {
    vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y) * 4.0;
    p = flow(p);
    return smoothstep(0.38, 0.66, fbm(p * 2.0));
  }

  void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 uv = frag / uRes;

    // 0 inside the lens (real marble), 1 outside (ascii)
    float ascii = uFade * smoothstep(uRadius, uRadius + uFeather, distance(frag, uMouse));

    // ascii: one luminance sample per cell, mapped to a glyph. Cells inside
    // the ORACV·VM word mask spell the brand in letters from the second
    // atlas instead of density symbols.
    vec2 cell = floor(frag / uCell);
    float d = 0.0;
    float onWord = 0.0;
    if (ascii > 0.001) {
      vec2 cellUV = (cell + 0.5) * uCell / uRes;
      d = vein(cellUV);
      onWord = step(0.55, texture2D(uWord, cellUV).r);
    }
    float idx = floor(d * (RAMP - 0.001));
    vec2 inCell = fract(frag / uCell);
    // sampled outside the branches so texture derivatives stay uniform.
    // Brand letters re-roll slowly (every ~1.7s) per cell.
    float li = floor(hash(cell + floor(uTime * 0.6) * vec2(7.13, 3.71)) * LETTERS - 0.001);
    float gRamp = texture2D(uAtlas, vec2((idx + inCell.x) / RAMP, inCell.y)).r;
    float gLetter = texture2D(uLetters, vec2((li + inCell.x) / LETTERS, inCell.y)).r;
    float g = mix(gRamp, gLetter, onWord);
    vec3 asciiCol = mix(uGround, uGold, g * mix(0.35 + 0.65 * d, 0.95, onWord));

    // true marble: only evaluated where the lens is visible. Same living-stone
    // maths as the Orders tier cards: domain-warped body, kintsugi ridged
    // veins, sparkle, and a cursor sheen tracking the smoothed pointer.
    vec3 marbleCol = uGround;
    if (ascii < 0.999) {
      vec2 pAsp2 = vec2(uRes.x / uRes.y, 1.0);
      vec2 w = flow(uv * pAsp2 * 2.4);
      float body = fbm(w);
      float v = pow(clamp(ridged(w * 1.6 + 3.7), 0.0, 1.0), 6.0);
      float vFine = pow(clamp(ridged(w * 3.1 + 11.3), 0.0, 1.0), 14.0);
      marbleCol = mix(uGround, uMarble, smoothstep(0.35, 0.75, body));
      marbleCol = mix(marbleCol, uGold, clamp(v * 0.55 + vFine * 0.35, 0.0, 1.0));
      float sparkle = step(0.985, hash(floor(frag / (2.0 * uDpr)) + floor(uTime * 2.0)));
      marbleCol = mix(marbleCol, uGold, sparkle * body * 0.6);
      // continuous cursor sheen (uMouse is already bottom-left origin here)
      vec2 dm = uv - uMouse / uRes;
      dm.x *= uRes.x / uRes.y;
      marbleCol += 0.25 * exp(-dot(dm, dm) * 9.0);
    }

    vec3 col = mix(marbleCol, asciiCol, ascii);

    // vignette: aspect-corrected ellipse, clamped so it can never crush to black
    vec2 pAsp = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    col *= clamp(1.0 - dot(pAsp, pAsp) * 0.8, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

/* Reads a design token (needs `@theme static`) as raw sRGB 0..1. The shader
   writes straight to the framebuffer, so no colour-space conversion. */
function readColor(THREE: Three, token: string, fallback: string): ThreeNs.Vector3 {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const hex = /^#[0-9a-f]{6}$/i.test(raw) ? raw : fallback;
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function createGlyphAtlas(THREE: Three): ThreeNs.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = GLYPH_W * GLYPHS.length;
  canvas.height = GLYPH_H;
  const ctx = canvas.getContext("2d");
  // a blank atlas means flat-shaded cells, never a throw after the
  // renderer is already on the page
  if (ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    // generic stack on purpose: next/font hashes family names, so
    // "Space Mono" would never match here
    ctx.font = `bold ${GLYPH_W / 0.6}px ui-monospace, "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    [...GLYPHS].forEach((ch, i) => {
      ctx.fillText(ch, i * GLYPH_W + GLYPH_W / 2, GLYPH_H / 2);
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function createLetterAtlas(THREE: Three): ThreeNs.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = GLYPH_W * BRAND_LETTERS.length;
  canvas.height = GLYPH_H;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${GLYPH_W / 0.6}px ui-monospace, "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    [...BRAND_LETTERS].forEach((ch, i) => {
      ctx.fillText(ch, i * GLYPH_W + GLYPH_W / 2, GLYPH_H / 2);
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

/* ORACV·VM rasterised white-on-black at drawing-buffer size: sampled per
   glyph cell by the shader as a mask. Redrawn on resize so the word keeps
   its aspect; contain-fit with side margins. */
function drawWordMask(canvas: HTMLCanvasElement, w: number, h: number): void {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx || w < 2 || h < 2) return;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const maxW = w * 0.86;
  let size = Math.floor(h * 0.42);
  ctx.font = `bold ${size}px ui-monospace, "Courier New", monospace`;
  const measured = ctx.measureText(BRAND_WORD).width;
  if (measured > maxW) size = Math.max(8, Math.floor(size * (maxW / measured)));
  ctx.font = `bold ${size}px ui-monospace, "Courier New", monospace`;
  ctx.fillText(BRAND_WORD, w / 2, h / 2);
}

export default function MarbleScene(): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let teardown: (() => void) | undefined;

    void (async () => {
      const THREE = await import("three");
      if (disposed) return; // unmounted (or StrictMode re-ran) while loading

      let renderer: ThreeNs.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          powerPreference: "high-performance",
        });
      } catch {
        return; // no WebGL: the CSS fallback background stays
      }

      const dpr = Math.min(window.devicePixelRatio, SCENE.maxDpr);
      renderer.setPixelRatio(dpr);
      const canvas = renderer.domElement;
      canvas.style.cssText =
        "display:block;width:100%;height:100%;opacity:0;transition:opacity 600ms var(--ease-out-expo)";
      host.appendChild(canvas);

      const atlas = createGlyphAtlas(THREE);
      const letters = createLetterAtlas(THREE);
      const wordCanvas = document.createElement("canvas");
      const wordTex = new THREE.CanvasTexture(wordCanvas);
      wordTex.minFilter = THREE.LinearFilter;
      wordTex.magFilter = THREE.LinearFilter;
      wordTex.generateMipmaps = false;
      const uniforms = {
        uTime: { value: 0 },
        uFade: { value: 0 },
        uDpr: { value: dpr },
        uRes: { value: new THREE.Vector2(1, 1) },
        uCell: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(-9999, -9999) },
        uRadius: { value: 0 },
        uFeather: { value: 0 },
        uGround: { value: readColor(THREE, "--color-ink", "#0d0c0a") },
        uMarble: { value: readColor(THREE, "--color-bone", "#ede6d6") },
        uGold: { value: readColor(THREE, "--color-gold", "#c8a45c") },
        uAtlas: { value: atlas },
        uLetters: { value: letters },
        uWord: { value: wordTex },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        depthTest: false,
        depthWrite: false,
      });
      const geometry = new THREE.PlaneGeometry(2, 2);
      const quad = new THREE.Mesh(geometry, material);
      quad.frustumCulled = false;
      const scene = new THREE.Scene();
      scene.add(quad);
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const renderFrame = (): void => renderer.render(scene, camera);
      const paintStatic = (): void => {
        uniforms.uFade.value = 1; // full ascii, lens parked offscreen
        renderFrame();
        canvas.style.opacity = "1";
      };

      const drawing = new THREE.Vector2();
      const resize = (): void => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h, false);
        renderer.getDrawingBufferSize(drawing);
        uniforms.uRes.value.copy(drawing);
        const cellW = clamp(w / SCENE.cellDivisor, SCENE.cellMinPx, SCENE.cellMaxPx) * dpr;
        uniforms.uCell.value.set(cellW, cellW * (GLYPH_H / GLYPH_W));
        uniforms.uRadius.value = clamp(w * SCENE.lensVw, SCENE.lensMinPx, SCENE.lensMaxPx) * dpr;
        uniforms.uFeather.value = SCENE.lensFeatherPx * dpr;
        drawWordMask(wordCanvas, drawing.x, drawing.y);
        wordTex.needsUpdate = true;
        if (reduced) paintStatic();
      };

      // lens: smoothed pointer on mouse/pen, autonomous drift on touch
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const mouse = new THREE.Vector2(-9999, -9999);
      const target = new THREE.Vector2(-9999, -9999);
      let hasPointer = false;
      const onMove = (e: PointerEvent): void => {
        if (e.pointerType === "touch") return;
        const r = host.getBoundingClientRect();
        target.set((e.clientX - r.left) * dpr, (r.height - (e.clientY - r.top)) * dpr);
        if (!hasPointer) {
          mouse.copy(target);
          hasPointer = true;
        }
      };

      let raf = 0;
      let last = 0;
      let time = 0;
      let fade = 0;
      let shown = false;
      const frameMs = coarse ? SCENE.touchFrameMs : 0;

      const driftTarget = (t: number, out: ThreeNs.Vector2): void => {
        const res = uniforms.uRes.value;
        out.set(
          res.x * (0.5 + 0.28 * Math.sin(t * 0.35)),
          res.y * (0.5 + 0.22 * Math.sin(t * 0.5 + 1.3)),
        );
      };

      const tick = (now: number): void => {
        raf = requestAnimationFrame(tick);
        if (now - last < frameMs) return;
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        time += dt;
        fade = Math.min(1, fade + dt / SCENE.fadeSeconds);
        uniforms.uTime.value = time;
        uniforms.uFade.value = fade * fade * (3 - 2 * fade); // smoothstep ease

        if (coarse) driftTarget(time, target);
        mouse.lerp(target, 1 - Math.exp(-dt * SCENE.lensFollow));
        uniforms.uMouse.value.copy(mouse);

        renderFrame();
        if (!shown) {
          shown = true;
          canvas.style.opacity = "1";
        }
      };
      const start = (): void => {
        if (raf || disposed) return;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      };
      const stop = (): void => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      };

      const onLost = (e: Event): void => e.preventDefault(); // allow restore
      canvas.addEventListener("webglcontextlost", onLost);

      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      // seed the lens on the first drift position so touch devices
      // don't sweep in from the parked corner
      if (coarse) {
        driftTarget(0, target);
        mouse.copy(target);
      }

      let io: IntersectionObserver | undefined;
      let warmup = 0;
      if (!reduced) {
        window.addEventListener("pointermove", onMove, { passive: true });
        // defer the first frame ~1.5s so page hydration is never starved
        // by the render loop (decisive on software rasterizers)
        io = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) {
            if (!warmup) {
              warmup = window.setTimeout(() => {
                warmup = 0;
                start();
              }, 1500);
            }
          } else {
            stop();
          }
        });
        io.observe(host);
      }

      teardown = () => {
        stop();
        if (warmup) clearTimeout(warmup);
        io?.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("webglcontextlost", onLost);
        geometry.dispose();
        material.dispose();
        atlas.dispose();
        letters.dispose();
        wordTex.dispose();
        renderer.dispose();
        renderer.forceContextLoss(); // release the context slot immediately
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [reduced]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ background: FALLBACK_BG }}
    />
  );
}
