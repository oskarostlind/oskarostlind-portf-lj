import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { allProjects, getProject } from "@/lib/projects";
import { gradientFor } from "@/lib/media";
import { site } from "@/lib/site";
import Reveal from "@/components/ui/Reveal";
import ArrowLink from "@/components/ui/ArrowLink";
import CaseTransitionSettle from "@/components/ui/CaseTransitionSettle";
import NextCaseLink from "@/components/ui/NextCaseLink";
import CTA from "@/components/sections/CTA";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    allProjects.map((p) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const l = locale === "en" ? "en" : "sv";
  const path = l === "sv" ? `/arbeten/${slug}` : `/en/work/${slug}`;

  return {
    title: project.title,
    description: project.tagline[l],
    alternates: {
      canonical: path,
      languages: { sv: `/arbeten/${slug}`, en: `/en/work/${slug}` },
    },
    openGraph: {
      title: `${project.title} — ${site.name}`,
      description: project.tagline[l],
      type: "article",
      url: `${site.url}${path}`,
    },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = getProject(slug);
  if (!project) notFound();

  const l = locale === "en" ? "en" : "sv";
  const t = await getTranslations({ locale, namespace: "work" });

  const index = allProjects.findIndex((p) => p.slug === slug);
  const next = allProjects[(index + 1) % allProjects.length];

  return (
    <>
      <CaseTransitionSettle />

      <article>
        <header className="relative pb-12">
          {/*
            Hero-bandet är målet för case-öppningen: kortets bildyta bär samma
            `view-transition-name` och morfas hit av browsern. Därför ligger
            namnet på den klippande behållaren, inte på bilden inuti.
          */}
          <div className="case-hero relative h-[78svh] min-h-[30rem] w-full overflow-hidden">
            {project.image ? (
              <Image
                src={project.image}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: gradientFor(project.slug) }}
              />
            )}

            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, var(--color-void) 2%, rgba(5,5,5,0.55) 42%, rgba(5,5,5,0.62) 100%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(48% 54% at 72% 8%, rgba(0,229,255,0.14), transparent 66%)",
              }}
            />

            <div className="shell absolute inset-x-0 bottom-0 pb-12 md:pb-16">
              <Reveal>
                <Link
                  href="/arbeten"
                  className="eyebrow inline-flex items-center gap-2 transition-colors duration-300 hover:text-[var(--color-ink)]"
                >
                  <span aria-hidden>←</span> {t("backToWork")}
                </Link>
              </Reveal>

              <Reveal as="h1" delay={80} className="display-lg mt-6 max-w-[16ch]">
                {project.title}
              </Reveal>

              <Reveal as="p" delay={150} className="lede mt-6 max-w-[52ch]">
                {project.tagline[l]}
              </Reveal>

              {project.client ? (
                <Reveal as="p" delay={190} className="mt-4 text-sm text-[var(--color-dim)]">
                  {project.client[l]}
                </Reveal>
              ) : null}
            </div>
          </div>

          <div className="shell">
            <Reveal delay={230}>
              <dl className="hairline mt-12 grid gap-8 pt-8 sm:grid-cols-3">
                <div>
                  <dt className="eyebrow">{t("year")}</dt>
                  <dd className="mt-2 font-[family-name:var(--font-mono)] text-sm">
                    {project.year}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">{t("role")}</dt>
                  <dd className="mt-2 text-sm text-[var(--color-muted)]">
                    {t("roleValue")}
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
                  {project.live ? (
                    <ArrowLink href={project.live} external>
                      {t("visitSite")}
                    </ArrowLink>
                  ) : null}
                  {project.repo ? (
                    <ArrowLink href={project.repo} external>
                      {t("viewCode")}
                    </ArrowLink>
                  ) : null}
                </div>
              </dl>
            </Reveal>
          </div>
        </header>

        <div className="shell grid gap-14 pb-24 md:grid-cols-[1.5fr_1fr] md:gap-20">
          <div>
            <h2 className="eyebrow">{t("theChallenge")}</h2>
            <div className="mt-6 space-y-6">
              {project.body.map((paragraph, i) => (
                <Reveal
                  key={i}
                  as="p"
                  delay={i * 80}
                  className="text-[1.0625rem] leading-relaxed text-[var(--color-muted)]"
                >
                  {paragraph[l]}
                </Reveal>
              ))}
            </div>

            {project.metrics && project.metrics.length > 0 ? (
              <div className="hairline mt-12 grid gap-8 pt-8 sm:grid-cols-3">
                {project.metrics.map((m) => (
                  <div key={m.label[l]}>
                    <p className="display-md font-[family-name:var(--font-display)]">
                      {m.value}
                    </p>
                    <p className="eyebrow mt-2">{m.label[l]}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {project.quote ? (
              <blockquote className="hairline mt-12 pt-8">
                <p className="display-md max-w-[24ch] leading-[1.2]">
                  “{project.quote.text[l]}”
                </p>
                <footer className="eyebrow mt-5">
                  {project.quote.author} — {project.quote.role[l]}
                </footer>
              </blockquote>
            ) : null}
          </div>

          <aside className="space-y-12">
            <div>
              <h2 className="eyebrow">{t("whatIBuilt")}</h2>
              <ul className="mt-5 space-y-3">
                {project.highlights.map((h) => (
                  <li
                    key={h[l]}
                    className="flex gap-3 text-sm leading-relaxed text-[var(--color-muted)]"
                  >
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]" />
                    {h[l]}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="eyebrow">{t("techStack")}</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-[var(--color-line)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.08em] text-[var(--color-muted)]"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Nästa case — bär samma morfning som korten */}
        <NextCaseLink project={next} />
      </article>

      <CTA />
    </>
  );
}
