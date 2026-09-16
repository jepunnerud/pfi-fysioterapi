import type { Metadata } from "next";
import Image from "next/image";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { BEHANDLERE_QUERY } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Våre behandlere",
};

export default async function Behandlere() {
  const behandlere = await client.fetch(BEHANDLERE_QUERY);

  return (
    <>
      <h1>Våre behandlere</h1>

      <ul className="behandlerliste">
        {behandlere.map((b) => (
          <li key={b._id}>
            <article>
              {b.bilde?.asset && (
                <Image
                  className="portrett"
                  src={urlFor(b.bilde).width(400).height(400).fit("crop").url()}
                  alt={b.bilde.alt}
                  width={400}
                  height={400}
                  sizes="400px"
                />
              )}
              <h2>{b.navn}</h2>
              <p className="tittel">{b.tittel}</p>
              {b.beskrivelse && <p>{b.beskrivelse}</p>}
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
