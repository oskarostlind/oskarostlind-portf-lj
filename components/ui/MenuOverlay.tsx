"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { featuredProjects } from "@/lib/projects";

const links = [
  { href: "/", key: "home" },
  { href: "/arbeten", key: "work" },
  { href: "/tjanster", key: "services" },
  { href: "/om", key: "about" },
  { href: "/kontakt", key: "contact" },
] as const;

export default function MenuOverlay({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  /** Menyknappen i headern. Ingår i fokusfällan så att stängningen alltid går
      att nå med tangentbord — den ligger utanför overlayen i DOM:en. */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const t = useTranslations("nav");
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Esc stänger, och fokus fångas i overlayen medan den är öppen
  useEffect(() => {
    if (!open) return;

    const focusables = () => {
      const inside = Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])"
        ) ?? []
      );
      const trigger = triggerRef.current;
      // Menyknappen först — den ligger visuellt överst, i headern.
      return trigger ? [trigger, ...inside] : inside;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => {
      ref.current?.querySelector<HTMLElement>("a[href]")?.focus();
    }, 420);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, onClose, triggerRef]);

  const preview = hovered !== null ? featuredProjects[hovered % featuredProjects.length] : null;

  return (
    <div
      id="menu-overlay"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={t("menu")}
      aria-hidden={!open}
      {...(!open && { inert: "" as unknown as boolean })}
      className={`fixed inset-0 z-[99] transition-[opacity,visibility] duration-500 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      {/* Bakgrund */}
      <div
        className={`absolute inset-0 bg-[var(--color-void)] transition-transform duration-[900ms] ease-[var(--ease-in-out-quart)] ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      />

      {/* Levande gradient bakom menyn */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
          preview ? "opacity-100" : "opacity-40"
        }`}
        style={{
          background:
            "radial-gradient(60% 55% at 78% 40%, rgba(0,229,255,0.10), transparent 70%)",
        }}
      />

      <div className="shell relative flex h-full flex-col justify-between pb-10 pt-[var(--header-h,4.5rem)]">
        <nav
          aria-label={t("menu")}
          className="flex flex-1 flex-col justify-center"
        >
          <ul className="space-y-1">
            {links.map((link, i) => (
              <li key={link.href} className="overflow-hidden">
                <Link
                  href={link.href}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className="group inline-flex items-baseline gap-4 py-1 transition-transform duration-[800ms] ease-[var(--ease-out-expo)] sm:gap-8"
                  style={{
                    transform: open ? "translateY(0)" : "translateY(110%)",
                    transitionDelay: open ? `${180 + i * 60}ms` : "0ms",
                  }}
                >
                  <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-[var(--color-dim)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                    0{i + 1}
                  </span>
                  <span className="display-lg text-[var(--color-muted)] transition-colors duration-500 group-hover:text-[var(--color-ink)] group-focus-visible:text-[var(--color-ink)]">
                    {t(link.key)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="hairline flex flex-col gap-4 pt-6 text-sm text-[var(--color-muted)] transition-opacity duration-700 sm:flex-row sm:items-center sm:justify-between"
          style={{
            opacity: open ? 1 : 0,
            transitionDelay: open ? "560ms" : "0ms",
          }}
        >
          <a
            href={`mailto:${site.email}`}
            className="transition-colors duration-300 hover:text-[var(--color-ink)]"
          >
            {site.email}
          </a>
          <div className="flex gap-6">
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors duration-300 hover:text-[var(--color-ink)]"
            >
              GitHub
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors duration-300 hover:text-[var(--color-ink)]"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
