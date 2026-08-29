import {defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'

// One string field per weekday instead of one free-text field. That way the
// front page can render the days in a predictable table, and the editor never
// has to format anything.
const dager = [
  {name: 'apningstiderMandag', title: 'Åpningstider – mandag'},
  {name: 'apningstiderTirsdag', title: 'Åpningstider – tirsdag'},
  {name: 'apningstiderOnsdag', title: 'Åpningstider – onsdag'},
  {name: 'apningstiderTorsdag', title: 'Åpningstider – torsdag'},
  {name: 'apningstiderFredag', title: 'Åpningstider – fredag'},
  {name: 'apningstiderLordag', title: 'Åpningstider – lørdag'},
  {name: 'apningstiderSondag', title: 'Åpningstider – søndag'},
]

const apningstidFelter = dager.map((dag) =>
  defineField({
    name: dag.name,
    title: dag.title,
    type: 'string',
    fieldset: 'apningstider',
    description: 'F.eks. "08:00–16:00". La feltet stå tomt hvis klinikken er stengt denne dagen.',
  }),
)

// Singleton. Vises på /kontakt.
export const kontakt = defineType({
  name: 'kontakt',
  title: 'Kontakt',
  type: 'document',
  icon: EnvelopeIcon,
  fieldsets: [
    {
      name: 'apningstider',
      title: 'Åpningstider',
      description: 'Én linje per ukedag. Tomme dager vises som stengt.',
      options: {collapsible: true, collapsed: false},
    },
  ],
  fields: [
    defineField({
      name: 'adresse',
      title: 'Gateadresse',
      type: 'string',
      description: 'Gatenavn og husnummer, f.eks. "Storgata 1".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'postnummer',
      title: 'Postnummer',
      type: 'string',
      description: 'Fire siffer.',
      validation: (r) =>
        r
          .required()
          .regex(/^\d{4}$/, {name: 'postnummer'})
          .error('Postnummer skal være fire siffer, f.eks. 0150.'),
    }),
    defineField({
      name: 'poststed',
      title: 'Poststed',
      type: 'string',
      description: 'F.eks. "Oslo".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'telefon',
      title: 'Telefonnummer',
      type: 'string',
      description:
        'Skriv nummeret slik det skal vises, f.eks. "22 00 00 00". ' +
        'Nettsiden lager en klikkbar lenke av det automatisk.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'epost',
      title: 'E-postadresse',
      type: 'string',
      description: 'Adressen pasienter kan skrive til. Ikke send helseopplysninger på e-post.',
      validation: (r) => r.required().email().error('Må være en gyldig e-postadresse.'),
    }),
    ...apningstidFelter,
  ],
  preview: {
    select: {adresse: 'adresse', poststed: 'poststed'},
    prepare: ({adresse, poststed}) => ({
      title: 'Kontakt',
      subtitle: [adresse, poststed].filter(Boolean).join(', '),
    }),
  },
})
