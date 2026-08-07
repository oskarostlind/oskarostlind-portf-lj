"use client";

import type { ComponentType, ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";

type Tagish = ComponentType<{
  ref?: React.Ref<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}>;

/** Enkel opacity/translate-reveal när elementet kommer in i vyn. */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: "div" | "p" | "h1" | "h2" | "h3" | "span" | "li" | "section" | "blockquote";
  delay?: number;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  const Component = Tag as unknown as Tagish;
  return (
    <Component
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
