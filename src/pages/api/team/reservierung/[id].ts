import { mit, json, fehler, lies, protokoll, text, ganzzahl } from '../../../../lib/server/api';
import { aendere, lade, type Aenderung, type Status } from '../../../../lib/server/verfuegbarkeit';
import { gueltigesDatum, hhmm, minuten } from '../../../../lib/server/zeit';

export const prerender = false;

const STATUS: Status[] = ['bestaetigt', 'angekommen', 'abgeschlossen', 'nicht_erschienen', 'storniert'];

// Angaben, Zeit, Personen, Status oder Tische einer Reservierung ändern.
export const PATCH = mit(async ({ request, params, nutzer }) => {
  const alt = await lade(String(params.id));
  if (!alt || (nutzer.rolle !== 'admin' && alt.standort !== nutzer.standort)) return fehler('Reservierung nicht gefunden.', 404);
  const b = await lies(request);
  const a: Aenderung = {};
  if (b.name !== undefined) a.name = text(b.name, 'Name', 1, 80);
  if (b.telefon !== undefined) a.telefon = text(b.telefon, 'Telefon', 0, 40);
  if (b.mail !== undefined) a.mail = text(b.mail, 'Mail', 0, 120);
  if (b.anmerkung !== undefined) a.anmerkung = text(b.anmerkung, 'Anmerkung', 0, 300);
  if (b.intern !== undefined) a.intern = text(b.intern, 'Notiz', 0, 300);
  if (b.personen !== undefined) a.personen = ganzzahl(b.personen, 'Personen', 1, 60);
  if (b.dauer !== undefined) a.dauer = ganzzahl(b.dauer, 'Dauer', 30, 360);
  if (b.datum !== undefined) {
    if (!gueltigesDatum(b.datum)) return fehler('Datum ungültig.');
    a.datum = b.datum;
  }
  if (b.zeit !== undefined) {
    if (typeof b.zeit !== 'string' || !/^\d{2}:\d{2}$/.test(b.zeit) || minuten(b.zeit) >= 24 * 60) return fehler('Uhrzeit ungültig.');
    a.von = minuten(b.zeit);
  }
  if (b.status !== undefined) {
    if (!STATUS.includes(b.status)) return fehler('Status ungültig.');
    a.status = b.status;
  }
  if (b.tischIds !== undefined) {
    if (!Array.isArray(b.tischIds)) return fehler('Tische ungültig.');
    a.tischIds = b.tischIds.map(String);
  }
  if (b.tischmodus === 'ohne') a.tischIds = [];
  const neu = await aendere(alt.id, a, { nutzerId: nutzer.id, erzwingen: !!b.erzwingen, ohneTisch: b.tischmodus === 'ohne', neuSuchen: !!b.neuSuchen });
  const was = b.status && b.status !== alt.status ? `Status ${alt.status} zu ${b.status}` : b.tischIds !== undefined ? 'Tische zugewiesen' : 'geändert';
  await protokoll(nutzer, alt.standort, 'Reservierung ' + was, `${neu.name}, ${neu.personen} P., ${neu.datum} ${hhmm(neu.von)}`);
  return json({ reservierung: neu });
});
