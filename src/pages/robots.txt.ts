import type { APIRoute } from 'astro';
import { INDEXIEREN, SITE } from '../lib/config';

// Solange der Prototyp läuft (PUBLIC_INDEXIEREN nicht "true"), bleibt alles gesperrt.
export const GET: APIRoute = () =>
  new Response(
    INDEXIEREN
      ? [
          'User-agent: *',
          'Allow: /',
          'Disallow: /team/',
          'Disallow: /reservierung/',
          'Disallow: /reservieren/',
          'Disallow: /404/',
          'Disallow: /*?*',
          '',
          `Sitemap: ${SITE}/sitemap-index.xml`,
          '',
        ].join('\n')
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
