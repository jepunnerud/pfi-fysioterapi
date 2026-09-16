import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { KONTAKT_QUERY } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Kontakt",
};

export default async function Kontakt() {
  const kontakt = await client.fetch(KONTAKT_QUERY);

  const dager = [
    { navn: "Mandag", tid: kontakt?.apningstiderMandag },
    { navn: "Tirsdag", tid: kontakt?.apningstiderTirsdag },
    { navn: "Onsdag", tid: kontakt?.apningstiderOnsdag },
    { navn: "Torsdag", tid: kontakt?.apningstiderTorsdag },
    { navn: "Fredag", tid: kontakt?.apningstiderFredag },
    { navn: "Lørdag", tid: kontakt?.apningstiderLordag },
    { navn: "Søndag", tid: kontakt?.apningstiderSondag },
  ];

  return (
    <>
      <h1>Kontakt</h1>

      {kontakt && (
        <>
          <h2>Adresse</h2>
          <address className="adresse">
            {kontakt.adresse}
            <br />
            {kontakt.postnummer} {kontakt.poststed}
          </address>

          <h2>Telefon og e-post</h2>
          <ul className="kontaktliste">
            <li>
              {/* Half the visitors are on a phone — make it dialable. */}
              Telefon:{" "}
              <a href={`tel:${kontakt.telefon.replace(/\s/g, "")}`}>
                {kontakt.telefon}
              </a>
            </li>
            <li>
              E-post: <a href={`mailto:${kontakt.epost}`}>{kontakt.epost}</a>
            </li>
          </ul>

          <h2>Åpningstider</h2>
          <table className="apningstider">
            <caption className="visuelt-skjult">
              Åpningstider for hver ukedag
            </caption>
            <tbody>
              {dager.map((dag) => (
                <tr key={dag.navn}>
                  <th scope="row">{dag.navn}</th>
                  <td>{dag.tid ?? "Stengt"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
