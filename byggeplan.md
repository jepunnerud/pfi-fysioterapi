# Byggeplan — klinikkside med Sanity, Next.js og Cloudflare

Rekkefølgen er valgt slik at du har noe synlig på skjermen tidlig, og slik at
det vanskeligste (domene, auto-publisering) kommer når resten virker.

Regn med 2–3 kvelder for et fungerende oppsett, pluss tid til innhold og design.

---

## Fase 0 — Forberedelser

**Kontoer du trenger:** Sanity, Cloudflare, GitHub. Alle gratis.

**Lokalt:** Node.js (siste LTS), git, og Claude Code.

Legg `CLAUDE.md` i prosjektroten før du starter Claude Code første gang.

**Innholdsstrukturen er avklart** (se fase 1.2). Det som fortsatt mangler før
du kan fylle siden:

- URL-en til timebestillingssystemet klinikken bruker
- Navn, titler, portretter og korte bios for behandlerne
- Prisliste med behandling, pris og varighet
- Adresse, telefon, e-post og åpningstider
- Logo og eventuelle bilder av lokalet
- Klinikkens organisasjonsnummer (trengs til domenet i fase 6)

Du kan bygge med plassholdertekst og fylle inn senere, men skjemaet bør speile
det som faktisk skal stå der. Skjemaet er det dyreste å endre i ettertid.

---

## Fase 1 — Sanity

### 1.1 Opprett prosjektet

```bash
yarn create sanity --template clean --create-project "Klinikk" --dataset production
```

Merk at `yarn create` sender argumentene rett videre — du trenger ikke `--`
mellom kommandoen og flaggene, slik npm krever.

Velg TypeScript. Legg det i en egen mappe, f.eks. `klinikk-studio/`, ikke inni
Next.js-appen.

Noter prosjekt-ID-en. Du trenger den flere ganger.

### 1.2 Definer skjemaene

Her ligger den viktigste designbeslutningen i hele prosjektet. Skjemaet skal
speile sidestrukturen, slik at Studio ser ut som nettsiden gjør.

Siden har fire ruter, med en meny som binder dem sammen:

| Rute | Innhold |
|---|---|
| `/` | «Bestill time»-knapp, `h1` med klinikknavn, info om stedet, hovedbilde |
| `/behandlere` | Alle behandlere med portrett, tittel og beskrivelse |
| `/priser` | Prisliste med valgfri merknad |
| `/kontakt` | Adresse, telefon, e-post, åpningstider |

Det gir fire dokumenttyper — én per rute:

| Type | Antall | Vises på | Innhold |
|---|---|---|---|
| `innstillinger` | singleton | `/` og menyen | Klinikknavn, booking-URL, knappetekst, hovedbilde, info om stedet |
| `behandler` | flere | `/behandlere` | Navn, tittel, portrett, beskrivelse, rekkefølge |
| `priser` | singleton | `/priser` | Liste med prislinjer, pluss valgfri merknad |
| `kontakt` | singleton | `/kontakt` | Adresse, telefon, e-post, åpningstider |

**Hvorfor behandlere er egne dokumenter, men priser er en liste:**
Behandlere har portrett og lengre tekst, og de kommer og går. Egne dokumenter
gir skikkelig forhåndsvisning i Studio og gjør det lett å legge til en ny ansatt.
Prislinjer er derimot bare rader i en tabell — der er en liste inni ett dokument
langt raskere å redigere enn å opprette et nytt dokument per behandling.

Merk at menyen er **hardkodet i koden**, ikke redigerbar i Sanity. Fire faste
lenker trenger ikke å være innhold, og en redigerbar meny er en av de tingene
som ser fleksibelt ut helt til noen sletter en lenke ved et uhell.

Eksempel som viser mønsteret du skal følge, med `behandler` som mal:

```ts
import { defineField, defineType } from 'sanity'

export const behandler = defineType({
  name: 'behandler',
  title: 'Behandler',
  type: 'document',
  fields: [
    defineField({
      name: 'navn',
      title: 'Navn',
      type: 'string',
      description: 'Fullt navn, slik det skal stå på nettsiden.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tittel',
      title: 'Tittel',
      type: 'string',
      description:
        'F.eks. "Fysioterapeut" eller "Manuellterapeut". Bruk bare titler ' +
        'personen faktisk har autorisasjon for.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bilde',
      title: 'Portrett',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          description: 'F.eks. "Portrett av Kari Nordmann".',
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: 'beskrivelse',
      title: 'Om behandleren',
      type: 'text',
      rows: 5,
      description:
        'Bakgrunn, utdanning og hva vedkommende jobber mest med. Husk at ' +
        'markedsføring av helsetjenester skal være nøktern — beskriv ' +
        'kompetanse, ikke lovnader om resultat.',
      validation: (r) => r.max(600),
    }),
    defineField({
      name: 'rekkefolge',
      title: 'Rekkefølge på nettsiden',
      type: 'number',
      description: 'Lavest tall vises først.',
      initialValue: 10,
    }),
  ],
  preview: {
    select: { title: 'navn', subtitle: 'tittel', media: 'bilde' },
  },
})
```

Legg merke til: norsk hjelpetekst på hvert felt, validering som fanger tomme
felt, `preview` med bilde så listen i Studio er lesbar, og en eksplisitt
sorteringsverdi i stedet for drag-and-drop.

**Priser** følger et annet mønster — en liste med faste felter inni ett dokument:

```ts
export const priser = defineType({
  name: 'priser',
  title: 'Priser',
  type: 'document',
  fields: [
    defineField({
      name: 'linjer',
      title: 'Prisliste',
      type: 'array',
      description: 'Dra i linjene for å endre rekkefølgen.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'prislinje',
          fields: [
            defineField({
              name: 'behandling',
              title: 'Behandling',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'pris',
              title: 'Pris i kroner',
              type: 'number',
              description: 'Bare tallet, uten "kr".',
            }),
            defineField({
              name: 'varighet',
              title: 'Varighet',
              type: 'string',
              description: 'F.eks. "30 min". Kan stå tomt.',
            }),
          ],
          preview: {
            select: { title: 'behandling', subtitle: 'pris' },
          },
        }),
      ],
    }),
    defineField({
      name: 'merknad',
      title: 'Merknad under prislisten',
      type: 'text',
      rows: 3,
      description:
        'Valgfritt. F.eks. informasjon om HELFO-refusjon, frikort eller ' +
        'avbestillingsregler.',
    }),
  ],
})
```

Husk `defineArrayMember` i importen sammen med `defineField` og `defineType`.

Dette bryter ikke med regelen om «ingen frie blokk-arrays» i `CLAUDE.md` — det
er en liste med én fast type og navngitte felter, ikke en page builder.

For bilder, bruk alltid dette mønsteret:

```ts
defineField({
  name: 'bilde',
  title: 'Bilde',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternativ tekst',
      type: 'string',
      description:
        'Beskriv hva som er på bildet. Leses opp for blinde og svaksynte. ' +
        'Dette er et lovkrav.',
      validation: (r) => r.required(),
    }),
  ],
})
```

### 1.3 Innstillinger og kontakt

`innstillinger` holder det som står øverst på siden — booking-knappen,
overskriften og info om stedet:

- `klinikknavn` (string) — «Paulsberg Fysikalske Institutt»
- `bookingUrl` (url) — lenke til journalsystemet
- `bookingTekst` (string) — knappeteksten, med `initialValue: 'Bestill time'`
- `hovedbilde` (image med alt-felt) — valgfritt
- `omStedet` (array of block) — info om stedet, som Portable Text

For `omStedet`, begrens hva han kan gjøre. Uten begrensninger får han
overskriftsnivåer og blokktyper som ikke passer inn i designet:

```ts
defineField({
  name: 'omStedet',
  title: 'Info om stedet',
  type: 'array',
  description: 'Kort tekst om klinikken, lokalene og hva dere tilbyr.',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Avsnitt', value: 'normal' }],
      lists: [{ title: 'Punktliste', value: 'bullet' }],
      marks: {
        decorators: [{ title: 'Fet', value: 'strong' }],
        annotations: [],
      },
    }),
  ],
})
```

`kontakt` er rett fram: adresse, postnummer, poststed, telefon, e-post og
åpningstider. For åpningstider, bruk sju separate strengfelter (ett per dag) i
stedet for ett fritekstfelt — da blir visningen forutsigbar, og han slipper å
formatere selv.

**Singleton-oppsett:** `innstillinger`, `priser` og `kontakt` skal det bare
finnes ett av. Sett opp `structure` i `sanity.config.ts` så han ikke kan
opprette «Kontakt 2». Be Claude Code om å konfigurere dette — det er fikkel å
skrive for hånd.

Sorter menyen i Studio i samme rekkefølge som siden: Innstillinger, Behandlere,
Priser, Kontakt. Da finner han fram uten å lete.

### 1.4 Deploy Studio

```bash
yarn sanity deploy
```

Velg et subdomene, f.eks. `klinikknavn`. Studio ligger nå på
`klinikknavn.sanity.studio`.

Legg inn litt testinnhold nå. Du trenger noe å hente når du bygger frontenden.

---

## Fase 2 — Next.js

### 2.1 Opprett appen

```bash
yarn create next-app klinikk-web --typescript --app --tailwind --eslint
cd klinikk-web
yarn add next-sanity @sanity/image-url
```

`create-next-app` spør hvilken pakkebehandler du vil bruke hvis den er i tvil.
Svar Yarn, ellers får du en `package-lock.json` du ikke vil ha.

**Hvis du bruker Yarn 2 eller nyere,** lag en `.yarnrc.yml` i prosjektroten før
du installerer noe:

```yaml
nodeLinker: node-modules
```

Plug'n'Play — Yarns standardoppførsel fra versjon 2 — gir vanskelige og lite
opplysende feil med både Next.js og Sanity Studio. Det er ikke verdt timene.

### 2.2 Miljøvariabler

`.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=din_prosjekt_id
NEXT_PUBLIC_SANITY_DATASET=production
```

Ingen token. Datasettet er offentlig, og siden leser bare publisert innhold.

### 2.3 Sanity-klient

```ts
// src/sanity/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-01-01',
  useCdn: true,
})
```

### 2.4 TypeGen

Kopier skjemaene fra Studio-mappa, eller pek TypeGen mot dem. Legg til i
`package.json`:

```json
"scripts": {
  "typegen": "sanity schema extract && sanity typegen generate"
}
```

Kjør `yarn typegen`. Nå får du ekte typer ut av GROQ-spørringene dine i stedet
for `any`. Kjør det hver gang skjema eller spørring endres.

---

## Fase 3 — Innhold på siden

### 3.1 Bildeloader mot Sanity

Dette er nøkkelen til at bilder fungerer i statisk eksport:

```ts
// src/sanityImageLoader.ts
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  return `${src}?w=${width}&q=${quality || 75}&auto=format&fit=max`
}
```

`auto=format` gir automatisk WebP eller AVIF til nettlesere som støtter det.

### 3.2 Felles layout og meny

Menyen og booking-knappen skal være på alle sidene, så de hører hjemme i
layouten — ikke i hver enkelt side.

```tsx
// src/app/layout.tsx
import { client } from '@/sanity/client'
import { groq } from 'next-sanity'
import Meny from '@/components/Meny'

const query = groq`*[_type == "innstillinger"][0]{
  klinikknavn, bookingUrl, bookingTekst
}`

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const innstillinger = await client.fetch(query)

  return (
    <html lang="nb">
      <body>
        <a href="#innhold" className="skip-lenke">
          Hopp til hovedinnhold
        </a>
        <header>
          <a
            href={innstillinger.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {innstillinger.bookingTekst ?? 'Bestill time'}
            <span className="visuelt-skjult">
              {' '}(åpner timebestilling i ny fane)
            </span>
          </a>
          <Meny />
        </header>
        <main id="innhold">{children}</main>
        <footer>
          <p>{innstillinger.klinikknavn}</p>
        </footer>
      </body>
    </html>
  )
}
```

Menyen trenger `usePathname` for å markere hvilken side du er på, og det
krever `'use client'`:

```tsx
// src/components/Meny.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const lenker = [
  { href: '/', tekst: 'Hjem' },
  { href: '/behandlere', tekst: 'Våre behandlere' },
  { href: '/priser', tekst: 'Priser' },
  { href: '/kontakt', tekst: 'Kontakt' },
]

export default function Meny() {
  const sti = usePathname()

  return (
    <nav aria-label="Hovedmeny">
      <ul>
        {lenker.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={sti === l.href ? 'page' : undefined}
            >
              {l.tekst}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

`'use client'` er helt greit med statisk eksport — komponenten rendres til
HTML ved bygg og hydreres i nettleseren. Det er bare *server*-funksjoner
som `cookies()` og route handlers som ikke fungerer.

**Hamburgermeny på mobil.** Menyen over vises som en vanlig lenkerad på desktop
og kollapser bak en knapp på smale skjermer. Dette er utvidelsen:

```tsx
// src/components/Meny.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const lenker = [
  { href: '/', tekst: 'Hjem' },
  { href: '/behandlere', tekst: 'Våre behandlere' },
  { href: '/priser', tekst: 'Priser' },
  { href: '/kontakt', tekst: 'Kontakt' },
]

export default function Meny() {
  const sti = usePathname()
  const [apen, setApen] = useState(false)
  const knappRef = useRef<HTMLButtonElement>(null)

  // Lukk menyen når man navigerer til en ny side
  useEffect(() => {
    setApen(false)
  }, [sti])

  // Escape lukker menyen og gir fokus tilbake til knappen
  useEffect(() => {
    if (!apen) return
    const ved = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setApen(false)
        knappRef.current?.focus()
      }
    }
    document.addEventListener('keydown', ved)
    return () => document.removeEventListener('keydown', ved)
  }, [apen])

  return (
    <nav aria-label="Hovedmeny">
      <button
        ref={knappRef}
        type="button"
        className="meny-knapp"
        aria-expanded={apen}
        aria-controls="meny-liste"
        onClick={() => setApen(!apen)}
      >
        <span aria-hidden="true">☰</span>
        <span className="visuelt-skjult">Meny</span>
      </button>

      <ul id="meny-liste" data-apen={apen}>
        {lenker.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={sti === l.href ? 'page' : undefined}
            >
              {l.tekst}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

CSS-en er den viktigste halvdelen. Poenget er at desktop ikke skal bry seg om
React-tilstanden i det hele tatt:

```css
/* Desktop: vanlig lenkerad, knappen finnes ikke */
.meny-knapp {
  display: none;
}

#meny-liste {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

@media (max-width: 48rem) {
  .meny-knapp {
    display: block;
    min-width: 44px;
    min-height: 44px;
  }

  #meny-liste {
    display: none;
    flex-direction: column;
  }

  #meny-liste[data-apen='true'] {
    display: flex;
  }
}

.visuelt-skjult {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

**Detaljene som avgjør om dette blir riktig:**

- `aria-expanded` må endre seg når menyen åpnes og lukkes. Dette er det
  vanligste å glemme, og det er hele grunnen til at skjermlesere skjønner
  at knappen styrer noe.
- `aria-controls` peker på `id`-en til listen. Selve knappen skal være en
  `<button>`, ikke en `<div>` med `onClick`.
- **Knappen trenger tekst.** Hamburgerikonet alene har ingen tilgjengelig navn.
  Løsningen over bruker `aria-hidden` på symbolet og visuelt skjult «Meny».
- **Lukk ved navigering.** Uten `useEffect` på `sti` blir menyen stående åpen
  når man klikker en lenke, og det ser ødelagt ut.
- **Escape lukker, og fokus går tilbake til knappen.** Uten det havner
  tastaturbrukeren i ingenmannsland.
- **Skjul med `display: none`, ikke bare visuelt.** Lenker som er usynlige men
  fortsatt i tabbrekkefølgen er verre enn ingen meny.
- **Minst 44 × 44 piksler** på knappen. WCAG 2.1 har krav til klikkflate.

Skulle du likevel ende opp med en fullskjerms overlay senere: da trenger du
også fokusfelle og `inert` på resten av siden. Det er en helt annen mengde
arbeid, og det er derfor disclosure-varianten over er verdt å holde på.

### 3.3 Sidene

Hver rute henter bare det den trenger:

```tsx
// src/app/behandlere/page.tsx
import { client } from '@/sanity/client'
import { groq } from 'next-sanity'
import Image from 'next/image'
import { urlFor } from '@/sanity/image'

const query = groq`*[_type == "behandler"] | order(rekkefolge asc){
  _id, navn, tittel, beskrivelse, bilde
}`

export const metadata = {
  title: 'Våre behandlere | Paulsberg Fysikalske Institutt',
}

export default async function Behandlere() {
  const behandlere = await client.fetch(query)

  return (
    <>
      <h1>Våre behandlere</h1>
      {behandlere.map((b) => (
        <article key={b._id}>
          {b.bilde && (
            <Image
              src={urlFor(b.bilde).width(400).height(400).url()}
              alt={b.bilde.alt}
              width={400}
              height={400}
            />
          )}
          <h2>{b.navn}</h2>
          <p>{b.tittel}</p>
          <p>{b.beskrivelse}</p>
        </article>
      ))}
    </>
  )
}
```

`/priser` og `/kontakt` følger samme mønster med sine egne spørringer.
Forsiden henter `innstillinger` og rendrer `omStedet` med Portable Text pluss
hovedbildet.

Bygg `urlFor` med `@sanity/image-url` én gang i `src/sanity/image.ts`, så
slipper du å sette sammen URL-er for hånd. Sett alltid eksplisitt `width` —
det er det som holder Sanity-båndbredden nede.

### 3.4 Ting som er lett å bomme på

- **Én `h1` per side.** På forsiden er det klinikknavnet, på de andre er det
  sidetittelen. Ikke gjenta klinikknavnet som `h1` overalt.
- **Booking-knappen er en lenke**, ikke en `<button>`. Den navigerer til et
  annet nettsted. Bruk `<a>` og styl den som en knapp.
- **Si fra at bookingen åpner i ny fane.** `target="_blank"` uten varsel er et
  WCAG-problem. Løsningen over bruker visuelt skjult tekst.
- **`aria-current="page"`** på aktiv menylenke. Farge alene er ikke nok —
  det må være maskinlesbart.
- **Hoppelenke øverst.** Med meny på hver side må tastaturbrukere ellers
  tabbe gjennom fire lenker på hver eneste sidevisning.
- **`<table>` for prislisten**, ikke divs. Tabulære data trenger tabellstruktur.
- **Telefon som `tel:` og e-post som `mailto:`.** Halvparten er på mobil.
- **Egen `metadata` per side.** Uten det får alle fire sidene samme tittel i
  Google, og det ser rart ut.

For Portable Text, installer `@portabletext/react` og render `omStedet` med
`<PortableText value={innstillinger.omStedet} />`.

---

## Fase 4 — Statisk eksport

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    loader: 'custom',
    loaderFile: './src/sanityImageLoader.ts',
  },
}

export default config
```

`trailingSlash: true` er nytt her, og det er verdt å forstå. Uten det lager
Next.js `behandlere.html` i stedet for `behandlere/index.html`. Begge deler
fungerer stort sett på Cloudflare, men mappestrukturen gir mer forutsigbar
oppførsel med og uten skråstrek i URL-en. Velg én variant nå — bytter du
senere, endres alle URL-ene, og lenker som er delt ut slutter å virke.

```bash
yarn build
```

Resultatet havner i `out/`. Åpne `out/index.html` lokalt for å sjekke at det
faktisk ble statisk HTML. Sjekk også at `out/behandlere/`, `out/priser/` og
`out/kontakt/` finnes — mangler de, er det noe galt med rutene.

**Hvis bygget feiler her:** noe i koden bruker en server-funksjon som ikke
finnes i eksportmodus. Vanligste synder er `cookies()`, `headers()`,
route handlers eller `revalidate`. Feilmeldingen peker ofte på feil sted —
se på det du endret sist.

---

## Fase 5 — Cloudflare

### 5.1 Wrangler-konfigurasjon

Fila hører hjemme i `klinikk-web/`, ved siden av `package.json` — ikke i
repo-roten. `"directory": "./out"` er relativ til der `wrangler.jsonc` ligger.

```jsonc
// klinikk-web/wrangler.jsonc
{
  "name": "klinikk",
  "compatibility_date": "2026-08-01",
  "assets": {
    "directory": "./out",
    "not_found_handling": "404-page"
  }
}
```

Ingen `main`. Det er ingen Worker — bare filer. Det er hele poenget.

### 5.2 Første deploy

Kjør fra `klinikk-web/`:

```bash
yarn add -D wrangler
yarn wrangler deploy
```

Du får en `*.workers.dev`-adresse. Sjekk at siden fungerer der før du går videre.

### 5.3 Koble til GitHub

Push repoet til GitHub, og koble Worker-en til det i Cloudflare-dashbordet
under **Workers & Pages → din Worker → Settings → Builds**.

**Sett root directory til `klinikk-web`.** Studio og nettside ligger i samme
repo, med hver sin mappe og hver sin `package.json`. Uten root directory leter
Cloudflare i roten, finner verken `package.json` eller `yarn.lock`, og bygget
stopper før det har begynt. Innstillingen ligger rett over byggekommandoen.

Legg inn byggekommando `yarn build` og output-mappe `out`. Begge er relative
til root directory, så de skal stå akkurat slik — ikke `klinikk-web/out`.

Cloudflare velger pakkebehandler ut fra hvilken lockfil som ligger i mappa.
Sørg for at `klinikk-web/yarn.lock` er committet, og at det **ikke** finnes en
`package-lock.json` ved siden av — da blir det uforutsigbart hvilken som vinner.

Legg miljøvariablene (`NEXT_PUBLIC_SANITY_PROJECT_ID` og `_DATASET`) inn som
byggevariabler. De trengs på byggetidspunktet, ikke ved kjøring.

Nå deployer hver push automatisk.

---

## Fase 6 — Domene

Kjøp `.no`-domenet hos Domeneshop eller Domene.no. **Registrer det på klinikkens
organisasjonsnummer, med broren din som kontaktperson.** Ikke på deg selv, uansett
hvor praktisk det virker akkurat nå.

Legg domenet til i Cloudflare (Add a site), og bytt navneserverne hos
registraren til de Cloudflare oppgir. Propagering tar alt fra minutter til et
døgn.

Deretter: **Workers & Pages → din Worker → Settings → Domains & Routes → Add
custom domain.** Cloudflare ordner SSL-sertifikat automatisk.

Sett opp omdirigering fra `www` til apex eller motsatt — velg én og hold deg
til den, ellers får du duplikatinnhold i søkemotorer.

---

## Fase 7 — Automatisk publisering

Dette er stegget som gjør siden selvbetjent for broren din.

### 7.1 Lag en Deploy Hook

**Workers & Pages → din Worker → Settings → Builds → Deploy Hooks.**
Gi den navn (f.eks. `sanity-publish`), velg `main`-branchen, og kopier URL-en.

Behandle URL-en som en hemmelighet. Hvem som helst med den kan trigge bygg.

### 7.2 Webhook i Sanity

I Sanity-dashbordet: **API → Webhooks → Create webhook.**

- URL: deploy hook-URL-en
- Trigger on: Create, Update, Delete
- Filter: `_type in ["innstillinger", "behandler", "priser", "kontakt"]`
- HTTP method: POST

Nå bygges siden på nytt hver gang han publiserer noe.

Cloudflare dedupliserer automatisk: fyrer hooken flere ganger før første bygg
har startet, hoppes de overflødige over. Så broren din kan trykke publiser ti
ganger på rappen uten å lage kø.

### 7.3 Test hele kjeden

Endre en tekst i Studio, publiser, vent to minutter, last siden på nytt.
Fungerer det, er prosjektet i praksis ferdig.

---

## Fase 8 — Tilgjengelighet

Ikke hopp over dette. Universell utforming er et lovkrav for private
virksomheter i Norge, ikke en anbefaling.

**Automatisk sjekk:** kjør Lighthouse (innebygd i Chrome DevTools) og axe
DevTools på hver side. Sikt mot 100 på Accessibility.

**Manuell sjekk — det automatiske verktøy ikke fanger:**

- Naviger hele siden med kun Tab-tasten. Kommer du overalt? Ser du hvor du er?
- Zoom til 200 %. Forsvinner noe innhold, eller må du scrolle sideveis?
- Er kontrasten minst 4.5:1 for brødtekst og 3:1 for store overskrifter?
- Gir hver lenketekst mening isolert? «Les mer» gjør ikke det.
- Er overskriftene i riktig rekkefølge, uten hopp fra `h1` til `h3`?
- Har alle bilder meningsfull alt-tekst? Dekorative bilder skal ha `alt=""`.
- Fungerer menyen på 320 piksels bredde uten at lenker overlapper?
- Går det an å tabbe forbi menyen med hoppelenken på hver side?
- **Hamburgermenyen:** åpne den med Enter på knappen, tab gjennom lenkene,
  lukk med Escape. Havner fokus tilbake på knappen? Endrer `aria-expanded`
  seg? Er lenkene utilgjengelige for Tab når menyen er lukket?

**Test alle fire rutene, ikke bare forsiden.** Det er lett å perfeksjonere
forsiden og glemme at `/priser` har en tabell uten `<th>`.

Lag også en `not-found.tsx`. Med flere ruter vil noen før eller siden treffe
en URL som ikke finnes, og standard-404 fra Cloudflare har verken meny eller
klinikkens navn.

**Innholdssjekk før lansering:** les gjennom all tekst med helsepersonelloven
§ 13 i bakhodet. Markedsføringen skal være forsvarlig og nøktern. Formuleringer
som «vi fjerner smertene dine» må omskrives.

---

## Fase 9 — Overlevering

Det er her de fleste hobbyprosjekter ryker. Bruk en kveld på dette.

1. **Lag en bruksanvisning på én side.** Hvordan logge inn i Studio, hvordan
   endre tekst, hvordan bytte bilde, hvordan publisere. Skjermbilder, ikke prosa.
2. **Fortell ham om ventetiden.** To minutter fra publisering til synlig endring.
   Ellers tror han det er ødelagt og publiserer fem ganger til.
3. **Vis ham hva han ikke kan ødelegge.** Sanity har full versjonshistorikk;
   alt kan rulles tilbake. Det gjør folk tryggere på å prøve seg.
4. **Bli enige om hva som er «ring broren»-oppgaver.** Ny underside, endret
   struktur, designendringer. Alt annet skal han klare selv.
5. **Skriv ned kontoene et sted han også har tilgang.** Hvis du blir utilgjengelig
   i et halvt år, skal han kunne komme videre uten deg.

---

## Vedlikehold

- Sjekk utdaterte pakker et par ganger i året. På Yarn 1 er kommandoen
  `yarn outdated`; den ble fjernet i Yarn 2, så der bruker du
  `yarn upgrade-interactive` i stedet. Sikkerhetsoppdateringer i Next.js
  bør inn raskt.
- Next.js har store versjonshopp med jevne mellomrom. Vent noen måneder etter
  en major-release før du oppgraderer.
- Sjekk Sanity-forbruket årlig. Klinikksiden kommer ikke i nærheten av taket,
  men det tar to minutter å bekrefte.
- Vær forberedt på at både Cloudflare og Sanity kan endre gratisplanene sine.
  De har begge gjort det før.
