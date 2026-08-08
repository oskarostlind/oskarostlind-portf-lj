export const site = {
  name: "Oskar Östlind",
  domain: "oskarostlind.se",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oskarostlind.se",
  email: "oskarandreassen01@gmail.com",
  github: "https://github.com/oskarostlind",
  linkedin: "https://www.linkedin.com/in/oskar-östlind-8a5b59234/",
  timezone: "Europe/Stockholm",
} as const;

/* Här låg tidigare `calLink` (Cal.com-bokning) och `analyticsToken`
   (Cloudflare Web Analytics). Båda borttagna 2026-08-08 på Oskars begäran:
   ingen kalenderfunktion önskas, och inget behov av besöksstatistik just nu.
   Vill du ha statistik senare är Vercels egen den naturliga vägen — den
   kräver paketet `@vercel/analytics`, en `<Analytics />` i layouten och en
   knapp i Vercel-panelen. Vercels inbyggda siffror utan paket är
   infrastrukturmätning (requests, bandbredd), inte besökare. */
