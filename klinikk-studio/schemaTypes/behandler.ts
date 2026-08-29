import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'

// One document per person. Shown on /behandlere, sorted by `rekkefolge`.
export const behandler = defineType({
  name: 'behandler',
  title: 'Behandler',
  type: 'document',
  icon: UsersIcon,
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
      description: 'Valgfritt, men siden ser best ut når alle behandlere har bilde.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternativ tekst',
          type: 'string',
          description:
            'Beskriv hva som er på bildet, f.eks. "Portrett av Kari Nordmann". ' +
            'Leses opp for blinde og svaksynte. Dette er et lovkrav.',
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
      description: 'Lavest tall vises først. Bruk f.eks. 10, 20, 30 så er det lett å skyte inn nye.',
      initialValue: 10,
      validation: (r) => r.required().integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Rekkefølge på nettsiden',
      name: 'rekkefolgeAsc',
      by: [{field: 'rekkefolge', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'navn', subtitle: 'tittel', media: 'bilde'},
  },
})
