import Script from "next/script";
import { site } from "@/lib/site";

/**
 * Cloudflare Web Analytics.
 *
 * Vald framför Vercel Analytics eftersom den är gratis utan volymtak, inte
 * sätter några cookies och därför inte kräver samtyckesbanner — en banner hade
 * varit det första besökaren mötte på en sajt vars hela poäng är första
 * intrycket.
 *
 * Skriptet laddas först när sidan är interaktiv, så det påverkar inte LCP.
 * Utan token renderas ingenting: sajten ska kunna köras lokalt och i preview
 * utan att skicka trafik till någon tredje part.
 */
export default function Analytics() {
  if (!site.analyticsToken) return null;

  return (
    <Script
      id="cf-beacon"
      strategy="afterInteractive"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: site.analyticsToken })}
    />
  );
}
