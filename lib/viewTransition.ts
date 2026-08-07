"use client";

/**
 * Tunn wrapper kring View Transitions API för case-öppningen.
 *
 * Problemet: `router.push()` i App Router uppdaterar inte DOM:en synkront, så
 * en naiv `startViewTransition(() => router.push(...))` fångar gammalt och
 * nytt tillstånd i samma bildruta och ger ingen övergång alls. Lösningen är
 * att låta callbacken returnera ett löfte som destinationssidan löser ut när
 * den faktiskt monterats — se `settleCaseTransition()`.
 *
 * Saknas stödet, eller har användaren bett om reducerad rörelse, navigerar vi
 * rakt av utan animation.
 */

type ViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

type StartViewTransition = (callback: () => void | Promise<void>) => ViewTransition;

type DocumentWithVT = Document & { startViewTransition?: StartViewTransition };

/** Säkerhetsventil: om destinationen aldrig monterar släpper vi ändå övergången. */
const SETTLE_TIMEOUT = 1600;

function getStarter(): StartViewTransition | null {
  if (typeof document === "undefined") return null;
  const fn = (document as DocumentWithVT).startViewTransition;
  return typeof fn === "function" ? fn.bind(document) : null;
}

/** true bara när både API-stöd och användarens rörelsepreferens tillåter det. */
export function canAnimateNavigation() {
  if (!getStarter()) return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let pending: { resolve: () => void; timer: number } | null = null;

/** Anropas av destinationssidan när den monterats — släpper övergången. */
export function settleCaseTransition() {
  if (!pending) return;
  window.clearTimeout(pending.timer);
  const { resolve } = pending;
  pending = null;
  resolve();
}

/**
 * Kör `navigate()` inuti en view transition. `cleanup` körs alltid när
 * övergången är slut, oavsett om den lyckades eller hoppades över.
 */
export function navigateWithCaseTransition(navigate: () => void, cleanup?: () => void) {
  const start = getStarter();

  if (!start || !canAnimateNavigation()) {
    navigate();
    cleanup?.();
    return;
  }

  // Släpp en eventuell hängande övergång innan vi startar en ny.
  settleCaseTransition();

  const root = document.documentElement;
  root.dataset.caseTransition = "";

  const destinationReady = new Promise<void>((resolve) => {
    pending = {
      resolve,
      timer: window.setTimeout(settleCaseTransition, SETTLE_TIMEOUT),
    };
  });

  const done = () => {
    delete root.dataset.caseTransition;
    cleanup?.();
  };

  try {
    const transition = start(() => {
      navigate();
      return destinationReady;
    });
    transition.finished.then(done, done);
  } catch {
    settleCaseTransition();
    navigate();
    done();
  }
}
