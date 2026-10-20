import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { fehler, json, lies, protokoll } from '../../../lib/server/api';
import { getDb } from '../../../lib/server/db';
import { ladeEinstellungen, istStandort } from '../../../lib/server/einstellungen';
import { Konflikt, erstelle } from '../../../lib/server/verfuegbarkeit';
import { gueltigesDatum, hhmm, jetzt, minuten, plusTage } from '../../../lib/server/zeit';

export const prerender = false;

async function turnstileOk(token: unknown) {
  if (!env.TURNSTILE_SECRET) return true; // Testphase: ohne Schlüssel kein Captcha
  if (typeof token !== 'string' || !token) return false;
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }) });
  return r.ok && ((await r.json()) as { success?: boolean }).success === true;
}

// Öffentlich: Reservierung des Gastes. Das System sucht den passenden Tisch selbst. Es werden keine IP Adressen gespeichert.
export const POST: APIRoute = async ({ request, url }) => {
  if ((request.headers.get('origin') ?? url.origin) !== url.origin) return fehler('Anfrage abgelehnt.', 403);
  try {
    const b = await lies(request);
    if (b.website) return json({ ok: true }); // Honeypot: Bots füllen das versteckte Feld
    if (!(await turnstileOk(b.turnstile))) return fehler('Die Sicherheitsprüfung ist fehlgeschlagen. Bitte erneut versuchen.', 400);
    if (!istStandort(b.ort)) return fehler('Standort unbekannt.');
    const heute = jetzt().datum;
    if (!gueltigesDatum(b.datum) || b.datum < heute || b.datum > plusTage(heute, 120)) return fehler('Datum ungültig.');
    if (typeof b.zeit !== 'string' || !/^\d{2}:\d{2}$/.test(b.zeit)) return fehler('Uhrzeit ungültig.');
    const e = await ladeEinstellungen(b.ort);
    const personen = Number(b.personen);
    if (!Number.isInteger(personen) || personen < 1 || personen > e.maxOnline) return fehler(`Online sind 1 bis ${e.maxOnline} Personen möglich. Für größere Gruppen bitte eine Feier anfragen.`);
    const name = String(b.name ?? '').trim();
    const telefon = String(b.telefon ?? '').trim();
    const mail = String(b.mail ?? '').trim();
    if (name.length < 2 || name.length > 80) return fehler('Bitte geben Sie Ihren Namen ein.');
    if (telefon.replace(/\D/g, '').length < 6 || telefon.length > 40 || !/^[\d\s+()/.-]+$/.test(telefon)) return fehler('Bitte geben Sie eine gültige Telefonnummer ein.');
    if (mail && (mail.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))) return fehler('Die E-Mail Adresse sieht nicht richtig aus.');
    const anmerkung = String(b.anmerkung ?? '').trim().slice(0, 300);

    // Missbrauchsbremse ohne IP: höchstens 3 künftige Reservierungen je Telefonnummer und Standort
    const db = await getDb();
    const n = await db.prepare("SELECT COUNT(*) AS n FROM reservierungen WHERE standort = ? AND telefon = ? AND datum >= ? AND status IN ('bestaetigt','angekommen')").bind(b.ort, telefon, heute).first<{ n: number }>();
    if (n && n.n >= 3) return fehler('Mit dieser Telefonnummer gibt es schon mehrere Reservierungen. Bitte rufen Sie uns an.', 429);

    const r = await erstelle({ standort: b.ort, datum: b.datum, von: minuten(b.zeit), personen, name, telefon, mail, anmerkung, quelle: 'online' }, { vorlauf: true });
    await protokoll(null, b.ort, 'Online Reservierung', `${r.name}, ${r.personen} P., ${r.datum} ${hhmm(r.von)}`);
    return json({ ok: true, code: r.id.slice(-6).toUpperCase(), datum: r.datum, zeit: hhmm(r.von), personen: r.personen, dauer: r.dauer }, 201);
  } catch (e) {
    if (e instanceof Konflikt) return fehler(e.message, 409);
    console.error(e);
    return fehler('Die Reservierung ist gerade nicht möglich. Bitte versuchen Sie es später oder rufen Sie an.', 500);
  }
};
