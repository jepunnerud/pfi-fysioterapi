"use client";

// next/image calls this once per width in the srcset. The page builds the base
// URL with urlFor() and decides the crop; this function only picks the size.
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const url = new URL(src);
  const bredde = url.searchParams.get("w");
  const hoyde = url.searchParams.get("h");

  // When the page asked for a fixed crop (w and h both set), scale the height
  // along with the width. Without this the 2x variant keeps the 1x height and
  // the image comes back stretched.
  if (bredde && hoyde) {
    const forhold = Number(hoyde) / Number(bredde);
    url.searchParams.set("h", String(Math.round(forhold * width)));
  }

  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");

  return url.toString();
}
