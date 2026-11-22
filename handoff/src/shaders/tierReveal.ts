/**
 * GLSL ES 3.00 shaders for the liquid-marble tier reveal.
 * Generated from reference/liquid-reveal-demo.html (same source of truth).
 *
 * Uniforms
 *   uRes   vec2   drawing-buffer size in device px (matches gl_FragCoord)
 *   uO     vec2   reveal origin, device px, origin bottom-left
 *   uM     vec2   cursor position for the sheen, same space
 *   uT     float  seconds of flow time (already speed-scaled)
 *   uP     float  reveal progress 0..1
 *   uS     float  1 = add travertine strata (Citizen)
 *   uMA    float  cursor sheen alpha 0..1
 *   uD     float  device pixel ratio (keeps dither and sparkles ~3px/2px)
 *   uBase  vec3   base (dark) card surface
 *   uBg,uBg2,uVein vec3  tier stone, light stone, vein colour
 *   uTB,uTT sampler2D  base-layer text, theme-layer text (premultiplied off)
 */
export const VERT = [
  "#version 300 es",
  "void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}",
].join("\n");

export const FRAG = [
  "#version 300 es",
  "precision highp float;",
  "uniform vec2 uRes,uO,uM;uniform float uT,uP,uS,uMA,uD;uniform vec3 uBase,uBg,uBg2,uVein;uniform sampler2D uTB,uTT;out vec4 oc;",
  "float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}",
  "float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}",
  "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}",
  "float bay(vec2 c){int i=int(mod(c.x,4.))+4*int(mod(c.y,4.));float m[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);return (m[i]+.5)/16.;}",
  "void main(){",
  "vec2 f=gl_FragCoord.xy,uv=f/uRes;float as=uRes.x/uRes.y;",
  "vec2 p=vec2(uv.x*as,uv.y),o=vec2(uO.x/uRes.x*as,uO.y/uRes.y);",
  "float R=uP*length(vec2(as,1.))*1.12;",
  "float wob=sin(3.14159*clamp(uP,0.,1.));",
  "vec2 w=vec2(fbm(p*2.2+uT*.25),fbm(p*2.2+5.2-uT*.2));",
  "float d=length(p-o)+((fbm(p*3.+w*2.+uT*.18)-.5)*.55+(w.x-.5)*.1)*wob;",
  "float s=R-d;float m=smoothstep(0.,.012,s);",
  "float pres=smoothstep(0.,.04,uP)*(1.-smoothstep(.9,1.,uP));",
  "vec2 dir=normalize(p-o+1e-4);",
  "float rip=sin(s*70.-uT*2.)*exp(-abs(s)*10.)*wob;",
  "float disp=rip*.012+exp(-s*s/.002)*.012*wob;",
  "vec2 q=p+dir*disp;vec2 uv2=uv+dir*disp*vec2(1./as,1.);",
  "vec4 tt=texture(uTT,uv2);",
  "vec2 fl=vec2(fbm(q*1.6+uT*.05),fbm(q*1.6+3.1-uT*.04));",
  "float f1=fbm(q*2.+fl*2.4+uT*.03);",
  "float ridge=1.-abs(2.*f1-1.);",
  "float vein=(pow(ridge,9.)+.35*pow(1.-abs(2.*fbm(q*5.+fl*3.)-1.),14.))*(1.-.85*tt.a);",
  "float st=uS*(.5+.5*sin(q.y*22.+f1*9.))*.35;",
  "vec3 art=mix(uBg,uBg2,smoothstep(.25,.8,f1+st));",
  "art=mix(art,uVein,clamp(vein,0.,1.)*.9);",
  "float ms=exp(-pow(length(p-vec2(uM.x/uRes.x*as,uM.y/uRes.y)),2.)*9.)*uMA;",
  "art+=ms*.14*(uBg2+.25);",
  "art=mix(art,tt.rgb,tt.a);",
  "vec3 base=uBase+(h(f*.5)-.5)*.012;",
  "vec4 bt=texture(uTB,uv);base=mix(base,bt.rgb,bt.a);",
  "float ah=max(-s,0.);float out_=step(s,0.)*pres;",
  "base*=1.-.38*(1.-smoothstep(0.,.07,ah))*out_;",
  "float mist=(1.-smoothstep(0.,.11,ah))*out_;",
  "float dt=step(bay(floor(f/(3.*uD))),mist*mist);",
  "base=mix(base,vec3(.78,.64,.36),dt*.85);",
  "vec3 col=mix(base,art,m);",
  "float inn=smoothstep(0.,.03,s)*(1.-smoothstep(.03,.14,s))*pres;",
  "col+=inn*.08*vec3(1.,.95,.85);",
  "float ed=exp(-s*s/.0001)*pres;",
  "col=mix(col,vec3(1.,.87,.55),clamp(ed,0.,1.)*.95);",
  "float sp=step(.988,h(floor(f/(2.*uD))+floor(uT*10.)))*exp(-s*s/.0004)*pres;",
  "col=mix(col,vec3(1.),sp);",
  "oc=vec4(col,1.);}",
].join("\n");
