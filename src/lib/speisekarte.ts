// Speisekarten je Standort, erzeugt aus den Karten der Bestandsseite (Infopaket 20.10.2026).
// Die Karten unterscheiden sich je Standort in Nummern, Beschreibungen und Gerichten (Dortmund hat eigene Gerichte).
// Die Kategorien sind per Stichwort abgeleitet und im Rohdatensatz nicht enthalten.
import daten from '../data/speisekarte.json';

export type Kategorie = 'sushi' | 'warm' | 'beilagen' | 'dessert' | 'saucen';
export type Gericht = { nr: number; name: string; desc: string; preis: string; abends: boolean; kat: Kategorie; bild: string | null };

export const kategorien: { id: Kategorie; label: string }[] = [
  { id: 'sushi', label: 'Sushi' },
  { id: 'warm', label: 'Warm Dishes' },
  { id: 'beilagen', label: 'Salate, Suppen, Nudeln, Reis' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'saucen', label: 'Saucen' },
];

export const karte = (standort: string): Gericht[] => ((daten as Record<string, Gericht[]>)[standort] ?? []);

/** Nummer eines Gerichts am Standort über den Namen, nur exakte Treffer */
export const nummer = (standort: string, name: string) => karte(standort).find((g) => g.name.toLowerCase() === name.toLowerCase())?.nr ?? null;

export const bildUrl = (g: Gericht) => (g.bild ? `/images/speisekarte/${g.bild}.webp` : null);
