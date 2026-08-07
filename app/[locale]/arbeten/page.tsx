import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import WorkIndex from "@/components/sections/WorkIndex";
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
  const t = await getTranslations({ locale, namespace: "meta.work" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "sv" ? "/arbeten" : "/en/work",
      languages: { sv: "/arbeten", en: "/en/work" },
    },
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WorkIndex />;
}
