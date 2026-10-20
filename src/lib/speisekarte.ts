// Speisekarten je Standort aus den CSV Dateien der Bestandsseite (Infopaket 20.10.2026).
// Spalten: Nr; Name; Beschreibung; Preis_EUR; Dinner_Only. Die Nummern unterscheiden sich je Standort.
const dateien = import.meta.glob('../data/menu/*.csv', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export type Gericht = { nr: number; name: string; beschreibung: string; preis: string; abends: boolean };

export function karte(standort: string): Gericht[] {
  const roh = dateien[`../data/menu/${standort}.csv`] ?? '';
  return roh
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((zeile) => {
      const [nr, name, beschreibung, preis, d] = zeile.split(';');
      return { nr: Number(nr), name: name?.trim(), beschreibung: (beschreibung ?? '').trim(), preis: preis?.trim(), abends: (d ?? '').trim() === 'D' };
    })
    .filter((g) => g.name);
}

/** Nummer eines Gerichts am Standort, über den Namen (nur exakte Treffer, sonst null) */
export function nummer(standort: string, name: string) {
  return karte(standort).find((g) => g.name.toLowerCase() === name.toLowerCase())?.nr ?? null;
}
