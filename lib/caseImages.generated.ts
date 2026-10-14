// GENERERAD FIL — redigera inte för hand.
// Skapas av `scripts/case-images.mjs`, som körs som `prebuild`.
// Lägg till en bild genom att lägga filen i `public/case/<slug>.<jpg|png|webp|avif>`.

export interface CaseImage {
  src: string;
  width: number;
  height: number;
  /** Saknas om sharp inte var tillgänglig när filen genererades. */
  blurDataURL?: string;
}

export const caseImages: Record<string, CaseImage> = {
  "avyracards": {
    src: "/case/avyracards.webp",
    width: 1600,
    height: 1000,
    blurDataURL: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAABwAQCdASoQAAoAAwBSJZQCdAFAAAD+9e3/L+M/+yDEm1XgVWEmDyWCCgzgLkmjAIbYIKKIALwAAA==",
  },
  "escape-room": {
    src: "/case/escape-room.webp",
    width: 1600,
    height: 1000,
    blurDataURL: "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAACwAQCdASoQAAoAAwBSJZQAAudkGRwAAP73vkUuztjBGLhgGzzoUAAA",
  },
  "jj-bygg": {
    src: "/case/jj-bygg.webp",
    width: 1600,
    height: 1000,
    blurDataURL: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADwAQCdASoQAAoAAwBSJZQC7AEVJtBsagAA/u0JvViHAH8WxJf9Yq6gwveO+G/j97LmbQ6oIzsobWVmXIAxq4PLKOInqiOar5xwUAAA",
  },
  "kundnytt": {
    src: "/case/kundnytt.webp",
    width: 1600,
    height: 759,
    blurDataURL: "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACwAQCdASoQAAgAAwBSJaQAAujcAwAAAP7675lQQlyDMYXargAAAA==",
  },
  "nextwatch": {
    src: "/case/nextwatch.webp",
    width: 1600,
    height: 1000,
    blurDataURL: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAwAgCdASoQAAoAAwBSJQBOj+CYAAUpD2kHgAD++ciBdWiHcNTiT3aO97HW2bnPO5+cnBbF2zmuV3vmgTrA5UNqAAA=",
  },
  "timringskurs": {
    src: "/case/timringskurs.webp",
    width: 1600,
    height: 1000,
    blurDataURL: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoQAAoAAwBSJYwCdAEVVQlJtKAA/vSdS93s02V3/77c7OBf/8ulDmL4C6eDqZVugeAAAA==",
  },
  "veckomat": {
    src: "/case/veckomat.webp",
    width: 1600,
    height: 1000,
    blurDataURL: "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAABQAQCdASoQAAoAAwBSJZwABDOAAP71T0Y3yjz11ESIY0PgAAA=",
  },
};
