"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Sektionernas rörelselager.
 *
 * Fundamentet (Lenis, ScrollTrigger-registrering, `html.has-motion`) sätts av
 * `components/providers/SmoothScroll.tsx`. Här bor bara koreografin: hur text
 * delas upp, hur reveals ser ut och hur en scen kopplas till scrollen.
 *
 * Tre regler styr allt i den här filen:
 *  1. Ingenting körs utan `has-motion` — innehållet måste synas utan JS och
 *     vid `prefers-reduced-motion`.
 *  2. Bara `transform`, `opacity` och `clip-path` animeras. `filter: blur()`
 *     används enbart på text och små element.
 *  3. All setup sker i `gsap.context()` så att `ctx.revert()` städar bort
 *     varje tween och ScrollTrigger vid unmount eller sidbyte.
 */

/* ------------------------------------------------------------------------ *
 * Tokens — hämtade ur skillen cinematic-gsap-lenis-motion-system.
 * ------------------------------------------------------------------------ */

export const FX = {
  ease: "power4.out",
  start: "top 82%",
  scrub: 1.1,
  duration: { line: 1.05, word: 0.9, item: 0.9 },
  stagger: { line: 0.11, word: 0.045, item: 0.075 },
} as const;

export type Timeline = ReturnType<typeof gsap.timeline>;
export type SplitMode = "words" | "lines";

/** Sant bara när SmoothScroll har tänt `html.has-motion`. */
export function hasMotion(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("has-motion")
  );
}

/* ------------------------------------------------------------------------ *
 * Textuppdelning
 *
 * Texten kommer från next-intl och får aldrig hårdkodas här — vi delar upp
 * den RENDERADE texten på klienten. Originalet sparas i `data-fx-text` och
 * speglas i `aria-label`.
 *
 * Ordspanarna lämnas medvetet synliga för uppläsare (inget `aria-hidden`).
 * `aria-label` är inte tillåtet på t.ex. <p> (role=paragraph förbjuder namn
 * från författaren); hade vi dolt barnen skulle stycket då annonseras som
 * tomt. Nu gäller: rubriker läses via aria-label, stycken via sitt innehåll
 * — och innehållet är teckenidentiskt med originalet, mellanslagen ligger
 * kvar som riktiga textnoder mellan maskerna.
 * ------------------------------------------------------------------------ */

/** Återställer elementet till oskuren text och glömmer uppdelningen. */
export function restoreText(el: HTMLElement): void {
  const stored = el.dataset.fxSource;
  if (stored === undefined) return;
  el.textContent = stored;
  el.removeAttribute("aria-label");
  delete el.dataset.fxSource;
  delete el.dataset.fxSplit;
}

/**
 * Läser originaltexten och nollställer elementet inför en ny uppdelning.
 *
 * OBS: lagringsnyckeln måste vara `fxSource`, INTE `fxText` — komponenterna
 * använder `data-fx-text` som tomt markörattribut i JSX, vilket React
 * renderar som strängen "true". Hade vi läst samma nyckel skulle "true"
 * ersätta rubriktexten (det hände i prod 2026-08-14).
 */
function prepare(el: HTMLElement): string {
  const stored = el.dataset.fxSource;
  if (stored !== undefined) {
    el.textContent = stored;
    return stored;
  }
  const text = el.textContent ?? "";
  el.dataset.fxSource = text;
  el.setAttribute("aria-label", text.trim());
  return text;
}

/** Delar upp texten i maskade ord. Reflowar fritt vid resize. */
export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.fxSplit === "words") {
    return Array.from(el.querySelectorAll<HTMLElement>(".fx-word"));
  }

  const text = prepare(el);
  if (!text.trim()) return [];

  el.textContent = "";
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (!part.trim()) {
      el.appendChild(document.createTextNode(part));
      continue;
    }
    const mask = document.createElement("span");
    mask.className = "fx-word-mask";
    const word = document.createElement("span");
    word.className = "fx-word";
    word.textContent = part;
    mask.appendChild(word);
    el.appendChild(mask);
  }

  el.dataset.fxSplit = "words";
  return Array.from(el.querySelectorAll<HTMLElement>(".fx-word"));
}

/**
 * Delar upp texten i maskade rader.
 *
 * Radbrytningarna kan inte hårdkodas — de beror på typsnitt och bredd. Vi
 * lägger därför först ut orden som vanliga inline-spanar, mäter var de
 * faktiskt hamnar och grupperar dem på y-position innan de maskeras.
 * Radmaskerna låser brytningen, så `fxText` släpper tillbaka ren text när
 * avslöjandet är klart (se `restoreText`).
 */
export function splitLines(el: HTMLElement): HTMLElement[] {
  if (el.dataset.fxSplit === "lines") {
    return Array.from(el.querySelectorAll<HTMLElement>(".fx-line"));
  }

  const text = prepare(el);
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  el.textContent = "";
  const probes: HTMLElement[] = [];
  words.forEach((word, i) => {
    const probe = document.createElement("span");
    probe.textContent = word;
    el.appendChild(probe);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    probes.push(probe);
  });

  const lines: string[][] = [];
  let top = Number.NEGATIVE_INFINITY;
  probes.forEach((probe, i) => {
    const y = probe.getBoundingClientRect().top;
    if (y > top + 2) {
      lines.push([]);
      top = y;
    }
    lines[lines.length - 1].push(words[i]);
  });

  el.textContent = "";
  for (const line of lines) {
    const mask = document.createElement("span");
    mask.className = "fx-line-mask";
    const inner = document.createElement("span");
    inner.className = "fx-line";
    inner.textContent = line.join(" ");
    mask.appendChild(inner);
    el.appendChild(mask);
  }

  el.dataset.fxSplit = "lines";
  return Array.from(el.querySelectorAll<HTMLElement>(".fx-line"));
}

/* ------------------------------------------------------------------------ *
 * Scener och presets
 * ------------------------------------------------------------------------ */

/** Tidslinje som spelas när scenen kommer in i vyn — som regel en gång. */
export function fxScene(
  trigger: Element,
  opts: {
    start?: string;
    end?: string | (() => string);
    once?: boolean;
    scrub?: number | boolean;
  } = {}
): Timeline {
  return gsap.timeline({
    defaults: { ease: FX.ease },
    scrollTrigger: {
      trigger,
      start: opts.start ?? FX.start,
      end: opts.end,
      scrub: opts.scrub,
      once: opts.scrub ? undefined : (opts.once ?? true),
    },
  });
}

/**
 * Maskad textreveal: raderna/orden glider upp genom sin mask med en lätt
 * oskärpa som klarnar. `yPercent: 130` matchar `.reveal-line` i globals.css
 * — masken har extra padding för underlängder, och texten måste börja
 * utanför även den.
 */
export function fxText(
  tl: Timeline,
  el: HTMLElement | null | undefined,
  opts: {
    mode?: SplitMode;
    at?: number | string;
    stagger?: number;
  } = {}
): Timeline {
  if (!el) return tl;

  const mode = opts.mode ?? "words";
  const targets = mode === "lines" ? splitLines(el) : splitWords(el);
  if (!targets.length) return tl;

  gsap.set(el, { autoAlpha: 1 });
  tl.fromTo(
    targets,
    { yPercent: 130, autoAlpha: 0, filter: "blur(9px)" },
    {
      yPercent: 0,
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: mode === "lines" ? FX.duration.line : FX.duration.word,
      stagger:
        opts.stagger ?? (mode === "lines" ? FX.stagger.line : FX.stagger.word),
      clearProps: "filter",
      onComplete: () => {
        // Radmaskerna låser radbrytningen. När avslöjandet är klart ser
        // ren text exakt likadan ut — och flödar om vid resize.
        if (mode === "lines") restoreText(el);
      },
    },
    opts.at ?? 0
  );

  return tl;
}

/** Staggrad reveal av innehållsblock. Oskärpa bara när blocken är text. */
export function fxItems(
  tl: Timeline,
  els: ArrayLike<Element> | null | undefined,
  opts: {
    at?: number | string;
    stagger?: number;
    y?: number;
    blur?: boolean;
    duration?: number;
  } = {}
): Timeline {
  const list = els ? Array.from(els) : [];
  if (!list.length) return tl;

  const blur = opts.blur ?? false;
  tl.fromTo(
    list,
    { y: opts.y ?? 34, autoAlpha: 0, ...(blur ? { filter: "blur(8px)" } : null) },
    {
      y: 0,
      autoAlpha: 1,
      ...(blur ? { filter: "blur(0px)", clearProps: "filter" } : null),
      duration: opts.duration ?? FX.duration.item,
      stagger: opts.stagger ?? FX.stagger.item,
    },
    opts.at ?? 0
  );

  return tl;
}

/**
 * Parallax genom hastighetsskillnad, inte genom stora förflyttningar.
 * Lagret driver från `from` till `to` (procent av sin egen höjd) medan
 * sektionen passerar vyn. Kräver att lagret har överhöjd i en
 * `overflow: hidden`-box — se `[data-fx-parallax]` i motion.css.
 */
export function fxParallax(
  layer: HTMLElement,
  opts: {
    trigger?: Element;
    from?: number;
    to?: number;
    scrub?: number;
  } = {}
): void {
  gsap.fromTo(
    layer,
    { yPercent: opts.from ?? -5.5 },
    {
      yPercent: opts.to ?? 5.5,
      ease: "none",
      scrollTrigger: {
        trigger: opts.trigger ?? layer,
        start: "top bottom",
        end: "bottom top",
        scrub: opts.scrub ?? 1.2,
        invalidateOnRefresh: true,
      },
    }
  );
}

/**
 * Reveal och bildparallax för ett rutnät av projektkort.
 *
 * ProjectCard rörs inte — koreografin läggs på den renderade strukturen från
 * wrapper-nivå. Bildytan är kortets `overflow: hidden`-box och parallaxlagret
 * är dess första barn: en <img> från next/image `fill`, eller gradient-diven
 * för de case som saknar bild. Ser strukturen inte ut så hoppas parallaxen
 * tyst över och korten får bara sin reveal.
 *
 * Returnerar en städfunktion som plockar bort attributen vi satte.
 */
export function fxCardGrid(grid: HTMLElement): () => void {
  const cards = Array.from(grid.querySelectorAll<HTMLElement>(":scope > article"));
  const marked: HTMLElement[] = [];

  cards.forEach((card, i) => {
    // Egen trigger per kort — rutnätet kan vara långt, och en enda stagger
    // hade dragit igång kort som ligger flera skärmar ner.
    gsap.fromTo(
      card,
      { y: 40, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: FX.duration.item,
        ease: FX.ease,
        delay: (i % 2) * 0.09,
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          once: true,
        },
      }
    );

    const media = card.querySelector<HTMLElement>("a > div");
    const layer = media?.firstElementChild;
    if (!media || !(layer instanceof HTMLElement)) return;

    layer.setAttribute("data-fx-parallax", "");
    marked.push(layer);
    fxParallax(layer, { trigger: media });
  });

  return () => {
    for (const layer of marked) layer.removeAttribute("data-fx-parallax");
  };
}

/* ------------------------------------------------------------------------ *
 * Hook
 * ------------------------------------------------------------------------ */

/**
 * Kör `setup` en gång per scen, inuti en `gsap.context()` som rivs i cleanup.
 *
 * Uppsättningen väntar in två saker innan den mäter något:
 *  - typsnitten, eftersom `splitLines` annars delar rubrikerna på
 *    fallback-typsnittets bredder och radbrytningen blir fel;
 *  - en frame, så att SmoothScroll hunnit registrera ScrollTrigger och tända
 *    `has-motion` (React kör effekter barn först).
 *
 * `setup` får returnera en egen städfunktion — gsap.context kör den vid revert.
 */
export function useScrollFx<T extends HTMLElement = HTMLDivElement>(
  setup: (scope: T) => void | (() => void),
  deps: DependencyList = []
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;

    let cancelled = false;
    let frame = 0;
    let ctx: { revert: () => void } | undefined;

    const start = () => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        if (cancelled || !hasMotion()) return;
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => setup(scope), scope);
      });
    };

    const fonts = document.fonts;
    if (fonts && fonts.status !== "loaded") fonts.ready.then(start, start);
    else start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
