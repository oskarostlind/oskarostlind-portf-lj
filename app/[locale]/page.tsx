import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import Opening from "@/components/sections/Opening";
import FeaturedWork from "@/components/sections/FeaturedWork";
import Services from "@/components/sections/Services";
import StackSection from "@/components/sections/StackSection";
import Process from "@/components/sections/Process";
import Stats from "@/components/sections/Stats";
import CTA from "@/components/sections/CTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return {
    title: { absolute: t("title") },
    description: t("description"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Opening />
      <FeaturedWork />
      <Services />
      <StackSection />
      <Process />
      <Stats />
      <CTA />
    </>
  );
}
