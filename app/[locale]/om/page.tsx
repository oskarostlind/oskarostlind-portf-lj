import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHead from "@/components/ui/PageHead";
import StackSection from "@/components/sections/StackSection";
import Stats from "@/components/sections/Stats";
import CTA from "@/components/sections/CTA";
import Reveal from "@/components/ui/Reveal";
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
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "sv" ? "/om" : "/en/about",
      languages: { sv: "/om", en: "/en/about" },
    },
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <>
      <PageHead eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <section className="shell pb-8 pt-12">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div className="hidden md:block" aria-hidden />
          <div className="space-y-6 text-[var(--color-muted)]">
            {[t("body1"), t("body2"), t("body3")].map((p, i) => (
              <Reveal key={i} as="p" delay={i * 90} className="leading-relaxed">
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Stats />
      <StackSection />
      <CTA />
    </>
  );
}
