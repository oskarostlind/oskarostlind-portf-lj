/* BORTTAGEN 2026-08-08 — Cloudflare Web Analytics är struken på Oskars
 * begäran: inget behov av besöksstatistik just nu.
 *
 * Vill du ha statistik senare är Vercels egen den naturliga vägen, eftersom
 * sajten redan ligger där: `npm i @vercel/analytics`, rendera <Analytics />
 * i `app/[locale]/layout.tsx` och slå på Web Analytics i Vercel-panelen.
 * Vercels siffror utan det paketet är infrastrukturmätning (requests,
 * bandbredd), inte besökare och sidvisningar.
 *
 * Filen ligger kvar tom bara för att byggsandlådan inte får radera filer i
 * den molnmonterade projektmappen. Ta bort den med `git rm` vid nästa commit.
 */
export {};
