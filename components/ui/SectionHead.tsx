import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function SectionHead({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <Reveal as="p" className="eyebrow">
          {eyebrow}
        </Reveal>
        <Reveal as="h2" delay={80} className="display-md mt-4 max-w-[18ch]">
          {title}
        </Reveal>
        {intro ? (
          <Reveal as="p" delay={160} className="lede mt-5">
            {intro}
          </Reveal>
        ) : null}
      </div>
      {action ? (
        <Reveal delay={200} className="shrink-0">
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}
