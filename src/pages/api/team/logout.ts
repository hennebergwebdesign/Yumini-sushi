import type { APIRoute } from 'astro';
import { abmelden, cookie, tokenAusCookie } from '../../../lib/server/auth';
import { fehler, json } from '../../../lib/server/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  if (request.headers.get('x-yumini') !== '1') return fehler('Anfrage abgelehnt.', 403);
  await abmelden(tokenAusCookie(request));
  return json({ ok: true }, 200, { 'Set-Cookie': cookie('', url.protocol === 'https:', 0) });
};
