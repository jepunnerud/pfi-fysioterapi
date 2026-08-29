# CLAUDE.md

## Prosjekt

Informasjonsnettside for en fysioterapi-klinikk i Norge. Eier av innholdet er en
ikke-teknisk person som skal redigere tekst og bilder selv via Sanity Studio.
Utvikler er hans bror, som vedlikeholder siden på fritiden.

Klinikken heter **Paulsberg Fysikalske Institutt**.

Siden har fire ruter, bundet sammen av en meny i felles layout:

| Rute | Innhold |
|---|---|
| `/` | Booking-knapp, `h1` med klinikknavn, info om stedet, hovedbilde |
| `/behandlere` | Alle behandlere med portrett, tittel og beskrivelse |
| `/priser` | Prisliste med valgfri merknad |
| `/kontakt` | Adresse, telefon, e-post, åpningstider |

Menyen og booking-knappen ligger i `layout.tsx`, ikke i hver enkelt side.
Menylenkene er hardkodet — ikke gjør menyen redigerbar i Sanity.

Menyen er en **disclosure**-hamburger på mobil: knappen med `aria-expanded`
og `aria-controls`, listen vises og skjules med `display: none` via CSS
media query. Ikke bygg den om til fullskjerms overlay — det krever fokusfelle
og `inert`, som ikke er ønsket kompleksitet her. Desktop viser lenkeraden via
CSS uten å bry seg om React-tilstanden.

Ikke legg til flere ruter uten at det er eksplisitt bedt om.
Siden har **ingen** egen timebestilling, ingen skjemaer og ingen innlogging.

## Sanity-dokumenttyper

- `innstillinger` (singleton) — klinikknavn, bookingUrl, bookingTekst,
  hovedbilde, omStedet (Portable Text)
- `behandler` (flere) — navn, tittel, bilde, beskrivelse, rekkefolge
- `priser` (singleton) — `linjer[]` med behandling/pris/varighet, merknad
- `kontakt` (singleton) — adresse, telefon, e-post, åpningstider per dag

## Stack

| Lag | Valg |
|---|---|
| CMS | Sanity (gratisplan) |
| Frontend | Next.js (App Router), React, TypeScript |
| Bygg | `output: 'export'` — full statisk eksport, ingen SSR |
| Hosting | Cloudflare Workers Static Assets |
| Studio | Deployes separat til `<prosjekt>.sanity.studio` |
| Domene | `.no`, registrert på klinikken, DNS hos Cloudflare |

## Harde regler

Disse er besluttet og skal ikke endres uten at det diskuteres eksplisitt:

1. **Ingen SSR, ingen ISR, ingen middleware, ingen route handlers.**
   Siden bygges statisk. Grunnen er at statiske filer er gratis og ubegrenset på
   Cloudflare, mens en Worker på gratisplanen har 10 ms CPU-tak og 3 MB
   størrelsesgrense. Ikke foreslå OpenNext eller Worker-basert rendering.
   `'use client'`-komponenter er derimot helt greit — de rendres til HTML ved
   bygg og hydreres i nettleseren. Menyen bruker `usePathname` og må være klient.

2. **Ingen egne skjemaer som samler personopplysninger.**
   Kontakt skjer via telefon, e-post eller lenke til klinikkens eksisterende
   journal-/bookingsystem. Å samle helseopplysninger selv utløser krav om
   databehandleravtale og risikovurdering som prosjektet ikke skal ha.

3. **Bilder serveres fra Sanitys CDN, ikke fra hosten.**
   `next/image` settes opp med en custom loader mot `cdn.sanity.io`. Sett alltid
   eksplisitt bredde i URL-en. Ikke bruk `unoptimized: true` som snarvei.

4. **Alt-tekst er påkrevd felt i Sanity.** Ikke valgfritt, ikke med default.

5. **Sanity-skjemaer skal være konkrete og navngitte.**
   Felter som «Åpningstider – mandag» og «Pris – førstegangskonsultasjon».
   Ikke page builder, ikke gjenbrukbare «section»-typer, ikke frie blokk-arrays
   der redaktøren velger komponenttype.
   Arrays med **én fast objekttype** er greit — `priser.linjer` er et array,
   og det er riktig løsning der. Skillet går på om redaktøren må velge type.
   Portable Text (`omStedet`) skal ha begrenset `styles`, `lists` og `marks`.

6. **All hjelpetekst i Studio skrives på norsk.** Bruk `description` på hvert felt.

## Juridiske krav (Norge)

- **Universell utforming er lovpålagt for private virksomheter.** Minst 35
  suksesskriterier fra WCAG 2.0 nivå A og AA. Vi sikter mot WCAG 2.1 AA.
  Konkret: semantisk HTML, kontrast ≥ 4.5:1 for brødtekst, all funksjonalitet
  tilgjengelig med tastatur, synlig fokusmarkering, alt-tekst på alle bilder,
  `lang="nb"` på `<html>`, riktig overskriftshierarki uten hopp.
- **Helsepersonelloven § 13** krever at markedsføring av helsetjenester er
  forsvarlig og nøktern. Ingen garantier om behandlingsresultat, ingen
  pasienthistorier som fungerer som effektløfter, ingen superlativer om
  behandlingseffekt. Flagg det hvis innhold eller tekstforslag går over streken.

## Kommandoer

Prosjektet bruker **Yarn**. Ikke bruk `npm` eller `npx` — det lager en
`package-lock.json` ved siden av `yarn.lock`, og da gjetter Cloudflare feil
pakkebehandler under bygg.

```
yarn dev        # utviklingsserver
yarn build      # statisk eksport til ./out
yarn typegen    # Sanity TypeGen: skjema + GROQ -> TypeScript-typer
yarn deploy     # wrangler deploy
```

Kjør `yarn typegen` etter enhver endring i Sanity-skjema eller GROQ-spørring.
Ikke skriv typer for hånd — de genereres.

## Fallgruver

- `output: 'export'` gir byggefeil hvis noe bruker dynamiske server-funksjoner.
  Feilmeldingen peker sjelden på riktig fil. Sjekk nyeste endring først.
- `trailingSlash: true` er satt bevisst. Ikke fjern det — det endrer alle
  URL-ene på siden.
- Sanity Studio ligger i eget repo/mappe og deployes med `yarn sanity deploy`.
  Den skal **ikke** bygges inn i Next.js-appen.
- Cloudflare Deploy Hook trigger nytt bygg når redaktøren publiserer.
  Bygget tar 1–2 minutter — det er forventet, ikke en feil.
- Datasettet er `public`. Derfor trengs ingen Sanity-token for lesing.
  Ikke legg inn token med mindre noe faktisk krever det.
- Bruk Yarn med `nodeLinker: node-modules` (se `.yarnrc.yml`). Plug'n'Play gir
  vanskelige feil med både Next.js og Sanity Studio. Ikke skru det på.

## Tone i kode og innhold

Kommentarer og commit-meldinger på engelsk. Brukervendt tekst på norsk (bokmål).
Foretrekk enkle løsninger fremfor smarte. Denne koden skal kunne leses av
utvikleren selv om to år, uten kontekst.
