"use client";

import { useEffect, useState } from "react";

/** true när användaren bett om reducerad rörelse, eller innan vi hunnit mäta. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** true på pekskärm eller små skärmar — används för att stänga av 3D. */
export function useIsLowPower() {
  const [low, setLow] = useState(true);

  useEffect(() => {
    const check = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrow = window.innerWidth < 768;
      const cores = navigator.hardwareConcurrency ?? 8;
      setLow(coarse || narrow || cores <= 4);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return low;
}
