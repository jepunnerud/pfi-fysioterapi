import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {CreditCardIcon} from '@sanity/icons/CreditCard'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {UsersIcon} from '@sanity/icons/Users'

// Same order as the menu on the website: Innstillinger, Behandlere, Priser, Kontakt.
// The three singletons get a fixed document id, so the editor always edits the
// same document instead of creating "Kontakt 2".
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([
      S.listItem()
        .title('Innstillinger')
        .icon(CogIcon)
        .child(
          S.document().schemaType('innstillinger').documentId('innstillinger').title('Innstillinger'),
        ),

      S.listItem()
        .title('Behandlere')
        .icon(UsersIcon)
        .child(
          S.documentTypeList('behandler')
            .title('Behandlere')
            .defaultOrdering([{field: 'rekkefolge', direction: 'asc'}]),
        ),

      S.listItem()
        .title('Priser')
        .icon(CreditCardIcon)
        .child(S.document().schemaType('priser').documentId('priser').title('Priser')),

      S.listItem()
        .title('Kontakt')
        .icon(EnvelopeIcon)
        .child(S.document().schemaType('kontakt').documentId('kontakt').title('Kontakt')),
    ])
