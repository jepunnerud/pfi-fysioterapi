import { createClient } from "next-sanity";

// The dataset is public and the site only ever reads published content, so no
// token is needed. `perspective: "published"` says that out loud — drafts must
// never reach the built pages.
//
// Every page is rendered at build time (output: "export"), so this client runs
// during `yarn build`, not in the browser.
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2026-01-01",
  useCdn: true,
  perspective: "published",
});
