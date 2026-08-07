import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

/** Display — tight geometrisk sans för rubriker. */
export const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

/** Brödtext. */
export const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Metadata, etiketter, siffror. */
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = `${display.variable} ${sans.variable} ${mono.variable}`;
