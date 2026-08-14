"use client";

import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { Link } from "@/i18n/navigation";
import { fxItems, fxScene, fxText, useScrollFx } from "@/lib/scrollFx";
import { site } from "@/lib/site";
import "./motion.css";

/**
 * Sidans sista andetag. Rubriken är den stora textreveal:en — rad för rad,
 * genom mask, med en oskärpa som klarnar. Etiketten går först, brödtexten
 * ord för ord efter, och knappen sist. Skenet i botten driver långsamt uppåt
 * under hela passagen så att sektionen har djup utan att röra på texten.
 */
export default function CTA() {
  const t = useTranslations("cta");

  const ref = useScrollFx<HTMLElement>((scope) => {
    const tl = fxScene(scope, { start: "top 78%" });

    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-eyebrow]"), {
      mode: "words",
      stagger: 0.03,
    });
    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-title]"), {
      mode: "lines",
      stagger: 0.13,
      at: 0.14,
    });
    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-body]"), {
      mode: "words",
      stagger: 0.02,
      at: 0.52,
    });
    fxItems(tl, scope.querySelectorAll("[data-fx-item]"), {
      at: 0.66,
      y: 22,
    });

    const glow = scope.querySelector<HTMLElement>("[data-fx-glow]");
    if (glow) {
      gsap.fromTo(
        glow,
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        }
      );
    }
  });

  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-44">
      <div
        data-fx-glow
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(52% 60% at 50% 105%, rgba(0,229,255,0.13), transparent 68%)",
        }}
      />
      <div className="shell text-center">
        <p data-fx-text data-fx-eyebrow className="eyebrow">
          {t("eyebrow")}
        </p>
        <h2
          data-fx-text
          data-fx-title
          className="display-lg mx-auto mt-6 max-w-[16ch]"
        >
          {t("title")}
        </h2>
        <p
          data-fx-text
          data-fx-body
          className="lede mx-auto mt-6 text-center"
        >
          {t("body")}
        </p>

        <div data-fx-item className="mt-12">
          <Link
            href="/kontakt"
            data-magnetic
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[var(--color-ink)] px-9 py-4 text-sm font-medium text-[var(--color-void)]"
          >
            <span className="relative z-10">{t("button")}</span>
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
            >
              <path
                d="M2 8h11M9 4l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              aria-hidden
              className="absolute inset-0 translate-y-full bg-[var(--color-accent)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
            />
          </Link>

          <p className="mt-6 text-sm text-[var(--color-muted)]">
            {t("or")}{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-[var(--color-ink)] underline decoration-[var(--color-line-strong)] underline-offset-4 transition-colors duration-300 hover:decoration-[var(--color-accent)]"
            >
              {site.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
