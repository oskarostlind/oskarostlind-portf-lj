export type StackGroupId =
  | "frontend"
  | "backend"
  | "data"
  | "auth"
  | "native"
  | "infra";

export interface StackGroup {
  id: StackGroupId;
  label: { sv: string; en: string };
  items: string[];
}

/** Grupperingen speglar det som faktiskt används i repona på github.com/oskarostlind. */
export const stackGroups: StackGroup[] = [
  {
    id: "frontend",
    label: { sv: "Frontend", en: "Frontend" },
    items: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Radix UI",
      "Framer Motion",
      "GSAP",
      "Three.js",
      "Recharts",
    ],
  },
  {
    id: "backend",
    label: { sv: "Backend", en: "Backend" },
    items: [
      "Node.js",
      "Route Handlers",
      "Python",
      "Flask",
      "REST-API",
      "Webhooks",
      "Cron-jobb",
      "Nodemailer",
    ],
  },
  {
    id: "data",
    label: { sv: "Databas", en: "Database" },
    items: [
      "PostgreSQL",
      "Prisma",
      "Drizzle",
      "SQLAlchemy",
      "Neon",
      "Redis",
      "Vercel KV",
    ],
  },
  {
    id: "auth",
    label: { sv: "Auth & betalning", en: "Auth & payments" },
    items: [
      "NextAuth",
      "Auth.js",
      "JWT",
      "OAuth",
      "Apple Sign-In",
      "Stripe",
      "Zod",
      "bcrypt",
    ],
  },
  {
    id: "native",
    label: { sv: "Mobil & native", en: "Mobile & native" },
    items: [
      "Capacitor",
      "iOS",
      "Push Notifications",
      "Firebase",
      "Apple Wallet",
      "AdMob",
    ],
  },
  {
    id: "infra",
    label: { sv: "Infra & CMS", en: "Infra & CMS" },
    items: [
      "Vercel",
      "Cloudflare",
      "Docker",
      "Sanity",
      "MDX",
      "Vercel Blob",
      "Git",
    ],
  },
];

export const allTools = stackGroups.flatMap((g) => g.items);
