# oskarostlind.se

Portföljsajt för Oskar Östlind. Next.js 15, React 19, TypeScript, Tailwind v4, React Three Fiber och Lenis. Svenska och engelska. Allt inom gratisnivåer.

---

## Kom igång

```bash
npm install
cp .env.example .env.local   # fyll i SMTP-uppgifterna
npm run dev
```

Sajten körs på http://localhost:3000. Svenska ligger på roten, engelska under `/en`.

> **Obs i Cowork-sandlådan:** den molnmonterade projektmappen klarar inte symlänkar, så `node_modules` kan inte ligga där. Använd `bash scripts/build.sh` — den speglar källkoden till `/tmp/site` och bygger där.

## Kommandon

| Kommando | Vad det gör |
|---|---|
| `npm run dev` | Utvecklingsserver |
| `npm run images` | Läser om `public/case/` och skriver `lib/caseImages.generated.ts` |
| `npm run build` | Produktionsbygge (kör `npm run images` först, automatiskt) |
| `npm run start` | Kör produktionsbygget lokalt |
| `npm run typecheck` | TypeScript utan att bygga |
| `bash scripts/build.sh` | Bygge via `/tmp/site` (för sandlådan) |

## Miljövariabler

Skapa `.env.local` från `.env.example`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=oskarandreassen01@gmail.com
SMTP_PASS=<app-lösenord>
CONTACT_TO=oskarandreassen01@gmail.com
NEXT_PUBLIC_SITE_URL=https://oskarostlind.se
NEXT_PUBLIC_CAL_LINK=<anvandarnamn/15min>
NEXT_PUBLIC_CF_BEACON_TOKEN=<token>
```

De två sista är valfria och avstängda som standard.

`NEXT_PUBLIC_CAL_LINK` slår på bokningsmodulen överst på `/kontakt`. Värdet är Cal.com-länken utan domän, alltså `anvandarnamn/15min` — inte hela URL:en. Gratisnivån räcker. Är variabeln tom renderas modulen inte alls, hellre det än en knapp som leder till en 404. Kalendern hämtas först när besökaren klickar, så inget tredjepartsanrop sker vid sidladdning.

`NEXT_PUBLIC_CF_BEACON_TOKEN` slår på Cloudflare Web Analytics — gratis, utan volymtak och utan cookies, vilket är hela poängen: ingen samtyckesbanner behöver möta besökaren. Token finns i Cloudflare-panelen under Web Analytics → Add a site. Sajten behöver inte ligga hos Cloudflare för att mätningen ska fungera.

`SMTP_PASS` är **inte** ditt Google-lösenord. Skapa ett app-lösenord på https://myaccount.google.com/apppasswords (kräver tvåstegsverifiering). Klistra in det utan mellanslag.

Gmail tillåter 500 mejl per dygn på ett vanligt konto — mer än nog för ett kontaktformulär.

## Lägga till ett nytt case

Allt caseinnehåll ligger i `lib/projects.ts` som typad data. Lägg till ett objekt i `projects`-arrayen:

```ts
{
  slug: "kortnamn",                    // används i URL:en
  title: "Projektnamn",
  year: "2026",
  categories: ["kundwebb"],            // kundwebb | saas | verktyg | app
  featured: false,                     // true = visas på startsidan
  order: 8,                            // sorteringsordning
  tagline: { sv: "…", en: "…" },
  body: [{ sv: "…", en: "…" }],        // 2–4 stycken
  stack: ["Next.js", "Prisma"],
  highlights: [{ sv: "…", en: "…" }],
  live: "https://…",
  repo: "https://…",
  image: "/case/kortnamn.webp",        // behövs normalt inte — se Bilder nedan
}
```

Sidan, OG-bilden och sitemap-posten skapas automatiskt.

## Bilder

**Lägg filen i `public/case/` och döp den till casets slug. Det är hela steget** — ingen kodändring, inget `image`-fält.

```
public/case/socialcard.jpg
public/case/nextwatch.webp
public/case/jj-bygg/cover.avif      ← undermapp funkar också
```

`scripts/case-images.mjs` körs som `prebuild` (och av `npm run dev`), läser varje bilds mått och skriver en suddig miniatyr på ett par hundra byte till `lib/caseImages.generated.ts`. Miniatyren blir `placeholder="blur"`, så hero-bandet aldrig blinkar tomt medan bilden hämtas. Samma bild används på kortet, på casesidan och i "nästa case" — alla tre går genom `caseMediaFor()` i `lib/media.ts`.

Saknas bilden för ett case renderas en deterministisk gradient i stället. Det ser gjort ut snarare än trasigt, och gradienten är densamma på kortet och på casesidan, vilket View Transition-morfningen kräver.

Skriptet varnar i byggloggen om en bild är smalare än 1600 px eller om filnamnet inte matchar någon slug i `lib/projects.ts` — det senare är nästan alltid ett stavfel, och utan varningen syns bilden bara aldrig.

`image`-fältet i `lib/projects.ts` finns kvar och vinner över den automatiska sökningen, för bilder som ska ligga utanför konventionen. Det ger ingen suddig platshållare.

**Format:** WebP eller AVIF, minst 1600 px brett, under ~300 kB. Skärminspelningar: WebM/VP9, 10–15 s, utan ljudspår, max 3 MB.

`lib/caseImages.generated.ts` är genererad och versionshanterad. Redigera den inte för hand — nästa bygge skriver över den.

## Texter och översättningar

All användarsynlig text ligger i `messages/sv.json` och `messages/en.json`. Ingen text är hårdkodad i komponenter. Lägger du till en nyckel i den ena filen måste den finnas i den andra.

Routerna är översatta i `i18n/routing.ts` — `/arbeten` blir `/en/work` och så vidare.

## Struktur

```
app/
  [locale]/          sidor, en per route
  api/kontakt/       SMTP-endpoint för kontaktformuläret
components/
  sections/          sidsektioner
  ui/                återanvändbara byggstenar
  three/             React Three Fiber-scener
  providers/         Lenis smooth scroll
lib/                 casedata, stack, hooks, sajtkonstanter
messages/            sv.json och en.json
i18n/                routing, navigation, request-config
docs/                spec, case-bank och strukturdokument
```

## Prestanda och tillgänglighet

3D-scenen laddas via `next/dynamic` med `ssr: false` och hamnar i en egen chunk. Renderloopen pausas när scenen är utanför viewporten. Under 768 px, på pekskärm, vid få CPU-kärnor eller vid `prefers-reduced-motion` byts 3D mot en statisk gradient.

`prefers-reduced-motion: reduce` stänger av Lenis, preloadern, den magnetiska cursorn och alla reveal-animationer. Innehållet visas alltid — inget döljs bakom en animation som aldrig körs.

Stack-konstellationen är byggd med CSS 3D-transformer i stället för WebGL. Effekten blir densamma till en bråkdel av kostnaden, och den tillgängliga listan under den fungerar med skärmläsare och tangentbord.

## Deploy

### Cloudflare Pages (rekommenderas)

Vercels Hobby-nivå är enligt villkoren avsedd för icke-kommersiellt bruk, och en portfölj som säljer in tjänster ligger i gråzonen. Cloudflare Pages har ingen sådan begränsning och obegränsad bandbredd.

1. Pusha repot till GitHub
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → anslut repot
3. Build command: `npx @opennextjs/cloudflare build` · Output: `.open-next/assets`
4. Lägg in miljövariablerna under Settings → Environment variables

### Vercel

Importera repot, lägg in miljövariablerna, klart. Nollkonfiguration.

## Koppla domänen

Domänen `oskarostlind.se` ligger hos Strato. När den är klar:

**Cloudflare Pages** → Custom domains → lägg till `oskarostlind.se`. Sätt hos Strato:

```
CNAME   www   <projekt>.pages.dev
```

Apex-domänen (`oskarostlind.se` utan www) kräver att domänen flyttas in i Cloudflare DNS, eller att Strato stödjer ALIAS/ANAME. Stödjer de det:

```
ALIAS   @     <projekt>.pages.dev
```

**Vercel** → Settings → Domains. Sätt hos Strato:

```
A       @     76.76.21.21
CNAME   www   cname.vercel-dns.com
```

Uppdatera `NEXT_PUBLIC_SITE_URL` när domänen är live — den styr canonical-URL:er, sitemap och OG-bilder.

## Kvar att göra

Se `PROGRESS.md` för aktuell status och `docs/CASE-BANK.md` för luckor i caseinnehållet — främst riktiga resultatsiffror, kundcitat och skärmbilder.
