import { standorte, type Standort } from '../standorte';
import { getDb } from './db';
import { hhmm, minuten } from './zeit';

// Einstellungen je Standort. Vorgabe sind die Werte aus src/lib/standorte.ts (Infopaket 20.10.2026),
// was im Backend geändert wird, liegt in der Tabelle `einstellungen` und überschreibt die Vorgabe.
export type Fenster = { von: string; bis: string } | null;
export type Tag = { mittag: Fenster; abend: Fenster };
export type Einst = {
  dauer: number; // Minuten am Tisch (Buffet)
  puffer: number; // Minuten zum Abräumen und Eindecken
  vorlauf: number; // frühestens so viele Minuten im Voraus online buchbar
  letzteVorSchluss: number; // letzte Reservierung = Schluss minus diese Minuten
  maxOnline: number; // größte Gruppe, die online buchen darf
  oeffnung: Tag[]; // Index = Wochentag wie Date.getDay(), 0 Sonntag
};

export const STANDORT_IDS = standorte.map((s) => s.id) as string[];
export const istStandort = (s: unknown): s is Standort['id'] => typeof s === 'string' && STANDORT_IDS.includes(s);

const fenster = (z: string): Fenster => {
  const [von, bis] = z.split(' bis ');
  return { von, bis };
};

export function vorgabe(id: string): Einst {
  const s = standorte.find((x) => x.id === id)!;
  const dauer = s.dauer.startsWith('2,5') ? 150 : 120;
  const oeffnung: Tag[] = [];
  for (let wd = 0; wd < 7; wd++) {
    let mittag = s.lunch ? fenster(s.lunch.zeit) : null;
    const abend: Fenster = fenster(s.dinner.zeit);
    if (s.id === 'luedenscheid' && wd >= 1 && wd <= 4) mittag = null;
    if (s.id === 'gelsenkirchen' && wd === 1) oeffnung.push({ mittag: null, abend: null });
    else oeffnung.push({ mittag, abend });
  }
  return { dauer, puffer: 15, vorlauf: 60, letzteVorSchluss: dauer, maxOnline: 15, oeffnung };
}

export async function ladeEinstellungen(standort: string): Promise<Einst> {
  const db = await getDb();
  const zeile = await db.prepare('SELECT daten FROM einstellungen WHERE standort = ?').bind(standort).first<{ daten: string }>();
  const basis = vorgabe(standort);
  if (!zeile) return basis;
  try {
    const d = JSON.parse(zeile.daten) as Partial<Einst>;
    return { ...basis, ...d, oeffnung: Array.isArray(d.oeffnung) && d.oeffnung.length === 7 ? d.oeffnung : basis.oeffnung };
  } catch {
    return basis;
  }
}

const zahl = (v: unknown, min: number, max: number, name: string) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name} muss zwischen ${min} und ${max} liegen.`);
  return n;
};
const uhr = (v: unknown, name: string) => {
  if (typeof v !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) throw new Error(`${name}: Uhrzeit im Format HH:MM erwartet.`);
  return v;
};

/** Prüft die Eingabe und gibt die bereinigten Einstellungen zurück. Wirft einen Fehler mit lesbarem Text. */
export function pruefe(e: any): Einst {
  const dauer = zahl(e?.dauer, 30, 360, 'Dauer');
  const out: Einst = {
    dauer,
    puffer: zahl(e?.puffer, 0, 120, 'Puffer'),
    vorlauf: zahl(e?.vorlauf, 0, 24 * 60, 'Vorlauf'),
    letzteVorSchluss: zahl(e?.letzteVorSchluss, 0, 360, 'Letzte Reservierung'),
    maxOnline: zahl(e?.maxOnline, 1, 40, 'Größte Online Gruppe'),
    oeffnung: [],
  };
  if (!Array.isArray(e?.oeffnung) || e.oeffnung.length !== 7) throw new Error('Öffnungszeiten für sieben Tage erwartet.');
  const WT = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  e.oeffnung.forEach((t: any, i: number) => {
    const f = (x: any, n: string): Fenster => {
      if (!x) return null;
      const von = uhr(x.von, `${WT[i]} ${n} von`);
      const bis = uhr(x.bis, `${WT[i]} ${n} bis`);
      if (minuten(bis) <= minuten(von)) throw new Error(`${WT[i]} ${n}: Ende muss nach dem Beginn liegen.`);
      return { von, bis };
    };
    const mittag = f(t?.mittag, 'Mittag');
    const abend = f(t?.abend, 'Abend');
    if (mittag && abend && minuten(abend.von) < minuten(mittag.bis)) throw new Error(`${WT[i]}: Abend darf nicht vor dem Ende von Mittag beginnen.`);
    out.oeffnung.push({ mittag, abend });
  });
  return out;
}

export async function speichereEinstellungen(standort: string, e: Einst) {
  const db = await getDb();
  await db.prepare('INSERT INTO einstellungen (standort, daten) VALUES (?1, ?2) ON CONFLICT (standort) DO UPDATE SET daten = ?2').bind(standort, JSON.stringify(e)).run();
}

export const fensterText = (f: Fenster) => (f ? `${f.von} bis ${f.bis}` : 'geschlossen');
export { hhmm };
