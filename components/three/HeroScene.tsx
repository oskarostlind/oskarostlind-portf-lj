"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Partikelfältet som bär hela öppningen.
 *
 * Två faser, båda drivna av scroll:
 *   1. `uScroll` (upplösning) — sfären andas, dras mot muspekaren och
 *      expanderar utåt tills formen släpper.
 *   2. `uDrift`  (drift)      — punkterna lämnar sfären, plattas ut mot ett
 *      brett fält och driver vidare som bakgrundstextur bakom manifestet.
 *
 * Ren GLSL, inga texturer, inga externa assets — laddar direkt.
 */

export type FieldProgress = { dissolve: number; drift: number };

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uScroll;
  uniform float uDrift;
  varying float vNoise;
  varying vec3  vPos;
  varying float vDrift;

  // Klassisk simplex-noise (Ashima Arts, MIT)
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec3 pos = position;
    float t = uTime * 0.16;

    float n = snoise(pos * 1.25 + vec3(t, t * 0.7, -t * 0.4));
    float n2 = snoise(pos * 2.8 - vec3(t * 0.6, -t, t * 0.3));

    // Muspekaren drar formen mjukt åt sitt håll
    float pull = dot(normalize(pos), normalize(vec3(uPointer, 0.85))) * 0.5 + 0.5;

    float amp = 0.34 + pull * 0.26;
    pos += normal * (n * amp + n2 * 0.075);

    // Vid scroll expanderar formen och löses upp
    pos += normal * uScroll * 1.6;

    // Fas 2: punkterna släpper sfären och plattas ut till ett brett fält.
    // Bredden växer, djupet kollapsar, och en långsam våg driver dem i sidled
    // så att fältet lever i stället för att stå still bakom manifestet.
    vec3 field = vec3(
      pos.x * 2.9 + sin(t * 1.3 + pos.y * 2.1) * 0.34,
      pos.y * 1.35 + cos(t * 0.9 + pos.x * 1.7) * 0.16,
      pos.z * 0.14
    );
    pos = mix(pos, field, uDrift);

    vNoise = n;
    vPos = pos;
    vDrift = uDrift;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    // Punkterna krymper när fältet breder ut sig — annars blir det en vägg.
    gl_PointSize = (2.4 + pull * 2.2) * (1.0 - uDrift * 0.42) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uScroll;
  varying float vNoise;
  varying vec3  vPos;
  varying float vDrift;

  void main() {
    // Runda punkter i stället för kvadrater
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = dot(c, c);
    if (d > 0.25) discard;

    vec3 ink    = vec3(0.961, 0.961, 0.941);
    vec3 accent = vec3(0.0, 0.898, 1.0);

    float mixer = smoothstep(-0.45, 0.75, vNoise);
    vec3 col = mix(ink, accent, mixer * 0.85);

    float edge = smoothstep(0.25, 0.0, d);
    float depth = smoothstep(-1.9, 1.6, vPos.z);

    // Upplösningen tunnar ut fältet, men släcker det inte: en svag närvaro
    // följer med in i manifestet. Taket hålls lågt så att brödtexten ovanpå
    // behåller sin kontrast.
    float presence = mix(1.0, 0.26, clamp(uScroll, 0.0, 1.0));
    float alpha = edge * (0.16 + depth * 0.72) * presence * (1.0 - vDrift * 0.3);

    gl_FragColor = vec4(col, alpha);
  }
`;

function Points({
  progressRef,
}: {
  progressRef: React.RefObject<FieldProgress>;
}) {
  const mesh = useRef<THREE.Points>(null);
  const { size } = useThree();
  const pointer = useRef(new THREE.Vector2(0, 0));
  const smoothed = useRef(new THREE.Vector2(0, 0));

  const geometry = useMemo(() => {
    // Punkttätheten skalas efter skärmyta — färre punkter på små skärmar.
    const detail = size.width > 1400 ? 96 : size.width > 900 ? 80 : 64;
    return new THREE.SphereGeometry(1.35, detail, detail);
  }, [size.width]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uDrift: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    const p = state.pointer;
    pointer.current.set(p.x, p.y);
    smoothed.current.lerp(pointer.current, 0.045);

    const target = progressRef.current ?? { dissolve: 0, drift: 0 };

    uniforms.uTime.value += delta;
    uniforms.uPointer.value.copy(smoothed.current);
    uniforms.uScroll.value += (target.dissolve - uniforms.uScroll.value) * 0.09;
    uniforms.uDrift.value += (target.drift - uniforms.uDrift.value) * 0.07;

    if (mesh.current) {
      // Rotationen mattas av när formen blivit ett fält — annars snurrar
      // bakgrundstexturen distraherande bakom manifestet.
      const calm = 1 - uniforms.uDrift.value * 0.78;
      mesh.current.rotation.y += delta * 0.055 * calm;
      mesh.current.rotation.x =
        smoothed.current.y * 0.22 * calm + uniforms.uDrift.value * 0.12;
    }
  });

  return (
    <points ref={mesh} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroScene({
  progressRef,
}: {
  progressRef: React.RefObject<FieldProgress>;
}) {
  return (
    <Canvas
      aria-hidden
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Points progressRef={progressRef} />
    </Canvas>
  );
}
