"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: site.timezone,
      }).format(new Date());

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="relative border-t border-[var(--color-line)] bg-[var(--color-void)]">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
              <span
                aria-hidden
                className="relative flex h-2 w-2"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
              </span>
              {t("available")}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="display-md mt-5 inline-block break-all text-[var(--color-ink)] transition-colors duration-300 hover:text-[var(--color-accent)]"
              data-magnetic
            >
              {site.email}
            </a>
          </div>

          <nav aria-label={nav("menu")}>
            <h2 className="eyebrow">{nav("menu")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(["/arbeten", "/tjanster", "/om", "/kontakt"] as const).map((href, i) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-ink)]"
                  >
                    {nav((["work", "services", "about", "contact"] as const)[i])}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">{t("localTime")}</h2>
            <p
              className="mt-4 font-[family-name:var(--font-mono)] text-sm tabular-nums text-[var(--color-ink)]"
              suppressHydrationWarning
            >
              {time ?? "--:--:--"}{" "}
              <span className="text-[var(--color-dim)]">Stockholm</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-ink)]"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-ink)]"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline mt-12 flex flex-col gap-3 pt-6 text-xs text-[var(--color-dim)] sm:flex-row sm:items-center sm:justify-between">
          <p>{t("builtBy")}</p>
          <p>
            © {new Date().getFullYear()} {site.name}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
