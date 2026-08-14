"use client";

import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { fxItems, fxScene, useScrollFx } from "@/lib/scrollFx";
import "./motion.css";

/**
 * Siffrorna räknas upp av ScrollTrigger, inte av en egen IntersectionObserver
 * — samma klocka som resten av sidan, så uppräkningen ligger i takt med
 * omgivande reveals även när Lenis smygbromsar scrollen.
 *
 * Talen tonas in genom oskärpa och göms med `opacity`, inte `visibility`:
 * `innerText` returnerar tom sträng för element som är visibility: hidden, och
 * GSAP skulle då aldrig få ett startvärde att räkna från.
 *
 * Utan JS och vid reducerad rörelse renderas slutvärdet direkt — det är det
 * som står i JSX, GSAP nollställer först när `has-motion` finns.
 */
export default function Stats() {
  const t = useTranslations("stats");

  const items = [
    { value: 10, suffix: "", label: t("projects") },
    { value: 90, suffix: "+", label: t("endpoints") },
    { value: 5, suffix: "", label: t("years") },
  ];

  const ref = useScrollFx<HTMLElement>((scope) => {
    const grid = scope.querySelector<HTMLElement>("[data-fx-grid]");
    const nums = Array.from(scope.querySelectorAll<HTMLElement>("[data-fx-num]"));
    const counts = Array.from(scope.querySelectorAll<HTMLElement>("[data-fx-count]"));

    const tl = fxScene(scope, { start: "top 85%" });

    tl.fromTo(
      nums,
      { opacity: 0, y: 16, filter: "blur(14px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.1,
        stagger: 0.08,
        clearProps: "filter",
      },
      0
    );

    counts.forEach((el, i) => {
      const to = Number(el.dataset.fxCount ?? 0);
      tl.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: to,
          snap: { innerText: 1 },
          duration: 1.7,
          ease: "power3.out",
        },
        i * 0.08
      );
    });

    fxItems(tl, scope.querySelectorAll("[data-fx-item]"), {
      at: 0.18,
      y: 14,
      stagger: 0.08,
    });

    // Sektionen driver förbi en aning långsammare än sidan. Bara rutnätet
    // rör sig — ramlinjerna över och under ska ligga still.
    if (grid) {
      gsap.fromTo(
        grid,
        { y: 20 },
        {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        }
      );
    }
  });

  return (
    <section
      ref={ref}
      className="border-y border-[var(--color-line)] py-16"
    >
      <div
        data-fx-grid
        className="shell grid grid-cols-2 gap-y-10 md:grid-cols-4"
      >
        {items.map((item) => (
          <div key={item.label}>
            <p
              data-fx-num
              className="display-md font-[family-name:var(--font-display)]"
            >
              <span data-fx-count={item.value} className="tabular-nums">
                {item.value}
              </span>
              {item.suffix}
            </p>
            <p data-fx-item className="eyebrow mt-3 max-w-[16ch]">
              {item.label}
            </p>
          </div>
        ))}
        <div>
          <p
            data-fx-num
            className="display-md font-[family-name:var(--font-display)]"
          >
            {t("responseValue")}
          </p>
          <p data-fx-item className="eyebrow mt-3 max-w-[16ch]">
            {t("response")}
          </p>
        </div>
      </div>
    </section>
  );
}
