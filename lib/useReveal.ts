"use client";

import { useEffect, useRef } from "react";

/**
 * Lätt reveal-hook byggd på IntersectionObserver.
 * Lägger klassen `is-in` på elementet när det kommer in i vyn.
 * Ingen GSAP behövs för de enkla fallen — håller bundlen liten.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; rootMargin?: string; once?: boolean }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            if (options?.once !== false) observer.unobserve(entry.target);
          } else if (options?.once === false) {
            entry.target.classList.remove("is-in");
          }
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? "0px 0px -10% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.once]);

  return ref;
}
