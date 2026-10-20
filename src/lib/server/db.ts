import { env } from 'cloudflare:workers';
import schema from '../../../migrations/0001_init.sql?raw';

// D1 Zugriff. Das Schema wird beim ersten Zugriff je Worker Instanz angelegt (alle Anweisungen sind idempotent),
// damit ein Deploy ohne manuellen Migrationsschritt funktioniert. Dieselbe Datei läuft auch mit `wrangler d1 migrations apply`.
let bereit: Promise<void> | null = null;

const anweisungen = schema
  .split('\n')
  .filter((z) => !z.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

export async function getDb(): Promise<D1Database> {
  const db = env.DB;
  if (!db) throw new Error('D1 Binding DB fehlt (wrangler.jsonc)');
  bereit ??= (async () => {
    const vorhanden = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'protokoll'").first();
    if (!vorhanden) await db.batch(anweisungen.map((a) => db.prepare(a)));
  })().catch((e) => {
    bereit = null;
    throw e;
  });
  await bereit;
  return db;
}

export const neueId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 16);
