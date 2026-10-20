import { mit, json, fehler, lies, protokoll, standortFuer, text } from '../../../lib/server/api';
import { getDb, neueId } from '../../../lib/server/db';
import { gueltigesDatum, hhmm, jetzt, minuten } from '../../../lib/server/zeit';

export const prerender = false;

// Sperren: ganze Tage, Zeitfenster oder einzelne Tische (Feier, Ruhetag, Personalengpass).
export const GET = mit(async ({ url, nutzer }) => {
  const st = standortFuer(nutzer, url.searchParams.get('standort'));
  if (st instanceof Response) return st;
  const db = await getDb();
  const r = await db
    .prepare('SELECT s.*, t.nr AS tisch_nr FROM sperren s LEFT JOIN tische t ON t.id = s.tisch_id WHERE s.standort = ? AND s.datum_bis >= ? ORDER BY s.datum_von, s.von')
    .bind(st, jetzt().datum)
    .all();
  return json({ sperren: r.results });
});

export const POST = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const st = standortFuer(nutzer, b.standort);
  if (st instanceof Response) return st;
  if (!gueltigesDatum(b.datumVon)) return fehler('Datum (von) ungültig.');
  const bis = b.datumBis ? b.datumBis : b.datumVon;
  if (!gueltigesDatum(bis) || bis < b.datumVon) return fehler('Datum (bis) ungültig.');
  const mitZeit = !!b.von && !!b.bis;
  const von = mitZeit ? minuten(String(b.von)) : null;
  const ende = mitZeit ? minuten(String(b.bis)) : null;
  if (mitZeit && (!/^\d{2}:\d{2}$/.test(b.von) || !/^\d{2}:\d{2}$/.test(b.bis) || ende! <= von!)) return fehler('Das Ende muss nach dem Beginn liegen.');
  const db = await getDb();
  let tischId: string | null = null;
  if (b.tischId) {
    const t = await db.prepare('SELECT id FROM tische WHERE id = ? AND standort = ?').bind(String(b.tischId), st).first();
    if (!t) return fehler('Tisch nicht gefunden.', 404);
    tischId = String(b.tischId);
  }
  const grund = text(b.grund ?? '', 'Grund', 0, 120);
  await db.prepare('INSERT INTO sperren (id, standort, datum_von, datum_bis, von, bis, tisch_id, grund, erstellt_von) VALUES (?,?,?,?,?,?,?,?,?)').bind(neueId(), st, b.datumVon, bis, von, ende, tischId, grund, nutzer.id).run();
  await protokoll(nutzer, st, 'Sperre angelegt', `${b.datumVon}${bis !== b.datumVon ? ' bis ' + bis : ''}${mitZeit ? ` ${hhmm(von!)} bis ${hhmm(ende!)}` : ''} ${grund}`);
  return json({ ok: true }, 201);
}, ['admin', 'leitung']);

export const DELETE = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const db = await getDb();
  const s = await db.prepare('SELECT * FROM sperren WHERE id = ?').bind(String(b.id)).first<any>();
  if (!s || (nutzer.rolle !== 'admin' && s.standort !== nutzer.standort)) return fehler('Sperre nicht gefunden.', 404);
  await db.prepare('DELETE FROM sperren WHERE id = ?').bind(s.id).run();
  await protokoll(nutzer, s.standort, 'Sperre aufgehoben', `${s.datum_von}`);
  return json({ ok: true });
}, ['admin', 'leitung']);
