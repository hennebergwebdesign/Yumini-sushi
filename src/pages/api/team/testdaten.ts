import { env } from 'cloudflare:workers';
import { mit, json, fehler, lies, protokoll, standortFuer } from '../../../lib/server/api';
import { getDb, neueId } from '../../../lib/server/db';
import { Konflikt, RASTER, erstelle, ladeKontext, startzeiten } from '../../../lib/server/verfuegbarkeit';
import { gueltigesDatum, jetzt, plusTage } from '../../../lib/server/zeit';

export const prerender = false;

// Testphase: Beispieltische (erfundener Grundriss, kein echter Plan eines Standorts) und Beispielreservierungen anlegen.
// Nur Admin, nur solange die Variable TESTPHASE nicht "false" ist.
type T = { nr: string; plaetze: number; form: 'rund' | 'eckig'; bereich: string; x: number; y: number; b: number; h: number };

function grundriss(): { tische: T[]; kombis: [string, string][] } {
  const t: T[] = [];
  for (let i = 0; i < 6; i++) t.push({ nr: String(i + 1), plaetze: 2, form: 'rund', bereich: 'Fenster', x: 2 + i * 7, y: 2, b: 4, h: 4 });
  for (let i = 0; i < 6; i++) t.push({ nr: String(i + 7), plaetze: 4, form: 'eckig', bereich: 'Innen', x: 2 + i * 8, y: 9, b: 6, h: 4 });
  for (let i = 0; i < 4; i++) t.push({ nr: String(i + 13), plaetze: 6, form: 'eckig', bereich: 'Innen', x: 2 + i * 11, y: 16, b: 8, h: 4 });
  for (let i = 0; i < 2; i++) t.push({ nr: String(i + 17), plaetze: 8, form: 'eckig', bereich: 'Gesellschaft', x: 2 + i * 13, y: 22, b: 10, h: 4 });
  return { tische: t, kombis: [['7', '8'], ['9', '10'], ['11', '12'], ['13', '14'], ['15', '16'], ['17', '18']] };
}

const NAMEN = ['Testgast Anna', 'Testgast Ben', 'Testgast Chris', 'Testgast Dilara', 'Testgast Emre', 'Testgast Fiona', 'Testgast Gero', 'Testgast Hana', 'Testgast Ivo', 'Testgast Jule', 'Testgast Kai', 'Testgast Lena'];
const GRUPPEN = [2, 2, 3, 4, 4, 5, 6, 2, 8, 4, 3, 10];

export const POST = mit(async ({ request, nutzer }) => {
  if (env.TESTPHASE === 'false') return fehler('Testdaten sind abgeschaltet (TESTPHASE=false).', 403);
  const b = await lies(request);
  const st = standortFuer(nutzer, b.standort);
  if (st instanceof Response) return st;
  const db = await getDb();

  if (b.aktion === 'tische') {
    const n = await db.prepare('SELECT COUNT(*) AS n FROM tische WHERE standort = ?').bind(st).first<{ n: number }>();
    if (n && n.n > 0) return fehler('Dieser Standort hat schon Tische. Bitte erst alle Tische entfernen.', 409);
    const g = grundriss();
    const ids = new Map<string, { id: string; plaetze: number }>();
    for (const t of g.tische) ids.set(t.nr, { id: neueId(), plaetze: t.plaetze });
    await db.batch([
      ...g.tische.map((t) => db.prepare('INSERT INTO tische (id, standort, nr, plaetze, form, bereich, x, y, b, h) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(ids.get(t.nr)!.id, st, t.nr, t.plaetze, t.form, t.bereich, t.x, t.y, t.b, t.h)),
      ...g.kombis.map(([a, c]) => {
        const l = [ids.get(a)!, ids.get(c)!];
        return db.prepare('INSERT INTO kombinationen (id, standort, tische, plaetze) VALUES (?,?,?,?)').bind(neueId(), st, JSON.stringify(l.map((x) => x.id).sort()), l[0].plaetze + l[1].plaetze);
      }),
    ]);
    await protokoll(nutzer, st, 'Beispieltische angelegt', `${g.tische.length} Tische (Testdaten)`);
    return json({ ok: true, anzahl: g.tische.length, raster: RASTER }, 201);
  }

  if (b.aktion === 'reservierungen') {
    const tage = [jetzt().datum, plusTage(jetzt().datum, 1)];
    let angelegt = 0;
    for (const datum of tage) {
      const k = await ladeKontext(st, datum);
      const zeiten = startzeiten(k).filter((s) => s.gruppe === 'Abend');
      if (!zeiten.length) continue;
      for (let i = 0; i < NAMEN.length; i++) {
        const von = zeiten[(i * 2) % zeiten.length].t;
        try {
          await erstelle({ standort: st, datum, von, personen: GRUPPEN[i], name: NAMEN[i], telefon: '0000 000000', mail: '', anmerkung: i % 5 === 0 ? 'Geburtstag' : '', quelle: i % 3 === 0 ? 'online' : 'telefon' }, { nutzerId: nutzer.id });
          angelegt++;
        } catch (e) {
          if (!(e instanceof Konflikt)) throw e;
        }
      }
    }
    await protokoll(nutzer, st, 'Beispielreservierungen angelegt', `${angelegt} (Testdaten)`);
    return json({ ok: true, anzahl: angelegt }, 201);
  }

  if (b.aktion === 'leeren') {
    if (b.bestaetigung !== 'LEEREN') return fehler('Zur Sicherheit bitte LEEREN eingeben.');
    await db.batch([
      db.prepare('DELETE FROM reservierungen WHERE standort = ?').bind(st),
      db.prepare('DELETE FROM sperren WHERE standort = ?').bind(st),
    ]);
    await protokoll(nutzer, st, 'Alle Reservierungen und Sperren gelöscht', 'Testphase');
    return json({ ok: true });
  }

  if (b.datum && !gueltigesDatum(b.datum)) return fehler('Datum ungültig.');
  return fehler('Aktion unbekannt.');
}, ['admin']);
