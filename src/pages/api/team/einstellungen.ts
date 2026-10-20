import { mit, json, fehler, lies, protokoll, standortFuer } from '../../../lib/server/api';
import { ladeEinstellungen, pruefe, speichereEinstellungen, vorgabe } from '../../../lib/server/einstellungen';

export const prerender = false;

export const GET = mit(async ({ url, nutzer }) => {
  const st = standortFuer(nutzer, url.searchParams.get('standort'));
  if (st instanceof Response) return st;
  return json({ einst: await ladeEinstellungen(st), vorgabe: vorgabe(st) });
});

export const PUT = mit(async ({ request, nutzer }) => {
  const b = await lies(request);
  const st = standortFuer(nutzer, b.standort);
  if (st instanceof Response) return st;
  let e;
  try {
    e = pruefe(b.einst);
  } catch (x) {
    return fehler((x as Error).message);
  }
  await speichereEinstellungen(st, e);
  await protokoll(nutzer, st, 'Einstellungen geändert');
  return json({ einst: e });
}, ['admin', 'leitung']);
