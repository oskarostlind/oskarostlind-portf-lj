"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }

    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setValue(Math.round((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const t = useTranslations("stats");

  const items = [
    { value: 10, suffix: "", label: t("projects") },
    { value: 90, suffix: "+", label: t("endpoints") },
    { value: 5, suffix: "", label: t("years") },
  ];

  return (
    <section className="border-y border-[var(--color-line)] py-16">
      <div className="shell grid grid-cols-2 gap-y-10 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="display-md font-[family-name:var(--font-display)]">
              <Counter to={item.value} suffix={item.suffix} />
            </p>
            <p className="eyebrow mt-3 max-w-[16ch]">{item.label}</p>
          </div>
        ))}
        <div>
          <p className="display-md font-[family-name:var(--font-display)]">
            {t("responseValue")}
          </p>
          <p className="eyebrow mt-3 max-w-[16ch]">{t("response")}</p>
        </div>
      </div>
    </section>
  );
}
