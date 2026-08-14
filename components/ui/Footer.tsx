"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const [time, setTime] = useState<string | null>(null);
  const scrambleTargets = useRef(new Map<string, HTMLElement>());

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

  // Subtil text-scramble på länk-hover, i mono-typsnitt. Kort (~0.4s) och
  // rör bara textinnehållet i befintliga element — ingen layoutshift.
  // Gate:ad bakom has-motion (sätts av SmoothScroll, saknas vid reduced motion).
  useEffect(() => {
    gsap.registerPlugin(ScrambleTextPlugin);
    const targets = scrambleTargets.current;
    return () => {
      targets.forEach((el) => gsap.killTweensOf(el));
    };
  }, []);

  const registerScramble = (key: string) => (el: HTMLElement | null) => {
    if (el) scrambleTargets.current.set(key, el);
    else scrambleTargets.current.delete(key);
  };

  const scramble = (key: string, text: string) => () => {
    if (!document.documentElement.classList.contains("has-motion")) return;
    const el = scrambleTargets.current.get(key);
    if (!el) return;
    gsap.to(el, {
      duration: 0.4,
      ease: "power1.out",
      overwrite: true,
      scrambleText: { text, chars: "upperCase", speed: 0.9, revealDelay: 0.05 },
      // Mono-typ bara under själva scramblet — vilostilen ska förbli orörd.
      onStart: () => {
        el.style.fontFamily = "var(--font-mono)";
      },
      onComplete: () => {
        el.style.fontFamily = "";
      },
    });
  };

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
              // Testyta för cursorns [data-cursor-label]-stöd — texten kommer
              // från next-intl (samma etikett som redan finns i nav-namespacet).
              data-cursor-label={nav("contact")}
            >
              {site.email}
            </a>
          </div>

          <nav aria-label={nav("menu")}>
            <h2 className="eyebrow">{nav("menu")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(["/arbeten", "/tjanster", "/om", "/kontakt"] as const).map((href, i) => {
                const label = nav((["work", "services", "about", "contact"] as const)[i]);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      ref={registerScramble(href)}
                      onMouseEnter={scramble(href, label)}
                      onFocus={scramble(href, label)}
                      className="text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-ink)]"
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
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
                  ref={registerScramble("github")}
                  onMouseEnter={scramble("github", "GitHub")}
                  onFocus={scramble("github", "GitHub")}
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
                  ref={registerScramble("linkedin")}
                  onMouseEnter={scramble("linkedin", "LinkedIn")}
                  onFocus={scramble("linkedin", "LinkedIn")}
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
