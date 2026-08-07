"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Hero-innehållet. Partikelfältet bakom ligger i `Opening`, som delar det med
 * manifestet — därför äger den här komponenten ingen 3D själv.
 */
export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end pb-14 pt-32">
      <div className="shell relative">
        <p
          className="eyebrow mb-8 opacity-0"
          style={{ animation: "none" }}
          ref={(el) => {
            if (el) requestAnimationFrame(() => el.classList.add("is-in"));
          }}
        >
          <span className="reveal is-in inline-block">{t("eyebrow")}</span>
        </p>

        <h1 className="display-xl max-w-[15ch]">
          {[t("titleLine1"), t("titleLine2"), t("titleLine3")].map((line, i) => (
            <span key={line} className="reveal-line is-in">
              <span style={{ transitionDelay: `${260 + i * 110}ms` }}>{line}</span>
            </span>
          ))}
        </h1>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="lede reveal is-in"
            style={{ transitionDelay: "640ms" }}
          >
            {t("subtitle")}
          </p>

          <div
            className="reveal is-in flex flex-wrap items-center gap-4"
            style={{ transitionDelay: "760ms" }}
          >
            <Link
              href="/arbeten"
              data-magnetic
              className="group relative overflow-hidden rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-sm font-medium text-[var(--color-void)] transition-colors duration-500"
            >
              <span className="relative z-10">{t("ctaWork")}</span>
              <span
                aria-hidden
                className="absolute inset-0 -z-0 translate-y-full bg-[var(--color-accent)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
              />
            </Link>
            <Link
              href="/kontakt"
              data-magnetic
              className="rounded-full border border-[var(--color-line-strong)] px-7 py-3.5 text-sm text-[var(--color-ink)] transition-colors duration-500 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {t("ctaContact")}
            </Link>
          </div>
        </div>

        <div className="mt-16 flex items-center gap-3 text-[var(--color-dim)]">
          <span className="eyebrow">{t("scroll")}</span>
          <span
            aria-hidden
            className="relative block h-8 w-px overflow-hidden bg-[var(--color-line)]"
          >
            <span className="absolute inset-x-0 top-0 h-3 animate-[scrollHint_2.2s_ease-in-out_infinite] bg-[var(--color-accent)]" />
          </span>
        </div>
      </div>

      <style>{`
        @keyframes scrollHint {
          0%   { transform: translateY(-100%); }
          60%  { transform: translateY(320%); }
          100% { transform: translateY(320%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes scrollHint { 0%,100% { transform: translateY(0); } }
        }
      `}</style>
    </section>
  );
}
