import { mit, json, fehler, lies, protokoll, standortFuer, text, ganzzahl } from '../../../lib/server/api';
import { getDb, neueId } from '../../../lib/server/db';
import { jetzt } from '../../../lib/server/zeit';
import { RASTER } from '../../../lib/server/verfuegbarkeit';

export const prerender = false;

const feld = (b: Record<string, any>) => ({
  nr: text(b.nr, 'Tischnummer', 1, 12),
  plaetze: ganzzahl(b.plaetze, 'Plätze', 1, 30),
  form: b.form === 'rund' ? 'rund' : 'eckig',
  bereich: text(b.bereich ?? 'Innen', 'Bereich', 1, 30),
  b: ganzzahl(b.b ?? 4, 'Breite', 2, 16),
  h: ganzzahl(b.h ?? 4, 'Höhe', 2, 16),
});
const lage = (b: Record<string, any>, w: number, h: number) => ({ x: ganzzahl(b.x ?? 1, 'x', 0, RASTER.b - w), y: ganzzahl(b.y ?? 1, 'y', 0, RASTER.h - h) });

// Tische anlegen, ändern (auch verschieben), entfernen. Nur Admin und Standortleitung.
export const POST = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const st = standortFuer(nutzer, b.standort);
  if (st instanceof Response) return st;
  const f = feld(b);
  const p = lage(b, f.b, f.h);
  const db = await getDb();
  const id = neueId();
  try {
    await db.prepare('INSERT INTO tische (id, standort, nr, plaetze, form, bereich, x, y, b, h) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, st, f.nr, f.plaetze, f.form, f.bereich, p.x, p.y, f.b, f.h).run();
  } catch {
    return fehler(`Tisch ${f.nr} gibt es an diesem Standort schon.`, 409);
  }
  await protokoll(nutzer, st, 'Tisch angelegt', f.nr);
  return json({ id }, 201);
}, ['admin', 'leitung']);

export const PATCH = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const db = await getDb();
  const alt = await db.prepare('SELECT * FROM tische WHERE id = ?').bind(String(b.id)).first<any>();
  if (!alt || (nutzer.rolle !== 'admin' && alt.standort !== nutzer.standort)) return fehler('Tisch nicht gefunden.', 404);
  const f = feld({ ...alt, ...b });
  const p = lage({ ...alt, ...b }, f.b, f.h);
  try {
    await db.prepare('UPDATE tische SET nr=?, plaetze=?, form=?, bereich=?, x=?, y=?, b=?, h=? WHERE id=?').bind(f.nr, f.plaetze, f.form, f.bereich, p.x, p.y, f.b, f.h, alt.id).run();
  } catch {
    return fehler(`Tisch ${f.nr} gibt es an diesem Standort schon.`, 409);
  }
  // Kombinationen merken sich die Platzsumme
  const kombis = (await db.prepare('SELECT id, tische FROM kombinationen WHERE standort = ?').bind(alt.standort).all()).results as any[];
  for (const c of kombis) {
    const ids: string[] = JSON.parse(c.tische);
    if (!ids.includes(alt.id)) continue;
    await db.prepare('UPDATE kombinationen SET plaetze = (SELECT COALESCE(SUM(plaetze),0) FROM tische WHERE id IN (SELECT value FROM json_each(?))) WHERE id = ?').bind(c.tische, c.id).run();
  }
  return json({ ok: true });
}, ['admin', 'leitung']);

export const DELETE = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const db = await getDb();
  const t = await db.prepare('SELECT * FROM tische WHERE id = ?').bind(String(b.id)).first<any>();
  if (!t || (nutzer.rolle !== 'admin' && t.standort !== nutzer.standort)) return fehler('Tisch nicht gefunden.', 404);
  const zukunft = await db.prepare('SELECT COUNT(*) AS n FROM reservierung_slots WHERE tisch_id = ? AND datum >= ?').bind(t.id, jetzt().datum).first<{ n: number }>();
  if (zukunft && zukunft.n > 0) return fehler(`Tisch ${t.nr} hat noch Reservierungen. Bitte erst umsetzen oder stornieren.`, 409);
  const kombis = (await db.prepare('SELECT id, tische FROM kombinationen WHERE standort = ?').bind(t.standort).all()).results as any[];
  await db.batch([
    ...kombis.filter((c) => (JSON.parse(c.tische) as string[]).includes(t.id)).map((c) => db.prepare('DELETE FROM kombinationen WHERE id = ?').bind(c.id)),
    db.prepare('DELETE FROM tische WHERE id = ?').bind(t.id),
  ]);
  await protokoll(nutzer, t.standort, 'Tisch entfernt', t.nr);
  return json({ ok: true });
}, ['admin', 'leitung']);
