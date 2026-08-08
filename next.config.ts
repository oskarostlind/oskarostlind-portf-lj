import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    /* Lighthouse flaggade sajtens två stilmallar som renderblockerande, ~100 ms.
       De är små (1,3 kB + 8,5 kB) — att hämta dem över en egen rundtur kostar
       mer än de väger. `inlineCss` lägger dem i dokumentet i stället. */
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  /* Caset hette "socialcard" i slugen tills produktens folkliga namn
     bekräftades vara AvyraCards. Sajten gick live samma dag som bytet, så
     kostnaden i sökmotorerna är nära noll — men sitemapen hann hämtas och
     adressen kan ligga i någons flik. 308 behåller metoden och signalerar
     permanent flytt, till skillnad från 307. */
  async redirects() {
    return [
      { source: "/arbeten/socialcard", destination: "/arbeten/avyracards", permanent: true },
      { source: "/en/work/socialcard", destination: "/en/work/avyracards", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
