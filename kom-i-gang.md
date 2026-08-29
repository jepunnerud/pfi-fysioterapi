# Kom i gang

Praktisk oppstartsguide. `byggeplan.md` beskriver *hva* som skal bygges —
denne beskriver *rekkefølgen* og hvem som gjør hva.

---

## 1. Kontoer

| Hvor | Når | Merk |
|---|---|---|
| [sanity.io](https://sanity.io) | Nå | Logg inn med GitHub, så slipper du enda et passord |
| [github.com](https://github.com) | Nå | Trengs før Cloudflare kan bygge automatisk |
| [dash.cloudflare.com](https://dash.cloudflare.com) | Før fase 5 | Gratis, ingen kort |
| Domeneshop eller Domene.no | Fase 6 | Krever klinikkens organisasjonsnummer |

**Broren din trenger egen Sanity-bruker.** Inviter ham som administrator når
Studio er oppe (fase 1.4). Ikke del din egen innlogging — da mister du oversikt
over hvem som endret hva, og versjonshistorikken blir verdiløs.

**Domenet registreres på klinikken**, ikke på deg. Organisasjonsnummer som eier,
broren din som kontaktperson. Det virker upraktisk nå og er verdt gull hvis dere
en gang blir uenige, eller han bytter til et byrå.

---

## 2. Lokalt oppsett

Node.js (siste LTS), git, Yarn og Claude Code.

```bash
mkdir klinikk
cd klinikk
```

Legg `CLAUDE.md` og `byggeplan.md` i mappa nå, før du gjør noe annet.
`CLAUDE.md` leses automatisk av Claude Code ved hver sesjonsstart.

Målstruktur:

```
klinikk/
├── CLAUDE.md
├── byggeplan.md
├── kom-i-gang.md
├── .gitignore
├── klinikk-studio/     ← Sanity Studio
└── klinikk-web/        ← Next.js
```

---

## 3. Kjør scaffolding selv

`yarn create sanity` og `yarn create next-app` er interaktive — den første åpner
nettleseren for innlogging, begge stiller spørsmål underveis. Claude Code blir
stående og vente på input den ikke kan gi.

Kjør derfor **fase 1.1** og **fase 2.1** fra byggeplanen manuelt i terminalen.
Tar ti minutter.

Husk `.yarnrc.yml` med `nodeLinker: node-modules` før du installerer noe, hvis
du er på Yarn 2 eller nyere.

---

## 4. Git før Claude Code

```bash
git init
git add .
git commit -m "Initial scaffolding"
```

Viktigere enn det ser ut. Når Claude Code endrer ti filer på tvers av to mapper,
er `git diff` eneste realistiske måte å se hva som faktisk skjedde — og du kan
rulle tilbake uten drama.

**Sjekk at `.env.local` står i `.gitignore`** etter fase 2.2. `create-next-app`
legger den inn automatisk, men verifiser før første push.

---

## 5. Arbeid med Claude Code

Start sesjonen i `klinikk/` — ytterst, ikke inne i en av undermappene. Da gjelder
`CLAUDE.md` for begge deler, og du slipper å bytte sesjon når du endrer et skjema
og en spørring i samme slengen.

**Én fase om gangen. `git commit` mellom hver.** Ber du om alt på én gang får du
hundrevis av linjer du ikke rekker å lese, og når noe er galt vet du ikke hvor.

### Rekkefølge og prompter

**Sanity-skjemaene**

```
Les byggeplan.md. Vi skal gjøre fase 1.2 og 1.3:
sette opp Sanity-skjemaene i klinikk-studio/.
Ikke rør klinikk-web/ ennå.
```

**Sanity-klient og typer**

```
Les byggeplan.md fase 2.2 til 2.4. Sett opp Sanity-klienten
og TypeGen i klinikk-web/.
```

**Sider, layout og meny**

```
Les byggeplan.md fase 3. Bygg layout med meny og booking-knapp,
og de fire rutene. Følg hamburger-mønsteret i 3.2 nøyaktig.
```

**Statisk eksport**

```
Les byggeplan.md fase 4. Sett opp next.config.ts for statisk
eksport og verifiser at bygget produserer alle fire rutene.
```

Fase 5 og utover er mest dashbord-klikking. Følg byggeplanen selv der.

### Nyttige vaner

- `byggeplan.md` leses **ikke** automatisk. Nevn den eksplisitt hver gang.
- Etter `/compact` leses `CLAUDE.md` inn på nytt, men ikke byggeplanen.
  Blir sesjonen lang, minn om hvilken fase du er i.
- Lærer du noe nytt om prosjektet, legg det i `CLAUDE.md`. Den er levende.

---

## 6. Det Claude Code ikke kan gjøre

- Opprette kontoer eller kjøpe domenet
- `yarn sanity deploy` — spør om subdomene interaktivt
- Cloudflare-dashbordet: byggeoppsett, deploy hook, tilkobling av domene
- Sanity-webhooken i fase 7.2
- Den manuelle tilgjengelighetstestingen i fase 8 — tab-navigering, zoom og
  kontrastvurdering må et menneske gjøre

Alt dette er beskrevet steg for steg i byggeplanen.

---

## 7. Sjekkpunkter

Stopp og verifiser før du går videre:

- [ ] Studio kjører lokalt, og du kan opprette en behandler med bilde
- [ ] Studio er deployet, broren din er invitert og har logget inn
- [ ] Next.js henter og viser innhold fra Sanity lokalt
- [ ] `yarn build` produserer `out/` med alle fire rutene
- [ ] Siden fungerer på `*.workers.dev`
- [ ] Push til GitHub trigger automatisk deploy
- [ ] Domenet peker riktig, og HTTPS fungerer
- [ ] Publisering i Studio trigger nytt bygg
- [ ] Lighthouse gir 100 på Accessibility på alle fire sidene
- [ ] Broren din har fått bruksanvisning og har publisert noe selv
