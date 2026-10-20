import type { APIRoute } from 'astro';
import { fehler, json } from '../../../lib/server/api';
import { ladeEinstellungen, istStandort } from '../../../lib/server/einstellungen';
import { zeitenFuer } from '../../../lib/server/verfuegbarkeit';
import { gueltigesDatum, jetzt, plusTage } from '../../../lib/server/zeit';

export const prerender = false;

// Öffentlich: Uhrzeiten eines Tages mit echter Verfügbarkeit (freier Tisch für die Gruppe).
export const GET: APIRoute = async ({ url }) => {
  const ort = url.searchParams.get('ort');
  const datum = url.searchParams.get('datum');
  const personen = Number(url.searchParams.get('personen'));
  if (!istStandort(ort) || !gueltigesDatum(datum) || !Number.isInteger(personen) || personen < 1) return fehler('Angaben ungültig.');
  const e = await ladeEinstellungen(ort);
  if (personen > e.maxOnline) return json({ zeiten: [], gross: true });
  const heute = jetzt().datum;
  if (datum < heute || datum > plusTage(heute, 120)) return json({ zeiten: [] });
  return json({ zeiten: await zeitenFuer(ort, datum, personen) });
};
