import type { APIRoute } from 'astro';
import { anmelden, cookie } from '../../../lib/server/auth';
import { fehler, json, lies, protokoll } from '../../../lib/server/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('x-yumini') !== '1' || (request.headers.get('origin') ?? url.origin) !== url.origin) return fehler('Anfrage abgelehnt.', 403);
  const b = await lies(request);
  if (typeof b.benutzername !== 'string' || typeof b.passwort !== 'string') return fehler('Bitte Benutzername und Passwort eingeben.');
  const r = await anmelden(b.benutzername, b.passwort);
  if ('fehler' in r) return json({ fehler: r.fehler, wartezeit: r.wartezeit }, r.wartezeit ? 429 : 401);
  await protokoll(null, null, 'Anmeldung', b.benutzername.slice(0, 40));
  return json({ ok: true }, 200, { 'Set-Cookie': cookie(r.token, url.protocol === 'https:') });
};
