"use client";

import { useCallback, useEffect } from "react";
import * as THREE from "three";

/**
 * WebGL-hover för casekorten: en ringvåg som utgår från pekaren, en långsam
 * uv-vågning och en knappt märkbar kromatisk isärdragning i vågens riktning.
 *
 * En enda delad renderer och canvas för hela sidan — inte en per kort.
 * Motivet: bara ett kort kan vara hovrat åt gången, så fler kontexter vore ren
 * spillvärme, och browsern ger upp runt 16 samtidiga WebGL-kontexter (arbets-
 * sidans sju kort plus heron skulle närma sig det obehagligt fort). Canvasen
 * flyttas i DOM till det kort som hovras — en canvas behåller sin kontext vid
 * omflyttning — och kopplas loss igen så fort effekten klingat av. Renderloopen
 * lever bara medan effekten är på väg in eller ut; en frånkopplad canvas ritar
 * ingenting.
 *
 * Texturen byggs direkt från det <img> som next/image redan renderat. Ingen
 * extra nätverkshämtning, ingen gissning kring vilken srcset-bredd som gäller,
 * och exakt samma pixlar som CSS visar — vilket är förutsättningen för att
 * övergången till canvas ska vara osynlig.
 *
 * Utan mus, vid reducerad rörelse eller när `html.has-motion` saknas monteras
 * ingenting alls: kortet beter sig precis som förut.
 */

type Ctx = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  geometry: THREE.PlaneGeometry;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Kvadraten täcker hela vyn av sig själv — ingen kameramatris behövs.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  // highp, inte mediump: förskjutningarna ligger på tusendels-uv och mediump
  // kvantiserar dem till synliga trappsteg i bilden.
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2  uCover;    // uv-skala som återskapar object-fit: cover
  uniform vec2  uPointer;  // pekaren i kortets uv-rum
  uniform float uStrength; // 0 → 1, lerpas in och ut
  uniform float uTime;
  uniform float uAspect;   // kortets bredd/höjd
  varying vec2 vUv;

  void main() {
    vec2 p = vUv;
    vec2 d = (p - uPointer) * vec2(uAspect, 1.0);
    float dist = length(d);
    vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);

    // Ringvågen utgår från pekaren och dör ut på ungefär halva kortet.
    float ripple = sin(dist * 15.0 - uTime * 3.2) * exp(-dist * 3.4);

    // En långsam grundvågning så att ytan lever även när musen står still.
    vec2 swell = vec2(
      sin(p.y * 8.5 + uTime * 0.85),
      cos(p.x * 7.0 - uTime * 0.7)
    ) * 0.0028;

    vec2 offset = (dir * ripple * 0.013 + swell) * uStrength;

    // Svag inzoom — samma gest som CSS-skalningen den ersätter under hover.
    float zoom = 1.0 - uStrength * 0.04;
    vec2 uv = (p - 0.5) * zoom + 0.5 + offset;
    uv = (uv - 0.5) * uCover + 0.5;

    // Kanalerna dras isär i vågens riktning. Håll den här låg: mer än så och
    // det slutar läsa som optik och börjar läsa som ett trasigt filter.
    vec2 shift = dir * uStrength * (0.0022 + abs(ripple) * 0.005);

    vec3 col;
    col.r = texture2D(uTex, clamp(uv + shift, 0.0, 1.0)).r;
    col.g = texture2D(uTex, clamp(uv, 0.0, 1.0)).g;
    col.b = texture2D(uTex, clamp(uv - shift, 0.0, 1.0)).b;

    // Ett spår av accentfärgen där vågen är som starkast.
    col += vec3(0.0, 0.898, 1.0) * abs(ripple) * uStrength * 0.055;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* --- Delat tillstånd ------------------------------------------------------ */

let ctx: Ctx | null = null;
let failed = false;
let users = 0;

let host: HTMLElement | null = null;
let strength = 0;
let strengthTarget = 0;
let raf = 0;
let last = 0;
let elapsed = 0;
let resizeObserver: ResizeObserver | null = null;

const pointer = new THREE.Vector2(0.5, 0.5);
const pointerTarget = new THREE.Vector2(0.5, 0.5);

/** Små-LRU: texturerna är redan dekodade bilder, men GPU-minne är inte gratis. */
const textures = new Map<string, THREE.Texture>();
const TEXTURE_LIMIT = 4;

/** Alla villkor som måste hålla för att WebGL alls ska få monteras. */
export function cardFxAvailable() {
  if (failed || typeof window === "undefined") return false;
  if (!document.documentElement.classList.contains("has-motion")) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  return true;
}

function createCtx(): Ctx | null {
  if (ctx) return ctx;
  if (failed) return null;

  try {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearAlpha(0);
    // Texturerna läggs in orörda (NoColorSpace) och skrivs ut orörda, så att
    // canvasens pixlar blir identiska med den <img> den lägger sig ovanpå.
    // Minsta färgrymdskonvertering här ger en synlig ton-knäpp vid hover.
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    canvas.style.transition = "opacity 90ms linear";
    canvas.style.opacity = "0";

    canvas.addEventListener("webglcontextlost", onContextLost);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTex: { value: null },
        uCover: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uStrength: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: 1 },
      },
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;

    const scene = new THREE.Scene();
    scene.add(mesh);

    ctx = { renderer, scene, camera: new THREE.Camera(), geometry, material, mesh };
    return ctx;
  } catch {
    // Ingen kontext att få — kortet får leva vidare med sin CSS-hover.
    failed = true;
    return null;
  }
}

function onContextLost(event: Event) {
  event.preventDefault();
  failed = true;
  detach();
  destroy();
}

function textureFor(img: HTMLImageElement, renderer: THREE.WebGLRenderer) {
  if (!img.complete || img.naturalWidth === 0) return null;

  const key = img.currentSrc || img.src;
  const cached = textures.get(key);
  if (cached) {
    // Touch: flytta sist i insättningsordningen så att LRU:n stämmer.
    textures.delete(key);
    textures.set(key, cached);
    return cached;
  }

  const texture = new THREE.Texture(img);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;

  textures.set(key, texture);
  while (textures.size > TEXTURE_LIMIT) {
    const oldest = textures.keys().next().value;
    if (oldest === undefined) break;
    textures.get(oldest)?.dispose();
    textures.delete(oldest);
  }

  return texture;
}

function syncSize() {
  if (!ctx || !host) return;
  const rect = host.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  // updateStyle = false: canvasen ligger på 100 % av kortet via CSS, och att
  // låta three skriva pixelbredder i style skulle bryta den kopplingen.
  ctx.renderer.setSize(w, h, false);
  ctx.material.uniforms.uAspect.value = w / h;

  const texture = ctx.material.uniforms.uTex.value as THREE.Texture | null;
  const image = texture?.image as HTMLImageElement | undefined;
  if (image?.naturalWidth) {
    // object-fit: cover, uttryckt som en uv-skala kring mitten.
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const boxAspect = w / h;
    const cover = ctx.material.uniforms.uCover.value as THREE.Vector2;
    if (imageAspect > boxAspect) cover.set(boxAspect / imageAspect, 1);
    else cover.set(1, imageAspect / boxAspect);
  }
}

function frame(now: number) {
  raf = requestAnimationFrame(frame);
  if (!ctx) return;

  const dt = Math.min((now - last) / 1000 || 0, 0.05);
  last = now;
  elapsed += dt;

  // Bildfrekvensoberoende lerp: ~99 % framme efter 0,6 s, ~90 % efter 0,3 s.
  // Långsammare än en CSS-transition på samma tid, vilket är poängen — vågen
  // ska växa fram, inte slås på.
  const k = 1 - Math.pow(0.01, dt / 0.6);
  strength += (strengthTarget - strength) * k;
  pointer.lerp(pointerTarget, 1 - Math.pow(0.002, dt / 0.18));

  const u = ctx.material.uniforms;
  u.uStrength.value = strength;
  u.uTime.value = elapsed;
  (u.uPointer.value as THREE.Vector2).copy(pointer);

  ctx.renderer.render(ctx.scene, ctx.camera);

  // När effekten är helt ute finns ingen anledning att hålla vare sig loop
  // eller canvas vid liv — kortet visar sin vanliga <Image> igen.
  if (strengthTarget === 0 && strength < 0.002) {
    strength = 0;
    detach();
  }
}

function start() {
  if (raf) return;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

function stop() {
  if (!raf) return;
  cancelAnimationFrame(raf);
  raf = 0;
}

/** Kopplar loss canvasen från kortet och stannar loopen. */
export function detach(only?: HTMLElement | null) {
  if (only && host !== only) return;
  stop();
  resizeObserver?.disconnect();
  resizeObserver = null;
  strength = 0;
  strengthTarget = 0;
  if (ctx) {
    ctx.renderer.domElement.style.opacity = "0";
    ctx.renderer.domElement.remove();
  }
  host = null;
}

export function enter(next: HTMLElement, img: HTMLImageElement) {
  if (!cardFxAvailable()) return;
  const context = createCtx();
  if (!context) return;

  const texture = textureFor(img, context.renderer);
  if (!texture) {
    // Bilden är inte dekodad än — låt CSS sköta den här hovern och förbered
    // för nästa gång.
    void img.decode?.().catch(() => {});
    return;
  }

  if (host !== next) {
    detach();
    host = next;
    strength = 0;
    next.appendChild(context.renderer.domElement);
    resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(next);
  }

  // Sätts alltid: next/image kan ha bytt srcset sedan förra hovern.
  context.material.uniforms.uTex.value = texture;
  syncSize();
  strengthTarget = 1;
  start();

  const canvas = context.renderer.domElement;
  if (canvas.style.opacity !== "1") {
    // En bildruta på 0 innan fadet, annars hoppar övergången över transitionen.
    requestAnimationFrame(() => {
      if (host === next) canvas.style.opacity = "1";
    });
  }
}

export function move(target: HTMLElement, u: number, v: number) {
  if (host !== target) return;
  pointerTarget.set(u, v);
}

export function leave(target: HTMLElement) {
  if (host !== target) return;
  strengthTarget = 0;
  start();
}

function destroy() {
  stop();
  resizeObserver?.disconnect();
  resizeObserver = null;
  host = null;
  if (!ctx) return;

  ctx.renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
  ctx.renderer.domElement.remove();
  textures.forEach((texture) => texture.dispose());
  textures.clear();
  ctx.geometry.dispose();
  ctx.material.dispose();
  ctx.renderer.dispose();
  ctx.renderer.forceContextLoss();
  ctx = null;
}

/* --- React-limmet --------------------------------------------------------- */

/**
 * Kopplar ett kort till den delade effekten. Returnerar pekarhanterare som
 * läggs på bildytan, plus `release()` för att lämna ytan omedelbart (används
 * vid navigering, så att View Transition-snapshoten tas av <Image> och inte
 * av en canvas som är på väg att försvinna).
 */
export function useCardHoverFx(
  hostRef: React.RefObject<HTMLElement | null>,
  imgRef: React.RefObject<HTMLImageElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;
    users += 1;
    return () => {
      users -= 1;
      // Ovillkorligt: `detach` är en nolloperation för alla kort utom det som
      // faktiskt håller canvasen. Skulle kortet försvinna under pekaren (filter,
      // navigering) vore alternativet en loop som ritar i en föräldralös canvas.
      detach(hostRef.current);
      // Sista kortet lämnar sidan → riv hela riggen, inte bara canvasen.
      if (users <= 0) destroy();
    };
  }, [enabled, hostRef]);

  const onPointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType !== "mouse") return;
      const node = hostRef.current;
      const img = imgRef.current;
      if (!node || !img) return;
      const rect = node.getBoundingClientRect();
      pointerTarget.set(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height
      );
      pointer.copy(pointerTarget);
      enter(node, img);
    },
    [enabled, hostRef, imgRef]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType !== "mouse") return;
      const node = hostRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      move(
        node,
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height
      );
    },
    [enabled, hostRef]
  );

  const onPointerLeave = useCallback(() => {
    const node = hostRef.current;
    if (!node) return;
    leave(node);
  }, [hostRef]);

  const release = useCallback(() => {
    detach(hostRef.current);
  }, [hostRef]);

  return { onPointerEnter, onPointerMove, onPointerLeave, release };
}
