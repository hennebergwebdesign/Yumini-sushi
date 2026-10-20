import type { APIRoute } from 'astro';
import { fehler, json } from '../../../lib/server/api';
import { ladeEinstellungen, istStandort } from '../../../lib/server/einstellungen';
import { gesperrteTage } from '../../../lib/server/verfuegbarkeit';
import { jetzt, plusTage } from '../../../lib/server/zeit';

export const prerender = false;

// Öffentlich: Öffnungstage und gesperrte Tage eines Standorts, damit der Kalender der Website stimmt.
export const GET: APIRoute = async ({ url }) => {
  const ort = url.searchParams.get('ort');
  if (!istStandort(ort)) return fehler('Standort unbekannt.');
  const e = await ladeEinstellungen(ort);
  const heute = jetzt().datum;
  return json({
    heute,
    dauer: e.dauer,
    maxOnline: e.maxOnline,
    offen: e.oeffnung.map((t) => !!(t.mittag || t.abend)),
    gesperrt: await gesperrteTage(ort, heute, plusTage(heute, 120)),
  });
};
