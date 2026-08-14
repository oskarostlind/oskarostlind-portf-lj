"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";

const KEY = "oo:preloaded";

export default function Preloader() {
  const t = useTranslations("preloader");
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(KEY)) return;

    sessionStorage.setItem(KEY, "1");

    /* Preloadern ska fylla väntetiden, inte lägga sig ovanpå den.
     *
     * Tidigare räknade den ned 1150 ms och gick ut på 750 ms — och den startar
     * först när React hydrerat. På en långsam telefon betyder det att sidan är
     * färdigladdad, varpå ett ogenomskinligt lager läggs över den i ytterligare
     * två sekunder. Eftersom LCP mäter när det största elementet faktiskt
     * målas satte preloadern golvet för sajtens LCP (2,6 s i produktion) och
     * höll Performance på 87 trots att allt annat var snabbt.
     *
     * Nu räknas anslaget från navigationsstart. `performance.now()` är vid
     * mount detsamma som tiden sedan sidan började laddas, så det som återstår
     * av BUDGET är det enda vi lägger till. Snabb enhet: hydrering på ~150 ms
     * ger nästan hela intrót. Långsam enhet: hydreringen har redan ätit upp
     * budgeten, och besökaren — som väntat länge nog — slipper det helt.
     * Under MIN_MS är det inte värt en helskärmsövergång. */
    const BUDGET = 900;
    const MIN_MS = 150;
    const remaining = BUDGET - performance.now();
    if (remaining < MIN_MS) return;

    setActive(true);
    document.documentElement.style.overflow = "hidden";

    const start = performance.now();
    const duration = remaining;
    let frame = 0;
    let ctx: ReturnType<typeof gsap.context> | undefined;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setLeaving(true);

        // Curtain-wipe: panelen klipps bort uppifrån och ner istället för att
        // bara glida undan rakt av — lämnar över scenen till heron med lite
        // mer dramatik. ~0.7s mot tidigare 0.52s, dvs inom +200ms-budgeten.
        const root = rootRef.current;
        if (root) {
          ctx = gsap.context(() => {
            gsap.fromTo(
              root,
              { clipPath: "inset(0% 0 0 0)" },
              {
                clipPath: "inset(100% 0 0 0)",
                duration: 0.7,
                ease: "expo.out",
                onComplete: () => {
                  setActive(false);
                  document.documentElement.style.overflow = "";
                },
              }
            );
          });
        } else {
          window.setTimeout(() => {
            setActive(false);
            document.documentElement.style.overflow = "";
          }, 520);
        }
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ctx?.revert();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label={t("label")}
      className="fixed inset-0 z-[300] flex items-end justify-between bg-[var(--color-void)] px-[var(--shell)] pb-10"
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
