"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
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
  const bgRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  // Cinematisk öppning/stängning: bakgrunden wipe:ar in med expo.out, länkarna
  // följer staggrat som maskade rader (yPercent 110 → 0). Stängningen är
  // snabbare och mindre uppdelad — man ska aldrig behöva vänta ut menyn.
  useEffect(() => {
    const bg = bgRef.current;
    const links = linkRefs.current.filter((el): el is HTMLAnchorElement => el !== null);
    const footer = footerRef.current;
    if (!bg || links.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // CSS:en (opacity/visibility) sköter visningen statiskt

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (open) {
        tl.fromTo(bg, { yPercent: -100 }, { yPercent: 0, duration: 0.9, ease: "expo.out" }).fromTo(
          links,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 },
          0.15
        );
        if (footer) {
          tl.fromTo(footer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power3.out" }, 0.55);
        }
      } else {
        tl.to(links, { yPercent: 110, duration: 0.32, ease: "power2.in", stagger: 0.025 }).to(
          bg,
          { yPercent: -100, duration: 0.38, ease: "power2.in" },
          "<0.04"
        );
        if (footer) {
          tl.to(footer, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
        }
      }
    });

    return () => ctx.revert();
  }, [open]);

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
    }, 380);

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
      {/* Bakgrund — wipe:as in/ut av gsap ovan, ingen CSS-transition på transform */}
      <div ref={bgRef} className="absolute inset-0 bg-[var(--color-void)] will-change-transform" />

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
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className="group inline-flex items-baseline gap-4 py-1 will-change-transform sm:gap-8"
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
          ref={footerRef}
          className="hairline flex flex-col gap-4 pt-6 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between"
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
