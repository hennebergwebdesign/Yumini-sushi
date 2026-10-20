import { mit, json } from '../../../lib/server/api';
import { getDb } from '../../../lib/server/db';

export const prerender = false;

// Wer hat wann was geändert. Leitung sieht ihren Standort, Admin alles.
export const GET = mit(async ({ nutzer }) => {
  const db = await getDb();
  const r =
    nutzer.rolle === 'admin'
      ? await db.prepare('SELECT * FROM protokoll ORDER BY id DESC LIMIT 200').all()
      : await db.prepare('SELECT * FROM protokoll WHERE standort = ? ORDER BY id DESC LIMIT 200').bind(nutzer.standort).all();
  return json({ eintraege: r.results });
}, ['admin', 'leitung']);
