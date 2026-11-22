'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

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
uniform float u_energy; // 0..1, driven by the physics sim's speed

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
  float ripple = (0.014 + 0.022 * u_energy) * sin(5.0 * ang - u_time * (0.9 + 2.2 * u_energy));
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
  const rootRef = useRef<HTMLDivElement>(null)

  // the roaming canvas is portaled to <body> while physics is active: an
  // element fixed inside the root would actually be fixed to the root (the
  // orb-float animation puts a transform on it) and could still widen the
  // document; portaled to body it can never add scrollable overflow
  const [floatHost, setFloatHost] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) setFloatHost(document.body)
  }, [])

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
    const uEnergy = gl.getUniformLocation(program, 'u_energy')
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), ...hexToRgb(color))

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = Math.round(size * dpr)
    canvas.width = px
    canvas.height = px
    gl.viewport(0, 0, px, px)
    gl.uniform2f(uResolution, px, px)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()

    // ---- physics: the browser window is the environment ----
    // the orb is a mass on a soft spring anchored at its layout spot;
    // the cursor can grab it, shove it or throw it, and the viewport
    // edges are walls it bounces off until the spring pulls it home
    const radius = size / 2
    const SPRING = 14 // spring stiffness (s^-2) — soft, so the return is slow
    const DAMP = 2.6 // spring damping — low enough for a gentle overshoot
    const REST = 0.72 // wall restitution
    const MAX_SPEED = 3000

    let pos = { x: 0, y: 0 } // offset from the anchor, CSS px
    let vel = { x: 0, y: 0 }
    let energy = 0
    let dragging = false
    let grab = { x: 0, y: 0 }
    let lastPtr = { x: 0, y: 0, t: performance.now() }
    let ptrVel = { x: 0, y: 0 }
    let prev = start
    let raf = 0

    // the anchor is the untransformed root's centre; the CSS float bob on
    // the root rides along, so the resting orb still breathes
    const anchorCenter = () => {
      const r = rootRef.current?.getBoundingClientRect()
      return r
        ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }

    const onDown = (e: PointerEvent) => {
      const a = anchorCenter()
      const cx = a.x + pos.x
      const cy = a.y + pos.y
      if (Math.hypot(e.clientX - cx, e.clientY - cy) > radius + 14) return
      dragging = true
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {}
      grab = { x: cx - e.clientX, y: cy - e.clientY }
      lastPtr = { x: e.clientX, y: e.clientY, t: performance.now() }
      ptrVel = { x: 0, y: 0 }
      canvas.style.cursor = 'grabbing'
      e.preventDefault()
    }

    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      const dt = Math.max((now - lastPtr.t) / 1000, 0.001)
      const inst = {
        x: (e.clientX - lastPtr.x) / dt,
        y: (e.clientY - lastPtr.y) / dt,
      }
      ptrVel.x = ptrVel.x * 0.6 + inst.x * 0.4
      ptrVel.y = ptrVel.y * 0.6 + inst.y * 0.4
      lastPtr = { x: e.clientX, y: e.clientY, t: now }

      if (dragging) return

      // shove: a fast cursor crossing the orb transfers momentum
      const a = anchorCenter()
      const d = Math.hypot(e.clientX - (a.x + pos.x), e.clientY - (a.y + pos.y))
      const reach = radius + 18
      if (d < reach && Math.hypot(ptrVel.x, ptrVel.y) > 240) {
        const f = Math.min(dt, 0.033) * 12 * (1 - d / reach)
        vel.x += ptrVel.x * f
        vel.y += ptrVel.y * f
      }
    }

    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      try {
        canvas.releasePointerCapture(e.pointerId)
      } catch {}
      canvas.style.cursor = 'grab'
    }

    if (!reduce) {
      // the roaming canvas is taken out of flow: a fixed element can never
      // expand the document's scrollable area, whatever the physics does
      canvas.style.position = 'fixed'
      canvas.style.left = '0'
      canvas.style.top = '0'
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      canvas.style.zIndex = '30'
      canvas.style.cursor = 'grab'
      canvas.style.touchAction = 'none'
      canvas.addEventListener('pointerdown', onDown)
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    }

    const frame = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.032)
      prev = now
      const t = reduce ? 0 : (now - start) / 1000
      const a = anchorCenter()

      if (!reduce) {
        // always on: the window is the orb's environment no matter which
        // section is on screen. The anchor rides with the page, so when you
        // scroll away the walls hold the orb at the window edge nearest its
        // home, and the spring walks it back as the section returns.
        if (dragging) {
          // the orb tracks the pointer directly; the velocity it keeps on
          // release is smoothed from that motion, so throws feel weighted
          const tx = lastPtr.x + grab.x - a.x
          const ty = lastPtr.y + grab.y - a.y
          const ivx = Math.max(Math.min((tx - pos.x) / Math.max(dt, 0.008), 4000), -4000)
          const ivy = Math.max(Math.min((ty - pos.y) / Math.max(dt, 0.008), 4000), -4000)
          vel.x = vel.x * 0.4 + ivx * 0.6
          vel.y = vel.y * 0.4 + ivy * 0.6
          pos.x = tx
          pos.y = ty
        } else {
          // soft spring home
          vel.x += (-SPRING * pos.x - DAMP * vel.x) * dt
          vel.y += (-SPRING * pos.y - DAMP * vel.y) * dt
          pos.x += vel.x * dt
          pos.y += vel.y * dt
        }

        // window edges are walls; the wall margin accounts for the
        // squash-and-stretch AABB so a speeding orb never spills the page
        let cx = a.x + pos.x
        let cy = a.y + pos.y
        const rad = (Math.atan2(vel.y, vel.x) * Math.PI) / 180
        const ca = Math.abs(Math.cos(rad))
        const sa = Math.abs(Math.sin(rad))
        const st = Math.min(Math.hypot(vel.x, vel.y) / 2600, 0.14)
        const halfW = radius * ((1 + st) * ca + (1 - st * 0.7) * sa)
        const halfH = radius * ((1 + st) * sa + (1 - st * 0.7) * ca)
        const minX = halfW
        const maxX = window.innerWidth - halfW
        const minY = halfH
        const maxY = window.innerHeight - halfH
        if (cx < minX) {
          cx = minX
          vel.x = Math.abs(vel.x) * REST
        } else if (cx > maxX) {
          cx = maxX
          vel.x = -Math.abs(vel.x) * REST
        }
        if (cy < minY) {
          cy = minY
          vel.y = Math.abs(vel.y) * REST
        } else if (cy > maxY) {
          cy = maxY
          vel.y = -Math.abs(vel.y) * REST
        }
        pos.x = cx - a.x
        pos.y = cy - a.y

        const speed = Math.hypot(vel.x, vel.y)
        if (speed > MAX_SPEED) {
          vel.x *= MAX_SPEED / speed
          vel.y *= MAX_SPEED / speed
        }
        energy += (Math.min(speed / 1400, 1) - energy) * Math.min(dt * 6, 1)

        // squash & stretch along the direction of travel
        const stretch = Math.min(speed / 2600, 0.14)
        const deg = (Math.atan2(vel.y, vel.x) * 180) / Math.PI
        canvas.style.transform =
          `translate3d(${(cx - radius).toFixed(2)}px, ${(cy - radius).toFixed(2)}px, 0) ` +
          `rotate(${deg.toFixed(2)}deg) scale(${(1 + stretch).toFixed(4)}, ${(1 - stretch * 0.7).toFixed(4)}) ` +
          `rotate(${(-deg).toFixed(2)}deg)`
        gl.uniform1f(uEnergy, energy)
      }

      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    frame(start)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      canvas.style.position = ''
      canvas.style.left = ''
      canvas.style.top = ''
      canvas.style.width = ''
      canvas.style.height = ''
      canvas.style.zIndex = ''
      canvas.style.transform = ''
      canvas.style.cursor = ''
      gl.deleteProgram(program)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      gl.deleteBuffer(buffer)
    }
  }, [size, color, floatHost])

  return (
    <div
      ref={rootRef}
      data-slot="fluid-orb"
      className={cn('relative rounded-full', className)}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      {...props}
    >
      {floatHost ? (
        createPortal(<canvas ref={canvasRef} className="h-full w-full" />, floatHost)
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}
    </div>
  )
}

export default FluidOrb
