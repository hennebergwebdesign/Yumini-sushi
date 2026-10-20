import { mit, json, standortFuer } from '../../../lib/server/api';
import { getDb } from '../../../lib/server/db';
import { jetzt } from '../../../lib/server/zeit';

export const prerender = false;

// Sucht Reservierungen nach Name, Telefon oder Mail. Standard: ab heute.
export const GET = mit(async ({ url, nutzer }) => {
  const st = standortFuer(nutzer, url.searchParams.get('standort'));
  if (st instanceof Response) return st;
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 60);
  if (q.length < 2) return json({ treffer: [] });
  const alle = url.searchParams.get('alle') === '1';
  const like = `%${q.replace(/[%_\\]/g, (c) => '\\' + c)}%`;
  const db = await getDb();
  const r = await db
    .prepare(`SELECT * FROM reservierungen WHERE standort = ?1 AND (name LIKE ?2 ESCAPE '\\' OR telefon LIKE ?2 ESCAPE '\\' OR mail LIKE ?2 ESCAPE '\\') ${alle ? '' : 'AND datum >= ?3'} ORDER BY datum, von LIMIT 60`)
    .bind(...(alle ? [st, like] : [st, like, jetzt().datum]))
    .all();
  return json({ treffer: r.results.map((z: any) => ({ ...z, tische: JSON.parse(z.tische) })) });
});
