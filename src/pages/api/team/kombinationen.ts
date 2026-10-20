import { mit, json, fehler, lies, protokoll, standortFuer } from '../../../lib/server/api';
import { getDb, neueId } from '../../../lib/server/db';

export const prerender = false;

// Erlaubte Tischkombinationen für größere Gruppen (Tische, die sich zusammenstellen lassen).
export const POST = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const st = standortFuer(nutzer, b.standort);
  if (st instanceof Response) return st;
  const ids = Array.isArray(b.tische) ? [...new Set(b.tische.map(String))].sort() : [];
  if (ids.length < 2 || ids.length > 6) return fehler('Eine Kombination braucht 2 bis 6 Tische.');
  const db = await getDb();
  const t = (await db.prepare('SELECT id, nr, plaetze FROM tische WHERE standort = ? AND id IN (SELECT value FROM json_each(?))').bind(st, JSON.stringify(ids)).all()).results as any[];
  if (t.length !== ids.length) return fehler('Ein Tisch gehört nicht zu diesem Standort.');
  const vorhanden = (await db.prepare('SELECT tische FROM kombinationen WHERE standort = ?').bind(st).all()).results as any[];
  if (vorhanden.some((c) => c.tische === JSON.stringify(ids))) return fehler('Diese Kombination gibt es schon.', 409);
  const summe = t.reduce((a, x) => a + x.plaetze, 0);
  await db.prepare('INSERT INTO kombinationen (id, standort, tische, plaetze) VALUES (?,?,?,?)').bind(neueId(), st, JSON.stringify(ids), summe).run();
  await protokoll(nutzer, st, 'Kombination angelegt', t.map((x) => x.nr).join(' + '));
  return json({ ok: true }, 201);
}, ['admin', 'leitung']);

export const DELETE = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const db = await getDb();
  const c = await db.prepare('SELECT * FROM kombinationen WHERE id = ?').bind(String(b.id)).first<any>();
  if (!c || (nutzer.rolle !== 'admin' && c.standort !== nutzer.standort)) return fehler('Kombination nicht gefunden.', 404);
  await db.prepare('DELETE FROM kombinationen WHERE id = ?').bind(c.id).run();
  await protokoll(nutzer, c.standort, 'Kombination entfernt');
  return json({ ok: true });
}, ['admin', 'leitung']);
