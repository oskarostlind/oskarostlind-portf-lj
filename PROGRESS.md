# Byggstatus — oskarostlind.se

**Läs `docs/AGENT-PROMPT.md` för hela specen och `docs/CASE-BANK.md` för allt caseinnehåll.**

Detta är den enda källan till sanning om vad som är gjort. Uppdatera den efter varje arbetspass.

---

## Regler för den automatiska byggagenten

1. Läs den här filen först. Ta den **översta ej avbockade** punkten under "Kvar att göra".
2. Arbeta tills punkten är helt klar. Kör `bash scripts/build.sh` — den **måste** gå igenom utan fel.
3. Bocka av punkten här, skriv en rad under "Logg", spara filen.
4. Ta nästa punkt om det finns tid. Lämna aldrig repot i ett trasigt läge.
5. Fråga aldrig om lov. Fatta rimliga beslut och dokumentera dem under "Beslut".
6. Hitta aldrig på kundnamn, resultatsiffror eller citat. Saknas uppgifter — lägg en `TODO:`-kommentar och notera under "Luckor".
7. Allt måste rymmas inom gratisnivåer. Inga betalda tjänster eller bibliotek.
8. När allt under "Kvar att göra" är avbockat: sätt status nedan till KLAR och gör inget mer.

**Miljö:** den molnmonterade projektmappen klarar inte symlänkar och tillåter inte radering via shell. Bygg alltid med `bash scripts/build.sh`, som speglar källkoden till en byggmapp utanför projektet och bygger där. Skriptet väljer själv mapp: `$BUILD_DIR` om satt, annars `/tmp/site`, annars `$HOME/.oskarostlind-build`. Skriv aldrig `node_modules` till projektmappen.

**STATUS: PÅGÅENDE**

---

## Klart

- [x] Projektstruktur, package.json, alla beroenden installerade
- [x] Grundkonfiguration — `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `.gitignore`, `.env.example`
- [x] i18n — next-intl med översatta routes (`/arbeten` ↔ `/en/work`), `messages/sv.json` + `en.json`
- [x] Designsystem — färgtokens, typografiskala, easing, focus-stilar, reduced-motion i `app/globals.css`
- [x] Layout — header, fullskärms meny-overlay med fokusfälla, footer med realtidsklocka, språkväxlare, skip-link
- [x] Casedata — alla sju case i `lib/projects.ts`, typade och tvåspråkiga
- [x] Rörelsegrund — Lenis-provider, `useReveal`, `useReducedMotion`, `useIsLowPower`
- [x] Startsidan — preloader, hero, manifest, utvalda arbeten, tjänster, stack, process, siffror, CTA
- [x] 3D: hero-scen — punktmoln med egen GLSL simplex-noise-shader, muspåverkan, scrolldriven upplösning, mobilfallback
- [x] 3D: stack-konstellation — CSS 3D-sfär med drag och tröghet, tillgänglig lista som fallback
- [x] Magnetisk cursor — desktop only, mix-blend-difference, dras mot `[data-magnetic]`
- [x] Undersidor — `/arbeten` med filter, `/arbeten/[slug]`, `/tjanster`, `/om`, `/kontakt`, 404
- [x] Kontaktformulär — API-route med nodemailer + Gmail SMTP, Zod-validering, honeypot, rate limiting
- [x] SEO — metadata per route, JSON-LD (Person + ProfessionalService), sitemap, robots, hreflang
- [x] OG-bilder — dynamiska via `next/og`, en per case plus startsidan
- [x] README — lokal körning, nya case, deploy och domänkoppling
- [x] **Case-öppning med View Transitions** — kortets bildyta morfar till casesidans hero-band medan sidan byts under. Gäller både projektkorten och "nästa case".
- [x] **Hero → Manifest-partikelövergång** — hero och manifest delar ett fast partikelfält; sfären löses upp och driver vidare som bakgrundstextur.
- [x] **Tillgänglighetsgenomgång** — `--color-dim` höjd till godkänd kontrast, meny-overlayen är en riktig dialog med fokusfälla som inkluderar menyknappen och fokusåterlämning.

## Kvar att göra

- [ ] **Prestandamätning** — kör Lighthouse mobil mot en byggd version. Kraven är Performance ≥ 90, Accessibility 100, SEO 100. Åtgärda det som fattas.
- [ ] **Bildpipeline** — `public/case/` är tom. Lägg upp skärmbilder när Oskar levererat dem och sätt `image` i `lib/projects.ts`. Tills dess renderas genererade gradienter, vilket fungerar men säljer sämre.
- [ ] **Favicon och app-ikoner** — `app/icon.tsx` och `app/apple-icon.tsx` saknas helt.
- [ ] **Cloudflare-deploy** — lägg till `@opennextjs/cloudflare` och en `wrangler.toml` så att bygget går att deploya utan manuella steg.

---

## Beslut

- **Casedata i typad TypeScript** (`lib/projects.ts`) i stället för MDX. Färre beroenden, full typsäkerhet, enklare att fylla på. Kan bytas till MDX senare om innehållet växer.
- **Typsnitt via `next/font/google`** (Inter Tight, Inter, JetBrains Mono) i stället för nedladdade Fontshare-filer — undviker binärer i repot och ger automatisk subsetting. Self-hostat i praktiken eftersom Next laddar ned dem vid bygge.
- **TypeScript pinnat till ^5.9.3.** TypeScript 7 kraschar Next 15:s laddare för `next.config.ts` med `Cannot read properties of undefined (reading 'fileExists')`. Uppgradera inte utan att verifiera bygget.
- **Stack-konstellationen byggd i CSS 3D, inte WebGL.** Samma effekt, en bråkdel av bundlen, fungerar på mobil och kräver inga externa typsnitt (drei's `Text` hämtar annars en font från CDN vid körning).
- **Bygget körs i `/tmp/site`.** Projektmappen ligger på en molnmonterad enhet utan stöd för symlänkar och utan raderingsrättigheter från shell. `scripts/build.sh` speglar källkoden dit och bygger.
- **Domänen oskarostlind.se** ligger hos Strato och bearbetas. Bygget är klart utan den; CNAME kopplas manuellt av Oskar senare.
- **Cloudflare Pages före Vercel.** Vercels Hobby-nivå är avsedd för icke-kommersiellt bruk enligt villkoren, och en säljande portfölj ligger i gråzonen.
- **Case-öppningen använder webbstandardens View Transitions API, inte en egen FLIP-animation.** Kortets bildyta och casesidans hero-band delar `view-transition-name`, och browsern morfar den ena till den andra. Knuten är att `router.push()` inte uppdaterar DOM:en synkront — callbacken till `startViewTransition` returnerar därför ett löfte som destinationssidan löser ut via `CaseTransitionSettle`, med 1,6 s timeout som säkerhetsventil. Saknas API-stöd (äldre Safari, Firefox) navigerar sajten rakt av, utan fallbackanimation. Se `lib/viewTransition.ts`.
- **Casesidan har fått ett hero-band på 78 svh.** Övergången kräver ett stort mål att morfa mot; ett band ger dessutom bilden plats att sälja caset. Rubrik och ingress ligger nu ovanpå bandet i stället för på tom bakgrund.
- **Partikelfältet flyttat från hero till en gemensam `Opening`-komponent.** Canvasen ligger i ett `fixed`-lager över viewporten och delas av hero och manifest, så att partiklarna inte klipps vid sektionsgränsen. Två scrolldrivna uniformer: `uScroll` löser upp sfären, `uDrift` plattar ut den till bakgrundsfält. Lagret tonas ut och canvasen avmonteras när öppningen lämnat vyn.
- **`--color-dim` höjd från `#56564f` till `#80807a`.** Det gamla värdet gav 2,76:1 mot `--color-void` — underkänt även för dekor. Nya värdet ger 5,13:1 mot void och 4,62:1 mot `--color-surface-2`, den mörkaste ytan tokenet används på. Skillnaden mot `--color-muted` blir liten; hierarkin bärs numera av storlek och typsnitt snarare än av ljushet.
- **Meny-overlayen är en `role="dialog"` med `aria-modal`.** Menyknappen ligger i headern, utanför overlayen i DOM:en, och ingår därför explicit i fokusfällan — annars går stängningen inte att nå med tangentbord. Fokus återlämnas till knappen vid stängning.
- **`scripts/build.sh` väljer byggmapp dynamiskt** (`$BUILD_DIR` → `/tmp/site` → `$HOME/.oskarostlind-build`). Sandlådan kan byta uid mellan sessioner, vilket gör en `/tmp/site` från förra körningen oläsbar och stoppade bygget helt.

## Luckor — kräver uppgifter från Oskar

- **Escape room-caset:** repots paketnamn är `telia-halloween-escaperoom`. Var det ett Telia-uppdrag? Kundnamnet är inte utskrivet förrän det bekräftas. Se `TODO` i `lib/projects.ts`.
- **Resultatsiffror:** inget case har `metrics` ifyllt. Portföljen blir avsevärt starkare med minst en mätbar siffra per case.
- **Kundcitat:** inget case har `quote`. Fråga JJ Bygg och Timringskurs om tillstånd.
- **Bilder:** `public/case/` är tom.
- **Statistiken på startsidan** använder 10 projekt, 90+ endpoints och 5 år. Alla tre är härledda ur GitHub-datan och bör dubbelkollas av Oskar innan lansering.

## Logg

- **2026-08-07** — Projekt scaffoldat: Next.js 15, React 19, Tailwind v4, R3F, GSAP, Lenis, next-intl, nodemailer.
- **2026-08-07** — Tre punkter avklarade. (1) Case-öppningen: projektkort och "nästa case" morfar sin bildyta till casesidans nya hero-band via View Transitions API, med löftesbaserad synk mot App Router och tyst fallback utan API-stöd. (2) Öppningen: hero och manifest delar nu ett och samma partikelfält i ett fast lager — sfären löses upp och driver vidare som bakgrundstextur genom manifestet i stället för att klippas vid sektionsgränsen. (3) Tillgänglighet: `--color-dim` höjd till godkänd kontrast (2,76:1 → 5,13:1), meny-overlayen gjord till en riktig dialog med fokusfälla som omfattar menyknappen och fokusåterlämning vid stängning, samt en död ternary rensad i kontaktformuläret. `bash scripts/build.sh` går igenom utan fel; startsidan 141 kB, casesidan 129 kB First Load JS.
- **2026-08-07** — Hela sajten byggd och grön: designsystem, layout, startsidans nio sektioner, hero-shader i WebGL, CSS 3D-stack, alla fem undersidor, kontaktformulär via SMTP, SEO, sitemap, robots, dynamiska OG-bilder och README. `bash scripts/build.sh` går igenom utan fel. Startsidan landar på 138 kB First Load JS exklusive 3D-chunken.
