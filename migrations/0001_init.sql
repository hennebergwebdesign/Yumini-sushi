-- Reservierungssystem und Backend (Cloudflare D1, SQLite).
-- Alle Anweisungen sind idempotent. Das Backend legt das Schema beim ersten Zugriff selbst an
-- (src/lib/server/db.ts), die Datei funktioniert genauso mit `wrangler d1 migrations apply`.
-- Zeiten sind Minuten seit Mitternacht, Daten ISO (JJJJ-MM-TT), ein Slot ist ein 15 Minuten Feld.

CREATE TABLE IF NOT EXISTS benutzer (
  id TEXT PRIMARY KEY,
  benutzername TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  rolle TEXT NOT NULL CHECK (rolle IN ('admin', 'leitung', 'service')),
  standort TEXT,
  pw_hash TEXT NOT NULL,
  aktiv INTEGER NOT NULL DEFAULT 1,
  totp_secret TEXT,
  erstellt TEXT NOT NULL DEFAULT (datetime('now')),
  letzter_login TEXT
);

CREATE TABLE IF NOT EXISTS sitzungen (
  id TEXT PRIMARY KEY,
  benutzer_id TEXT NOT NULL REFERENCES benutzer (id) ON DELETE CASCADE,
  ablauf INTEGER NOT NULL,
  erstellt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_versuche (
  schluessel TEXT PRIMARY KEY,
  anzahl INTEGER NOT NULL DEFAULT 0,
  gesperrt_bis INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tische (
  id TEXT PRIMARY KEY,
  standort TEXT NOT NULL,
  nr TEXT NOT NULL,
  plaetze INTEGER NOT NULL,
  form TEXT NOT NULL DEFAULT 'eckig' CHECK (form IN ('eckig', 'rund')),
  bereich TEXT NOT NULL DEFAULT 'Innen',
  x INTEGER NOT NULL DEFAULT 1,
  y INTEGER NOT NULL DEFAULT 1,
  b INTEGER NOT NULL DEFAULT 3,
  h INTEGER NOT NULL DEFAULT 3,
  aktiv INTEGER NOT NULL DEFAULT 1,
  UNIQUE (standort, nr)
);

CREATE TABLE IF NOT EXISTS kombinationen (
  id TEXT PRIMARY KEY,
  standort TEXT NOT NULL,
  tische TEXT NOT NULL,
  plaetze INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reservierungen (
  id TEXT PRIMARY KEY,
  standort TEXT NOT NULL,
  datum TEXT NOT NULL,
  von INTEGER NOT NULL,
  dauer INTEGER NOT NULL,
  puffer INTEGER NOT NULL DEFAULT 15,
  personen INTEGER NOT NULL,
  name TEXT NOT NULL,
  telefon TEXT NOT NULL DEFAULT '',
  mail TEXT NOT NULL DEFAULT '',
  anmerkung TEXT NOT NULL DEFAULT '',
  intern TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'bestaetigt' CHECK (status IN ('bestaetigt', 'angekommen', 'abgeschlossen', 'nicht_erschienen', 'storniert')),
  quelle TEXT NOT NULL DEFAULT 'online' CHECK (quelle IN ('online', 'telefon', 'laufkunde')),
  tische TEXT NOT NULL DEFAULT '[]',
  token TEXT NOT NULL,
  erstellt TEXT NOT NULL DEFAULT (datetime('now')),
  erstellt_von TEXT,
  geaendert TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_res_tag ON reservierungen (standort, datum, von);
CREATE INDEX IF NOT EXISTS idx_res_token ON reservierungen (token);

-- Jede aktive Buchung belegt je Tisch alle 15 Minuten Felder ihrer Dauer. Ein Feld ist nur einmal
-- vergebbar: so sind Doppelbuchungen auch bei gleichzeitigen Anfragen ausgeschlossen.
CREATE TABLE IF NOT EXISTS reservierung_slots (
  tisch_id TEXT NOT NULL REFERENCES tische (id) ON DELETE CASCADE,
  datum TEXT NOT NULL,
  slot INTEGER NOT NULL,
  reservierung_id TEXT NOT NULL REFERENCES reservierungen (id) ON DELETE CASCADE,
  PRIMARY KEY (tisch_id, datum, slot)
);
CREATE INDEX IF NOT EXISTS idx_slots_res ON reservierung_slots (reservierung_id);

CREATE TABLE IF NOT EXISTS sperren (
  id TEXT PRIMARY KEY,
  standort TEXT NOT NULL,
  datum_von TEXT NOT NULL,
  datum_bis TEXT NOT NULL,
  von INTEGER,
  bis INTEGER,
  tisch_id TEXT REFERENCES tische (id) ON DELETE CASCADE,
  grund TEXT NOT NULL DEFAULT '',
  erstellt_von TEXT,
  erstellt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sperren ON sperren (standort, datum_von, datum_bis);

CREATE TABLE IF NOT EXISTS einstellungen (
  standort TEXT PRIMARY KEY,
  daten TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS protokoll (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zeit TEXT NOT NULL DEFAULT (datetime('now')),
  benutzer TEXT,
  standort TEXT,
  aktion TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT ''
);
