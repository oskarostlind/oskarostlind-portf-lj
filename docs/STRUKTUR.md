# oskarostlind.se — Struktur & konceptdokument

**Positionering:** Oskar Östlind bygger kompletta digitala lösningar — hemsidor, frontend, backend och CRM — från idé till drift.
**Mål:** Konvertera besökare till bokade samtal. Sajten är i sig själv det starkaste caset i portföljen.
**Stil:** Mörk, cinematisk, high-end. Svart bas, glöd, 3D, neon-accent.
**Språk:** SV/EN med växlare (svenska som default).

---

## 1. Sidkarta

| Route | Syfte |
|---|---|
| `/` | Hero + hela storyn i ett scroll. Huvudkonverteraren. |
| `/arbeten` | Alla case, filtrerbara. |
| `/arbeten/[slug]` | Djupt case: problem → lösning → resultat. |
| `/tjanster` | Vad man kan köpa, paketerat. |
| `/om` | Person, resa, stack, arbetssätt. |
| `/kontakt` | Formulär + kalenderbokning. |
| `/lab` *(valfri fas 2)* | Experiment, shaders, småprojekt. Visar teknisk lekfullhet. |
| `/sv` `/en` | Språkprefix via i18n-routing. |

**Navigation:** Minimal fixerad header (logotyp vänster, hamburgare höger). Menyn öppnar en fullskärms-overlay med stora typsnitt, stagger-animerade länkar och hover-preview av case i bakgrunden.

---

## 2. Startsidan — sektion för sektion

### S1 — Preloader (0–1,5 s)
Räknare 0→100 med namnet som växer fram. Döljer att 3D-scenen laddas. Sätter tonen direkt.
*Krav: får aldrig visas mer än en gång per session (sessionStorage).*

### S2 — Hero
Fullskärms WebGL-scen. Namn + one-liner ovanpå. Scroll-indikator.
Innehåll: **"Oskar Östlind — Jag bygger digitala upplevelser som säljer."** Sekundär rad: "Hemsidor, frontend, backend & CRM. Från första skiss till driftsatt system."
Två CTA: *Se mina arbeten* / *Boka ett samtal*.

### S3 — Manifest
Stor typografi som avslöjas ord för ord vid scroll. 2–3 meningar om varför du finns. Ingen 3D — andningspaus efter hero.

### S4 — Utvalda arbeten (3–4 case)
Horisontell scroll-sektion eller alternerande stora bildblock. Varje case: bild/video, kundnamn, en rad om resultatet, tagg-rad (t.ex. Next.js · Supabase · Stripe). Hover skjuter fram bilden i 3D-djup.

### S5 — Tjänster
Fyra kort som expanderar vid klick: **Kompletta hemsidor · Frontend · Backend & API · CRM-system & integrationer**. Varje kort: vad du får, typisk leveranstid, vem det passar.

### S6 — Stack & verktyg
Det interaktiva blickfånget. En 3D-scen där teknikloggor sitter som noder — roterbar, med tooltip vid hover. Grupperat: Frontend / Backend / Data / Verktyg / AI.
*Fallback på mobil: animerat rutnät med loggor, ingen 3D.*

### S7 — Process
4 steg: Upptäck → Design → Bygg → Lansera & förvalta. Horisontell tidslinje som ritas ut vid scroll.

### S8 — Siffror
Räknare som tickar upp: antal projekt, år i branschen, snittleveranstid, nöjda kunder. Bara siffror du faktiskt kan stå för.

### S9 — Referenser
2–4 kundcitat. Karusell eller staplade kort. Namn, roll, företag, foto/logotyp. *Hoppa hellre över sektionen än att hitta på citat.*

### S10 — Kontakt-CTA
Stor, mörk, magnetisk knapp. E-post, kort formulär, länk till Cal.com-bokning. Bakgrund: långsam shader-gradient.

### S11 — Footer
Klocka i realtid (Sverige), sociala länkar, mejl, "Byggd av mig, från grunden"-rad.

---

## 3. Signaturmoment (det som ger WOW)

Fem specifika saker — inte generisk "animation överallt":

1. **Hero-scenen.** En roterande, distorderad partikel-/mesh-form som reagerar på muspositionen och långsamt morfar. Kärnan i varumärket.
2. **Scroll-driven hero-transition.** När man scrollar från hero till manifest exploderar/löses 3D-formen upp i partiklar som blir bakgrunden för nästa sektion. Ett enda sammanhängande flöde.
3. **Case-öppning.** Klick på ett case → bilden expanderar till fullskärm och sidan byter under den (View Transitions API). Inget hårt sidhopp.
4. **Stack-noderna.** Interaktiv 3D-konstellation man kan snurra på. Rolig, inte bara snygg.
5. **Magnetisk cursor.** Custom cursor som dras mot knappar och länkar, blandningsläge invertering över bilder. Desktop only.

**Genomgående:** Lenis smooth scroll, GSAP ScrollTrigger för all sektionslogik, stagger-reveals på text, `prefers-reduced-motion` respekteras överallt.

---

## 4. Teknikstack (rekommendation)

| Lager | Val | Varför |
|---|---|---|
| Ramverk | Next.js 15 (App Router) + TypeScript | SEO, bildoptimering, Vercel-native |
| Styling | Tailwind CSS v4 | Snabbt, konsekvent |
| 3D | React Three Fiber + drei + postprocessing | Deklarativ Three.js, bra ekosystem |
| Animation | GSAP + ScrollTrigger, Framer Motion | ScrollTrigger för scroll, Motion för UI |
| Scroll | Lenis | Smooth scroll utan att förstöra tillgänglighet |
| i18n | next-intl | SV/EN routing + översättningsfiler |
| Innehåll | MDX-filer i repo *(fas 1)* → Sanity *(fas 2)* | Börja enkelt, migrera vid behov |
| Formulär | React Hook Form + Zod → Resend | Validering + mejlutskick |
| Bokning | Cal.com embed | Färre steg till möte |
| Analys | Vercel Analytics + Plausible | Lätt, GDPR-vänligt |
| Hosting | Vercel + domän oskarostlind.se | Preview-deploys |

---

## 5. Designsystem

**Färger**
- Bas: `#050505` bakgrund, `#0D0D0F` yta
- Text: `#F5F5F0` primär, `#8A8A85` sekundär
- Accent: en enda stark färg — förslag elektrisk cyan `#00E5FF` eller giftgrön `#C6FF3D`. Välj EN och håll dig till den.
- Glöd: accentfärg med låg opacitet + blur, aldrig som fyllnadsfärg på stora ytor.

**Typografi**
- Display: en tight, hög sans — *Neue Haas Grotesk Display*, *Satoshi* eller *General Sans*
- Brödtext: *Inter* eller *Satoshi*
- Detaljer/metadata: monospace — *JetBrains Mono*
- Hero-storlek: `clamp(3rem, 12vw, 12rem)`, letter-spacing negativ

**Rörelse**
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` som standard
- Duration: 0,4 s mikro, 0,8–1,2 s sektionsövergångar
- Aldrig mer än en dominerande rörelse i taget

---

## 6. Prestanda — kritiskt

3D + animationer dödar lätt en portfölj. Hårda krav:

- Lighthouse ≥ 90 på mobil för Performance, 100 för Accessibility och SEO
- LCP < 2,5 s, CLS < 0,1
- 3D lazy-laddas (`next/dynamic`, `ssr: false`) och pausas när scenen är utanför viewport
- Mobil får förenklad eller helt utesluten 3D — statisk gradient/video-fallback
- Alla bilder i AVIF/WebP via `next/image`, videor i H.265/WebM
- Fonter self-hosted med `font-display: swap`
- Total JS på startsidan < 300 kB gzippad exklusive 3D-chunk

---

## 7. Innehåll du behöver ta fram

- [ ] 3–8 case: kundnamn (eller "Konfidentiell kund"), problem, din lösning, mätbart resultat, 3–5 bilder eller en skärminspelning per case
- [ ] Din one-liner och 2–3 meningars manifest
- [ ] Tjänstebeskrivningar + prisintervall eller "från X kr"
- [ ] Fullständig verktygslista att gruppera
- [ ] 2–4 kundcitat med tillstånd
- [ ] Ett bra porträttfoto
- [ ] CV/bakgrund för om-sidan
- [ ] Logotyp eller ordmärke

---

## 8. Byggordning

1. **Fas 1 — Skelett.** Next.js, routing, i18n, designsystem, alla sektioner statiska utan animation. Deploy till Vercel.
2. **Fas 2 — Rörelse.** Lenis, GSAP ScrollTrigger, reveals, sidövergångar, cursor.
3. **Fas 3 — 3D.** Hero-scen, stack-noder, postprocessing, fallbacks.
4. **Fas 4 — Innehåll.** Riktiga case, bilder, texter, översättningar.
5. **Fas 5 — Polish.** Prestandabudget, tillgänglighet, SEO, OG-bilder, formulär, analytics, domän.

Deploya efter varje fas. Sajten ska aldrig vara trasig i mer än en session.
