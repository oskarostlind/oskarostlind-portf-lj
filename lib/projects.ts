/**
 * Casedata hämtad från github.com/oskarostlind.
 * Teknikstack, datum och live-URL:er är verifierade mot repona.
 *
 * TODO (Oskar): fyll i `metrics` med riktiga siffror och `quote` med kundcitat.
 *               Hitta aldrig på dem — tomma fält renderas inte.
 */

export type Category = "kundwebb" | "saas" | "verktyg" | "app";

export type Localized = { sv: string; en: string };

export interface Metric {
  value: string;
  label: Localized;
}

export interface Project {
  slug: string;
  title: string;
  client?: Localized;
  year: string;
  categories: Category[];
  featured: boolean;
  order: number;
  tagline: Localized;
  /** 2–4 stycken. Problem → lösning → vad som gör det tekniskt intressant. */
  body: Localized[];
  stack: string[];
  /** Kort lista med det som faktiskt byggdes. */
  highlights: Localized[];
  live?: string;
  repo?: string;
  /** Läggs i /public/case/. Saknas bilden renderas en genererad gradient i stället. */
  image?: string;
  video?: string;
  metrics?: Metric[];
  quote?: { text: Localized; author: string; role: Localized };
}

export const categories: { id: Category; label: Localized }[] = [
  { id: "kundwebb", label: { sv: "Kundwebb", en: "Client sites" } },
  { id: "saas", label: { sv: "SaaS-produkt", en: "SaaS product" } },
  { id: "verktyg", label: { sv: "Verktyg & automation", en: "Tools & automation" } },
  { id: "app", label: { sv: "App", en: "App" } },
];

export const projects: Project[] = [
  {
    slug: "avyracards",
    title: "AvyraCards",
    year: "2025–2026",
    categories: ["saas", "app"],
    featured: true,
    order: 1,
    tagline: {
      sv: "Digitalt visitkort kopplat till fysiskt NFC-kort — byggt två gånger, andra gången bättre.",
      en: "A digital business card wired to a physical NFC card — built twice, better the second time.",
    },
    body: [
      {
        sv: "Ett visitkort som slutar vara papper. Kunden får ett fysiskt NFC-kort som pekar mot en profil de själva styr — och kan byta destination utan att trycka nya kort.",
        en: "A business card that stops being paper. The customer gets a physical NFC card pointing at a profile they control — and can change the destination without reprinting anything.",
      },
      {
        sv: "Första versionen byggdes i Python och Flask med Stripe, schemalagda jobb och rate limiting. När produkten växte ur den skrev jag om hela plattformen i Next.js och lade till en native iOS-app via Capacitor.",
        en: "The first version was built in Python and Flask with Stripe, scheduled jobs and rate limiting. When the product outgrew it I rewrote the whole platform in Next.js and added a native iOS app through Capacitor.",
      },
      {
        sv: "Andra versionen hanterar Apple Sign-In, push-notiser via Firebase, Apple Wallet-pass, QR-koder, bilduppladdning med beskärning och statistik över hur ofta kortet skannas.",
        en: "The second version handles Apple Sign-In, Firebase push notifications, Apple Wallet passes, QR codes, image upload with cropping, and analytics on how often the card gets scanned.",
      },
    ],
    stack: [
      "Next.js 14",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "NextAuth v5",
      "Stripe",
      "Capacitor iOS",
      "Firebase Admin",
      "Apple Wallet",
      "Vercel Blob",
      "Python / Flask",
      "SQLAlchemy",
      "Redis",
    ],
    highlights: [
      { sv: "Native iOS-app från samma kodbas", en: "Native iOS app from the same codebase" },
      { sv: "Betalflöde och prenumerationer via Stripe", en: "Payments and subscriptions through Stripe" },
      { sv: "Apple Wallet-pass genererade på servern", en: "Server-generated Apple Wallet passes" },
      { sv: "Full migrering Flask → Next.js utan driftstopp", en: "Full Flask → Next.js migration with no downtime" },
    ],
    // socialcard.se är produktens gamla domän. Den pekar numera på en
    // Strato-platshållare och svarar inte över https — den låg som live-länk
    // här och gav flaggskeppscaset en död "besök sajten"-knapp.
    live: "https://avyracards.se",
    repo: "https://github.com/oskarostlind/Avyracards",
  },
  {
    slug: "nextwatch",
    title: "NextWatch",
    year: "2025–2026",
    categories: ["saas", "app"],
    featured: true,
    order: 2,
    tagline: {
      sv: "Rekommendationsmotor som matchar vad en hel grupp vill se — filtrerat på tjänsterna de faktiskt har.",
      en: "A recommendation engine that matches what a whole group wants to watch — filtered by the services they actually have.",
    },
    body: [
      {
        sv: "Problemet är banalt och universellt: fyra personer i en soffa kommer inte överens om vad de ska titta på. NextWatch löser det genom att låta alla swipa igenom titlar och sedan räkna fram överlappet.",
        en: "The problem is mundane and universal: four people on a sofa cannot agree on what to watch. NextWatch solves it by letting everyone swipe through titles and then computing the overlap.",
      },
      {
        sv: "Systemet väger in varje medlems betyg, filtrerar bort det de redan sett och visar bara titlar som faktiskt går att strömma på gruppens tjänster. Data kommer från TMDB.",
        en: "The system weighs each member's ratings, filters out what they have already seen and only surfaces titles the group can actually stream. Data comes from TMDB.",
      },
      {
        sv: "Bakom gränssnittet ligger ungefär nittio API-endpoints: autentisering, vänsystem, grupper, inbjudningar, röstning, matchning, watchlist och betalflöde. Det är den mest sammansatta backend jag byggt.",
        en: "Behind the interface sit roughly ninety API endpoints: auth, friends, groups, invitations, voting, matching, watchlist and billing. It is the most involved backend I have built.",
      },
    ],
    stack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "Stripe",
      "TMDB API",
      "Capacitor iOS",
      "Framer Motion",
      "JWT / jose",
      "Zod",
    ],
    highlights: [
      { sv: "~90 API-endpoints i produktion", en: "~90 API endpoints in production" },
      { sv: "Gruppmatchning i realtid", en: "Real-time group matching" },
      { sv: "Filtrering mot användarens streamingtjänster", en: "Filtering against the user's streaming services" },
      { sv: "Premiumnivå med Stripe och native köp", en: "Premium tier with Stripe and native purchases" },
    ],
    live: "https://nextwatch-eight.vercel.app",
    repo: "https://github.com/oskarostlind/nextwatch",
  },
  {
    slug: "escape-room",
    title: "Halloween Escape Room",
    year: "2025",
    categories: ["kundwebb", "verktyg"],
    featured: true,
    order: 3,
    tagline: {
      sv: "Ett digitalt escape room byggt som eventupplevelse — flera lag, delad speltid, spårad progression.",
      en: "A digital escape room built as an event experience — multiple teams, shared clock, tracked progress.",
    },
    body: [
      {
        sv: "En webbaserad escape room-upplevelse där lag löser pussel mot klockan. Varje lags progression lagras serverside så att spelet överlever en omladdning eller ett tappat nät.",
        en: "A browser-based escape room where teams solve puzzles against the clock. Each team's progress is stored server-side so the game survives a reload or a dropped connection.",
      },
      {
        sv: "Byggt på Drizzle och serverlös Postgres via Neon, med Vercel KV för speltillstånd som behöver läsas ofta. Sessionshantering via NextAuth.",
        en: "Built on Drizzle and serverless Postgres via Neon, with Vercel KV for game state that gets read constantly. Session handling through NextAuth.",
      },
    ],
    stack: [
      "Next.js 14",
      "TypeScript",
      "Drizzle ORM",
      "Neon Postgres",
      "Vercel KV",
      "NextAuth",
      "Tailwind CSS",
      "Zod",
    ],
    highlights: [
      { sv: "Serverside speltillstånd — tål omladdning", en: "Server-side game state — survives reloads" },
      { sv: "Flera samtidiga lag", en: "Multiple concurrent teams" },
      { sv: "Serverlös databas, noll driftkostnad mellan event", en: "Serverless database, zero cost between events" },
    ],
    live: "https://escaperoom-mu.vercel.app",
    repo: "https://github.com/oskarostlind/escaperoom",
    // TODO (Oskar): var detta ett uppdrag åt Telia? Repots paketnamn antyder det.
    // Bekräfta innan kundnamnet skrivs ut här.
  },
  {
    slug: "jj-bygg",
    title: "JJ Bygg",
    client: { sv: "Jesper Johansson Bygg & Entreprenad", en: "Jesper Johansson Bygg & Entreprenad" },
    year: "2026",
    categories: ["kundwebb"],
    featured: true,
    order: 4,
    tagline: {
      sv: "Komplett webbplats åt ett byggföretag, med offertformulär som landar direkt i inkorgen.",
      en: "A complete website for a construction firm, with a quote form that lands straight in the inbox.",
    },
    body: [
      {
        sv: "Ett byggföretag som tappade förfrågningar för att de inte hade någonstans att ta emot dem. Sajten presenterar tjänsterna, visar tidigare arbeten och gör det så enkelt som möjligt att begära offert.",
        en: "A construction firm that was losing enquiries because they had nowhere to receive them. The site presents their services, shows past work and makes requesting a quote as frictionless as possible.",
      },
      {
        sv: "Offertformuläret validerar i både klient och server, laddar upp bilder från kunden och skickar en strukturerad förfrågan vidare. Bilder komprimeras vid uppladdning.",
        en: "The quote form validates on both client and server, accepts image uploads from the customer and forwards a structured enquiry. Images are compressed on upload.",
      },
    ],
    stack: [
      "Next.js 14",
      "TypeScript",
      "Prisma",
      "Radix UI",
      "React Hook Form",
      "Zod",
      "Vercel Blob",
      "Tailwind CSS",
    ],
    highlights: [
      { sv: "Offertformulär med bilduppladdning", en: "Quote form with image upload" },
      { sv: "Validering i både klient och server", en: "Validation on both client and server" },
      { sv: "Tillgänglig UI byggd på Radix-primitiv", en: "Accessible UI built on Radix primitives" },
    ],
    live: "https://jjbygg.vercel.app",
    repo: "https://github.com/oskarostlind/Jjbygg",
    // TODO (Oskar): be om ett kundcitat från Jesper + siffror på antal förfrågningar före/efter.
  },
  {
    slug: "kundnytt",
    title: "Kundnytt",
    year: "2026",
    categories: ["saas", "verktyg"],
    featured: true,
    order: 5,
    tagline: {
      sv: "Automatisk nyhetsbevakning på sökord och bolagsnamn, levererad som mejl.",
      en: "Automated news monitoring on keywords and company names, delivered by email.",
    },
    body: [
      {
        sv: "Ett verktyg som bevakar nyhetsflöden på valda sökord och bolagsnamn och skickar en sammanställning när något dyker upp. Byggt för att slippa läsa branschnyheter manuellt.",
        en: "A tool that monitors news feeds for chosen keywords and company names and sends a digest when something surfaces. Built to stop reading industry news by hand.",
      },
      {
        sv: "Innehåll hämtas och normaliseras med Cheerio, lagras i Postgres via Prisma och mejlas ut med React Email. Hela kedjan går på schemalagda jobb.",
        en: "Content is fetched and normalised with Cheerio, stored in Postgres through Prisma and mailed out with React Email. The whole chain runs on scheduled jobs.",
      },
    ],
    stack: [
      "Next.js 16",
      "React 19",
      "Prisma 7",
      "PostgreSQL",
      "NextAuth v5",
      "Cheerio",
      "React Email",
      "Tailwind CSS v4",
    ],
    highlights: [
      { sv: "Schemalagd insamling utan manuellt arbete", en: "Scheduled collection with no manual work" },
      { sv: "Normalisering av spretiga nyhetskällor", en: "Normalisation of inconsistent news sources" },
      { sv: "Enhetstester på parsning-logiken", en: "Unit tests on the parsing logic" },
    ],
    live: "https://kundnytt.se",
    repo: "https://github.com/oskarostlind/RSS-feed",
  },
  {
    slug: "timringskurs",
    title: "Timringskurs",
    year: "2026",
    categories: ["kundwebb"],
    featured: true,
    order: 6,
    tagline: {
      sv: "Kurswebb där kunden själv redigerar allt innehåll utan att röra koden.",
      en: "A course site where the client edits every word without touching the code.",
    },
    body: [
      {
        sv: "En kurswebbplats byggd på Sanity, så att kursledaren kan lägga till datum, ändra priser och skriva om texter själv. Frontend hämtar innehållet med GROQ och renderar statiskt.",
        en: "A course website built on Sanity so the instructor can add dates, change prices and rewrite copy themselves. The frontend fetches content with GROQ and renders statically.",
      },
      {
        sv: "Byggd på Next.js 16 och Tailwind v4 med typgenererat schema — innehållsmodellen är typsäker hela vägen ut i komponenterna.",
        en: "Built on Next.js 16 and Tailwind v4 with a type-generated schema — the content model is type-safe all the way out into the components.",
      },
    ],
    stack: ["Next.js 16", "React 19", "Sanity v6", "GROQ", "Tailwind CSS v4", "TypeScript"],
    highlights: [
      { sv: "Kunden uppdaterar innehållet själv", en: "The client updates content themselves" },
      { sv: "Typgenererat innehållsschema", en: "Type-generated content schema" },
      { sv: "Statiskt renderad — laddar direkt", en: "Statically rendered — loads instantly" },
    ],
    live: "https://timringskurs.vercel.app",
    repo: "https://github.com/oskarostlind/timringskurs",
  },
  {
    slug: "veckomat",
    title: "Veckomat av Åke & Gunbritt",
    year: "2026",
    categories: ["kundwebb"],
    featured: false,
    order: 7,
    tagline: {
      sv: "Veckomatsedel på webben — litet projekt, snabbt levererat.",
      en: "A weekly menu on the web — small project, quickly delivered.",
    },
    body: [
      {
        sv: "En liten, snabb sajt som gör en veckomatsedel läsbar på telefonen. Byggd på några dagar från idé till driftsatt.",
        en: "A small, fast site that makes a weekly menu readable on a phone. Built in a few days from idea to deployed.",
      },
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    highlights: [{ sv: "Idé till drift på några dagar", en: "Idea to production in days" }],
    live: "https://veckomat-av-ke-gunbritt.vercel.app",
    repo: "https://github.com/oskarostlind/Veckomat-av-Ake-Gunbritt",
  },
];

export const featuredProjects = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);

export const allProjects = [...projects].sort((a, b) => a.order - b.order);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
