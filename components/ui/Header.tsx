"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import MenuOverlay from "./MenuOverlay";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        className={`fixed inset-x-0 top-0 z-[100] transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled && !open
            ? "border-b border-[var(--color-line)] bg-[rgba(5,5,5,0.72)] backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="shell flex h-[var(--header-h,4.5rem)] items-center justify-between">
          <Link
            href="/"
            className="group flex items-baseline gap-2.5"
            aria-label={t("home")}
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
