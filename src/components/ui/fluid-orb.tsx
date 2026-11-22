'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

export type FluidOrbProps = React.ComponentProps<'div'> & {
  size?: number
  color?: string
}

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;

// sin-free hash (Hoskins) — same constant as MarbleScene/TierCanvas, stable on mobile
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

// first-order flow warp (the site's fluid primitive): the field advects
// itself over time, so the marble interior moves like liquid, not drift
vec2 flow(vec2 p) {
  float t = u_time * 0.06;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, t * 0.8)));
  return p + 0.75 * vec2(fbm(p + 4.0 * q), fbm(p + 4.0 * q + 8.3));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv - 0.5; // square buffer
  float r = length(p);
  float ang = atan(p.y, p.x);

  // ---- liquid silhouette: the radius itself breathes with the flow field ----
  float lobes = fbm(p * 3.0 + u_time * 0.14);
  float ripple = 0.014 * sin(5.0 * ang - u_time * 0.9);
  float R = 0.46 + 0.05 * (lobes - 0.5) + ripple;
  float edge = R - r; // >0 inside
  float inside = smoothstep(0.0, 0.006, edge);

  // ---- sphere normal for lighting ----
  float rr = min(r / R, 1.0);
  float z = sqrt(max(1.0 - rr * rr, 0.0));
  vec3 n = normalize(vec3(p / max(R, 0.001), z));

  // ---- liquid marble surface, advected through the flow field ----
  vec2 q = flow(p * 3.2);
  float body = fbm(q);
  vec3 bone = vec3(0.97, 0.95, 0.90);
  vec3 deep = u_color;
  vec3 marble = mix(bone, deep * 1.18, smoothstep(0.30, 0.72, body));
  // denser colour pools low in the sphere, like pigment settling
  marble = mix(marble, deep * 0.70, smoothstep(-0.12, -0.48, p.y) * 0.55);

  // ---- kintsugi gold veins: coarse + mid + fine, hard crack edges ----
  float veinC = pow(clamp(ridged(q * 1.4 + 3.7), 0.0, 1.0), 4.0);
  float veinM = pow(clamp(ridged(q * 2.3 + 7.1), 0.0, 1.0), 9.0);
  float veinF = pow(clamp(ridged(q * 3.4 + 11.3), 0.0, 1.0), 10.0);
  float veins = clamp(veinC * 0.8 + veinM * 0.55 + veinF * 0.45, 0.0, 1.0);
  veins = smoothstep(0.24, 0.52, veins);
  vec3 veinCol = mix(vec3(0.42, 0.30, 0.10), vec3(0.78, 0.60, 0.24), fbm(q * 5.0));
  marble = mix(marble, veinCol, veins);

  // ---- lighting: lambert + specular + fresnel so it reads as a ball ----
  vec3 l = normalize(vec3(-0.35, 0.5, 0.8));
  float diff = clamp(dot(n, l), 0.0, 1.0);
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));
  float spec = pow(clamp(dot(n, h), 0.0, 1.0), 42.0);
  float fres = pow(1.0 - z, 2.4);

  vec3 col = marble * (0.40 + 0.72 * diff);
  col += vec3(1.0, 0.97, 0.90) * spec * 0.85;          // wet specular highlight
  col = mix(col, vec3(0.79, 0.64, 0.36), fres * 0.30); // gold rim from the room
  col *= 0.85 + 0.15 * z;                              // limb darkening for roundness

  gl_FragColor = vec4(col * inside, inside);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) {
    const [a, b, c] = h
    if (a !== undefined && b !== undefined && c !== undefined) {
      h = `${a}${a}${b}${b}${c}${c}`
    }
  }
  const n = parseInt(h, 16)
  if (h.length !== 6 || Number.isNaN(n)) return [0.1, 0.45, 0.95]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

const FluidOrb = ({
  size = 240,
  color = '#1A73F2',
  className,
  style,
  ...props
}: FluidOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: true, alpha: true })
    if (!gl) return

    const program = gl.createProgram()
    const vert = compile(gl, gl.VERTEX_SHADER, VERT)
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!program || !vert || !frag) return

    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uResolution = gl.getUniformLocation(program, 'u_resolution')
    const uTime = gl.getUniformLocation(program, 'u_time')
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), ...hexToRgb(color))

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = Math.round(size * dpr)
    canvas.width = px
    canvas.height = px
    gl.viewport(0, 0, px, px)
    gl.uniform2f(uResolution, px, px)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let raf = 0

    const render = (now: number) => {
      gl.uniform1f(uTime, reduce ? 0 : (now - start) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (!reduce) raf = requestAnimationFrame(render)
    }
    render(start)

    return () => {
      cancelAnimationFrame(raf)
      gl.deleteProgram(program)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      gl.deleteBuffer(buffer)
    }
  }, [size, color])

  return (
    <div
      data-slot="fluid-orb"
      className={cn('relative overflow-hidden rounded-full', className)}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      {...props}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}

export default FluidOrb
