"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Cinematisk cursor: prick + ring med olika lag via gsap quickTo.
 *
 * - Prick (0.25s) hänger tätare pekaren än ringen (0.45s) — ger lite djup
 *   utan att kännas studsigt (skill: cursor lag 0.25–0.45s).
 * - [data-magnetic]-element dras mot pekaren via egna quickTo-par, cachade
 *   per element så vi inte skapar nya tweens varje pointermove.
 * - [data-cursor-label]: ringen växer ~1.75x och visar attributets text i
 *   liten mono-typ. Generisk hover (a/button/[data-magnetic]) ger en mindre
 *   förstoring utan text.
 *
 * Endast pointer: fine + ej reducerad rörelse. Målen upptäcks via
 * closest() på varje pointermove istället för listeners bundna vid mount —
 * cursorn lever i root layout och måste även hitta element som renderas in
 * senare (t.ex. caseskort) utan att själv monteras om.
 *
 * OBS: gsap.context() reverterar bara GSAP-tweens den själv skapat — den
 * kör INTE en returnerad funktion som React-effekter gör. pointermove-
 * lyssnaren hanteras därför separat, direkt i useEffect-cleanupen.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.body.dataset.cursor = "on";

    let dotX: ReturnType<typeof gsap.quickTo>;
    let dotY: ReturnType<typeof gsap.quickTo>;
    let ringX: ReturnType<typeof gsap.quickTo>;
    let ringY: ReturnType<typeof gsap.quickTo>;
    let ringScale: ReturnType<typeof gsap.quickTo>;

    const ctx = gsap.context(() => {
      dotX = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3.out" });
      dotY = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3.out" });
      ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
      ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
      ringScale = gsap.quickTo(ring, "scale", { duration: 0.35, ease: "power3.out" });

      // Startläge i mitten av skärmen, som tidigare — quickTo animerar
      // sedan smidigt dit pekaren faktiskt är vid första rörelsen.
      gsap.set([dot, ring], { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    });

    let currentScale = 1;
    let labelTarget: HTMLElement | null = null;
    const magneticTweens = new WeakMap<
      HTMLElement,
      { x: ReturnType<typeof gsap.quickTo>; y: ReturnType<typeof gsap.quickTo> }
    >();

    const setScale = (value: number) => {
      if (currentScale === value) return;
      currentScale = value;
      ringScale(value);
    };

    const releaseMagnetic = (except: HTMLElement | null) => {
      document.querySelectorAll<HTMLElement>('[data-pulled="1"]').forEach((el) => {
        if (el === except) return;
        const tw = magneticTweens.get(el);
        tw?.x(0);
        tw?.y(0);
        delete el.dataset.pulled;
      });
    };

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      const target = e.target as HTMLElement | null;
      const interactive = target?.closest?.("a, button, [data-magnetic]") as HTMLElement | null;
      const labelled = target?.closest?.("[data-cursor-label]") as HTMLElement | null;

      // Etikett-läge går före generisk hover — större ring + text.
      if (labelled !== labelTarget) {
        labelTarget = labelled;
        if (labelled) {
          label.textContent = labelled.dataset.cursorLabel || "";
          gsap.to(label, { autoAlpha: 1, duration: 0.25, ease: "power3.out" });
        } else {
          gsap.to(label, { autoAlpha: 0, duration: 0.2, ease: "power3.out" });
        }
      }
      setScale(labelled ? 1.75 : interactive ? 1.8 : 1);

      if (interactive?.hasAttribute("data-magnetic")) {
        const raw = interactive.dataset.magnetic;
        const strength = raw ? Number(raw) : 0.28;
        const r = interactive.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * strength;
        const dy = (e.clientY - (r.top + r.height / 2)) * strength;

        let tw = magneticTweens.get(interactive);
        if (!tw) {
          tw = {
            x: gsap.quickTo(interactive, "x", { duration: 0.45, ease: "power3.out" }),
            y: gsap.quickTo(interactive, "y", { duration: 0.45, ease: "power3.out" }),
          };
          magneticTweens.set(interactive, tw);
        }
        tw.x(dx);
        tw.y(dy);
        interactive.dataset.pulled = "1";
      }

      releaseMagnetic(interactive?.hasAttribute("data-magnetic") ? interactive : null);
    };

    const onLeaveWindow = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
    const onEnterWindow = () => gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseenter", onEnterWindow);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseenter", onEnterWindow);
      releaseMagnetic(null);
      delete document.body.dataset.cursor;
      ctx.revert();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[250] hidden [@media(pointer:fine)]:block">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 -ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-ink)] opacity-45 mix-blend-difference will-change-transform"
      >
        <span
          ref={labelRef}
          className="pointer-events-none whitespace-nowrap font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.1em] text-[var(--color-ink)] opacity-0"
        />
      </div>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] will-change-transform"
      />
    </div>
  );
}
