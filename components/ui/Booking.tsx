"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { site } from "@/lib/site";

/**
 * Bokningsmodul mot Cal.coms gratisnivå.
 *
 * Två medvetna avsteg från Cal.coms färdiga embed-snutt:
 *
 * 1. **Ren iframe i stället för `embed.js`.** Skriptet lägger till automatisk
 *    höjdjustering och prefill, men kostar en tredjepartsbundle och en global
 *    `window.Cal`-kö. Iframen med `embed=true` är samma vy, och eftersom vi ger
 *    den en fast ram med egen scroll behövs ingen höjdjustering.
 *
 * 2. **Laddas först vid klick.** Inget tredjepartsanrop sker innan besökaren
 *    faktiskt vill boka. Det håller kontaktsidans LCP och Best Practices intakta
 *    och gör att sajten kan köras utan samtyckesbanner.
 *
 * Utan `NEXT_PUBLIC_CAL_LINK` renderas ingenting alls — se `lib/site.ts`.
 */
export default function Booking() {
  const t = useTranslations("booking");
  const [open, setOpen] = useState(false);

  if (!site.calLink) return null;

  const publicUrl = `https://cal.com/${site.calLink}`;
  const embedUrl = `${publicUrl}?embed=true&theme=dark&layout=month_view`;

  return (
    <section
      id="boka"
      aria-labelledby="boka-rubrik"
      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <p className="eyebrow">{t("eyebrow")}</p>
      <h2
        id="boka-rubrik"
        className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-[-0.025em] md:text-3xl"
      >
        {t("title")}
      </h2>
      <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-[var(--color-muted)]">
        {t("body")}
      </p>

      {open ? (
        <div className="mt-7 overflow-hidden rounded-xl border border-[var(--color-line)]">
          <iframe
            src={embedUrl}
            title={t("frameTitle")}
            loading="lazy"
            className="block h-[42rem] w-full border-0 bg-[var(--color-void)]"
          />
        </div>
      ) : (
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-magnetic
            className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-[var(--color-void)] transition-colors duration-500 hover:bg-[var(--color-accent)]"
          >
            {t("open")}
          </button>
          <p className="text-xs text-[var(--color-dim)]">{t("note")}</p>
        </div>
      )}

      <p className="mt-5 text-sm">
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[var(--color-muted)] underline-offset-4 transition-colors duration-300 hover:text-[var(--color-accent)] hover:underline"
        >
          {t("newTab")}
        </a>
      </p>
    </section>
  );
}
