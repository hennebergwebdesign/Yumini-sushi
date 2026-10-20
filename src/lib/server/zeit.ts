// Zeit und Datum. Alles läuft in Berliner Zeit, Zeiten sind Minuten seit Mitternacht, Daten ISO.
export const SLOT = 15;

export const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const minuten = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m || 0);
};

export const ISO = /^\d{4}-\d{2}-\d{2}$/;
export function gueltigesDatum(s: unknown): s is string {
  if (typeof s !== 'string' || !ISO.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Wochentag wie Date.getDay(): 0 Sonntag bis 6 Samstag */
export const wochentag = (datum: string) => new Date(`${datum}T00:00:00Z`).getUTCDay();

export function plusTage(datum: string, n: number) {
  const d = new Date(`${datum}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Aktuelles Datum und Minuten in Berlin */
export function jetzt() {
  const t = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
  return { datum: t.slice(0, 10), minuten: minuten(t.slice(11, 16)) };
}

/** Felder, die eine Buchung von `von` an für `laenge` Minuten belegt */
export function slotsFuer(von: number, laenge: number) {
  const out: number[] = [];
  for (let s = Math.floor(von / SLOT); s < Math.ceil((von + laenge) / SLOT); s++) out.push(s);
  return out;
}
