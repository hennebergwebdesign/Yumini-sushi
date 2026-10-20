import { getDb, neueId } from './db';
import { ladeEinstellungen, type Einst } from './einstellungen';
import { SLOT, hhmm, jetzt, minuten, plusTage, slotsFuer, wochentag } from './zeit';

// Verfügbarkeit, Tischvergabe und Buchung. Eine aktive Reservierung belegt je Tisch die 15 Minuten Felder von
// Beginn bis Ende plus Puffer (Tabelle reservierung_slots, Primärschlüssel verhindert Doppelbelegung).

export type Tisch = { id: string; standort: string; nr: string; plaetze: number; form: 'eckig' | 'rund'; bereich: string; x: number; y: number; b: number; h: number; aktiv: number };
export type Kombi = { id: string; standort: string; tische: string[]; plaetze: number };
export type Sperre = { id: string; standort: string; datum_von: string; datum_bis: string; von: number | null; bis: number | null; tisch_id: string | null; grund: string };
export type Status = 'bestaetigt' | 'angekommen' | 'abgeschlossen' | 'nicht_erschienen' | 'storniert';
export type Quelle = 'online' | 'telefon' | 'laufkunde';
export type Reservierung = {
  id: string; standort: string; datum: string; von: number; dauer: number; puffer: number; personen: number;
  name: string; telefon: string; mail: string; anmerkung: string; intern: string;
  status: Status; quelle: Quelle; tische: string[]; erstellt: string; geaendert: string;
};

/** Zeichenfläche des Tischplans in Rasterfeldern */
export const RASTER = { b: 48, h: 28 };

export const AKTIV: Status[] = ['bestaetigt', 'angekommen'];
export const istAktiv = (s: Status) => AKTIV.includes(s);
export class Konflikt extends Error {}

export type Kontext = {
  standort: string; datum: string; einst: Einst;
  tische: Tisch[]; kombis: Kombi[]; sperren: Sperre[];
  belegt: Map<string, Set<number>>;
};

export async function ladeKontext(standort: string, datum: string, ausser?: string): Promise<Kontext> {
  const db = await getDb();
  const [einst, r] = await Promise.all([
    ladeEinstellungen(standort),
    db.batch([
      db.prepare('SELECT * FROM tische WHERE standort = ? AND aktiv = 1 ORDER BY nr').bind(standort),
      db.prepare('SELECT * FROM kombinationen WHERE standort = ?').bind(standort),
      db.prepare('SELECT * FROM sperren WHERE standort = ? AND datum_von <= ? AND datum_bis >= ?').bind(standort, datum, datum),
      db.prepare('SELECT s.tisch_id, s.slot FROM reservierung_slots s JOIN tische t ON t.id = s.tisch_id WHERE t.standort = ? AND s.datum = ? AND s.reservierung_id != ?').bind(standort, datum, ausser ?? ''),
    ]),
  ]);
  const belegt = new Map<string, Set<number>>();
  for (const z of r[3].results as { tisch_id: string; slot: number }[]) {
    if (!belegt.has(z.tisch_id)) belegt.set(z.tisch_id, new Set());
    belegt.get(z.tisch_id)!.add(z.slot);
  }
  return {
    standort, datum, einst, belegt,
    tische: r[0].results as unknown as Tisch[],
    kombis: (r[1].results as any[]).map((k) => ({ ...k, tische: JSON.parse(k.tische) })),
    sperren: r[2].results as unknown as Sperre[],
  };
}

/** Ist der ganze Tag für den Standort gesperrt? */
export const tagGesperrt = (k: Kontext) => k.sperren.some((s) => s.tisch_id === null && s.von === null);

export function fensterDesTages(k: Kontext) {
  return k.einst.oeffnung[wochentag(k.datum)];
}

/** Beginnzeiten im 15 Minuten Raster. Letzte Reservierung = Schluss minus `letzteVorSchluss`. */
export function startzeiten(k: Kontext): { t: number; gruppe: 'Mittag' | 'Abend' }[] {
  if (tagGesperrt(k)) return [];
  const tag = fensterDesTages(k);
  const out: { t: number; gruppe: 'Mittag' | 'Abend' }[] = [];
  for (const [g, f] of [['Mittag', tag.mittag], ['Abend', tag.abend]] as const) {
    if (!f) continue;
    for (let t = minuten(f.von); t <= minuten(f.bis) - k.einst.letzteVorSchluss; t += SLOT) out.push({ t, gruppe: g });
  }
  return out;
}

function tischFrei(k: Kontext, t: Tisch, von: number, dauer: number, puffer: number) {
  const belegt = k.belegt.get(t.id);
  if (belegt) for (const s of slotsFuer(von, dauer + puffer)) if (belegt.has(s)) return false;
  for (const s of k.sperren) {
    if (s.tisch_id && s.tisch_id !== t.id) continue;
    if (s.von === null || s.bis === null) return false;
    if (s.von < von + dauer && s.bis > von) return false;
  }
  return true;
}

/** Sucht den kleinsten passenden Tisch oder die kleinste passende Kombination. */
export function findeTische(k: Kontext, von: number, personen: number, dauer = k.einst.dauer, puffer = k.einst.puffer): Tisch[] | null {
  const frei = new Set(k.tische.filter((t) => tischFrei(k, t, von, dauer, puffer)).map((t) => t.id));
  const nachId = new Map(k.tische.map((t) => [t.id, t]));
  const kandidaten: Tisch[][] = [];
  for (const t of k.tische) if (frei.has(t.id) && t.plaetze >= personen) kandidaten.push([t]);
  for (const c of k.kombis) {
    if (c.plaetze < personen || !c.tische.every((id) => frei.has(id))) continue;
    kandidaten.push(c.tische.map((id) => nachId.get(id)!));
  }
  if (!kandidaten.length) return null;
  const summe = (l: Tisch[]) => l.reduce((a, t) => a + t.plaetze, 0);
  kandidaten.sort((a, b) => summe(a) - summe(b) || a.length - b.length || a[0].nr.localeCompare(b[0].nr, 'de', { numeric: true }));
  return kandidaten[0];
}

/** Prüft eine vorgegebene Tischwahl. Wirft Konflikt, wenn ein Tisch belegt oder gesperrt ist. */
function pruefeWahl(k: Kontext, ids: string[], von: number, dauer: number, puffer: number, personen: number, erzwingen: boolean): Tisch[] {
  const liste = ids.map((id) => k.tische.find((t) => t.id === id));
  if (liste.some((t) => !t)) throw new Konflikt('Ein gewählter Tisch existiert nicht mehr.');
  const t = liste as Tisch[];
  for (const x of t) if (!tischFrei(k, x, von, dauer, puffer)) throw new Konflikt(`Tisch ${x.nr} ist zu dieser Zeit belegt oder gesperrt.`);
  if (!erzwingen && t.reduce((a, x) => a + x.plaetze, 0) < personen) throw new Konflikt('Die gewählten Tische haben zu wenige Plätze.');
  return t;
}

export type SlotInfo = { t: string; gruppe: 'Mittag' | 'Abend'; frei: boolean };

/** Zeiten eines Tages mit echter Verfügbarkeit. `intern` ignoriert den Vorlauf (Eintragen im Dashboard). */
export async function zeitenFuer(standort: string, datum: string, personen: number, intern = false): Promise<SlotInfo[]> {
  const k = await ladeKontext(standort, datum);
  const n = jetzt();
  const ab = datum === n.datum ? n.minuten + (intern ? 0 : k.einst.vorlauf) : -1;
  return startzeiten(k)
    .filter((s) => datum > n.datum || (datum === n.datum && (intern || s.t >= ab)))
    .map((s) => ({ t: hhmm(s.t), gruppe: s.gruppe, frei: datum < n.datum ? false : (datum > n.datum || s.t >= ab) && findeTische(k, s.t, personen) !== null }));
}

function claim(db: D1Database, id: string, datum: string, tischIds: string[], von: number, laenge: number) {
  const slots = JSON.stringify(slotsFuer(von, laenge));
  return tischIds.map((t) => db.prepare('INSERT INTO reservierung_slots (tisch_id, datum, slot, reservierung_id) SELECT ?1, ?2, value, ?3 FROM json_each(?4)').bind(t, datum, id, slots));
}
const istUnique = (e: unknown) => /UNIQUE|constraint/i.test(String((e as Error)?.message));

export type Neu = {
  standort: string; datum: string; von: number; personen: number; name: string; telefon: string; mail: string;
  anmerkung: string; intern?: string; quelle: Quelle; dauer?: number;
};
export type Optionen = { tischIds?: string[]; ohneTisch?: boolean; keinTisch?: boolean; nutzerId?: string | null; erzwingen?: boolean; vorlauf?: boolean };

/** Legt eine Reservierung an und belegt die Tische. Gibt Reservierung samt Storno Token zurück. */
export async function erstelle(r: Neu, o: Optionen = {}): Promise<Reservierung & { token: string }> {
  const db = await getDb();
  for (let versuch = 0; versuch < 3; versuch++) {
    const k = await ladeKontext(r.standort, r.datum);
    const dauer = r.dauer ?? k.einst.dauer;
    const puffer = k.einst.puffer;
    if (o.vorlauf) {
      const starts = startzeiten(k);
      if (!starts.some((s) => s.t === r.von)) throw new Konflikt('Diese Uhrzeit ist nicht buchbar.');
      const n = jetzt();
      if (r.datum < n.datum || (r.datum === n.datum && r.von < n.minuten + k.einst.vorlauf)) throw new Konflikt('Diese Uhrzeit liegt zu kurzfristig.');
    }
    let tische: Tisch[] = [];
    if (o.keinTisch) tische = [];
    else if (o.tischIds?.length) tische = pruefeWahl(k, o.tischIds, r.von, dauer, puffer, r.personen, !!o.erzwingen);
    else {
      const f = findeTische(k, r.von, r.personen, dauer, puffer);
      if (f) tische = f;
      else if (!o.ohneTisch) throw new Konflikt('Zu dieser Zeit ist leider kein passender Tisch frei.');
    }
    const id = neueId();
    const token = neueId() + neueId();
    try {
      await db.batch([
        db
          .prepare('INSERT INTO reservierungen (id, standort, datum, von, dauer, puffer, personen, name, telefon, mail, anmerkung, intern, quelle, tische, token, erstellt_von) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
          .bind(id, r.standort, r.datum, r.von, dauer, puffer, r.personen, r.name, r.telefon, r.mail, r.anmerkung, r.intern ?? '', r.quelle, JSON.stringify(tische.map((t) => t.id)), token, o.nutzerId ?? null),
        ...claim(db, id, r.datum, tische.map((t) => t.id), r.von, dauer + puffer),
      ]);
    } catch (e) {
      if (istUnique(e) && versuch < 2) continue; // gleichzeitige Buchung: neu rechnen
      if (istUnique(e)) throw new Konflikt('Zu dieser Zeit ist leider kein passender Tisch mehr frei.');
      throw e;
    }
    return { ...(await lade(id))!, token };
  }
  throw new Konflikt('Zu dieser Zeit ist leider kein passender Tisch mehr frei.');
}

const zeile = (z: any): Reservierung => ({ ...z, tische: JSON.parse(z.tische) });

export async function lade(id: string): Promise<Reservierung | null> {
  const db = await getDb();
  const z = await db.prepare('SELECT * FROM reservierungen WHERE id = ?').bind(id).first();
  return z ? zeile(z) : null;
}

export async function ladeTag(standort: string, datum: string): Promise<Reservierung[]> {
  const db = await getDb();
  const r = await db.prepare('SELECT * FROM reservierungen WHERE standort = ? AND datum = ? ORDER BY von, name').bind(standort, datum).all();
  return r.results.map(zeile);
}

export type Aenderung = Partial<Pick<Reservierung, 'datum' | 'von' | 'dauer' | 'personen' | 'name' | 'telefon' | 'mail' | 'anmerkung' | 'intern' | 'status'>> & { tischIds?: string[] };

/** Ändert Angaben, Zeit, Status oder Tische. Die Belegung wird dabei neu berechnet. */
export async function aendere(id: string, a: Aenderung, o: { nutzerId?: string | null; erzwingen?: boolean; ohneTisch?: boolean; neuSuchen?: boolean } = {}): Promise<Reservierung> {
  const db = await getDb();
  const alt = await lade(id);
  if (!alt) throw new Konflikt('Reservierung nicht gefunden.');
  const neu = { ...alt, ...Object.fromEntries(Object.entries(a).filter(([k, v]) => k !== 'tischIds' && v !== undefined)) } as Reservierung;
  const aktivNeu = istAktiv(neu.status);
  const platzGeaendert =
    a.tischIds !== undefined || neu.datum !== alt.datum || neu.von !== alt.von || neu.dauer !== alt.dauer || neu.personen !== alt.personen || (aktivNeu && !istAktiv(alt.status)) || !!o.neuSuchen;

  let tischIds = alt.tische;
  let claims: D1PreparedStatement[] = [];
  let neuBelegen = false; // Belegung löschen und neu eintragen
  const loeschen = db.prepare('DELETE FROM reservierung_slots WHERE reservierung_id = ?').bind(id);
  if (!aktivNeu) {
    neuBelegen = istAktiv(alt.status); // Felder freigeben
  } else if (platzGeaendert) {
    neuBelegen = true;
    const k = await ladeKontext(neu.standort, neu.datum, id);
    let tische: Tisch[] = [];
    if (a.tischIds !== undefined) {
      tische = a.tischIds.length ? pruefeWahl(k, a.tischIds, neu.von, neu.dauer, neu.puffer, neu.personen, !!o.erzwingen) : [];
    } else {
      // erst die bisherigen Tische behalten, wenn sie noch passen, sonst neu suchen
      try {
        if (!o.neuSuchen && alt.tische.length && istAktiv(alt.status) && neu.datum === alt.datum) tische = pruefeWahl(k, alt.tische, neu.von, neu.dauer, neu.puffer, neu.personen, false);
        else throw new Konflikt('');
      } catch {
        const f = findeTische(k, neu.von, neu.personen, neu.dauer, neu.puffer);
        if (f) tische = f;
        else if (!o.ohneTisch && !o.erzwingen) throw new Konflikt('Zu dieser Zeit ist kein passender Tisch frei. Reservierung ohne Tisch speichern oder anderen Zeitpunkt wählen.');
      }
    }
    tischIds = tische.map((t) => t.id);
    claims = claim(db, id, neu.datum, tischIds, neu.von, neu.dauer + neu.puffer);
  }

  const update = db
    .prepare("UPDATE reservierungen SET datum=?, von=?, dauer=?, personen=?, name=?, telefon=?, mail=?, anmerkung=?, intern=?, status=?, tische=?, geaendert=datetime('now') WHERE id=?")
    .bind(neu.datum, neu.von, neu.dauer, neu.personen, neu.name, neu.telefon, neu.mail, neu.anmerkung, neu.intern, neu.status, JSON.stringify(aktivNeu ? tischIds : alt.tische), id);
  try {
    await db.batch(neuBelegen ? [loeschen, update, ...claims] : [update]);
  } catch (e) {
    if (istUnique(e)) throw new Konflikt('Ein Tisch wurde gerade anderweitig vergeben. Bitte erneut versuchen.');
    throw e;
  }
  return (await lade(id))!;
}

export async function sperrenFuerTag(standort: string, datum: string) {
  const db = await getDb();
  return (await db.prepare('SELECT * FROM sperren WHERE standort = ? AND datum_von <= ? AND datum_bis >= ? ORDER BY von').bind(standort, datum, datum).all()).results as unknown as Sperre[];
}

/** Gesperrte ganze Tage im Bereich (für den Kalender der Website) */
export async function gesperrteTage(standort: string, von: string, bis: string): Promise<string[]> {
  const db = await getDb();
  const r = (await db.prepare('SELECT datum_von, datum_bis FROM sperren WHERE standort = ? AND tisch_id IS NULL AND von IS NULL AND datum_bis >= ? AND datum_von <= ?').bind(standort, von, bis).all()).results as { datum_von: string; datum_bis: string }[];
  const tage: string[] = [];
  for (const s of r) for (let d = s.datum_von < von ? von : s.datum_von; d <= s.datum_bis && d <= bis; d = plusTage(d, 1)) tage.push(d);
  return tage;
}
