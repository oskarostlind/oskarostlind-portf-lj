# Case-bank — hämtad från github.com/oskarostlind

Allt nedan är läst direkt ur dina publika repon (stack, beskrivningar, datum, live-URL:er). Endast **publika** repon syntes — har du privata kundprojekt behöver du lägga till dem manuellt.

**⚠️ Fyll i själv:** resultatsiffror, kundnamn där de saknas, och bekräfta rad markerade `[BEKRÄFTA]`. Jag hittar inte på siffror.

---

## Din tekniska profil (utläst ur koden)

| Kategori | Verktyg du faktiskt använt i skarpa projekt |
|---|---|
| **Frontend** | Next.js 14/15/16 (App Router), React 18/19, TypeScript, Tailwind CSS v3 & v4, Radix UI / shadcn, Framer Motion, Lucide, Recharts, react-easy-crop |
| **Backend** | Next.js Route Handlers, Node.js, Python (Flask), REST-API:er, middleware, cron-jobb, webhooks |
| **Databas & ORM** | PostgreSQL, Neon Serverless, Prisma 5/6/7, Drizzle ORM, SQLAlchemy, Redis / Vercel KV |
| **Auth & säkerhet** | NextAuth v4/v5, Auth.js Prisma-adapter, JWT (jose), bcrypt, Apple Sign-In, Google OAuth, rate limiting, e-postverifiering |
| **Betalningar** | Stripe (checkout, webhooks, prenumerationer), Capacitor Native Purchases, AdMob |
| **Mobil / native** | Capacitor (iOS), Push Notifications, Firebase Admin / FCM, Local Notifications, Apple Wallet-pass (passkit-generator) |
| **E-post** | Resend, React Email, Nodemailer, Flask-Mail |
| **CMS & innehåll** | Sanity v6, MDX |
| **Validering & formulär** | Zod, React Hook Form, WTForms |
| **Data & integration** | TMDB API, Google APIs, Cheerio (scraping), RSS, QR-generering, NFC |
| **Infra & drift** | Vercel, Vercel Blob, Vercel Analytics & Speed Insights, Gunicorn, Docker, Prisma Migrate, Drizzle Kit |

**Berättelsen den här listan berättar:** du bygger inte bara sidor — du bygger produkter med inloggning, betalflöden, databaser, e-postutskick och native-appar. Det är detta portföljen ska skrika.

---

## Case 1 — SocialCard / Avyra Cards *(flaggskepp)*

**En SaaS-produkt du byggt två gånger, och andra gången bättre.**

Digitalt visitkort kopplat till ett fysiskt NFC-kort med styrbar domänpekning. Byggd först som Python/Flask-applikation, sedan helt omskriven i Next.js med native iOS-app.

| | |
|---|---|
| **Live** | socialcard.se · social-card-next-js.vercel.app |
| **Repon** | `TheSocialCard2Live` (v1, Python) · `Avyracards` (v2, TypeScript) |
| **Period** | maj 2025 → juli 2026 (pågående) |

**v1 — Flask:** Flask 2.3, SQLAlchemy, Flask-Login, Flask-Migrate, Stripe, APScheduler, Flask-Limiter, Redis, Gunicorn, engångs-e-postspärr.

**v2 — Next.js:** Next.js 14, Prisma, NextAuth v5, Stripe, **Capacitor iOS-app**, Apple Sign-In, Firebase push-notiser, **Apple Wallet-pass**, Vercel Blob, Resend + Nodemailer, QR-koder, Recharts-statistik, bildbeskärning, Vitest.

**Varför det är starkt i portföljen:** hela kedjan — hårdvara (NFC) → webbapp → native iOS-app → betalflöde → analys. Plus att du visar migrering mellan stackar.

**Fyll i:** `[antal aktiva användare / sålda kort]` `[vad som drev omskrivningen]` `[MRR eller intäktsmodell om du vill visa den]`

---

## Case 2 — NextWatch

**AI-driven film- och serierekommendation med gruppmatchning.**

Användare swipar sig genom titlar; appen matchar rekommendationer mot vad hela gruppen vill se — och filtrerar på vilka streamingtjänster de faktiskt har.

| | |
|---|---|
| **Live** | nextwatch-eight.vercel.app |
| **Repo** | `nextwatch` · aktivt utvecklad (senaste push aug 2026) |
| **Period** | sep 2025 → nu |

**Stack:** Next.js 15 (Turbopack), React 19, Prisma, PostgreSQL, Stripe (premium-nivå), TMDB API, Capacitor iOS, AdMob, push- och lokala notiser, native purchases, Framer Motion, Zod, JWT-auth, e-postverifiering, cron-städning.

**Systemets omfattning:** ~90 API-endpoints — auth, vänsystem, grupper, inbjudningar, röstning, matchning, watchlist, betalning, streamingleverantörsfilter.

**Varför det är starkt:** din mest komplexa backend. Rekommendationslogik, realtidsgruppmatchning och betalflöde i samma produkt.

**Fyll i:** `[hur rekommendationsmotorn fungerar i en mening]` `[antal användare]` `[skärminspelning av swipe-flödet — det säljer bäst i rörelse]`

---

## Case 3 — Halloween Escape Room *(digitalt event)*

**Ett webbaserat escape room byggt som kampanj-/eventupplevelse.**

| | |
|---|---|
| **Live** | escaperoom-mu.vercel.app |
| **Repo** | `escaperoom` (paketnamn: `telia-halloween-escaperoom`) |
| **Period** | okt 2025 |

**Stack:** Next.js 14, Drizzle ORM, Neon Serverless Postgres, Vercel KV, NextAuth, Zod, Tailwind v4.

**[BEKRÄFTA]** Var detta ett uppdrag åt Telia? I så fall är det ditt starkaste namn att sätta i portföljen — skriv i så fall ut kunden. Om det var ett internt/eget projekt, presentera det som eget koncept.

**Fyll i:** `[antal deltagare]` `[uppdragsgivare]` `[bilder — visuellt driven upplevelse, bör visas i rörelse]`

---

## Case 4 — JJ Bygg

**Komplett kundwebb för Jesper Johansson Bygg & Entreprenad.**

Det renodlade "kunden fick en hemsida"-caset — perfekt för att visa vad en typisk beställare får.

| | |
|---|---|
| **Live** | jjbygg.vercel.app |
| **Repo** | `Jjbygg` |
| **Period** | mars → juni 2026 |

**Stack:** Next.js 14, Prisma, Radix UI / shadcn, React Hook Form + Zod, Resend (offertförfrågningar), Vercel Blob (bildhantering), Vercel Analytics, Sharp.

**Fyll i:** `[fick kunden fler förfrågningar? hur många?]` `[hade de en sida innan — före/efter-bild är extremt övertygande]` `[egen domän istället för vercel.app?]`

---

## Case 5 — Bevakningsverktyg (RSS-feed)

**Automatisk nyhetsbevakning på sökord och bolagsnamn, levererad som mejl.**

| | |
|---|---|
| **Live** | rss-feed-lime.vercel.app |
| **Repo** | `RSS-feed` · senast pushad aug 2026 |
| **Period** | juni 2026 → nu |

**Stack:** Next.js 16, React 19, Prisma 7 + PostgreSQL, NextAuth v5, Cheerio (scraping), React Email + Resend, Tailwind v4, enhetstester.

**Varför det är starkt:** visar automatisering och schemalagd datainsamling — inte bara gränssnitt. Bra case att sälja in "jag bygger verktyg som jobbar åt er när ni sover".

**Fyll i:** `[vem använder det]` `[eget verktyg eller kunduppdrag?]`

---

## Case 6 — Timringskurs

**Kundwebb med redigerbart innehåll via Sanity CMS.**

| | |
|---|---|
| **Live** | timringskurs.vercel.app |
| **Repo** | `timringskurs` · nyast (aug 2026) |

**Stack:** Next.js 16, React 19, Sanity v6, Tailwind v4, TypeScript.

**Varför det är bra att ha med:** enda caset där kunden själv kan uppdatera innehållet. Det är ett säljargument i sig — visa det.

**Fyll i:** `[kundnamn]` `[status: pågående/levererat]`

---

## Case 7 — Veckomat av Åke & Gunbritt

Mindre TypeScript-projekt, mars 2026. Live: veckomat-av-ke-gunbritt.vercel.app.
**Rekommendation:** ta med i den fullständiga listan på `/arbeten`, men inte bland de utvalda på startsidan.

---

## Rekommenderat urval

**Startsidan — 4 utvalda case:**

1. **SocialCard / Avyra** — bredden och ambitionen
2. **NextWatch** — den tekniska tyngden
3. **Escape Room** — den visuella wow-faktorn (och ev. det stora kundnamnet)
4. **JJ Bygg** — beviset att du levererar åt riktiga kunder

**`/arbeten`** — alla sju, filtrerbara på *Kundwebb · SaaS-produkt · Verktyg & automation · App*.

---

## Luckor att täppa till innan lansering

- [ ] **Riktiga domäner.** Sex av sju case ligger på `*.vercel.app`. En beställare som ser det tänker "hobbyprojekt". Peka minst de fyra utvalda mot riktiga domäner, eller visa dem bara som skärmbilder utan URL.
- [ ] **Skärminspelningar.** NextWatch-swipen och escape room-upplevelsen säljer inte i stillbild. Spela in 10–15 s per case.
- [ ] **Resultatsiffror.** Minst en mätbar siffra per case. Utan dem blir portföljen en lista på hemsidor istället för bevis på affärsnytta.
- [ ] **Kundtillstånd.** Fråga JJ Bygg och Timringskurs om du får använda deras namn och gärna ett citat.
- [ ] **README:er.** Flera repon har fortfarande Next.js standard-README. Om en teknisk beställare klickar sig till GitHub sänker det intrycket. Snabb fix, stor effekt.
- [ ] **Privata repon.** Har du kundprojekt i privata repon? De syns inte här — lägg till dem manuellt.
