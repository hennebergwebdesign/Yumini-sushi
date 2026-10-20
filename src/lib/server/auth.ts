import { getDb, neueId } from './db';

// Anmeldung: Passwörter nur als PBKDF2 Hash (Cloudflare erlaubt höchstens 100.000 Durchläufe), Sitzung als
// zufälliges Token im HttpOnly Cookie, in der Datenbank nur dessen SHA 256. Zwei Faktor kommt später:
// die Spalte benutzer.totp_secret ist vorbereitet, an `anmelden` hängt dann ein zweiter Schritt.
export type Rolle = 'admin' | 'leitung' | 'service';
export type Nutzer = { id: string; benutzername: string; name: string; rolle: Rolle; standort: string | null };

export const COOKIE = 'yumini_team';
export const SITZUNG_SEK = 8 * 60 * 60;
const ITER = 100_000;
const MAX_FEHLER = 5;

const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const enc = new TextEncoder();

async function pbkdf2(pw: string, salt: Uint8Array, iter: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256);
}

export async function hashPasswort(pw: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${b64(salt)}$${b64(await pbkdf2(pw, salt, ITER))}`;
}

async function pruefePasswort(pw: string, gespeichert: string) {
  const [typ, iter, salt, hash] = gespeichert.split('$');
  if (typ !== 'pbkdf2') return false;
  const a = new Uint8Array(await pbkdf2(pw, unb64(salt), Number(iter)));
  const b = unb64(hash);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function sha256(s: string) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function passwortFehler(pw: unknown) {
  if (typeof pw !== 'string' || pw.length < 10) return 'Das Passwort braucht mindestens 10 Zeichen.';
  if (pw.length > 200) return 'Das Passwort ist zu lang.';
  return '';
}

const sek = () => Math.floor(Date.now() / 1000);
const DUMMY = 'pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

/** Prüft Benutzername und Passwort, begrenzt Fehlversuche je Benutzername (5 Fehler: Wartezeit wächst). */
export async function anmelden(benutzername: string, passwort: string): Promise<{ token: string } | { fehler: string; wartezeit?: number }> {
  const db = await getDb();
  const schluessel = benutzername.trim().toLowerCase().slice(0, 80);
  const v = await db.prepare('SELECT anzahl, gesperrt_bis FROM login_versuche WHERE schluessel = ?').bind(schluessel).first<{ anzahl: number; gesperrt_bis: number }>();
  if (v && v.gesperrt_bis > sek()) return { fehler: 'Zu viele Fehlversuche. Bitte später erneut versuchen.', wartezeit: v.gesperrt_bis - sek() };

  const u = await db.prepare('SELECT id, pw_hash, aktiv FROM benutzer WHERE benutzername = ?').bind(schluessel).first<{ id: string; pw_hash: string; aktiv: number }>();
  // Auch bei unbekanntem Benutzer wird gerechnet, damit die Antwortzeit nichts verrät.
  const ok = await pruefePasswort(passwort, u?.pw_hash ?? DUMMY);
  if (!u || !u.aktiv || !ok) {
    const anzahl = (v?.anzahl ?? 0) + 1;
    const sperre = anzahl >= MAX_FEHLER ? sek() + Math.min(900, 30 * 2 ** (anzahl - MAX_FEHLER)) : 0;
    await db.prepare('INSERT INTO login_versuche (schluessel, anzahl, gesperrt_bis) VALUES (?1, ?2, ?3) ON CONFLICT (schluessel) DO UPDATE SET anzahl = ?2, gesperrt_bis = ?3').bind(schluessel, anzahl, sperre).run();
    return { fehler: 'Benutzername oder Passwort stimmt nicht.' };
  }
  const roh = b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  await db.batch([
    db.prepare('DELETE FROM login_versuche WHERE schluessel = ?').bind(schluessel),
    db.prepare('DELETE FROM sitzungen WHERE ablauf < ?').bind(sek()),
    db.prepare('INSERT INTO sitzungen (id, benutzer_id, ablauf) VALUES (?, ?, ?)').bind(await sha256(roh), u.id, sek() + SITZUNG_SEK),
    db.prepare("UPDATE benutzer SET letzter_login = datetime('now') WHERE id = ?").bind(u.id),
  ]);
  return { token: roh };
}

export function tokenAusCookie(request: Request) {
  const c = request.headers.get('cookie') ?? '';
  const m = c.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m?.[1] ?? null;
}

export async function nutzerAusToken(token: string | null): Promise<Nutzer | null> {
  if (!token || token.length < 20) return null;
  const db = await getDb();
  return db
    .prepare('SELECT b.id, b.benutzername, b.name, b.rolle, b.standort FROM sitzungen s JOIN benutzer b ON b.id = s.benutzer_id WHERE s.id = ? AND s.ablauf > ? AND b.aktiv = 1')
    .bind(await sha256(token), sek())
    .first<Nutzer>();
}

export async function abmelden(token: string | null) {
  if (!token) return;
  const db = await getDb();
  await db.prepare('DELETE FROM sitzungen WHERE id = ?').bind(await sha256(token)).run();
}

export function cookie(token: string, https: boolean, maxAge = SITZUNG_SEK) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${https ? '; Secure' : ''}`;
}

export async function legeBenutzerAn(d: { benutzername: string; name: string; rolle: Rolle; standort: string | null; passwort: string }) {
  const db = await getDb();
  const id = neueId();
  await db
    .prepare('INSERT INTO benutzer (id, benutzername, name, rolle, standort, pw_hash) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, d.benutzername.trim(), d.name.trim(), d.rolle, d.rolle === 'admin' ? null : d.standort, await hashPasswort(d.passwort))
    .run();
  return id;
}

export async function setzePasswort(benutzerId: string, passwort: string, sitzungenBehalten?: string) {
  const db = await getDb();
  const stmts = [db.prepare('UPDATE benutzer SET pw_hash = ? WHERE id = ?').bind(await hashPasswort(passwort), benutzerId)];
  stmts.push(
    sitzungenBehalten
      ? db.prepare('DELETE FROM sitzungen WHERE benutzer_id = ? AND id != ?').bind(benutzerId, await sha256(sitzungenBehalten))
      : db.prepare('DELETE FROM sitzungen WHERE benutzer_id = ?').bind(benutzerId),
  );
  await db.batch(stmts);
}
