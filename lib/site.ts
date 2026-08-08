export const site = {
  name: "Oskar Östlind",
  domain: "oskarostlind.se",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oskarostlind.se",
  email: "oskarandreassen01@gmail.com",
  github: "https://github.com/oskarostlind",
  linkedin: "https://www.linkedin.com/in/oskar-östlind-8a5b59234/",
  timezone: "Europe/Stockholm",

  /**
   * Cal.com-länk på formen `anvandarnamn/30min`, satt via `NEXT_PUBLIC_CAL_LINK`.
   * Är variabeln tom renderas ingen bokningsmodul alls. Ett påhittat användarnamn
   * hade lett besökaren till en 404 mitt i det mest köpnära ögonblicket på sajten,
   * så tomt är det enda försvarbara defaultvärdet.
   */
  calLink: process.env.NEXT_PUBLIC_CAL_LINK ?? "",

  /**
   * Cloudflare Web Analytics — cookiefritt, gratis och utan volymtak.
   * Token hämtas i Cloudflare-panelen under Web Analytics → Add a site.
   * Tom variabel = ingen mätning och inget tredjepartsskript alls.
   */
  analyticsToken: process.env.NEXT_PUBLIC_CF_BEACON_TOKEN ?? "",
} as const;
