import { mit, json, fehler, standortFuer } from '../../../lib/server/api';
import { getDb } from '../../../lib/server/db';
import { RASTER, ladeKontext, ladeTag, sperrenFuerTag, startzeiten, tagGesperrt } from '../../../lib/server/verfuegbarkeit';
import { gueltigesDatum, hhmm, jetzt, wochentag } from '../../../lib/server/zeit';

export const prerender = false;

// Alles für die Tagesansicht und den Tischplan: Reservierungen, Tische, Kombinationen, Sperren, Zeiten.
export const GET = mit(async ({ url, nutzer }) => {
  const st = standortFuer(nutzer, url.searchParams.get('standort'));
  if (st instanceof Response) return st;
  const datum = url.searchParams.get('datum') ?? jetzt().datum;
  if (!gueltigesDatum(datum)) return fehler('Datum ungültig.');
  const db = await getDb();
  const [res, k, sperren, kombis] = await Promise.all([
    ladeTag(st, datum),
    ladeKontext(st, datum),
    sperrenFuerTag(st, datum),
    db.prepare('SELECT * FROM kombinationen WHERE standort = ?').bind(st).all(),
  ]);
  const tag = k.einst.oeffnung[wochentag(datum)];
  return json({
    standort: st,
    datum,
    raster: RASTER,
    jetzt: jetzt(),
    wochentag: wochentag(datum),
    geschlossen: tagGesperrt(k) || (!tag.mittag && !tag.abend),
    fenster: tag,
    startzeiten: startzeiten(k).map((s) => ({ t: hhmm(s.t), gruppe: s.gruppe })),
    einst: { dauer: k.einst.dauer, puffer: k.einst.puffer, vorlauf: k.einst.vorlauf },
    tische: k.tische,
    kombinationen: kombis.results.map((c: any) => ({ ...c, tische: JSON.parse(c.tische) })),
    sperren,
    reservierungen: res,
  });
});
