import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHead from "@/components/ui/PageHead";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import CTA from "@/components/sections/CTA";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.services" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "sv" ? "/tjanster" : "/en/services",
      languages: { sv: "/tjanster", en: "/en/services" },
    },
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "services" });

  return (
    <>
      <PageHead eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <Services standalone />
      <Process />
      <CTA />
    </>
  );
}
