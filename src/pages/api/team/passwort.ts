import { mit, json, fehler, lies, protokoll } from '../../../lib/server/api';
import { getDb } from '../../../lib/server/db';
import { anmelden, passwortFehler, setzePasswort, tokenAusCookie } from '../../../lib/server/auth';

export const prerender = false;

// Eigenes Passwort ändern, andere Sitzungen werden beendet.
export const POST = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const pf = passwortFehler(b.neu);
  if (pf) return fehler(pf);
  const db = await getDb();
  const u = await db.prepare('SELECT benutzername FROM benutzer WHERE id = ?').bind(nutzer.id).first<{ benutzername: string }>();
  const pruef = await anmelden(u!.benutzername, String(b.alt ?? ''));
  if ('fehler' in pruef) return fehler('Das bisherige Passwort stimmt nicht.', 403);
  await setzePasswort(nutzer.id, b.neu, tokenAusCookie(request) ?? undefined);
  await protokoll(nutzer, nutzer.standort, 'Passwort geändert');
  return json({ ok: true });
});
