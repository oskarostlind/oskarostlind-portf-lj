"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const KEY = "oo:preloaded";

export default function Preloader() {
  const t = useTranslations("preloader");
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(KEY)) return;

    sessionStorage.setItem(KEY, "1");
    setActive(true);
    document.documentElement.style.overflow = "hidden";

    const start = performance.now();
    const duration = 1150;
    let frame = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setLeaving(true);
        window.setTimeout(() => {
          setActive(false);
          document.documentElement.style.overflow = "";
        }, 750);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("label")}
      className={`fixed inset-0 z-[300] flex items-end justify-between bg-[var(--color-void)] px-[var(--shell)] pb-10 transition-transform duration-[750ms] ease-[var(--ease-in-out-quart)] ${
        leaving ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <span className="display-lg block overflow-hidden">
        <span
          className="block transition-transform duration-700 ease-[var(--ease-out-expo)]"
          style={{ transform: leaving ? "translateY(-110%)" : "none" }}
        >
          Oskar Östlind
        </span>
      </span>
      <span className="font-[family-name:var(--font-mono)] text-sm tabular-nums text-[var(--color-muted)]">
        {String(count).padStart(3, "0")}
      </span>
      <span
        aria-hidden
        className="absolute inset-x-[var(--shell)] bottom-8 h-px origin-left bg-[var(--color-accent)]"
        style={{ transform: `scaleX(${count / 100})` }}
      />
    </div>
  );
}
