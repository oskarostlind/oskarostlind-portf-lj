/**
 * Delad mediahjälp för case. Så länge `public/case/` är tom renderas en
 * deterministisk gradient per slug — samma gradient på kortet och på
 * casesidan, vilket är en förutsättning för att View Transition-morfningen
 * ska se sammanhängande ut.
 */

import { caseImages } from "@/lib/caseImages.generated";
import type { Project } from "@/lib/projects";

export type CaseMedia =
  | { kind: "image"; src: string; blurDataURL?: string }
  | { kind: "gradient"; background: string };

/**
 * Vad ett case ska visa i sin bildyta — en riktig bild om det finns en, annars
 * gradienten. Två källor, i tur och ordning:
 *
 *  1. `project.image` i `lib/projects.ts` — en uttrycklig sökväg, för när en
 *     bild ska pekas ut manuellt eller ligga utanför namnkonventionen.
 *  2. `public/case/<slug>.<ext>` — hittas automatiskt av `scripts/case-images.mjs`
 *     och kommer med suddig platshållare. Det här är den normala vägen: lägg
 *     upp filen, klart. Ingen kodändring behövs.
 *
 * Alla tre vyer (kortet, casesidans hero, "nästa case") går genom den här
 * funktionen, så en bild dyker upp på alla tre samtidigt eller ingen alls.
 * Gradientens determinism är det som håller View Transition-morfningen ihop.
 */
export function caseMediaFor(project: Pick<Project, "slug" | "image">): CaseMedia {
  if (project.image) return { kind: "image", src: project.image };

  const generated = caseImages[project.slug];
  if (generated) {
    return { kind: "image", src: generated.src, blurDataURL: generated.blurDataURL };
  }

  return { kind: "gradient", background: gradientFor(project.slug) };
}

/**
 * Deterministisk gradient per slug — används tills riktiga bilder finns.
 *
 * Kulören hålls medvetet inom accentens familj (cyan → teal → indigo).
 * Den fria 360-graders spridning som låg här tidigare gav grönt på ett kort
 * och magenta på nästa, vilket läste som slumpmässigt snarare än designat på
 * en sajt vars hela identitet är en enda accentfärg mot svart. Variationen
 * bärs nu av ljuspunktens läge och mättnad i stället för av kulören, så att
 * korten känns som en svit.
 */
export function gradientFor(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) % 9973;

  const a = 172 + (hash % 46); // 172–217
  const b = 192 + ((hash >> 3) % 44); // 192–235
  const x = 22 + (hash % 28);
  const y = 16 + ((hash >> 2) % 26);

  return [
    `radial-gradient(72% 62% at ${x}% ${y}%, hsl(${a} 84% 26% / 0.88), transparent 62%)`,
    `radial-gradient(58% 68% at ${100 - x}% ${100 - y}%, hsl(${b} 88% 19% / 0.82), transparent 60%)`,
    `linear-gradient(150deg, #0d0d0f, #141417)`,
  ].join(", ");
}

/**
 * Namnet som binder ihop kortets bildyta med casesidans hero.
 * Måste vara unikt per dokument — bara ett element åt gången får bära det.
 */
export const CASE_MEDIA_VT_NAME = "case-media";
