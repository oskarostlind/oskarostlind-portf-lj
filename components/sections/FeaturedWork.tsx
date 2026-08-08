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
        {featuredProjects.map((project, i) => {
          /* Första caset får full bredd — det bär mest tyngd. Blir det udda
             antal kvar efter det hamnar det sista ensamt i vänsterkolumnen
             med ett tomt hål bredvid sig, så då får även det full bredd. */
          const last = i === featuredProjects.length - 1;
          const orphan = last && (featuredProjects.length - 1) % 2 === 1;

          return (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              index={i}
              wide={i === 0 || orphan}
            />
          );
        })}
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
