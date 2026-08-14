"use client";

import { useCallback, useRef, type MouseEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useReveal } from "@/lib/useReveal";
import { CASE_MEDIA_VT_NAME, caseMediaFor } from "@/lib/media";
import { canAnimateNavigation, navigateWithCaseTransition } from "@/lib/viewTransition";
import { useCardHoverFx } from "@/components/three/CardHoverFx";
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
  const media = caseMediaFor(project);
  const ref = useReveal<HTMLElement>();
  const mediaRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const router = useRouter();

  /**
   * Shader-hovern lever i ett eget lager mellan bilden och titelöverlägget, så
   * att texten aldrig hamnar under canvasen. Bara bildcase har något att
   * distordera — gradientkorten går orörda vidare. Alla övriga villkor (mus,
   * rörelsepreferens, `has-motion`, WebGL-stöd) prövas i modulen, vid första
   * hovern, så att ingenting monteras i onödan.
   */
  const { onPointerEnter, onPointerMove, onPointerLeave, release } = useCardHoverFx(
    fxRef,
    imgRef,
    media.kind === "image"
  );

  /**
   * Öppningen: bildytan får samma `view-transition-name` som casesidans hero,
   * varpå browsern morfar kortet till fullskärm medan sidan byts under det.
   * Modifierade klick (ny flik, nytt fönster) lämnas orörda.
   */
  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      // Canvasen kopplas loss före navigeringen: View Transition-snapshoten
      // ska tas av <Image>, inte av ett WebGL-lager som är på väg bort.
      release();

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

      const node = mediaRef.current;
      if (!node) return;

      event.preventDefault();
      node.style.viewTransitionName = CASE_MEDIA_VT_NAME;

      navigateWithCaseTransition(
        () =>
          router.push({
            pathname: "/arbeten/[slug]",
            params: { slug: project.slug },
          }),
        () => {
          node.style.viewTransitionName = "";
        }
      );
    },
    [project.slug, release, router]
  );

  return (
    <article
      ref={ref}
      className={`reveal group relative ${wide ? "md:col-span-2" : ""}`}
      style={{ transitionDelay: `${(index % 3) * 90}ms` }}
    >
      {/* `data-cursor-label` är etiketten den anpassade cursorn visar över
          kortet. Någon nyckel för "Öppna" finns inte i messages ännu, och de
          filerna hör till ett annat spår — därav språkvalet här. */}
      <Link
        href={{ pathname: "/arbeten/[slug]", params: { slug: project.slug } }}
        onClick={onClick}
        className="block focus-visible:outline-offset-8"
        aria-label={`${project.title} — ${t("viewCase")}`}
        data-cursor-label={locale === "en" ? "Open" : "Öppna"}
      >
        <div
          ref={mediaRef}
          onPointerEnter={onPointerEnter}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className={`relative overflow-hidden rounded-2xl border border-[var(--color-line)] ${
            wide ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[4/3]"
          }`}
        >
          {media.kind === "image" ? (
            /* Värdlagret för shader-hovern. Bilden ligger kvar och syns tills
               canvasen tonat in — och hela vägen ut igen om WebGL uteblir. */
            <div ref={fxRef} className="absolute inset-0">
              <Image
                ref={imgRef}
                src={media.src}
                alt=""
                fill
                sizes={wide ? "(max-width: 768px) 100vw, 90vw" : "(max-width: 768px) 100vw, 45vw"}
                placeholder={media.blurDataURL ? "blur" : "empty"}
                blurDataURL={media.blurDataURL}
                className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              />
            </div>
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
              style={{ background: media.background }}
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
