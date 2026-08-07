import type { ReactNode } from "react";
import "./globals.css";

/**
 * Root-layouten är avsiktligt tom — <html> och <body> sätts i app/[locale]/layout.tsx
 * så att lang-attributet kan följa aktivt språk.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
