"use client";

import { useTranslations } from "next-intl";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import { useReveal } from "@/lib/useReveal";

const steps = ["discover", "design", "build", "launch"] as const;

export default function Process() {
  const t = useTranslations("process");
  const lineRef = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="py-28 md:py-40">
      <div className="shell">
        <SectionHead eyebrow={t("eyebrow")} title={t("title")} />

        <div ref={lineRef} className="group relative mt-16">
          {/* Tidslinjen ritas ut när sektionen kommer in i vyn */}
          <div
            aria-hidden
            className="absolute left-0 top-[0.4rem] h-px w-full bg-[var(--color-line)]"
          >
            <div className="h-px w-full origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] group-[.is-in]:scale-x-100" />
          </div>

          <ol className="grid gap-12 md:grid-cols-4 md:gap-8">
            {steps.map((step, i) => (
              <li key={step} className="relative pt-8">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-2 w-2 -translate-y-[0.2rem] rounded-full bg-[var(--color-void)] ring-1 ring-[var(--color-line-strong)] transition-[background-color,transform] duration-700 group-[.is-in]:bg-[var(--color-accent)]"
                  style={{ transitionDelay: `${i * 320}ms` }}
                />
                <Reveal delay={i * 120}>
                  <p className="eyebrow">0{i + 1}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl tracking-[-0.02em]">
                    {t(`steps.${step}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {t(`steps.${step}.body`)}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
