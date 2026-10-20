import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { standorte } from '../../lib/standorte';

export const prerender = false;

// Google Bewertungen je Standort über die Places API (New), 24 Stunden in KV zwischengespeichert.
// Ohne Key oder Place ID liefert die Route 503, die Seite zeigt dann ihre Platzhalter.
const TTL = 60 * 60 * 24;

type Antwort = { standort: string; wert: number | null; anzahl: number | null; stimmen: { name: string; sterne: number; text: string; datum: string }[] };

async function holen(id: string, placeId: string, key: string): Promise<Antwort> {
  const r = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=de`, {
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' },
  });
  if (!r.ok) throw new Error(`Places API ${r.status}`);
  const d = (await r.json()) as any;
  return {
    standort: id,
    wert: d.rating ?? null,
    anzahl: d.userRatingCount ?? null,
    stimmen: (d.reviews ?? [])
      .filter((x: any) => (x.rating ?? 0) >= 4 && x.text?.text)
      .map((x: any) => ({ name: x.authorAttribution?.displayName ?? '', sterne: x.rating, text: x.text.text, datum: x.publishTime })),
  };
}

export const GET: APIRoute = async () => {
  const key = env.GOOGLE_PLACES_KEY;
  if (!key) return Response.json({ fehler: 'GOOGLE_PLACES_KEY fehlt' }, { status: 503 });

  const ergebnis: Antwort[] = [];
  for (const s of standorte) {
    const placeId = (env as unknown as Record<string, string>)[`PLACE_ID_${s.id.toUpperCase()}`];
    if (!placeId) continue;
    const ck = `bewertungen:${s.id}`;
    let a = await env.CACHE.get<Antwort>(ck, 'json');
    if (!a) {
      try {
        a = await holen(s.id, placeId, key);
        await env.CACHE.put(ck, JSON.stringify(a), { expirationTtl: TTL });
      } catch {
        continue;
      }
    }
    ergebnis.push(a);
  }
  if (!ergebnis.length) return Response.json({ fehler: 'Keine Place IDs gesetzt' }, { status: 503 });
  return Response.json(ergebnis, { headers: { 'Cache-Control': 'public, max-age=3600' } });
};
