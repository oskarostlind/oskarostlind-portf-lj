# Agent-prompt: bygg oskarostlind.se

> Kopiera allt nedanför linjen och ge till byggagenten. Ersätt `[…]`-fälten med dina uppgifter innan du kör.

---

## UPPDRAG

Bygg en komplett, produktionsklar portföljsajt för **Oskar Östlind** på domänen **oskarostlind.se**. Sajten ska sälja in Oskar till potentiella kunder och samtidigt fungera som hans starkaste referenscase — den ska framkalla ett omedelbart "wow" hos en beställare som landar där för första gången.

Oskar bygger **kompletta hemsidor åt kunder** samt **frontend, backend och CRM-system**. Målgruppen är företag som vill anlita honom.

Arbeta självständigt. Deploya efter varje fas. Fråga bara när ett beslut kräver information du omöjligt kan gissa.

---

## TEKNIKSTACK (icke förhandlingsbar)

**Hårt krav: allt ska ligga inom gratisnivåer. Inga betalda tjänster, inga betalda bibliotek, inga betalda typsnittslicenser.**

- Next.js 15, App Router, TypeScript strict
- Tailwind CSS v4
- React Three Fiber + `@react-three/drei` + `@react-three/postprocessing`
- GSAP med ScrollTrigger (hela GSAP är gratis sedan 2024, inkl. alla plugins)
- Lenis (smooth scroll)
- Framer Motion (UI-mikrointeraktioner)
- next-intl för SV/EN (svenska default, `/en`-prefix för engelska)
- Innehåll som typade MDX-filer i repot under `content/` — inget externt CMS
- Formulär: React Hook Form + Zod
- **E-post: Nodemailer via Gmail SMTP** (app-lösenord i env, 500 mejl/dygn gratis). **Använd INTE Resend** — den fria nivån tillåter bara en domän och den är redan upptagen. Fallback om SMTP strular: Web3Forms (gratis, kräver ingen backend).
- Bokning: Cal.com gratisnivå, embed
- Analys: Cloudflare Web Analytics (gratis, obegränsat, cookiefritt och GDPR-vänligt) — inte Vercel Analytics
- Typsnitt: Satoshi och General Sans från Fontshare (gratis kommersiell licens), JetBrains Mono. Self-hostade lokalt.
- 3D-assets: endast CC0-källor (Poly Haven) eller procedurell geometri

Strukturera koden som: `app/` (routes), `components/` (uppdelat i `ui/`, `sections/`, `three/`), `lib/`, `content/`, `messages/`.

**Hosting:** Cloudflare Pages via `@opennextjs/cloudflare`, eller Vercel. Notera att Vercels Hobby-nivå enligt deras villkor är avsedd för icke-kommersiellt bruk — en portfölj som säljer in tjänster kan falla utanför. Cloudflare Pages har ingen sådan begränsning och obegränsad bandbredd. Välj Cloudflare om inte Oskar säger annat.

**Mediafiler:** optimera lokalt och committa till repot. Håll varje skärminspelning under 3 MB (WebM/VP9, 10–15 s, ingen ljudkanal). Ingen extern bildtjänst.

---

## DESIGNRIKTNING

Mörk, cinematisk, high-end. Awwwards-nivå. Referenser i anda: Locomotive, Active Theory, Basement Studio.

**Färger**
- Bakgrund `#050505`, yta `#0D0D0F`, kant `rgba(255,255,255,0.08)`
- Text `#F5F5F0` primär, `#8A8A85` sekundär
- En enda accentfärg: `#00E5FF`. Använd sparsamt — glöd, kanter, hover. Aldrig som stor fyllnadsyta.

**Typografi**
- Display: en tight geometrisk sans (Satoshi eller General Sans), negativt letter-spacing, hero i `clamp(3rem, 12vw, 12rem)`
- Brödtext: Inter
- Metadata/etiketter: JetBrains Mono, versaler, spärrad
- Self-hosta alla fonter via `next/font/local`

**Rörelse**
- Standard-easing `cubic-bezier(0.16, 1, 0.3, 1)`
- 0,4 s för mikro, 0,8–1,2 s för sektionsövergångar
- Aldrig fler än en dominerande rörelse samtidigt
- `prefers-reduced-motion: reduce` ska stänga av all icke-essentiell rörelse och all 3D

---

## SIDSTRUKTUR

| Route | Innehåll |
|---|---|
| `/` | Hela storyn i ett scroll (sektionerna nedan) |
| `/arbeten` | Alla case, filtrerbara på tjänstetyp och teknik |
| `/arbeten/[slug]` | Case-detalj: problem → lösning → resultat → stack → nästa case |
| `/tjanster` | Fyra tjänsteområden, paketerade |
| `/om` | Bakgrund, arbetssätt, full verktygslista, porträtt |
| `/kontakt` | Formulär + Cal.com + direktmejl |

Navigation: fixerad minimal header (ordmärke vänster, meny-toggle höger). Toggle öppnar fullskärms-overlay med stora länkar i stagger-animation och hover-preview av case i bakgrunden.

### Startsidans sektioner, i ordning

1. **Preloader** — räknare 0→100, ordmärket växer fram, döljer 3D-laddning. Visas max en gång per session (sessionStorage).
2. **Hero** — fullskärms WebGL. Rubrik: "Jag bygger digitala upplevelser som säljer." Underrad: "Hemsidor, frontend, backend & CRM. Från första skiss till driftsatt system." CTA: *Se mina arbeten* / *Boka ett samtal*. Scroll-indikator.
3. **Manifest** — stor typografi som avslöjas ord för ord vid scroll. Ingen 3D. Andningspaus.
4. **Utvalda arbeten** — 3–4 case i horisontell scroll-sektion (GSAP pin + translate). Per case: bild/video, kund, en rad om resultatet, teknik-taggar. Hover lyfter bilden i 3D-djup.
5. **Tjänster** — fyra expanderbara kort: Kompletta hemsidor · Frontend · Backend & API · CRM & integrationer. Innehåll per kort: vad kunden får, typisk leveranstid, vem det passar.
6. **Stack & verktyg** — interaktiv 3D-konstellation av teknikloggor som noder, roterbar med drag, tooltip vid hover, grupperad i Frontend / Backend / Data / Verktyg / AI. Mobil får animerat 2D-rutnät istället.
7. **Process** — fyra steg (Upptäck → Design → Bygg → Lansera & förvalta) på en horisontell tidslinje som ritas ut vid scroll.
8. **Siffror** — uppräknande statistik.
9. **Referenser** — kundcitat, karusell.
10. **Kontakt-CTA** — stor magnetisk knapp, shader-gradient i bakgrunden, mejl + bokningslänk.
11. **Footer** — realtidsklocka (Europe/Stockholm), sociala länkar, mejl.

---

## FEM SIGNATURMOMENT

Dessa fem ska vara exceptionellt välgjorda — resten av sajten får vara stram och lugn.

1. **Hero-scenen.** En distorderad, långsamt morfande partikel-/mesh-form med custom GLSL-shader. Reagerar mjukt på muspositionen med lerp-dämpning. Subtil bloom och chromatic aberration via postprocessing. Ska kännas dyr, inte stökig.
2. **Hero → Manifest-övergång.** Vid scroll löses hero-formen upp i partiklar som driver iväg och blir bakgrundstextur för manifest-sektionen. Ett sammanhängande flöde, inte två separata scener.
3. **Case-öppning.** Klick på ett case expanderar bilden till fullskärm och sidan byter under den via View Transitions API. Inget hårt sidbyte.
4. **Stack-konstellationen.** 3D-noder man kan snurra på med drag och tröghet. Ska vara rolig att leka med.
5. **Magnetisk cursor.** Custom cursor som dras mot interaktiva element, växer vid hover, `mix-blend-mode: difference` över bilder. Endast desktop med pekdon.

---

## PRESTANDAKRAV (blockerar leverans)

- Lighthouse mobil: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100
- LCP < 2,5 s, CLS < 0,1, INP < 200 ms
- All 3D lazy-laddas via `next/dynamic` med `ssr: false`, och renderingsloopen pausas när canvasen är utanför viewport (IntersectionObserver)
- Under 768 px bredd, eller vid `prefers-reduced-motion`, eller vid låg `hardwareConcurrency`: rendera statisk fallback istället för 3D
- Alla bilder via `next/image` i AVIF/WebP med explicita dimensioner. Videor i WebM + MP4, `preload="none"`, poster-bild.
- Startsidans JS < 300 kB gzippad exklusive 3D-chunken

## TILLGÄNGLIGHET

Full tangentbordsnavigation med synliga focus-ringar. Semantisk HTML och landmarks. Kontrast minst 4.5:1 för brödtext. Skip-link. Alla animationer avstängningsbara. Skärmläsare ska kunna ta sig genom hela sajten utan att fastna i canvas-element (`aria-hidden` på dekorativ 3D).

## SEO & DELNING

Metadata per route via Next Metadata API. Dynamiskt genererade OG-bilder med `@vercel/og` per case. JSON-LD för `Person` och `ProfessionalService`. sitemap.xml, robots.txt, hreflang för sv/en. Canonical URLs.

---

## SPRÅK

Allt innehåll i `messages/sv.json` och `messages/en.json`. Ingen hårdkodad text i komponenter. Språkväxlare i headern som behåller nuvarande route. Svenska är default utan prefix, engelska på `/en`.

---

## INNEHÅLL

- **Namn:** Oskar Östlind
- **Mejl:** oskarandreassen01@gmail.com
- **GitHub:** https://github.com/oskarostlind
- **LinkedIn:** https://www.linkedin.com/in/oskar-östlind-8a5b59234/
- **Ort:** [DIN ORT]

**Case och verktygslista:** använd `CASE-BANK.md` i repot. Den innehåller sju verkliga projekt hämtade från Oskars GitHub, med korrekt teknikstack, live-URL:er, tidsperioder och en färdig gruppering av hans verktyg. Konvertera varje case till en MDX-fil under `content/arbeten/`.

**Startsidans fyra utvalda case:** AvyraCards · NextWatch · Escape Room · JJ Bygg. Övriga tre visas på `/arbeten`.

**Filtrering på `/arbeten`:** Kundwebb · SaaS-produkt · Verktyg & automation · App.

**Stack-sektionens grupper:** Frontend · Backend · Databas & ORM · Auth & betalningar · Mobil & native · Infra & drift. Kategoriindelning och innehåll finns i `CASE-BANK.md`.

Fält markerade `[…]` eller `[BEKRÄFTA]` i case-banken saknar uppgifter — lägg dem som tydligt kommenterade platshållare i MDX-filerna. **Hitta aldrig på kundnamn, resultatsiffror eller citat.** Om ett case saknar mätbart resultat, skriv caset utan resultatblock istället för att fylla det med påhitt.

**Referenser:** [KUNDCITAT MED NAMN OCH FÖRETAG — saknas ännu, hoppa över sektionen tills de finns]

---

## BYGGORDNING

Deploya till Vercel efter varje fas.

1. **Skelett** — Next.js-projekt, routing, i18n, designsystem (färger, fonter, spacing-skala, bastypografi), alla sektioner statiskt utan animation. Verifiera att sajten är fullt läsbar och navigerbar utan JS-effekter.
2. **Rörelse** — Lenis, GSAP ScrollTrigger, text-reveals, sidövergångar, magnetisk cursor, menyoverlay.
3. **3D** — hero-scenen med shader, partikelövergången, stack-konstellationen, postprocessing, alla fallbacks.
4. **Innehåll** — MDX-case, bilder, översättningar SV/EN, OG-bilder.
5. **Polish** — prestandabudget verifierad, Lighthouse-körning, tillgänglighetsgenomgång med tangentbord och skärmläsare, kontaktformulär kopplat till Resend, Cal.com, analytics, domänkoppling.

---

## LEVERANS

- Fungerande repo med tydliga commits per fas
- `README.md` som förklarar hur man lägger till ett nytt case och kör lokalt
- Lighthouse-rapport från mobil som visar att kraven är uppfyllda
- Live-URL på Vercel

**Kvalitetsribba:** Om sajten inte skulle klara sig i en Awwwards-inlämning är den inte klar. Men prestanda och tillgänglighet får aldrig offras för en effekt — en långsam portfölj är ett sämre säljargument än en snabb och enkel.
