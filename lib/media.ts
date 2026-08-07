/**
 * Delad mediahjälp för case. Så länge `public/case/` är tom renderas en
 * deterministisk gradient per slug — samma gradient på kortet och på
 * casesidan, vilket är en förutsättning för att View Transition-morfningen
 * ska se sammanhängande ut.
 */

/** Deterministisk gradient per slug — används tills riktiga bilder finns. */
export function gradientFor(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) % 360;
  const a = hash;
  const b = (hash + 48) % 360;
  return `radial-gradient(70% 60% at 30% 25%, hsl(${a} 70% 22% / 0.9), transparent 62%), radial-gradient(60% 70% at 78% 78%, hsl(${b} 80% 18% / 0.85), transparent 60%), linear-gradient(150deg, #0d0d0f, #141417)`;
}

/**
 * Namnet som binder ihop kortets bildyta med casesidans hero.
 * Måste vara unikt per dokument — bara ett element åt gången får bära det.
 */
export const CASE_MEDIA_VT_NAME = "case-media";
