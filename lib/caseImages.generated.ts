// GENERERAD FIL — redigera inte för hand.
// Skapas av `scripts/case-images.mjs`, som körs som `prebuild`.
// Lägg till en bild genom att lägga filen i `public/case/<slug>.<jpg|png|webp|avif>`.

export interface CaseImage {
  src: string;
  width: number;
  height: number;
  /** Saknas om sharp inte var tillgänglig när filen genererades. */
  blurDataURL?: string;
}

export const caseImages: Record<string, CaseImage> = {};
