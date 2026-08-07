import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHead from "@/components/ui/PageHead";
import ContactForm from "@/components/sections/ContactForm";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "sv" ? "/kontakt" : "/en/contact",
      languages: { sv: "/kontakt", en: "/en/contact" },
    },
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <>
      <PageHead eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />

      <div className="shell grid gap-14 pb-32 pt-10 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
        <ContactForm />

        <aside className="hairline pt-8 lg:border-0 lg:pt-0">
          <h2 className="eyebrow">{t("directTitle")}</h2>
          <ul className="mt-6 space-y-5 text-sm">
            <li>
              <span className="block text-[var(--color-dim)]">{t("emailLabel")}</span>
              <a
                href={`mailto:${site.email}`}
                className="mt-1 block break-all text-[var(--color-ink)] transition-colors duration-300 hover:text-[var(--color-accent)]"
              >
                {site.email}
              </a>
            </li>
            <li>
              <span className="block text-[var(--color-dim)]">{t("githubLabel")}</span>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 block text-[var(--color-ink)] transition-colors duration-300 hover:text-[var(--color-accent)]"
              >
                github.com/oskarostlind
              </a>
            </li>
            <li>
              <span className="block text-[var(--color-dim)]">{t("linkedinLabel")}</span>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 block text-[var(--color-ink)] transition-colors duration-300 hover:text-[var(--color-accent)]"
              >
                Oskar Östlind
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </>
  );
}
