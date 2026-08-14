"use client";

import type { ReactNode } from "react";
import { fxItems, fxScene, fxText, useScrollFx } from "@/lib/scrollFx";
import "@/components/sections/motion.css";

/**
 * Sektionsrubrik med koreograferad reveal: etikett, rubrik, ingress, åtgärd.
 *
 * Texterna kommer från next-intl och delas upp klientside — rubriken rad för
 * rad, etikett och ingress ord för ord. Originaltexten läggs i `aria-label`
 * av `fxText`, och radmaskerna släpps så fort avslöjandet är klart.
 */
export default function SectionHead({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  const ref = useScrollFx<HTMLDivElement>((scope) => {
    const tl = fxScene(scope);

    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-eyebrow]"), {
      mode: "words",
      stagger: 0.03,
    });
    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-title]"), {
      mode: "lines",
      at: 0.12,
    });
    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-intro]"), {
      mode: "words",
      stagger: 0.02,
      at: 0.32,
    });
    fxItems(tl, scope.querySelectorAll("[data-fx-action]"), {
      at: 0.42,
      y: 18,
    });
  });

  return (
    <div
      ref={ref}
      className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <p data-fx-text data-fx-eyebrow className="eyebrow">
          {eyebrow}
        </p>
        <h2 data-fx-text data-fx-title className="display-md mt-4 max-w-[18ch]">
          {title}
        </h2>
        {intro ? (
          <p data-fx-text data-fx-intro className="lede mt-5">
            {intro}
          </p>
        ) : null}
      </div>
      {action ? (
        <div data-fx-item data-fx-action className="shrink-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}
