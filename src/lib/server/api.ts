import type { APIContext, APIRoute } from 'astro';
import { getDb } from './db';
import { istStandort } from './einstellungen';
import type { Nutzer, Rolle } from './auth';
import { Konflikt } from './verfuegbarkeit';

export const json = (d: unknown, status = 200, kopf: Record<string, string> = {}) =>
  new Response(JSON.stringify(d), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...kopf } });
export const fehler = (text: string, status = 400) => json({ fehler: text }, status);

export async function lies(request: Request): Promise<Record<string, any>> {
  try {
    const b = await request.json();
    return b && typeof b === 'object' && !Array.isArray(b) ? (b as Record<string, any>) : {};
  } catch {
    return {};
  }
}

/** Standort, auf den dieser Nutzer zugreifen darf. Admin wählt frei, alle anderen sind an ihren Standort gebunden. */
export function standortFuer(n: Nutzer, wunsch: unknown): string | Response {
  if (n.rolle === 'admin') return istStandort(wunsch) ? wunsch : fehler('Standort fehlt oder ist unbekannt.');
  if (wunsch && wunsch !== n.standort) return fehler('Kein Zugriff auf diesen Standort.', 403);
  return n.standort!;
}

export async function protokoll(n: Nutzer | null, standort: string | null, aktion: string, details = '') {
  const db = await getDb();
  await db.prepare('INSERT INTO protokoll (benutzer, standort, aktion, details) VALUES (?, ?, ?, ?)').bind(n?.benutzername ?? null, standort, aktion, details.slice(0, 500)).run();
}

type Kontext = APIContext & { nutzer: Nutzer };

/**
 * Hüllt eine Route des Backends: verlangt eine Sitzung (und optional eine Rolle), prüft bei Änderungen Origin und
 * Kopfzeile gegen Fremdaufrufe und übersetzt Fehler. Dashboard Routen ohne Sitzung liefern nichts außer 401.
 */
export const mit =
  (fn: (c: Kontext) => Promise<Response>, rollen?: Rolle[]): APIRoute =>
  async (c) => {
    try {
      const n = c.locals.nutzer;
      if (!n) return fehler('Bitte melden Sie sich an.', 401);
      if (c.request.method !== 'GET') {
        const origin = c.request.headers.get('origin');
        if ((origin && origin !== c.url.origin) || c.request.headers.get('x-yumini') !== '1') return fehler('Anfrage abgelehnt.', 403);
      }
      if (rollen && !rollen.includes(n.rolle)) return fehler('Dafür fehlt die Berechtigung.', 403);
      return await fn({ ...c, nutzer: n } as Kontext);
    } catch (e) {
      if (e instanceof Konflikt) return fehler(e.message, 409);
      if (e instanceof Error && e.name === 'Eingabe') return fehler(e.message, 400);
      console.error(e);
      return fehler('Interner Fehler.', 500);
    }
  };

export class Eingabe extends Error {
  name = 'Eingabe';
}

export const text = (v: unknown, name: string, min: number, max: number) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s.length < min) throw new Eingabe(min === 0 ? `${name} ist ungültig.` : `Bitte ${name} angeben.`);
  if (s.length > max) throw new Eingabe(`${name} ist zu lang (höchstens ${max} Zeichen).`);
  return s;
};
export const ganzzahl = (v: unknown, name: string, min: number, max: number) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new Eingabe(`${name} muss zwischen ${min} und ${max} liegen.`);
  return n;
};
