/**
 * Har besökaren en riktig GPU?
 *
 * Jobbdatorer, fjärrskrivbord och virtuella maskiner kör ofta WebGL i
 * mjukvara (SwiftShader, llvmpipe, Microsoft Basic Render Driver/WARP).
 * WebGL "finns" då — kontexten skapas utan fel — men varje bildruta
 * rasteriseras på CPU:n. Partikelfältet i heron frös helt i ett sådant läge
 * (0 bilder/s i 20 s i SwiftShader), och den halvritade bildrutan lade en vit
 * slöja över rubriken.
 *
 * Tre skydd, billigast först:
 *   1. Sessionen har redan konstaterat att GPU:n är för långsam (se nedan).
 *   2. `failIfMajorPerformanceCaveat` — browsern vägrar ge en kontext om den
 *      bara kan erbjuda mjukvarurendering. Det kanoniska testet.
 *   3. Rendersträngen matchar en känd mjukvarurenderare — för browsers som
 *      ändå lämnar ut en kontext.
 * Därutöver mäter heron sina första bildrutor och anropar `markGpuSlow()` om
 * hårdvaran är för svag trots allt; då slipper resten av sessionen försöka.
 */

const SLOW_KEY = "oo:gpu-slow";
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic|warp|mesa offscreen/i;

let cached: boolean | null = null;

export function gpuCapable(): boolean {
  if (cached !== null) return cached;
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(SLOW_KEY) === "1") return (cached = false);
  } catch {
    /* lagring blockerad — gå vidare med de andra testen */
  }

  try {
    const canvas = document.createElement("canvas");
    const attrs: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const gl = (canvas.getContext("webgl2", attrs) ??
      canvas.getContext("webgl", attrs)) as WebGLRenderingContext | null;
    if (!gl) return (cached = false);

    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
    );
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    cached = !SOFTWARE.test(renderer);
  } catch {
    cached = false;
  }
  return cached;
}

/** Anropas när en scen mätt upp för låg bildfrekvens. Gäller resten av sessionen. */
export function markGpuSlow() {
  cached = false;
  try {
    window.sessionStorage.setItem(SLOW_KEY, "1");
  } catch {
    /* ingen lagring — flaggan i minnet räcker för den här sidvisningen */
  }
}
