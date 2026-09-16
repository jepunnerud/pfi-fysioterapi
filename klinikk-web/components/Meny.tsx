"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const lenker = [
  { href: "/", tekst: "Hjem" },
  { href: "/behandlere", tekst: "Våre behandlere" },
  { href: "/priser", tekst: "Priser" },
  { href: "/kontakt", tekst: "Kontakt" },
];

// `trailingSlash: true` makes usePathname() return "/priser/" while the links
// below are written "/priser". Compare them without the trailing slash, or
// aria-current silently disappears from every page but the front page.
const normaliser = (sti: string) => (sti.length > 1 ? sti.replace(/\/$/, "") : sti);

export default function Meny() {
  const sti = normaliser(usePathname());
  const knappRef = useRef<HTMLButtonElement>(null);

  // The menu belongs to the page it was opened on. Storing that path instead of
  // a plain boolean closes the menu on every navigation — a link, the back
  // button — without an effect that resets it afterwards.
  const [apnetPaSti, setApnetPaSti] = useState<string | null>(null);
  const apen = apnetPaSti === sti;

  const lukk = () => setApnetPaSti(null);

  // Escape lukker menyen og gir fokus tilbake til knappen
  useEffect(() => {
    if (!apen) return;
    const ved = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        lukk();
        knappRef.current?.focus();
      }
    };
    document.addEventListener("keydown", ved);
    return () => document.removeEventListener("keydown", ved);
  }, [apen]);

  return (
    <nav aria-label="Hovedmeny">
      <button
        ref={knappRef}
        type="button"
        className="meny-knapp"
        aria-expanded={apen}
        aria-controls="meny-liste"
        onClick={() => setApnetPaSti(apen ? null : sti)}
      >
        <span aria-hidden="true">☰</span>
        <span className="visuelt-skjult">Meny</span>
      </button>

      <ul id="meny-liste" data-apen={apen}>
        {lenker.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={sti === normaliser(l.href) ? "page" : undefined}
            >
              {l.tekst}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
