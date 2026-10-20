import { mit, json } from '../../../lib/server/api';
import { standorte } from '../../../lib/standorte';

export const prerender = false;

export const GET = mit(async ({ nutzer }) =>
  json({
    nutzer,
    standorte: standorte.filter((s) => nutzer.rolle === 'admin' || s.id === nutzer.standort).map((s) => ({ id: s.id, name: s.name })),
  }),
);
