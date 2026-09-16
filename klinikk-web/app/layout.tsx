import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { client } from "@/sanity/client";
import { LAYOUT_INNSTILLINGER_QUERY } from "@/sanity/queries";
import Meny from "@/components/Meny";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Paulsberg Fysikalske Institutt",
    template: "%s | Paulsberg Fysikalske Institutt",
  },
  description:
    "Fysikalsk institutt med fysioterapi og manuellterapi. Se behandlere, priser, åpningstider og kontaktinformasjon.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const innstillinger = await client.fetch(LAYOUT_INNSTILLINGER_QUERY);

  return (
    <html lang="nb" className={geistSans.variable}>
      <body>
        <a href="#innhold" className="skip-lenke">
          Hopp til hovedinnhold
        </a>
        <header>
          {innstillinger?.bookingUrl && (
            <a
              className="booking-knapp"
              href={innstillinger.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {innstillinger.bookingTekst ?? "Bestill time"}
              <span className="visuelt-skjult">
                {" "}
                (åpner timebestilling i ny fane)
              </span>
            </a>
          )}
          <Meny />
        </header>
        <main id="innhold">{children}</main>
        <footer>
          <p>{innstillinger?.klinikknavn}</p>
        </footer>
      </body>
    </html>
  );
}
