"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/useReveal";

/** Manifest: texten avslöjas ord för ord vid scroll. Ingen 3D — andningspaus.
 *
 *  Vilotillståndet är `opacity-[0.42]`, inte `opacity-15`. 0.15 gav den
 *  sammansatta färgen #292928 mot `--color-void`, alltså 1,39:1 — underkänt
 *  (WCAG 1.4.3 kräver 3:1 för stor text, och `display-md` är minst 28 px).
 *  0.42 ger #6A6A68 och 3,76:1. Att texten är oläsbar tills man scrollat är
 *  inte försvarbart bara för att den blir läsbar sedan: den som inte kan
 *  utlösa avslöjandet — eller om IntersectionObservern aldrig kör — lämnas
 *  med ett stycke som inte går att läsa. Dramatiken flyttad till rörelsen
 *  i stället: orden lyfts 0,1em samtidigt som de tänds. */
export default function Manifest() {
  const t = useTranslations("manifest");
  const ref = useReveal<HTMLDivElement>({ threshold: 0.35 });
  const words = t("body").split(" ");

  return (
    <section className="relative py-32 md:py-48">
      <div className="shell">
        <p className="eyebrow mb-10">{t("eyebrow")}</p>
        <div ref={ref} className="group">
          <p className="display-md max-w-[22ch] font-[family-name:var(--font-display)] leading-[1.12] md:max-w-[26ch]">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="inline-block translate-y-[0.1em] opacity-[0.42] transition-[opacity,transform] duration-700 ease-out group-[.is-in]:translate-y-0 group-[.is-in]:opacity-100"
                style={{ transitionDelay: `${i * 26}ms` }}
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          <p className="eyebrow mt-10">— {t("signature")}</p>
        </div>
      </div>
    </section>
  );
}
