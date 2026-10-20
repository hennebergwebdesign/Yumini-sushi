import { defineMiddleware } from 'astro:middleware';
import { nutzerAusToken, tokenAusCookie } from './lib/server/auth';

// Das Backend (/team und /api/team) liefert nur mit Sitzung, wird nie zwischengespeichert und nie indexiert.
export const onRequest = defineMiddleware(async (context, next) => {
  const pfad = context.url.pathname;
  const intern = pfad.startsWith('/team') || pfad.startsWith('/api/team');
  context.locals.nutzer = null;
  if (!intern) return next();
  try {
    context.locals.nutzer = await nutzerAusToken(tokenAusCookie(context.request));
  } catch (e) {
    console.error(e);
  }
  const res = await next();
  const kopf = new Headers(res.headers);
  kopf.set('Cache-Control', 'no-store');
  kopf.set('X-Robots-Tag', 'noindex, nofollow');
  kopf.set('X-Frame-Options', 'DENY');
  kopf.set('Referrer-Policy', 'same-origin');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: kopf });
});
