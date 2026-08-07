"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/useReveal";

/** Manifest: texten avslöjas ord för ord vid scroll. Ingen 3D — andningspaus. */
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
                className="inline-block opacity-15 transition-opacity duration-700 ease-out group-[.is-in]:opacity-100"
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
