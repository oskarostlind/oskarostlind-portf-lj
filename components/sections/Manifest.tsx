"use client";

import { useTranslations } from "next-intl";
import { fxScene, fxText, useScrollFx } from "@/lib/scrollFx";
import "./motion.css";

/** Manifest: texten avslöjas ord för ord vid scroll. Ingen 3D — andningspaus.
 *
 *  Tidigare låg vilotillståndet på `opacity-[0.42]` för att texten skulle gå
 *  att läsa även om avslöjandet aldrig utlöstes. Den avvägningen behövs inte
 *  längre: allt som göms här ligger bakom `html.has-motion`, som bara tänds
 *  när JS kört och `prefers-reduced-motion` inte är satt. Utan JS, och för den
 *  som bett om mindre rörelse, står texten fullt läsbar från början.
 *
 *  Avslöjandet är tidsstyrt (once), inte scroll-scrubbat. Ett scrubbat
 *  förlopp hade lämnat halva stycket i ett halvtransparent mellanläge så fort
 *  någon stannade mitt i — precis den oläsbarhet vi ville bort ifrån. Nu är
 *  texten antingen inte framme än, eller helt framme. */
export default function Manifest() {
  const t = useTranslations("manifest");

  const ref = useScrollFx<HTMLElement>((scope) => {
    const tl = fxScene(scope, { start: "top 74%" });

    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-eyebrow]"), {
      mode: "words",
      stagger: 0.03,
    });
    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-body]"), {
      mode: "words",
      stagger: 0.035,
      at: 0.2,
    });
    fxText(tl, scope.querySelector<HTMLElement>("[data-fx-sign]"), {
      mode: "words",
      stagger: 0.03,
      at: ">-0.5",
    });
  });

  return (
    <section ref={ref} className="relative py-32 md:py-48">
      <div className="shell">
        <p data-fx-text data-fx-eyebrow className="eyebrow mb-10">
          {t("eyebrow")}
        </p>

        <p
          data-fx-text
          data-fx-body
          className="display-md max-w-[22ch] font-[family-name:var(--font-display)] leading-[1.12] md:max-w-[26ch]"
        >
          {t("body")}
        </p>

        <p data-fx-text data-fx-sign className="eyebrow mt-10">
          — {t("signature")}
        </p>
      </div>
    </section>
  );
}
