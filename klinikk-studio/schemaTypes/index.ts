import {behandler} from './behandler'
import {innstillinger} from './innstillinger'
import {kontakt} from './kontakt'
import {priser} from './priser'

export const schemaTypes = [innstillinger, behandler, priser, kontakt]

// There should only ever be one of each of these. They are locked to a fixed
// document id in `structure.ts`, and filtered out of the "create new" menu and
// the delete/duplicate actions in `sanity.config.ts`.
export const SINGLETONS = ['innstillinger', 'priser', 'kontakt']
