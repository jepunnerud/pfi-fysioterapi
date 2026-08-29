import {defineArrayMember, defineField, defineType} from 'sanity'
import {CreditCardIcon} from '@sanity/icons/CreditCard'

// Singleton. The price list is an array of one fixed line type — the editor
// never picks a component type, only fills in named fields.
export const priser = defineType({
  name: 'priser',
  title: 'Priser',
  type: 'document',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'linjer',
      title: 'Prisliste',
      type: 'array',
      description: 'Én linje per behandling. Dra i linjene for å endre rekkefølgen.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'prislinje',
          title: 'Prislinje',
          fields: [
            defineField({
              name: 'behandling',
              title: 'Behandling',
              type: 'string',
              description: 'Navnet på behandlingen, f.eks. "Førstegangskonsultasjon".',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'pris',
              title: 'Pris i kroner',
              type: 'number',
              description: 'Bare tallet, uten "kr".',
              validation: (r) => r.required().integer().min(0),
            }),
            defineField({
              name: 'varighet',
              title: 'Varighet',
              type: 'string',
              description: 'F.eks. "30 min". Kan stå tomt.',
            }),
          ],
          preview: {
            select: {title: 'behandling', pris: 'pris', varighet: 'varighet'},
            prepare: ({title, pris, varighet}) => ({
              title,
              subtitle: [typeof pris === 'number' ? `${pris} kr` : null, varighet]
                .filter(Boolean)
                .join(' · '),
            }),
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
  preview: {
    select: {linjer: 'linjer'},
    prepare: ({linjer}) => ({
      title: 'Priser',
      subtitle: `${linjer?.length ?? 0} prislinjer`,
    }),
  },
})
