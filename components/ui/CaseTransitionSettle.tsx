"use client";

import { useEffect } from "react";
import { settleCaseTransition } from "@/lib/viewTransition";

/**
 * Renderas överst på casesidan. När den monterats vet vi att den nya DOM:en
 * är på plats, och då — och först då — får browsern rita klart övergången.
 * Utan detta kör View Transition-löftet ut på timeout och morfningen uteblir.
 */
export default function CaseTransitionSettle() {
  useEffect(() => {
    settleCaseTransition();
  }, []);

  return null;
}
