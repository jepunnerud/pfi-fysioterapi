import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {SINGLETONS, schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Paulsberg Fysikalske Institutt',

  projectId: '8d65o0bs',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Keep the singletons out of the global "create new document" menu.
    templates: (prev) => prev.filter((template) => !SINGLETONS.includes(template.schemaType)),
  },

  document: {
    // A singleton must not be deleted, duplicated or unpublished — the website
    // reads it on every build and would break without it.
    actions: (prev, {schemaType}) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter((action) => !['delete', 'duplicate', 'unpublish'].includes(action.action ?? ''))
        : prev,
  },
})
