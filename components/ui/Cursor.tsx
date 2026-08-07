"use client";

import { useEffect, useRef } from "react";

/**
 * Magnetisk cursor. Endast på finpekdon utan reducerad rörelse.
 * Element med [data-magnetic] drar till sig cursorn; bilder inverterar den.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.body.dataset.cursor = "on";

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let scale = 1;
    let targetScale = 1;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;

      const target = (e.target as HTMLElement)?.closest?.(
        "a, button, [data-magnetic]"
      ) as HTMLElement | null;

      targetScale = target ? 2.6 : 1;

      if (target?.hasAttribute("data-magnetic")) {
        const r = target.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) * 0.28;
        const dy = (e.clientY - cy) * 0.28;
        target.style.transform = `translate(${dx}px, ${dy}px)`;
        target.dataset.pulled = "1";
      }

      document.querySelectorAll<HTMLElement>('[data-pulled="1"]').forEach((el) => {
        if (el !== target) {
          el.style.transform = "";
          delete el.dataset.pulled;
        }
      });
    };

    const render = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      scale += (targetScale - scale) * 0.14;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x - 16}px, ${ringPos.y - 16}px, 0) scale(${scale.toFixed(3)})`;
      }
      frame = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      delete document.body.dataset.cursor;
      document.querySelectorAll<HTMLElement>('[data-pulled="1"]').forEach((el) => {
        el.style.transform = "";
        delete el.dataset.pulled;
      });
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[250] hidden [@media(pointer:fine)]:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-[var(--color-ink)] opacity-45 mix-blend-difference will-change-transform"
      />
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] will-change-transform"
      />
    </div>
  );
}
