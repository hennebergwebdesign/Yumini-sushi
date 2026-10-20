import { mit, json, fehler, lies, standortFuer, protokoll, text, ganzzahl } from '../../../lib/server/api';
import { erstelle, zeitenFuer } from '../../../lib/server/verfuegbarkeit';
import { gueltigesDatum, hhmm, minuten } from '../../../lib/server/zeit';

export const prerender = false;

// Zeiten mit Verfügbarkeit für das Eintragen im Dashboard (ohne Vorlauf).
export const GET = mit(async ({ url, nutzer }) => {
  const st = standortFuer(nutzer, url.searchParams.get('standort'));
  if (st instanceof Response) return st;
  const datum = url.searchParams.get('datum') ?? '';
  if (!gueltigesDatum(datum)) return fehler('Datum ungültig.');
  const p = ganzzahl(url.searchParams.get('personen') ?? 2, 'Personen', 1, 60);
  return json({ zeiten: await zeitenFuer(st, datum, p, true) });
});

// Telefonische Reservierung oder Laufkundschaft eintragen.
export const POST = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const st = standortFuer(nutzer, b.standort);
  if (st instanceof Response) return st;
  if (!gueltigesDatum(b.datum)) return fehler('Datum ungültig.');
  const quelle = b.quelle === 'laufkunde' ? 'laufkunde' : 'telefon';
  const von = typeof b.zeit === 'string' && /^\d{2}:\d{2}$/.test(b.zeit) ? minuten(b.zeit) : NaN;
  if (!Number.isFinite(von) || von >= 24 * 60) return fehler('Uhrzeit ungültig.');
  const r = await erstelle(
    {
      standort: st,
      datum: b.datum,
      von,
      personen: ganzzahl(b.personen, 'Personen', 1, 60),
      name: text(b.name, 'Name', quelle === 'laufkunde' ? 0 : 2, 80) || 'Laufkundschaft',
      telefon: text(b.telefon ?? '', 'Telefon', 0, 40),
      mail: text(b.mail ?? '', 'Mail', 0, 120),
      anmerkung: text(b.anmerkung ?? '', 'Anmerkung', 0, 300),
      intern: text(b.intern ?? '', 'Notiz', 0, 300),
      quelle,
    },
    { tischIds: Array.isArray(b.tischIds) ? b.tischIds.map(String) : undefined, keinTisch: b.tischmodus === 'ohne', nutzerId: nutzer.id, erzwingen: !!b.erzwingen },
  );
  await protokoll(nutzer, st, 'Reservierung eingetragen', `${r.name}, ${r.personen} P., ${r.datum} ${hhmm(r.von)}`);
  return json({ reservierung: r }, 201);
});
