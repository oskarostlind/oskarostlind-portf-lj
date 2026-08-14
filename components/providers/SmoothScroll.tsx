"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Sajtens motion-fundament.
 *
 * - Registrerar GSAP + ScrollTrigger och sätter husets default-ease.
 * - Kör Lenis genom GSAP-tickern så att smooth scroll och ScrollTrigger
 *   aldrig glider isär (skill: cinematic-gsap-lenis-motion-system).
 * - Sätter `html.has-motion` — CSS som gömmer element inför reveals får
 *   BARA gälla under den klassen, så att innehållet alltid syns utan JS
 *   och för reduced-motion-användare.
 *
 * Reduced motion  → ingen Lenis, ingen has-motion-klass, allt statiskt.
 * Touch (coarse)  → native scroll (ingen Lenis), men ScrollTrigger-reveals
 *                   körs fortfarande — mobilen får också magi.
 */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power3.out", duration: 0.85 });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    document.documentElement.classList.add("has-motion");

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let lenis: Lenis | undefined;
    let onTick: ((time: number) => void) | undefined;

    if (!coarse) {
      lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.6,
      });

      lenis.on("scroll", ScrollTrigger.update);
      onTick = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);
    }

    // Ankarlänkar ska fungera med Lenis
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    };
    document.addEventListener("click", onClick);

    // Bilder/typsnitt kan flytta layouten efter första mätningen
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", onLoad);
      if (onTick) gsap.ticker.remove(onTick);
      lenis?.destroy();
      document.documentElement.classList.remove("has-motion");
    };
  }, []);

  return null;
}
