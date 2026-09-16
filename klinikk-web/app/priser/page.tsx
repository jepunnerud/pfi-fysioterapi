import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { PRISER_QUERY } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Priser",
};

export default async function Priser() {
  const priser = await client.fetch(PRISER_QUERY);
  const linjer = priser?.linjer ?? [];

  return (
    <>
      <h1>Priser</h1>

      {linjer.length > 0 && (
        // Tabular data belongs in a table — screen readers announce the column
        // a cell belongs to, which a grid of divs cannot do.
        <table className="prisliste">
          <caption className="visuelt-skjult">
            Prisliste for behandlinger
          </caption>
          <thead>
            <tr>
              <th scope="col">Behandling</th>
              <th scope="col">Varighet</th>
              <th scope="col">Pris</th>
            </tr>
          </thead>
          <tbody>
            {linjer.map((linje) => (
              <tr key={linje._key}>
                <th scope="row">{linje.behandling}</th>
                <td>{linje.varighet}</td>
                <td className="pris">{linje.pris} kr</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {priser?.merknad && <p className="merknad">{priser.merknad}</p>}
    </>
  );
}
