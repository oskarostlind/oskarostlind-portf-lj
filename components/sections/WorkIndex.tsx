"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ProjectCard from "@/components/ui/ProjectCard";
import PageHead from "@/components/ui/PageHead";
import { fxCardGrid, fxItems, fxScene, useScrollFx } from "@/lib/scrollFx";
import { allProjects, categories, type Category } from "@/lib/projects";
import "./motion.css";

export default function WorkIndex() {
  const t = useTranslations("work");
  const locale = useLocale() as "sv" | "en";
  const [filter, setFilter] = useState<Category | "all">("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? allProjects
        : allProjects.filter((p) => p.categories.includes(filter)),
    [filter]
  );

  const filterRef = useScrollFx<HTMLDivElement>((scope) => {
    fxItems(fxScene(scope), scope.querySelectorAll("[data-fx-item]"), { y: 18 });
  });

  /* Rutnätet sätts upp på nytt när filtret ändras: urvalet är ett annat, och
     de kort som blir kvar ska komma in i sin nya ordning. */
  const gridRef = useScrollFx<HTMLDivElement>((scope) => fxCardGrid(scope), [
    filter,
  ]);

  return (
    <>
      <PageHead eyebrow={t("eyebrow")} title={t("allTitle")} intro={t("allIntro")} />

      <div className="shell">
        <div
          ref={filterRef}
          role="group"
          aria-label={t("filterLabel")}
          className="hairline flex flex-wrap gap-2 pt-8"
        >
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={allProjects.length}
          >
            {t("filterAll")}
          </FilterButton>
          {categories.map((cat) => {
            const count = allProjects.filter((p) =>
              p.categories.includes(cat.id)
            ).length;
            if (count === 0) return null;
            return (
              <FilterButton
                key={cat.id}
                active={filter === cat.id}
                onClick={() => setFilter(cat.id)}
                count={count}
              >
                {cat.label[locale]}
              </FilterButton>
            );
          })}
        </div>

        <div
          ref={gridRef}
          data-fx-cards
          className="mt-12 grid gap-6 pb-28 md:grid-cols-2 md:gap-8"
        >
          {visible.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              index={i}
              wide={i === 0 && filter === "all"}
            />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="pb-28 text-[var(--color-muted)]">{t("empty")}</p>
        )}
      </div>
    </>
  );
}

function FilterButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-fx-item
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-ink)]"
          : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
      }`}
    >
      {children}
      <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-[var(--color-dim)]">
        {count}
      </span>
    </button>
  );
}
