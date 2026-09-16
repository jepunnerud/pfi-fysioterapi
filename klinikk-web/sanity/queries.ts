import { defineQuery } from "next-sanity";

// All queries live here because Sanity TypeGen requires every query variable to
// have a unique name across the whole project — two files both calling theirs
// `query` would silently overwrite each other's generated types.

export const LAYOUT_INNSTILLINGER_QUERY = defineQuery(`
  *[_type == "innstillinger"][0]{
    klinikknavn, bookingUrl, bookingTekst
  }
`);

export const FORSIDE_QUERY = defineQuery(`
  *[_type == "innstillinger"][0]{
    klinikknavn, omStedet, hovedbilde
  }
`);

export const BEHANDLERE_QUERY = defineQuery(`
  *[_type == "behandler"] | order(rekkefolge asc){
    _id, navn, tittel, beskrivelse, bilde
  }
`);

export const PRISER_QUERY = defineQuery(`
  *[_type == "priser"][0]{
    linjer[]{ _key, behandling, pris, varighet },
    merknad
  }
`);

export const KONTAKT_QUERY = defineQuery(`
  *[_type == "kontakt"][0]{
    adresse, postnummer, poststed, telefon, epost,
    apningstiderMandag, apningstiderTirsdag, apningstiderOnsdag,
    apningstiderTorsdag, apningstiderFredag, apningstiderLordag,
    apningstiderSondag
  }
`);
