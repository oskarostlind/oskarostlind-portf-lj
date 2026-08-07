"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export default function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="relative overflow-hidden py-32 md:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(52% 60% at 50% 105%, rgba(0,229,255,0.13), transparent 68%)",
        }}
      />
      <div className="shell text-center">
        <Reveal as="p" className="eyebrow">
          {t("eyebrow")}
        </Reveal>
        <Reveal as="h2" delay={80} className="display-lg mx-auto mt-6 max-w-[16ch]">
          {t("title")}
        </Reveal>
        <Reveal as="p" delay={160} className="lede mx-auto mt-6 text-center">
          {t("body")}
        </Reveal>

        <Reveal delay={240} className="mt-12">
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
        </Reveal>
      </div>
    </section>
  );
}
