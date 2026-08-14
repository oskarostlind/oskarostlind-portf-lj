"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import Hero from "@/components/sections/Hero";
import Manifest from "@/components/sections/Manifest";
import { useIsLowPower, useReducedMotion } from "@/lib/useReducedMotion";
import type { FieldProgress } from "@/components/three/HeroScene";

// 3D laddas först i klienten och hamnar i en egen chunk.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

/**
 * Öppningen: hero och manifest delar ett och samma partikelfält.
 *
 * Fältet ligger i ett fast lager över hela viewporten, bakom innehållet, och
 * lever bara så länge öppningen syns. Sfären löses upp genom hero och driver
 * sedan vidare som bakgrundstextur genom manifestet, i stället för att
 * klippas bort vid sektionsgränsen. Utan WebGL — eller vid reducerad rörelse
 * och på svag hårdvara — ersätts fältet av en statisk gradient med exakt
 * samma placering, så kompositionen håller.
 */
export default function Opening() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<FieldProgress>({ dissolve: 0, drift: 0, depth: 0 });

  const reduced = useReducedMotion();
  const lowPower = useIsLowPower();
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(true);

  const show3d = mounted && !reduced && !lowPower;

  useEffect(() => setMounted(true), []);

  // Scrollprogress genom öppningen: dissolve driver upplösningen, drift driver
  // utplattningen till bakgrundsfält, depth backar kameran och ger fältet
  // tillbaka sitt djup när manifestet rullar förbi. Mätningen sker i rAF för
  // att inte trigga layout på varje scroll-event.
  useEffect(() => {
    let frame = 0;
    let queued = false;

    const measure = () => {
      queued = false;
      const el = wrapperRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const scrolled = -rect.top;

      const clamp = (v: number) => Math.min(1, Math.max(0, v));

      progressRef.current.dissolve = clamp(scrolled / (vh * 0.9));
      progressRef.current.drift = clamp((scrolled - vh * 0.8) / (vh * 0.9));
      // Tredje fasen är avsiktligt trögare och överlappar de två andra: den
      // rör bara kameran och fältets z-spann, inte formen, så de befintliga
      // kurvorna för dissolve och drift lämnas orörda. Startpunkten ligger
      // mitt i upplösningen eftersom lagret tonas ut redan strax efter att
      // manifestet passerat — väntar djupet till drift är i mål hinner det
      // aldrig synas.
      progressRef.current.depth = clamp((scrolled - vh * 0.6) / (vh * 1.1));

      // Fältet tonas ut när öppningen är på väg ur vyn, så att det aldrig
      // syns bakom sektionerna som följer.
      const layer = layerRef.current;
      if (layer) {
        const remaining = rect.bottom - vh * 0.35;
        layer.style.opacity = String(clamp(remaining / (vh * 0.5)));
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Pausa renderloopen helt när öppningen lämnat vyn.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        ref={layerRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
      >
        {show3d ? (
          /* Canvasen avmonteras helt när öppningen lämnat vyn — ingen
             renderloop får ticka bakom resten av sidan. */
          inView ? (
            <HeroScene progressRef={progressRef} surfaceRef={wrapperRef} />
          ) : null
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(48% 42% at 62% 42%, rgba(0,229,255,0.16), transparent 68%), radial-gradient(38% 34% at 28% 58%, rgba(245,245,240,0.06), transparent 70%)",
            }}
          />
        )}

        {/* Mjuk botten så att hero-texten alltid har ren yta under sig */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[var(--color-void)] to-transparent" />
      </div>

      <Hero />
      <Manifest />
    </div>
  );
}
