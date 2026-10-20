// Öffnungslogik für das Reservierungstool. Quelle: Zeiten aus src/lib/standorte.ts (Infopaket 20.10.2026).
// ANNAHME (zu bestätigen): letzte Reservierung = Schluss minus Buffetdauer, Raster 15 Minuten.
// Die Verfügbarkeit im Prototyp ist simuliert (stabile Pseudozufallswerte), nicht echt.
import type { Standort } from './standorte';

export type Slot = { t: string; gruppe: 'Mittag' | 'Abend'; frei: boolean };

const min = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const fenster = (zeit: string): [number, number] => {
  const [a, b] = zeit.split(' bis ');
  return [min(a), min(b)];
};
export const dauerMin = (s: Standort) => (s.dauer.startsWith('2,5') ? 150 : 120);

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Hat der Standort an diesem Tag überhaupt geöffnet (abends)? */
export function geoeffnet(s: Standort, d: Date) {
  const wd = d.getDay(); // 0 Sonntag
  if (s.id === 'gelsenkirchen' && wd === 1) return false;
  return true;
}

function mittagAktiv(s: Standort, d: Date) {
  if (!s.lunch) return false;
  const wd = d.getDay();
  if (s.id === 'luedenscheid' && wd >= 1 && wd <= 4) return false;
  return true;
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100;
}

export function slots(s: Standort, d: Date, personen: number, jetzt = new Date()): Slot[] {
  if (!geoeffnet(s, d)) return [];
  const wd = d.getDay();
  const wochenende = wd === 5 || wd === 6 || wd === 0;
  const dauer = dauerMin(s);
  const out: Slot[] = [];
  const heute = iso(d) === iso(jetzt);
  const ab = jetzt.getHours() * 60 + jetzt.getMinutes() + 60;

  const fuellen = (gruppe: Slot['gruppe'], zeit: string) => {
    const [von, bis] = fenster(zeit);
    for (let t = von; t <= bis - dauer; t += 15) {
      if (heute && t < ab) continue;
      const stark = gruppe === 'Abend' && wochenende && t >= 18 * 60 && t <= 20 * 60;
      const last = (stark ? 42 : 14) + (personen >= 8 ? 18 : 0) + (personen >= 12 ? 14 : 0);
      out.push({ t: hhmm(t), gruppe, frei: hash(`${s.id}${iso(d)}${t}`) >= last });
    }
  };
  if (mittagAktiv(s, d) && s.lunch) fuellen('Mittag', s.lunch.zeit);
  fuellen('Abend', s.dinner.zeit);
  return out;
}

/** Preis für das Datum und die Tageszeit, nur Anzeige */
export function preisFuer(s: Standort, d: Date, gruppe: 'Mittag' | 'Abend') {
  const wd = d.getDay();
  const we = wd === 5 || wd === 6 || wd === 0;
  const m = gruppe === 'Mittag' ? s.lunch : s.dinner;
  if (!m) return null;
  const zeile = m.preise.find((p) => (we ? p.label.startsWith('Freitag') : !p.label.startsWith('Freitag')));
  return zeile?.wert ?? null;
}
