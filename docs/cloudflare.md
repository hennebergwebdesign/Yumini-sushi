# Cloudflare: Worker, Bindings, Variablen, Secrets

Die Seite läuft als **Cloudflare Worker mit statischen Assets** (Astro mit `@astrojs/cloudflare`). Statische Seiten werden vorgebaut, Serverrouten liegen in `src/pages/api/` mit `export const prerender = false`. Weil jetzt ein Worker Skript existiert, lassen sich im Dashboard unter **Settings** Variablen, Secrets und Bindings anlegen.

## Einrichtung im Dashboard (Workers Builds)

| Feld | Wert |
| --- | --- |
| Build command | `npm run build` (muss gesetzt sein, sonst fehlt `dist/` und der Deploy bricht mit "Missing entry-point" ab) |
| Deploy command | `npx wrangler deploy` (Alternative ohne Build command: `npm run deploy`, baut und deployt in einem Schritt) |
| Worker Name | muss `name` in `wrangler.jsonc` entsprechen (`yumini-sushi`), sonst anpassen |

## Bindings und Variablen (in `wrangler.jsonc`, im Git)

| Name | Art | Zweck |
| --- | --- | --- |
| `CACHE` | KV Namespace | Zwischenspeicher, aktuell Google Bewertungen (24 h). Wird beim ersten Deploy automatisch angelegt |
| `PLACE_ID_BOCHUM`, `_DORTMUND`, `_GELSENKIRCHEN`, `_LUEDENSCHEID`, `_SIEGEN` | Variable | Google Place IDs je Standort (nicht geheim), in `wrangler.jsonc` unter `vars` eintragen |
| `TURNSTILE_SITE_KEY` | Variable | öffentlicher Turnstile Schlüssel |

## Secrets (nie ins Git)

Im Dashboard unter Settings, Variables and Secrets, Typ **Secret**, oder per `npx wrangler secret put NAME`.

| Name | Zweck |
| --- | --- |
| `GOOGLE_PLACES_KEY` | API Key der Places API (New), in der Google Cloud auf diese API beschränken |
| `TURNSTILE_SECRET` | serverseitiger Turnstile Schlüssel |
| `RESEND_API_KEY` | Mailversand (Bauphase Reservierung) |

Lokal: `.dev.vars` (aus `.dev.vars.example` kopieren, steht in `.gitignore`).

## Hinweis

Variablen, die im Dashboard von Hand angelegt werden, überschreibt der nächste Deploy, wenn sie auch in `wrangler.jsonc` stehen. Öffentliche Werte deshalb dort pflegen, geheime nur als Secret.

## Später

D1 für Reservierungen (Binding `DB`, Migrationen unter `migrations/`) und ein eigener Worker mit Zeitplan für Erinnerungsmails und Löschung.
