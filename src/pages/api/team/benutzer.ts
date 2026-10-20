import { mit, json, fehler, lies, protokoll, text } from '../../../lib/server/api';
import { legeBenutzerAn, passwortFehler, setzePasswort, type Rolle } from '../../../lib/server/auth';
import { getDb } from '../../../lib/server/db';
import { istStandort } from '../../../lib/server/einstellungen';

export const prerender = false;

const ROLLEN: Rolle[] = ['admin', 'leitung', 'service'];

// Benutzerverwaltung, nur Admin.
export const GET = mit(async () => {
  const db = await getDb();
  const r = await db.prepare('SELECT id, benutzername, name, rolle, standort, aktiv, erstellt, letzter_login FROM benutzer ORDER BY rolle, standort, name').all();
  return json({ benutzer: r.results });
}, ['admin']);

export const POST = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const benutzername = text(b.benutzername, 'Benutzername', 3, 80);
  if (!/^[a-z0-9._@+-]+$/i.test(benutzername)) return fehler('Benutzername: Buchstaben, Ziffern, @ . _ + -');
  const name = text(b.name, 'Name', 2, 80);
  if (!ROLLEN.includes(b.rolle)) return fehler('Rolle ungültig.');
  if (b.rolle !== 'admin' && !istStandort(b.standort)) return fehler('Für diese Rolle ist ein Standort nötig.');
  const pf = passwortFehler(b.passwort);
  if (pf) return fehler(pf);
  try {
    await legeBenutzerAn({ benutzername, name, rolle: b.rolle, standort: b.rolle === 'admin' ? null : b.standort, passwort: b.passwort });
  } catch {
    return fehler('Diesen Benutzernamen gibt es schon.', 409);
  }
  await protokoll(nutzer, b.standort ?? null, 'Benutzer angelegt', `${benutzername} (${b.rolle})`);
  return json({ ok: true }, 201);
}, ['admin']);

export const PATCH = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const db = await getDb();
  const u = await db.prepare('SELECT * FROM benutzer WHERE id = ?').bind(String(b.id)).first<any>();
  if (!u) return fehler('Benutzer nicht gefunden.', 404);
  if (b.passwort !== undefined) {
    const pf = passwortFehler(b.passwort);
    if (pf) return fehler(pf);
    await setzePasswort(u.id, b.passwort);
    await protokoll(nutzer, u.standort, 'Passwort zurückgesetzt', u.benutzername);
  }
  if (b.aktiv !== undefined) {
    if (u.id === nutzer.id && !b.aktiv) return fehler('Das eigene Konto lässt sich nicht deaktivieren.', 409);
    await db.batch([db.prepare('UPDATE benutzer SET aktiv = ? WHERE id = ?').bind(b.aktiv ? 1 : 0, u.id), ...(b.aktiv ? [] : [db.prepare('DELETE FROM sitzungen WHERE benutzer_id = ?').bind(u.id)])]);
    await protokoll(nutzer, u.standort, b.aktiv ? 'Benutzer aktiviert' : 'Benutzer deaktiviert', u.benutzername);
  }
  if (b.rolle !== undefined || b.standort !== undefined || b.name !== undefined) {
    const rolle = b.rolle ?? u.rolle;
    const standort = rolle === 'admin' ? null : (b.standort ?? u.standort);
    if (!ROLLEN.includes(rolle) || (rolle !== 'admin' && !istStandort(standort))) return fehler('Rolle oder Standort ungültig.');
    if (u.id === nutzer.id && rolle !== 'admin') return fehler('Die eigene Admin Rolle lässt sich nicht entziehen.', 409);
    await db.prepare('UPDATE benutzer SET rolle = ?, standort = ?, name = ? WHERE id = ?').bind(rolle, standort, b.name !== undefined ? text(b.name, 'Name', 2, 80) : u.name, u.id).run();
    await protokoll(nutzer, standort, 'Benutzer geändert', u.benutzername);
  }
  return json({ ok: true });
}, ['admin']);
