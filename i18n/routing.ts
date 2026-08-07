import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sv", "en"],
  defaultLocale: "sv",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/arbeten": { sv: "/arbeten", en: "/work" },
    "/arbeten/[slug]": { sv: "/arbeten/[slug]", en: "/work/[slug]" },
    "/tjanster": { sv: "/tjanster", en: "/services" },
    "/om": { sv: "/om", en: "/about" },
    "/kontakt": { sv: "/kontakt", en: "/contact" },
  },
});

export type Locale = (typeof routing.locales)[number];
