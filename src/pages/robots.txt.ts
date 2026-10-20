import type { APIRoute } from 'astro';
import { INDEXIEREN, SITE } from '../lib/config';

export const GET: APIRoute = () =>
  new Response(
    INDEXIEREN
      ? `User-agent: *\nAllow: /\nDisallow: /team/\nDisallow: /reservierung/\n\nSitemap: ${SITE}/sitemap-index.xml\n`
      : `User-agent: *\nDisallow: /\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
