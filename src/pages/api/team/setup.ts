import type { APIRoute } from 'astro';
import { anmelden, cookie, legeBenutzerAn, passwortFehler } from '../../../lib/server/auth';
import { getDb } from '../../../lib/server/db';
import { fehler, json, lies, protokoll } from '../../../lib/server/api';

export const prerender = false;

// Ersteinrichtung: legt den ersten Admin an, aber nur solange es noch keinen Benutzer gibt.
export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('x-yumini') !== '1' || (request.headers.get('origin') ?? url.origin) !== url.origin) return fehler('Anfrage abgelehnt.', 403);
  const db = await getDb();
  const n = await db.prepare('SELECT COUNT(*) AS n FROM benutzer').first<{ n: number }>();
  if (n && n.n > 0) return fehler('Die Ersteinrichtung ist bereits erfolgt.', 403);
  const b = await lies(request);
  const benutzername = String(b.benutzername ?? '').trim();
  const name = String(b.name ?? '').trim() || benutzername;
  if (!/^[a-z0-9._@+-]{3,80}$/i.test(benutzername)) return fehler('Benutzername: 3 bis 80 Zeichen, Buchstaben, Ziffern, @ . _ + -');
  const pf = passwortFehler(b.passwort);
  if (pf) return fehler(pf);
  try {
    await legeBenutzerAn({ benutzername, name, rolle: 'admin', standort: null, passwort: b.passwort });
  } catch {
    return fehler('Die Ersteinrichtung ist bereits erfolgt.', 403);
  }
  await protokoll(null, null, 'Ersteinrichtung', benutzername);
  const r = await anmelden(benutzername, b.passwort);
  if ('fehler' in r) return json({ ok: true });
  return json({ ok: true }, 200, { 'Set-Cookie': cookie(r.token, url.protocol === 'https:') });
};
