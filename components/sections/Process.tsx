"use client";

import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import SectionHead from "@/components/ui/SectionHead";
import { FX, fxItems, fxScene, useScrollFx } from "@/lib/scrollFx";
import "./motion.css";

const steps = ["discover", "design", "build", "launch"] as const;

/**
 * Processen som pinnad scen.
 *
 * På stora skärmar hålls sektionen kvar medan scrollen drar tidslinjen: en
 * progresslinje ritas ut i takt, punkterna tänds en och en och stegen avlöser
 * varandra. Scrubben ligger på 1.1 — rörelsen släpar efter scrollen precis
 * lagom mycket för att kännas filmisk i stället för direktstyrd.
 *
 * På touch och små skärmar pinnas ingenting. Pinning gör ont på mobil, så där
 * blir det vanliga staggrade reveals i samma ordning.
 */
export default function Process() {
  const t = useTranslations("process");

  const ref = useScrollFx<HTMLElement>((scope) => {
    const track = scope.querySelector<HTMLElement>("[data-fx-track]");
    const line = scope.querySelector<HTMLElement>("[data-fx-line]");
    const cards = Array.from(scope.querySelectorAll<HTMLElement>("[data-fx-step]"));
    const dots = Array.from(scope.querySelectorAll<HTMLElement>("[data-fx-dot]"));
    if (!track || !line || !cards.length) return;

    const mm = gsap.matchMedia();

    // --- Stor skärm: pinnad storytelling -------------------------------
    mm.add("(min-width: 1024px)", () => {
      const tl = gsap.timeline({
        defaults: { ease: FX.ease },
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 1.4)}`,
          scrub: FX.scrub,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Linjen ritas linjärt över hela scenen — den är klockan, inte effekten.
      tl.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          ease: "none",
          duration: cards.length,
        },
        0
      );

      cards.forEach((card, i) => {
        const at = i * 0.92;

        // Inget blur här: timelinen är scrubbad, så filtret hade räknats om på
        // varje scrolltick. Utan GPU (t.ex. svartlistad WebGL) rasteriseras
        // blur i mjukvara och kan frysa hela renderern. Engångs-reveals får
        // blura; scrubbade scener animerar bara transform/opacity.
        tl.fromTo(
          card,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          at
        );

        const dot = dots[i];
        if (dot) {
          tl.fromTo(
            dot,
            { scale: 0 },
            { scale: 1, duration: 0.55, ease: "expo.out" },
            at
          );
        }
      });
    });

    // --- Touch och små skärmar: vanliga reveals ------------------------
    mm.add("(max-width: 1023px)", () => {
      const tl = fxScene(track);

      tl.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          ease: "power3.inOut",
          duration: 1.5,
        },
        0
      );
      fxItems(tl, cards, { at: 0.12, stagger: 0.09, y: 28, blur: true });
      tl.fromTo(
        dots,
        { scale: 0 },
        { scale: 1, duration: 0.55, stagger: 0.09, ease: "expo.out" },
        0.12
      );
    });

    return () => mm.revert();
  });

  return (
    <section ref={ref} className="fx-process py-28 md:py-40">
      <div className="shell">
        <SectionHead eyebrow={t("eyebrow")} title={t("title")} />

        <div data-fx-track className="relative mt-16">
          {/* Tidslinjen: spåret ligger stilla, progresslinjen ritas av GSAP */}
          <div
            aria-hidden
            className="absolute left-0 top-[0.4rem] h-px w-full bg-[var(--color-line)]"
          >
            <div
              data-fx-line
              className="h-px w-full origin-left bg-[var(--color-accent)]"
            />
          </div>

          <ol className="grid gap-12 md:grid-cols-4 md:gap-8">
            {steps.map((step, i) => (
              <li key={step} className="relative pt-8">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-2 w-2 -translate-y-[0.2rem] rounded-full bg-[var(--color-void)] ring-1 ring-[var(--color-line-strong)]"
                >
                  <span
                    data-fx-dot
                    className="block h-full w-full rounded-full bg-[var(--color-accent)]"
                  />
                </span>

                <div data-fx-step data-fx-item>
                  <p className="eyebrow">0{i + 1}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl tracking-[-0.02em]">
                    {t(`steps.${step}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {t(`steps.${step}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
