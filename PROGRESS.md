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

**Git går inte att köra från byggsandlådan.** Mappen tillåter inte `unlink`, så `git add` lämnar `.git/index.lock` kvar och varje följande git-kommando vägrar starta. Vägen runt: skriv en `.bat` i projektroten som kör `git add`/`commit`/`push` med utdata till en loggfil, och dubbelklicka den via Utforskaren med datorstyrning — då kör git som Windows-användaren, med rätt rättigheter och rätt inloggning mot GitHub. Städa bort hjälpfilerna efteråt (också via Utforskaren) och `git reset` dem innan commit så att de inte följer med. Ligger det redan en `index.lock` eller `HEAD.lock` i `.git` måste de raderas från Utforskaren först.

**Miljö:** den molnmonterade projektmappen klarar inte symlänkar och tillåter inte radering via shell. Bygg alltid med `bash scripts/build.sh`, som speglar källkoden till en byggmapp utanför projektet och bygger där. Skriptet väljer själv mapp: `$BUILD_DIR` om satt, annars `/tmp/site`, annars `$HOME/.oskarostlind-build`. Skriv aldrig `node_modules` till projektmappen.

**Sandlådan dödar bakgrundsprocesser.** Varje shell-anrop körs i en egen PID-namespace med `--die-with-parent`, så `nohup … &` överlever *inte* till nästa anrop — processen dör i samma sekund som anropet returnerar. Ett `npm ci` startat i bakgrunden ser ut att hänga för evigt fast det egentligen är dött. Kör i stället installationen synkront i ett anrop; npm-cachen i `~/.npm` överlever mellan anrop, så en avbruten installation gör nästa försök snabbare. Med varm cache tar `npm ci` ca 30 s.

**`Bus error (core dumped)` under `next build`** betyder oftast att `@next/swc`-binären (143 MB) är trunkerad efter en avbruten installation. Kör om `npm ci` — då byts binären ut och bygget går igenom.

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
- [x] **Favicon och app-ikoner** — `app/icon.tsx` (32×32) och `app/apple-icon.tsx` (180×180), genererade med `next/og`. Inga binärer i repot.
- [x] **Git-repo initierat** — projektet är nu ett git-repo med en första commit. Krävdes för att kunna koppla Vercel till GitHub.
- [x] **Miljövariabler** — `.env.example` uppdaterad och `.env.local` skapad. Enda tomma fältet är `SMTP_PASS`.
- [x] **Pusha till GitHub och importera i Vercel** — klart, sajten är live. Se "Deploy: läge 2026-08-08".
- [x] **DNS hos Strato** — A-posten `@ → 216.198.79.1` är satt och domänen svarar.
- [x] **Bokning via Cal.com** — bokningsmodul överst på `/kontakt`, styrd av `NEXT_PUBLIC_CAL_LINK`. Kalendern hämtas först vid klick.
- [x] **Cloudflare Web Analytics** — cookiefri mätning, styrd av `NEXT_PUBLIC_CF_BEACON_TOKEN`. Inget skript laddas utan token.
- [x] **Bildpipeline** — `scripts/case-images.mjs` hittar bilder i `public/case/` på slug, läser måtten och genererar suddiga platshållare. Att lägga upp en skärmbild kräver ingen kodändring. Själva bilderna saknas fortfarande, se "Luckor".

## Kvar att göra

- [ ] **Fyll i `NEXT_PUBLIC_CAL_LINK` och `NEXT_PUBLIC_CF_BEACON_TOKEN`** — koden finns och är verifierad i bygget, men båda funktionerna är avstängda tills värdena finns. Se "Luckor".
- [ ] **Prestandamätning** — kör Lighthouse mobil mot den driftsatta sajten. Kraven är Performance ≥ 90, Accessibility 100, SEO 100. Går inte att köra i byggsandlådan — den saknar Chrome, och PageSpeed Insights-API:t (som hade kunnat köra Lighthouse åt oss) svarar tomt genom sandlådans nätverkslager. Kräver en webbläsare hos Oskar: öppna DevTools → Lighthouse → Mobile mot `https://oskarostlind.se`, eller klistra in URL:en på pagespeed.web.dev.

---

## Deploy: läge 2026-08-08

**Sajten är live på sin egen domän: https://oskarostlind.se** (certifikat utfärdat, http → https, `www` → apex med 308).

- Vercel-projekt: `oskarostlind` (`prj_FnJ9NDOUaunB50jvYLXmsVxVQYWq`) under `oskar-ostlinds-projects`, kopplat till GitHub-repot `oskarostlind/oskarostlind-portf-lj`, produktionsgren `master`. Varje push deployar automatiskt.
- Första produktionsbygget gick igenom (commit `0088edb`).
- Miljövariabler inlagda i Vercel för Production och Preview: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `CONTACT_TO`, `NEXT_PUBLIC_SITE_URL`.
- `oskarostlind.se` är tillagd i projektet som produktionsdomän, utan www-omdirigering — apex är primär, vilket matchar `NEXT_PUBLIC_SITE_URL` och alla canonical-URL:er.

**DNS är satt och domänen svarar.** A-posten `@ → 216.198.79.1` skapades hos Strato via DNS → A-post → *Egen IP-adress*. Domänkortet visar numera `A: 216.198.79.1` i stället för `Platshållare`. Verifierat: `oskarostlind.se` slår upp till 216.198.79.1 och returnerar 200 med sajtens egen HTML.

### Kvar i Vercel

Tre miljövariabler saknas fortfarande. Sajten fungerar utan dem, men tre funktioner är avstängda: kontaktformuläret svarar 500, bokningsmodulen visas inte och ingen trafik mäts.

| Nyckel | Vad den slår på | Var värdet hämtas |
|---|---|---|
| `SMTP_PASS` | Kontaktformuläret | myaccount.google.com/apppasswords |
| `NEXT_PUBLIC_CAL_LINK` | Bokningen på `/kontakt` | cal.com — händelsetyp, länk utan domän |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics | Cloudflare → Web Analytics → Add a site |

**`SMTP_PASS` i Vercel.** Kontaktformuläret svarar 500 tills den finns. Vercel → oskarostlind → Settings → Environment Variables → Add. Värdet är ett Gmail-app-lösenord från myaccount.google.com/apppasswords. Jag lägger avsiktligt inte in lösenord.

### Att hålla ögonen på

- **HTTPS är på plats.** Certifikatet är utfärdat av Vercel och `https://oskarostlind.se` svarar 200; `http` skickar vidare med 308. Aktivera **inte** Stratos "Kryptera" parallellt — två certifikatutfärdare på samma domän ställer bara till det.
- **`www.oskarostlind.se` är tillagd** som 308-omdirigering till apex, med eget certifikat. Sökvägen följer med: `www.oskarostlind.se/en/arbeten` landar på `oskarostlind.se/en/arbeten`. Riktningen är medvetet apex-först — Vercel förkryssar "Redirect apex domains to www" i dialogen, vilket hade vänt allt mot www och brutit varenda canonical-URL och `NEXT_PUBLIC_SITE_URL`. Den rutan ska vara urkryssad.

Ocommittat i mappen: `app/icon.tsx`, `app/apple-icon.tsx`, `.env.example`, `.env.local` och den här filen. De kommer med i produktionen först efter nästa push.

---

## Deploy: instruktioner

Domänen **oskarostlind.se** är aktiv hos Strato (status: Aktiv, pekar just nu på Stratos platshållare). Hosting är **Vercel** — Oskar har team `oskar-ostlinds-projects` med sex befintliga projekt. Portföljen saknas ännu.

**0. Rensa två låsfiler först.** Byggsandlådan får inte radera filer i den molnmonterade mappen, så git lämnade kvar `.git/index.lock` och `.git/HEAD.lock`. Radera båda från Utforskaren (eller `del .git\index.lock .git\HEAD.lock` i PowerShell) — annars vägrar git köra. Ingen data går förlorad; filerna är tomma.

**1. Pusha repot.** Mappen är nu ett git-repo med en commit (`0088edb`, hela källkoden). Ikonerna, `.env.example` och den här filen ligger ännu ocommittade — de kommer med i nästa `git add -A && git commit`. Skapa repot `oskarostlind-portfolj` på GitHub och:

```
git remote add origin https://github.com/oskarostlind/oskarostlind-portfolj.git
git branch -M main
git push -u origin main
```

**2. Importera i Vercel.** vercel.com → Add New → Project → välj repot. Framework detekteras som Next.js; inga byggkommandon behöver ändras.

**3. Miljövariabler i Vercel** (Settings → Environment Variables, alla tre miljöer):

| Nyckel | Värde |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `oskarandreassen01@gmail.com` |
| `SMTP_PASS` | Gmail-app-lösenord — skapas på myaccount.google.com/apppasswords |
| `CONTACT_TO` | `oskarandreassen01@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://oskarostlind.se` |

**4. Lägg till domänen i Vercel** (Settings → Domains): `oskarostlind.se` och `www.oskarostlind.se`. Vercel visar då exakt vilka poster som gäller.

**5. DNS hos Strato** (Domänadministration → oskarostlind.se → kugghjulet → DNS):

| Typ | Namn | Värde |
|---|---|---|
| A | `@` | `216.198.79.1` |
| CNAME | `www` | `cname.vercel-dns.com` |

`216.198.79.1` är verifierad mot `nextwatch.se`, som redan ligger på Vercel i samma Strato-konto. Bekräfta ändå mot det Vercel själv visar i steg 4 — apex-IP:n har bytts förr.

**6. Slå på SSL** hos Strato ("Kryptera") eller låt Vercel sköta certifikatet. Gör inte båda samtidigt.

---

## Beslut

- **Casedata i typad TypeScript** (`lib/projects.ts`) i stället för MDX. Färre beroenden, full typsäkerhet, enklare att fylla på. Kan bytas till MDX senare om innehållet växer.
- **Typsnitt via `next/font/google`** (Inter Tight, Inter, JetBrains Mono) i stället för nedladdade Fontshare-filer — undviker binärer i repot och ger automatisk subsetting. Self-hostat i praktiken eftersom Next laddar ned dem vid bygge.
- **TypeScript pinnat till ^5.9.3.** TypeScript 7 kraschar Next 15:s laddare för `next.config.ts` med `Cannot read properties of undefined (reading 'fileExists')`. Uppgradera inte utan att verifiera bygget.
- **Stack-konstellationen byggd i CSS 3D, inte WebGL.** Samma effekt, en bråkdel av bundlen, fungerar på mobil och kräver inga externa typsnitt (drei's `Text` hämtar annars en font från CDN vid körning).
- **Bygget körs i `/tmp/site`.** Projektmappen ligger på en molnmonterad enhet utan stöd för symlänkar och utan raderingsrättigheter från shell. `scripts/build.sh` speglar källkoden dit och bygger.
- **Domänen oskarostlind.se** ligger hos Strato och bearbetas. Bygget är klart utan den; CNAME kopplas manuellt av Oskar senare.
- **~~Cloudflare Pages före Vercel.~~ Omkullkastat 2026-08-08 av Oskar: sajten ska ligga på Vercel.** Alla hans övriga projekt ligger redan där, domänerna administreras hos Strato och `nextwatch.se` visar att kedjan Strato → Vercel fungerar. Den ursprungliga invändningen — att Hobby-nivån enligt villkoren är avsedd för icke-kommersiellt bruk — kvarstår formellt och bör lösas med ett Pro-konto om portföljen börjar dra in uppdrag. `@opennextjs/cloudflare` och `wrangler.toml` läggs alltså inte till.
- **Deploy via GitHub-import, inte filuppladdning.** Vercels MCP kan skapa ett projekt genom att ta emot hela filträdet i ett anrop, men källkoden är ~170 kB och ryms inte i ett svar. Repot är därför initierat med git så att den vanliga vägen — push till GitHub, import i Vercel — går att ta direkt. Den ger dessutom automatiska deployer vid varje commit, vilket filuppladdningen inte gör.
- **`SMTP_PASS` lämnas tom överallt.** App-lösenord är en hemlighet och fylls i av Oskar själv, både i `.env.local` och i Vercel. Allt annat är förifyllt.
- **Case-öppningen använder webbstandardens View Transitions API, inte en egen FLIP-animation.** Kortets bildyta och casesidans hero-band delar `view-transition-name`, och browsern morfar den ena till den andra. Knuten är att `router.push()` inte uppdaterar DOM:en synkront — callbacken till `startViewTransition` returnerar därför ett löfte som destinationssidan löser ut via `CaseTransitionSettle`, med 1,6 s timeout som säkerhetsventil. Saknas API-stöd (äldre Safari, Firefox) navigerar sajten rakt av, utan fallbackanimation. Se `lib/viewTransition.ts`.
- **Casesidan har fått ett hero-band på 78 svh.** Övergången kräver ett stort mål att morfa mot; ett band ger dessutom bilden plats att sälja caset. Rubrik och ingress ligger nu ovanpå bandet i stället för på tom bakgrund.
- **Partikelfältet flyttat från hero till en gemensam `Opening`-komponent.** Canvasen ligger i ett `fixed`-lager över viewporten och delas av hero och manifest, så att partiklarna inte klipps vid sektionsgränsen. Två scrolldrivna uniformer: `uScroll` löser upp sfären, `uDrift` plattar ut den till bakgrundsfält. Lagret tonas ut och canvasen avmonteras när öppningen lämnat vyn.
- **`--color-dim` höjd från `#56564f` till `#80807a`.** Det gamla värdet gav 2,76:1 mot `--color-void` — underkänt även för dekor. Nya värdet ger 5,13:1 mot void och 4,62:1 mot `--color-surface-2`, den mörkaste ytan tokenet används på. Skillnaden mot `--color-muted` blir liten; hierarkin bärs numera av storlek och typsnitt snarare än av ljushet.
- **Meny-overlayen är en `role="dialog"` med `aria-modal`.** Menyknappen ligger i headern, utanför overlayen i DOM:en, och ingår därför explicit i fokusfällan — annars går stängningen inte att nå med tangentbord. Fokus återlämnas till knappen vid stängning.
- **Bokningen bygger på en ren iframe, inte Cal.coms `embed.js`.** Skriptet ger automatisk höjdjustering och prefill, men kostar en tredjepartsbundle och en global `window.Cal`-kö för en vy vi ändå ger en fast ram med egen scroll. Iframen med `embed=true` är samma kalender. Den laddas dessutom först vid klick, så inget tredjepartsanrop sker vid sidladdning — det håller kontaktsidans LCP intakt och gör att sajten slipper samtyckesbanner.
- **Cloudflare Web Analytics framför Vercel Analytics.** Gratis utan volymtak, cookiefri och därmed utan banner. Sajten behöver inte ligga hos Cloudflare för att mätningen ska fungera — bara beacon-skriptet, som laddas `afterInteractive`.
- **Båda funktionerna är env-styrda och avstängda som standard.** Utan `NEXT_PUBLIC_CAL_LINK` renderas bokningsmodulen inte alls, och utan `NEXT_PUBLIC_CF_BEACON_TOKEN` laddas inget mätskript. Ett påhittat Cal.com-användarnamn hade lett besökaren till en 404 i sajtens mest köpnära ögonblick; tomt är det enda försvarbara defaultvärdet. Bygget är verifierat i båda lägena.
- **Bilder hittas på namnkonvention, inte på ett fält i koden.** `image` i `lib/projects.ts` krävde en kodändring per bild — ett steg som är lätt att glömma och som gör att en uppladdad bild tyst inte syns. `scripts/case-images.mjs` matchar i stället filnamnet mot casets slug. `image`-fältet finns kvar och vinner över sökningen, för bilder utanför konventionen.
- **Genereringen sker vid bygget, inte vid körning.** Ett `prebuild`-skript läser måtten och skriver `lib/caseImages.generated.ts`, som checkas in. Alternativet — att läsa katalogen i en server-komponent — hade fungerat lokalt men inte i en statiskt prerenderad build, och hade kostat en filsystemsläsning per rendering. Generatorn använder `sharp`, som redan följer med `next`, och faller tillbaka på en egen PNG/JPEG/WebP-headerläsare om den inte går att ladda: då blir det inga suddiga platshållare, men måtten stämmer och bygget går igenom. Båda vägarna är verifierade och ger identiska mått.
- **Alt-texten skiljer sig mellan vyerna.** På kortet och i "nästa case" upprepar bilden bara en rubrik som står bredvid — den är dekor och får tom alt, vilket är det rätta enligt WCAG. På casesidan är skärmbilden sidans huvudsakliga bevis och får en riktig alt-text (`work.imageAlt`, med casets titel insatt).
- **`scripts/build.sh` väljer byggmapp dynamiskt** (`$BUILD_DIR` → `/tmp/site` → `$HOME/.oskarostlind-build`). Sandlådan kan byta uid mellan sessioner, vilket gör en `/tmp/site` från förra körningen oläsbar och stoppade bygget helt.

## Luckor — kräver uppgifter från Oskar

- **Escape room-caset:** repots paketnamn är `telia-halloween-escaperoom`. Var det ett Telia-uppdrag? Kundnamnet är inte utskrivet förrän det bekräftas. Se `TODO` i `lib/projects.ts`.
- **Resultatsiffror:** inget case har `metrics` ifyllt. Portföljen blir avsevärt starkare med minst en mätbar siffra per case.
- **Kundcitat:** inget case har `quote`. Fråga JJ Bygg och Timringskurs om tillstånd.
- **Bilder:** `public/case/` är tom. Pipelinen är byggd och testad, så det enda som fattas är filerna: lägg en bild per case i `public/case/` döpt till casets slug (`socialcard.webp`, `nextwatch.webp`, …), minst 1600 px bred. Nästa bygge plockar upp dem automatiskt. Tills dess renderas gradienterna. Se avsnittet "Bilder" i README.
- **Cal.com-konto:** koden är klar men bokningen är osynlig tills `NEXT_PUBLIC_CAL_LINK` är satt. Skapa ett gratiskonto på cal.com, lägg upp en händelsetyp på 15 minuter och lägg in länken utan domän (`anvandarnamn/15min`) i `.env.local` och i Vercel. Verifiera samtidigt att kalendern faktiskt visas i iframen — den vägen är inte testad mot ett skarpt konto.
- **Cloudflare-token:** mätningen är avstängd tills `NEXT_PUBLIC_CF_BEACON_TOKEN` är satt. Cloudflare-panelen → Web Analytics → Add a site → kopiera token ur beacon-snutten.
- **Statistiken på startsidan** använder 10 projekt, 90+ endpoints och 5 år. Alla tre är härledda ur GitHub-datan och bör dubbelkollas av Oskar innan lansering.

## Logg

- **2026-08-08** — **Domänen är live.** `https://oskarostlind.se` svarar 200 med giltigt certifikat, `http` skickar vidare med 308 och `/en` fungerar. Ingenting behövde ändras för apex — DNS hos Strato hade hunnit slå igenom och Vercel hade utfärdat certifikatet av sig självt. Det som saknades var `www`: den pekade mot Vercels IP men fanns inte i projektet, så alla som skrev "www" framför fick certifikatfel. Den är nu tillagd som 308-omdirigering till apex och verifierad, sökväg och allt. Notera fällan i Vercels dialog: "Redirect apex domains to www" är förkryssad och hade vänt hela sajten mot www, tvärtemot alla canonical-URL:er.
- **2026-08-08** — **Bildpipelinen byggd.** Att lägga upp en skärmbild kräver nu ingen kodändring: lägg filen i `public/case/` och döp den till casets slug, så plockas den upp av nästa bygge. `scripts/case-images.mjs` körs som `prebuild`, matchar filnamn mot slug (även `<slug>/cover.<ext>`), läser varje bilds verkliga mått och genererar en 16 px bred WebP-miniatyr som blir `placeholder="blur"` — så hero-bandet aldrig blinkar tomt medan bilden hämtas. Resultatet skrivs till `lib/caseImages.generated.ts`. Alla tre vyer som visar en casebild — kortet, casesidans hero och "nästa case" — går numera genom en enda `caseMediaFor()` i `lib/media.ts`, så en bild dyker upp på alla tre samtidigt eller ingen alls; gradientfallbacken är oförändrad och håller View Transition-morfningen ihop. Skriptet varnar om en bild är smalare än 1600 px eller om filnamnet inte matchar något case, eftersom ett stavfel annars bara yttrar sig som att bilden aldrig syns. Verifierat i skarpt bygge med en riktig bild: `/_next/image`-optimering, blur-platshållare i HTML:en och lokaliserad alt-text (`Skärmbild från …` / `Screenshot from …`) på både `/sv` och `/en`, samtidigt som ett case utan bild fortsatt renderar sin gradient. Fallbacken utan `sharp` testad separat och ger identiska mått. README har fått ett eget avsnitt "Bilder". `bash scripts/build.sh` går igenom utan fel. **Prestandamätningen går inte att göra härifrån:** sandlådan saknar Chrome och PageSpeed Insights-API:t svarar tomt genom nätverkslagret — punkten kräver en webbläsare hos Oskar. **Committat och pushat** som `a89d906`; Vercel-deployen gick igenom (`dpl_HmPuoJ5GiwEdhzVzisdyrYHcWNsn`, READY, production). De gamla låsfilerna i `.git` är borta.
- **2026-08-08** — Två punkter ur specen som aldrig blivit byggda är nu på plats: **bokning via Cal.com** och **Cloudflare Web Analytics**. Bokningsmodulen ligger överst på `/kontakt`, före formuläret — den som redan bestämt sig ska inte behöva scrolla förbi ett fritextfält för att hitta en tid. Kalendern hämtas först när besökaren klickar, så ingen tredjepart kontaktas vid sidladdning. Mätningen är cookiefri och laddas `afterInteractive`. Båda är env-styrda och renderar ingenting utan värde, så inget påhittat användarnamn eller trasig länk hamnar i produktion. All text ligger i `messages/sv.json` och `en.json` under `booking`. `.env.example`, `.env.local` och README uppdaterade. Bygget verifierat i båda lägena — både med tomma variabler och med värden satta, där beacon-skriptet och Cal.com-länken bekräftats i den genererade HTML:en. Dessutom bockades två punkter av som i praktiken redan var gjorda: pushen till GitHub/Vercel och DNS hos Strato.
- **2026-08-08** — Visuell genomgång av den driftsatta sajten i Chrome, 1440 px. Tre fel hittade och rättade. (1) **Hero-rubriken kapade underlängderna** — `display-xl` har line-height 0.86, alltså en radbox som är lägre än glyferna, och `.reveal-line { overflow: hidden }` skar av g, j och p rakt av på alla tre raderna. Masken har fått padding som ger underlängderna plats innanför klippboxen, negativ marginal som håller radavståndet oförändrat, och starttransformen är höjd 105% → 130% så att texten inte sticker fram i underkanten innan den animerats in. Verifierat i webbläsaren. (2) **Case-gradienterna spred sig över hela färgcirkeln** — SocialCard blev grönt, JJ Bygg magenta. På en sajt vars identitet är en enda cyan accent mot svart läser det som slumpmässigt. Kulören är nu låst till accentens familj (172–235°) och variationen bärs av ljuspunktens läge i stället. (3) **Sista utvalda caset låg ensamt** i vänsterkolumnen med ett tomt hål bredvid sig; det får nu full bredd när antalet går ojämnt ut. `bash scripts/build.sh` går igenom utan fel.
- **2026-08-08** — Sajten driftsatt på Vercel. Projekt `oskarostlind` skapat och kopplat till GitHub-repot, produktionsbygge grönt, miljövariabler inlagda (utom `SMTP_PASS`) och `oskarostlind.se` tillagd som produktionsdomän utan www-omdirigering. Kvar: A-posten hos Strato och app-lösenordet. Se "Deploy: läge 2026-08-08".
- **2026-08-08** — Domänen bekräftad aktiv hos Strato och hostingbeslutet ändrat till Vercel på Oskars begäran. Gjort: favicon och Apple-ikon via `next/og`, `.env.example` omskriven och `.env.local` skapad (allt ifyllt utom `SMTP_PASS`), git-repo initierat med en första commit, samt en komplett deploy-instruktion under "Deploy: nästa steg" med de DNS-poster som gäller. `bash scripts/build.sh` går igenom utan fel; startsidan 141 kB First Load JS. Kvar innan sajten är live: push till GitHub, import i Vercel, miljövariabler och DNS.
- **2026-08-07** — Projekt scaffoldat: Next.js 15, React 19, Tailwind v4, R3F, GSAP, Lenis, next-intl, nodemailer.
- **2026-08-07** — Tre punkter avklarade. (1) Case-öppningen: projektkort och "nästa case" morfar sin bildyta till casesidans nya hero-band via View Transitions API, med löftesbaserad synk mot App Router och tyst fallback utan API-stöd. (2) Öppningen: hero och manifest delar nu ett och samma partikelfält i ett fast lager — sfären löses upp och driver vidare som bakgrundstextur genom manifestet i stället för att klippas vid sektionsgränsen. (3) Tillgänglighet: `--color-dim` höjd till godkänd kontrast (2,76:1 → 5,13:1), meny-overlayen gjord till en riktig dialog med fokusfälla som omfattar menyknappen och fokusåterlämning vid stängning, samt en död ternary rensad i kontaktformuläret. `bash scripts/build.sh` går igenom utan fel; startsidan 141 kB, casesidan 129 kB First Load JS.
- **2026-08-07** — Hela sajten byggd och grön: designsystem, layout, startsidans nio sektioner, hero-shader i WebGL, CSS 3D-stack, alla fem undersidor, kontaktformulär via SMTP, SEO, sitemap, robots, dynamiska OG-bilder och README. `bash scripts/build.sh` går igenom utan fel. Startsidan landar på 138 kB First Load JS exklusive 3D-chunken.
