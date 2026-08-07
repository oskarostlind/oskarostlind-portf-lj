"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";

const items = ["websites", "frontend", "backend", "crm"] as const;

export default function Services({ standalone = false }: { standalone?: boolean }) {
  const t = useTranslations("services");
  const [open, setOpen] = useState<string | null>(standalone ? "websites" : null);

  return (
    <section id="tjanster" className={standalone ? "pb-28 pt-8" : "py-28 md:py-40"}>
      <div className="shell">
        {!standalone && (
          <SectionHead eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
        )}

        <div className={standalone ? "" : "mt-14"}>
          {items.map((id, i) => {
            const expanded = open === id;
            return (
              <Reveal key={id} delay={i * 70}>
                <div className="hairline">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? null : id)}
                      aria-expanded={expanded}
                      aria-controls={`service-${id}`}
                      className="group flex w-full items-center gap-6 py-7 text-left"
                    >
                      <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-dim)]">
                        0{i + 1}
                      </span>
                      <span
                        className={`display-md flex-1 transition-colors duration-500 ${
                          expanded
                            ? "text-[var(--color-ink)]"
                            : "text-[var(--color-muted)] group-hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {t(`items.${id}.title`)}
                      </span>
                      <span
                        aria-hidden
                        className="relative h-4 w-4 shrink-0 text-[var(--color-accent)]"
                      >
                        <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                        <span
                          className={`absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                            expanded ? "scale-y-0" : "scale-y-100"
                          }`}
                        />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`service-${id}`}
                    className="grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-out-expo)]"
                    style={{
                      gridTemplateRows: expanded ? "1fr" : "0fr",
                      opacity: expanded ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="grid gap-8 pb-9 pl-0 md:grid-cols-[1.6fr_1fr] md:pl-12">
                        <div>
                          <p className="text-[var(--color-ink)]">
                            {t(`items.${id}.summary`)}
                          </p>
                          <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-[var(--color-muted)]">
                            {t(`items.${id}.detail`)}
                          </p>
                        </div>
                        <dl className="space-y-5 text-sm">
                          <div>
                            <dt className="eyebrow">{t("whoFor")}</dt>
                            <dd className="mt-2 text-[var(--color-muted)]">
                              {t(`items.${id}.who`)}
                            </dd>
                          </div>
                          <div>
                            <dt className="eyebrow">{t("timeline")}</dt>
                            <dd className="mt-2 font-[family-name:var(--font-mono)] text-[var(--color-ink)]">
                              {t(`items.${id}.timeline`)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
