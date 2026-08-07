import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  children: ReactNode;
  className?: string;
} & (
  | { href: React.ComponentProps<typeof Link>["href"]; external?: false }
  | { href: string; external: true }
);

/** Länk med pil som glider iväg vid hover. Används genomgående för CTA:er. */
export default function ArrowLink({ children, className = "", ...rest }: Props) {
  const inner = (
    <>
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:origin-left group-hover:scale-x-100" />
      </span>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
      >
        <path
          d="M2 8h11M9 4l4 4-4 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  const classes = `group inline-flex items-center gap-2.5 text-sm text-[var(--color-ink)] ${className}`;

  if ("external" in rest && rest.external) {
    return (
      <a href={rest.href} target="_blank" rel="noreferrer noopener" className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={(rest as { href: React.ComponentProps<typeof Link>["href"] }).href} className={classes}>
      {inner}
    </Link>
  );
}
