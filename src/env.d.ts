/// <reference types="astro/client" />

// Bindings, Variablen und Secrets des Workers (wrangler.jsonc, docs/cloudflare.md)
declare namespace Cloudflare {
  interface Env {
    CACHE: KVNamespace;
    PLACE_ID_BOCHUM: string;
    PLACE_ID_DORTMUND: string;
    PLACE_ID_GELSENKIRCHEN: string;
    PLACE_ID_LUEDENSCHEID: string;
    PLACE_ID_SIEGEN: string;
    TURNSTILE_SITE_KEY: string;
    GOOGLE_PLACES_KEY?: string;
    TURNSTILE_SECRET?: string;
    RESEND_API_KEY?: string;
  }
}
