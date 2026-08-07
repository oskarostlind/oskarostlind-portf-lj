"use client";

import { useCallback, useRef, type MouseEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { CASE_MEDIA_VT_NAME, gradientFor } from "@/lib/media";
import { canAnimateNavigation, navigateWithCaseTransition } from "@/lib/viewTransition";
import type { Project } from "@/lib/projects";

/**
 * Fotnoten på en casesida: nästa case. Bär samma morfning som korten, så att
 * hela kedjan av case känns som en enda yta man rör sig genom.
 */
export default function NextCaseLink({ project }: { project: Project }) {
  const t = useTranslations("work");
  const mediaRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();

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
      if (!canAnimateNavigation()) return;

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
    <nav className="border-t border-[var(--color-line)]">
      <Link
        href={{ pathname: "/arbeten/[slug]", params: { slug: project.slug } }}
        onClick={onClick}
        className="group block py-16 transition-colors duration-500 hover:bg-[var(--color-surface)]"
      >
        <div className="shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <span
              ref={mediaRef}
              aria-hidden
              className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[var(--color-line)] sm:block"
            >
              {project.image ? (
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <span
                  className="absolute inset-0"
                  style={{ background: gradientFor(project.slug) }}
                />
              )}
            </span>

            <span className="block">
              <span className="eyebrow block">{t("nextCase")}</span>
              <span className="display-md mt-3 block text-[var(--color-muted)] transition-colors duration-500 group-hover:text-[var(--color-ink)]">
                {project.title}
              </span>
            </span>
          </div>

          <span
            aria-hidden
            className="text-[var(--color-accent)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2"
          >
            →
          </span>
        </div>
      </Link>
    </nav>
  );
}
