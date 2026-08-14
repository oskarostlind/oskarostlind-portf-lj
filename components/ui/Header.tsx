"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { gsap } from "gsap";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import MenuOverlay from "./MenuOverlay";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Gömmer headern vid scroll nedåt och visar den igen vid scroll uppåt —
  // klassisk mönster som ger mer yta åt innehållet utan att navigeringen
  // försvinner för gott. Menyn öppen eller nära toppen håller den alltid synlig.
  // Körs bara en gång (tomt beroende-array); `openRef` läses i handlern så vi
  // slipper montera om lyssnaren — och därmed tappa `hidden`-status — varje
  // gång menyn togglas.
  //
  // OBS: gsap.context() reverterar bara GSAP-tweens den skapat, inte en
  // returnerad funktion (till skillnad från React-effekter) — scroll-
  // lyssnaren tas därför bort explicit i cleanupen, inte via ctx.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // statisk header, alltid synlig

    let yTo: ReturnType<typeof gsap.quickTo>;
    const ctx = gsap.context(() => {
      yTo = gsap.quickTo(header, "yPercent", { duration: 0.5, ease: "power3.out" });
    }, header);

    let lastY = window.scrollY;
    let hidden = false;

    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      setScrolled(y > 40);

      if (openRef.current || y < 120) {
        if (hidden) {
          hidden = false;
          yTo(0);
        }
      } else if (delta > 4 && !hidden) {
        hidden = true;
        yTo(-100);
      } else if (delta < -4 && hidden) {
        hidden = false;
        yTo(0);
      }

      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      ctx.revert();
    };
  }, []);

  // Stäng menyn vid navigering
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lås scroll när menyn är öppen
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Fokus tillbaka till menyknappen när overlayen stängts — annars hamnar
  // tangentbordsanvändaren i början av dokumentet igen.
  useEffect(() => {
    if (wasOpen.current && !open) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-[100] will-change-transform transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled && !open
            ? "border-b border-[var(--color-line)] bg-[rgba(5,5,5,0.72)] backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="shell flex h-[var(--header-h,4.5rem)] items-center justify-between">
          {/* WCAG 2.5.3 Label in Name: det tillgängliga namnet måste innehålla
              den synliga texten. `aria-label="Start"` ersatte "Oskar Östlind"
              helt, vilket gjorde länken omöjlig att träffa med röststyrning. */}
          <Link
            href="/"
            className="group flex items-baseline gap-2.5"
            aria-label={t("homeAria")}
          >
            <span className="font-[family-name:var(--font-display)] text-[0.95rem] font-semibold tracking-[-0.02em]">
              Oskar Östlind
            </span>
            <span
              aria-hidden
              className="hidden h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] transition-transform duration-500 group-hover:scale-150 sm:block"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <LanguageSwitcher currentLocale={locale} />

            <button
              type="button"
              ref={toggleRef}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-overlay"
              className="group -mr-1 flex items-center gap-3 rounded-full border border-[var(--color-line)] py-2 pl-4 pr-2.5 text-xs uppercase tracking-[0.16em] text-[var(--color-ink)] transition-colors duration-300 hover:border-[var(--color-line-strong)]"
              data-magnetic
            >
              <span className="font-[family-name:var(--font-mono)]">
                {open ? t("close") : t("menu")}
              </span>
              <span aria-hidden className="relative block h-4 w-4">
                <span
                  className={`absolute left-0 top-[5px] h-px w-4 bg-current transition-transform duration-400 ease-[var(--ease-out-expo)] ${
                    open ? "translate-y-[3px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[10px] h-px w-4 bg-current transition-transform duration-400 ease-[var(--ease-out-expo)] ${
                    open ? "-translate-y-[2px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={toggleRef}
      />
    </>
  );
}

function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const [pending, startTransition] = useTransition();
  const other = currentLocale === "sv" ? "en" : "sv";

  // usePathname ger en dynamisk route ("/arbeten/[slug]"); params fyller i luckorna.
  const switchLocale = () => {
    startTransition(() => {
      router.replace(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { pathname, params } as any,
        { locale: other }
      );
    });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      disabled={pending}
      aria-label={t("switchTo")}
      className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-ink)] disabled:opacity-50"
      data-magnetic
    >
      {currentLocale === "sv" ? "EN" : "SV"}
    </button>
  );
}
