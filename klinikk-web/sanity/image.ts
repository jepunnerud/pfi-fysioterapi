import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/client";

const builder = createImageUrlBuilder(client);

// Always give this an explicit width — that is what keeps the Sanity bandwidth
// down. `sanityImageLoader` takes over from there and picks the actual sizes.
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
