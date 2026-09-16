import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { FORSIDE_QUERY } from "@/sanity/queries";

export default async function Forside() {
  const innstillinger = await client.fetch(FORSIDE_QUERY);

  return (
    <>
      {/* The clinic name is the h1 here. On the other pages the page title is. */}
      <h1>{innstillinger?.klinikknavn}</h1>

      {/* The alt text can be filled in before a file is uploaded, so check
          for the asset itself and not just the image object. */}
      {innstillinger?.hovedbilde?.asset && (
        <Image
          className="hovedbilde"
          src={urlFor(innstillinger.hovedbilde)
            .width(1200)
            .height(675)
            .fit("crop")
            .url()}
          alt={innstillinger.hovedbilde.alt}
          width={1200}
          height={675}
          sizes="(max-width: 48rem) 100vw, 48rem"
          priority
        />
      )}

      {innstillinger?.omStedet && (
        <div className="brodtekst">
          <PortableText value={innstillinger.omStedet} />
        </div>
      )}
    </>
  );
}
