"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SectionHead from "@/components/ui/SectionHead";
import ArrowLink from "@/components/ui/ArrowLink";
import ProjectCard from "@/components/ui/ProjectCard";
import { featuredProjects } from "@/lib/projects";

export default function FeaturedWork() {
  const t = useTranslations("work");
  const locale = useLocale() as "sv" | "en";

  return (
    <section id="arbeten" className="py-28 md:py-40">
      <div className="shell">
        <SectionHead
          eyebrow={t("eyebrow")}
          title={t("title")}
          intro={t("intro")}
          action={<ArrowLink href="/arbeten">{t("viewAll")}</ArrowLink>}
        />
      </div>

      <div className="shell mt-16 grid gap-6 md:grid-cols-2 md:gap-8">
        {featuredProjects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            locale={locale}
            index={i}
            /* Första två casen får full bredd — de bär mest tyngd. */
            wide={i === 0}
          />
        ))}
      </div>

      <div className="shell mt-12 md:hidden">
        <Link
          href="/arbeten"
          className="hairline block pt-6 text-sm text-[var(--color-muted)]"
        >
          {t("viewAll")}
        </Link>
      </div>
    </section>
  );
}
