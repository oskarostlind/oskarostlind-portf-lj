"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Partikelfältet som bär hela öppningen.
 *
 * Tre faser, alla drivna av scroll:
 *   1. `uScroll` (upplösning) — sfären andas, dras mot muspekaren och
 *      expanderar utåt tills formen släpper.
 *   2. `uDrift`  (drift)      — punkterna lämnar sfären, plattas ut mot ett
 *      brett fält och driver vidare som bakgrundstextur bakom manifestet.
 *   3. `uDepth`  (djup)       — fältet får tillbaka sitt z-spann samtidigt som
 *      kameran backar, så att 3D-känslan följer med längre ner på sidan i
 *      stället för att dö i en platt vägg.
 *
 * Ovanpå scrollen ligger två pekarhändelser: en lokal repulsion kring
 * markören och en impuls som klingar av vid klick. Båda räknas i skärmrymd —
 * det är där användaren ser dem, och det är enda sättet att få dem att kännas
 * som en hand mot ytan snarare än som en global lutning av hela formen.
 *
 * Ren GLSL, inga texturer, inga externa assets — laddar direkt.
 */

export type FieldProgress = { dissolve: number; drift: number; depth: number };

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uPointer;    // mjukt eftersläpande pekare — global lutning
  uniform vec2  uCursor;     // snabb pekare — lokal repulsion
  uniform float uCursorIn;   // 0 när ingen mus finns i vyn
  uniform float uScroll;
  uniform float uDrift;
  uniform float uDepth;
  uniform float uAspect;
  uniform vec2  uBurstPos;
  uniform float uBurst;      // 1 vid klick, faller linjärt mot 0
  varying float vNoise;
  varying vec3  vPos;
  varying float vDrift;
  varying float vGlow;

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
    // Fas 3 (uDepth) ger tillbaka z-spannet: fältet blir ett moln igen medan
    // kameran backar, vilket håller djupet vid liv längre ner på sidan.
    vec3 field = vec3(
      pos.x * 2.9 + sin(t * 1.3 + pos.y * 2.1) * 0.34,
      pos.y * 1.35 + cos(t * 0.9 + pos.x * 1.7) * 0.16,
      pos.z * mix(0.14, 0.78, uDepth) - uDepth * 0.85
    );
    pos = mix(pos, field, uDrift);

    // --- Pekarens närområde ------------------------------------------------
    // Punktens läge i NDC avgör avståndet till markören. x-axeln skalas med
    // bildförhållandet, annars blir "cirkeln" kring pekaren en ellips.
    vec4 mvProbe = modelViewMatrix * vec4(pos, 1.0);
    vec4 clipProbe = projectionMatrix * mvProbe;
    vec2 ndc = clipProbe.xy / max(abs(clipProbe.w), 0.0001);
    vec2 aspect = vec2(uAspect, 1.0);

    // Kamerans höger/upp/framåt uttryckta i objektrymd (raderna i modelView).
    // Förskjutningen måste ske i skärmplanet — annars vandrar punkterna in i
    // djupet i takt med att sfären roterar.
    vec3 camRight = vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]);
    vec3 camUp    = vec3(modelViewMatrix[0][1], modelViewMatrix[1][1], modelViewMatrix[2][1]);
    vec3 camFwd   = vec3(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2]);

    // Interaktionen dämpas när fältet driftat in bakom manifestet — där ligger
    // brödtext ovanpå, och en punktsvärm som hoppar undan musen stjäl läsning.
    float grip = uCursorIn * (1.0 - uDrift * 0.55);

    vec2 toCursor = (ndc - uCursor) * aspect;
    float dC = length(toCursor);
    vec2 dirC = dC > 0.0001 ? toCursor / dC : vec2(0.0, 1.0);
    float grab = exp(-dC * dC * 6.5);
    float repel = grab * 0.38 * grip;
    pos += (camRight * dirC.x + camUp * dirC.y) * repel;
    pos += camFwd * grab * 0.26 * grip;   // en mjuk bula mot kameran

    // --- Impuls vid klick --------------------------------------------------
    // En smal ring som växer utåt från klickpunkten och tunnas ut i takt med
    // att uBurst faller. Radien följer (1 - uBurst) → jämn utbredningshastighet.
    float wave = 1.0 - uBurst;
    vec2 toBurst = (ndc - uBurstPos) * aspect;
    float dB = length(toBurst);
    vec2 dirB = dB > 0.0001 ? toBurst / dB : vec2(0.0, 1.0);
    float ringD = (dB - wave * 1.55) * 3.4;
    float ring = exp(-ringD * ringD) * uBurst;
    float impulse = ring * 0.46 * (1.0 - uDrift * 0.4);
    pos += (camRight * dirB.x + camUp * dirB.y) * impulse;
    pos += camFwd * impulse * 0.45;

    vNoise = n;
    vPos = pos;
    vDrift = uDrift;
    vGlow = clamp(grab * grip * 0.85 + ring, 0.0, 1.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    // Punkterna krymper när fältet breder ut sig — annars blir det en vägg.
    // Kring pekaren och i impulsens ring får de däremot växa: det är den
    // detaljen som gör att interaktionen läses som fysisk.
    gl_PointSize = (2.4 + pull * 2.2 + vGlow * 2.6) * (1.0 - uDrift * 0.42) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uScroll;
  varying float vNoise;
  varying vec3  vPos;
  varying float vDrift;
  varying float vGlow;

  void main() {
    // Runda punkter i stället för kvadrater
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = dot(c, c);
    if (d > 0.25) discard;

    vec3 ink    = vec3(0.961, 0.961, 0.941);
    vec3 accent = vec3(0.0, 0.898, 1.0);

    float mixer = smoothstep(-0.45, 0.75, vNoise);
    vec3 col = mix(ink, accent, mixer * 0.85);
    // Pekaren och impulsen drar färgen mot accenten — aldrig hela vägen, det
    // ska läsa som ett svagt sken och inte som en lampa.
    col = mix(col, accent, vGlow * 0.55);

    float edge = smoothstep(0.25, 0.0, d);
    float depth = smoothstep(-1.9, 1.6, vPos.z);

    // Upplösningen tunnar ut fältet, men släcker det inte: en svag närvaro
    // följer med in i manifestet. Taket hålls lågt så att brödtexten ovanpå
    // behåller sin kontrast.
    float presence = mix(1.0, 0.26, clamp(uScroll, 0.0, 1.0));
    float alpha = edge * (0.16 + depth * 0.72) * presence * (1.0 - vDrift * 0.3);
    alpha += edge * vGlow * 0.3 * presence;

    gl_FragColor = vec4(col, alpha);
  }
`;

function Points({
  progressRef,
  surfaceRef,
}: {
  progressRef: React.RefObject<FieldProgress>;
  surfaceRef?: React.RefObject<HTMLElement | null>;
}) {
  const mesh = useRef<THREE.Points>(null);
  const { size } = useThree();
  const pointer = useRef(new THREE.Vector2(0, 0));
  const smoothed = useRef(new THREE.Vector2(0, 0));
  const cursor = useRef(new THREE.Vector2(0, 0));
  const present = useRef(0);

  const geometry = useMemo(() => {
    // Punkttätheten skalas efter skärmyta — färre punkter på små skärmar.
    const detail = size.width > 1400 ? 96 : size.width > 900 ? 80 : 64;
    return new THREE.SphereGeometry(1.35, detail, detail);
  }, [size.width]);

  // Geometrin byts när viewporten passerar en brytpunkt — den gamla måste
  // lämna GPU:n, annars läcker varje resize en buffert.
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uCursor: { value: new THREE.Vector2(0, 0) },
      uCursorIn: { value: 0 },
      uScroll: { value: 0 },
      uDrift: { value: 0 },
      uDepth: { value: 0 },
      uAspect: { value: 1 },
      uBurstPos: { value: new THREE.Vector2(0, 0) },
      uBurst: { value: 0 },
    }),
    []
  );

  /**
   * Pekaren läses på fönstret, inte via R3F:s eventsystem. Canvasen ligger i
   * ett `pointer-events: none`-lager (den får inte fånga klick från hero-
   * knapparna under), och då når inga pointer-events fram till R3F alls.
   * Fönsterlyssnaren ger dessutom exakt de koordinater shadern vill ha,
   * eftersom canvasen täcker hela viewporten.
   */
  useEffect(() => {
    const toNdc = (clientX: number, clientY: number) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      return [(clientX / w) * 2 - 1, -(clientY / h) * 2 + 1] as const;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const [x, y] = toNdc(event.clientX, event.clientY);
      pointer.current.set(x, y);
      present.current = 1;
    };

    const onLeave = () => {
      present.current = 0;
    };

    const onDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const surface = surfaceRef?.current;
      // Bara klick på öppningens egen yta ger impuls — och aldrig på något
      // som redan har en egen affordans (länkar, knappar, fält).
      if (surface && target && !surface.contains(target)) return;
      if (target?.closest("a, button, input, textarea, select, label, [role='button']")) {
        return;
      }
      const [x, y] = toNdc(event.clientX, event.clientY);
      uniforms.uBurstPos.value.set(x, y);
      uniforms.uBurst.value = 1;
      // Klick utan föregående musrörelse (tangentbord → mus) ska inte ge en
      // impuls från en pekare som shadern tror ligger i origo.
      pointer.current.set(x, y);
      present.current = 1;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [surfaceRef, uniforms]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);

    // Två eftersläp av samma pekare: det tröga bär den globala lutningen och
    // rotationen, det snabba bär den lokala repulsionen. Ett enda värde kan
    // inte göra båda — tröghet läser som elegans i formen men som lagg i
    // interaktionen.
    smoothed.current.lerp(pointer.current, 0.045);
    cursor.current.lerp(pointer.current, 0.16);

    const target = progressRef.current ?? { dissolve: 0, drift: 0, depth: 0 };

    uniforms.uTime.value += delta;
    uniforms.uPointer.value.copy(smoothed.current);
    uniforms.uCursor.value.copy(cursor.current);
    uniforms.uCursorIn.value += (present.current - uniforms.uCursorIn.value) * 0.09;
    uniforms.uAspect.value = state.size.width / Math.max(1, state.size.height);
    uniforms.uScroll.value += (target.dissolve - uniforms.uScroll.value) * 0.09;
    uniforms.uDrift.value += (target.drift - uniforms.uDrift.value) * 0.07;
    uniforms.uDepth.value += ((target.depth ?? 0) - uniforms.uDepth.value) * 0.06;

    // Impulsen klingar av på drygt en sekund, oberoende av bildfrekvens.
    if (uniforms.uBurst.value > 0) {
      uniforms.uBurst.value = Math.max(0, uniforms.uBurst.value - d * 0.85);
    }

    // Kameran backar och lyfter en aning i takt med uDepth, och parallaxar
    // svagt med pekaren. Det är den rörelsen som gör att fältet fortsätter
    // läsas som ett rum längre ner på sidan.
    const cam = state.camera;
    const depth = uniforms.uDepth.value;
    cam.position.z += (4.2 + depth * 1.5 - cam.position.z) * 0.06;
    cam.position.x += (smoothed.current.x * 0.26 - cam.position.x) * 0.05;
    cam.position.y += (smoothed.current.y * 0.16 + depth * 0.34 - cam.position.y) * 0.05;
    cam.lookAt(0, 0, 0);

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
  surfaceRef,
}: {
  progressRef: React.RefObject<FieldProgress>;
  /** Ytan där klick ska ge impuls — normalt hela öppningen. */
  surfaceRef?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <Canvas
      aria-hidden
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Points progressRef={progressRef} surfaceRef={surfaceRef} />
    </Canvas>
  );
}
