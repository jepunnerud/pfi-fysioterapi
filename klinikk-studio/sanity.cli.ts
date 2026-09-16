import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '8d65o0bs',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  /**
   * TypeGen reads the schema in this folder and writes types for the Next.js app
   * next door. The CLI only lives here, so `yarn typegen` runs from here — the
   * script in klinikk-web/package.json just delegates to it.
   */
  typegen: {
    path: [
      '../klinikk-web/app/**/*.{ts,tsx}',
      '../klinikk-web/components/**/*.{ts,tsx}',
      '../klinikk-web/sanity/**/*.ts',
    ],
    schema: './schema.json',
    generates: '../klinikk-web/sanity.types.ts',
  },
})
