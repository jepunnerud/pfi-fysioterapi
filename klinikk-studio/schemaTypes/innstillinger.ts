import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

// Singleton. Holds what appears on the front page and in the shared layout:
// the clinic name, the booking button and the intro text.
export const innstillinger = defineType({
  name: 'innstillinger',
  title: 'Innstillinger',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'klinikknavn',
      title: 'Klinikknavn',
      type: 'string',
      description:
        'Navnet på klinikken slik det skal stå som overskrift på forsiden og nederst på alle sider.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Lenke til timebestilling',
      type: 'url',
      description:
        'Full adresse til systemet der pasienten bestiller time, f.eks. ' +
        '"https://booking.eksempel.no/paulsberg". Knappen åpner denne i ny fane.',
      validation: (r) =>
        r
          .required()
          .uri({scheme: ['http', 'https']})
          .error('Må være en full nettadresse som begynner med http:// eller https://'),
    }),
    defineField({
      name: 'bookingTekst',
      title: 'Tekst på bookingknappen',
      type: 'string',
      description: 'Teksten som står på knappen. Hold den kort og tydelig.',
      initialValue: 'Bestill time',
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: 'hovedbilde',
      title: 'Hovedbilde på forsiden',
      type: 'image',
      description: 'Valgfritt. Et bilde av lokalet eller inngangen fungerer bra.',
      options: {hotspot: true},
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
    }),
    defineField({
      name: 'omStedet',
      title: 'Info om stedet',
      type: 'array',
      description:
        'Kort tekst om klinikken, lokalene og hva dere tilbyr. Beskriv tilbudet ' +
        'nøkternt — ikke lov noe om resultatet av behandlingen.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Avsnitt', value: 'normal'}],
          lists: [{title: 'Punktliste', value: 'bullet'}],
          marks: {
            decorators: [{title: 'Fet', value: 'strong'}],
            annotations: [],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {subtitle: 'klinikknavn', media: 'hovedbilde'},
    prepare: ({subtitle, media}) => ({title: 'Innstillinger', subtitle, media}),
  },
})
