"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import { stackGroups } from "@/lib/stack";
import { useReducedMotion } from "@/lib/useReducedMotion";

const accentFor = (i: number) => `hsl(${186 + ((i * 37) % 40)} 100% 62%)`;

type Node = { label: string; group: number; x: number; y: number; z: number };

/** Fördela punkter jämnt på en sfär med gyllene spiral. */
function buildNodes(): Node[] {
  const flat = stackGroups.flatMap((g, gi) =>
    g.items.map((label) => ({ label, group: gi }))
  );
  const n = flat.length;
  const golden = Math.PI * (3 - Math.sqrt(5));

  return flat.map((item, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    return {
      ...item,
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    };
  });
}

export default function StackSection() {
  const t = useTranslations("stack");
  const locale = useLocale() as "sv" | "en";
  const reduced = useReducedMotion();

  const [nodes] = useState(buildNodes);
  const [active, setActive] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);

  const rot = useRef({ x: -0.18, y: 0 });
  const vel = useRef({ x: 0, y: 0.0022 });
  const drag = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const sphere = sphereRef.current;
    if (!wrap || !sphere) return;

    let frame = 0;
    let visible = true;

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    const render = () => {
      if (visible) {
        if (!drag.current.active) {
          // Tröghet efter släpp, sedan tillbaka till lugn rotation
          vel.current.x *= 0.94;
          vel.current.y = vel.current.y * 0.94 + 0.0022 * 0.06;
        }
        rot.current.x = Math.max(
          -0.9,
          Math.min(0.9, rot.current.x + vel.current.x)
        );
        rot.current.y += vel.current.y;

        sphere.style.transform = `rotateX(${rot.current.x}rad) rotateY(${rot.current.y}rad)`;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      drag.current = { active: true, x: e.clientX, y: e.clientY };
      wrap.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      vel.current.y = dx * 0.0045;
      vel.current.x = -dy * 0.0045;
    };
    const onUp = (e: PointerEvent) => {
      drag.current.active = false;
      if (wrap.hasPointerCapture(e.pointerId)) wrap.releasePointerCapture(e.pointerId);
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
    };
  }, [reduced]);

  return (
    <section id="stack" className="py-28 md:py-40">
      <div className="shell">
        <SectionHead eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      </div>

      {/* Interaktiv konstellation — döljs vid reducerad rörelse */}
      {!reduced && (
        <div className="shell mt-12 hidden md:block">
          <div
            ref={wrapRef}
            className="relative mx-auto h-[30rem] w-full max-w-3xl touch-none select-none"
            style={{ perspective: "1100px", cursor: "grab" }}
            aria-hidden
          >
            <div
              ref={sphereRef}
              className="absolute left-1/2 top-1/2 h-0 w-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              {nodes.map((node, i) => (
                <span
                  key={node.label}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className="absolute whitespace-nowrap font-[family-name:var(--font-mono)] text-[0.72rem] uppercase tracking-[0.12em] transition-colors duration-300"
                  style={{
                    transform: `translate3d(${node.x * 195}px, ${node.y * 195}px, ${node.z * 195}px) translate(-50%,-50%)`,
                    color: active === i ? accentFor(node.group) : "var(--color-muted)",
                  }}
                >
                  {node.label}
                </span>
              ))}
            </div>

            <p className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-dim)]">
              {t("hint")}
            </p>
          </div>
        </div>
      )}

      {/* Tillgänglig, alltid närvarande lista — även fallback på mobil */}
      <div className="shell mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
        {stackGroups.map((group, gi) => (
          <Reveal key={group.id} delay={gi * 60}>
            <h3 className="eyebrow" style={{ color: accentFor(gi) }}>
              {group.label[locale]}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs text-[var(--color-muted)] transition-colors duration-300 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
