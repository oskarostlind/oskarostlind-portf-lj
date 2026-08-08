import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import Preloader from "@/components/ui/Preloader";
import JsonLd from "@/components/ui/JsonLd";
import Analytics from "@/components/ui/Analytics";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t("siteTitle"),
      template: `%s — ${site.name}`,
    },
    description: t("defaultDescription"),
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: { sv: "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: locale === "sv" ? "sv_SE" : "en_GB",
      title: t("siteTitle"),
      description: t("defaultDescription"),
      url: locale === routing.defaultLocale ? site.url : `${site.url}/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle"),
      description: t("defaultDescription"),
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <JsonLd locale={locale} />
          <Preloader />
          <SmoothScroll />
          <Cursor />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-[var(--color-accent)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-[var(--color-void)]"
          >
            {t("skipToContent")}
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
