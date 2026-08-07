"use client";

import { useCallback, useRef, type MouseEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useReveal } from "@/lib/useReveal";
import { CASE_MEDIA_VT_NAME, gradientFor } from "@/lib/media";
import { canAnimateNavigation, navigateWithCaseTransition } from "@/lib/viewTransition";
import type { Project } from "@/lib/projects";

export default function ProjectCard({
  project,
  locale,
  index,
  wide = false,
}: {
  project: Project;
  locale: "sv" | "en";
  index: number;
  wide?: boolean;
}) {
  const t = useTranslations("work");
  const ref = useReveal<HTMLElement>();
  const mediaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /**
   * Öppningen: bildytan får samma `view-transition-name` som casesidans hero,
   * varpå browsern morfar kortet till fullskärm medan sidan byts under det.
   * Modifierade klick (ny flik, nytt fönster) lämnas orörda.
   */
  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }
      if (!canAnimateNavigation()) return; // låt <Link> göra sitt

      const media = mediaRef.current;
      if (!media) return;

      event.preventDefault();
      media.style.viewTransitionName = CASE_MEDIA_VT_NAME;

      navigateWithCaseTransition(
        () =>
          router.push({
            pathname: "/arbeten/[slug]",
            params: { slug: project.slug },
          }),
        () => {
          media.style.viewTransitionName = "";
        }
      );
    },
    [project.slug, router]
  );

  return (
    <article
      ref={ref}
      className={`reveal group relative ${wide ? "md:col-span-2" : ""}`}
      style={{ transitionDelay: `${(index % 3) * 90}ms` }}
    >
      <Link
        href={{ pathname: "/arbeten/[slug]", params: { slug: project.slug } }}
        onClick={onClick}
        className="block focus-visible:outline-offset-8"
        aria-label={`${project.title} — ${t("viewCase")}`}
      >
        <div
          ref={mediaRef}
          className={`relative overflow-hidden rounded-2xl border border-[var(--color-line)] ${
            wide ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[4/3]"
          }`}
        >
          {project.image ? (
            <Image
              src={project.image}
              alt=""
              fill
              sizes={wide ? "(max-width: 768px) 100vw, 90vw" : "(max-width: 768px) 100vw, 45vw"}
              className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
              style={{ background: gradientFor(project.slug) }}
            />
          )}

          {/* Titelöverlägg som lyfter vid hover */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(5,5,5,0.9)] via-[rgba(5,5,5,0.4)] to-transparent p-6 md:p-8">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.025em] md:text-3xl">
                {project.title}
              </h3>
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-dim)]">
                {project.year}
              </span>
            </div>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[var(--color-muted)] transition-colors duration-500 group-hover:text-[var(--color-ink)]">
              {project.tagline[locale]}
            </p>
          </div>

          {/* Accentram vid hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent transition-colors duration-500 group-hover:ring-[var(--color-accent)]/35"
          />
        </div>
      </Link>

      <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
        {project.stack.slice(0, wide ? 6 : 4).map((tech) => (
          <li
            key={tech}
            className="font-[family-name:var(--font-mono)] text-[0.68rem] uppercase tracking-[0.1em] text-[var(--color-dim)]"
          >
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}
