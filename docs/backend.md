# Backend `/team/` (Reservierungen, Tischplan, Benutzer)

Eigenbau auf Cloudflare D1 (Binding `DB`), Astro Serverrouten, ohne Fremddienst. Stand: Testphase.

## Einrichtung

1. Deploy wie in `docs/cloudflare.md`. `wrangler.jsonc` enthält `d1_databases` (`yumini-reservierung`), Wrangler legt die Datenbank beim ersten Deploy an.
2. Das Schema (`migrations/0001_init.sql`) legt das Backend beim ersten Zugriff selbst an. Alternativ: `npx wrangler d1 migrations apply yumini-reservierung --remote`.
3. `/team/` öffnen: solange es keinen Benutzer gibt, erscheint die **Ersteinrichtung** (erster Admin, Passwort mindestens 10 Zeichen). Danach nie wieder.
4. Als Admin unter Einstellungen (Testphase): Beispieltische und Beispielreservierungen anlegen, unter Benutzer die Konten je Standort anlegen.
5. Lokal: `npm run dev`, die lokale D1 liegt in `.wrangler/state` (nicht im Git).

## Rollen

| Rolle | Standorte | Darf |
| --- | --- | --- |
| Admin | alle | alles, Benutzer, Testdaten, Protokoll |
| Standortleitung | einer | Reservierungen, Tische und Grundriss, Sperren, Einstellungen, Protokoll |
| Service | einer | Reservierungen eintragen, ändern, Status, Tische zuweisen, Suche |

Die Standortbindung prüft der Server in jeder Route, nicht nur die Oberfläche.

## Funktionen

Tagesansicht (Kennzahlen, Auslastung, Status Angekommen/Fertig/Nicht erschienen/Storno, Tisch offen), Eintragen telefonisch und Laufkundschaft, Tischplan mit Belegung je Uhrzeit, Tisch zuweisen (auch Kombinationen), Grundriss Editor per Ziehen, Tischkombinationen, Sperren (Tag, Zeitfenster, Tisch), Einstellungen (Dauer, Puffer, Vorlauf, größte Online Gruppe, Öffnungszeiten je Wochentag), Suche, Protokoll, eigenes Passwort. Neue Online Reservierungen erscheinen alle 30 Sekunden von selbst.

## Regeln der Verfügbarkeit

Eine aktive Reservierung belegt je Tisch die 15 Minuten Felder von Beginn bis Ende plus Puffer (`reservierung_slots`, Primärschlüssel `tisch, datum, slot`). Doppelbuchungen scheitern deshalb in der Datenbank, auch bei gleichzeitigen Anfragen. Die Tischwahl nimmt den kleinsten passenden Tisch oder die kleinste erlaubte Kombination. Storno, Nicht erschienen und Abgeschlossen geben den Tisch frei. Letzte Reservierung = Schluss minus Dauer (Annahme, einstellbar).

## Öffentliche Routen (Website)

`GET /api/reservierung/konfig/`, `GET /api/reservierung/zeiten/`, `POST /api/reservierung/`. Die Tablet Vorschau auf der Startseite und den Standortseiten nutzt sie. Fällt die API aus, rechnet das Tablet mit Beispielzeiten und sagt das. Ohne Tische an einem Standort ist online nichts buchbar. Alle Serverrouten brauchen den abschließenden Schrägstrich (`trailingSlash: 'always'`).

## Sicherheit

PBKDF2 SHA 256 (100.000 Durchläufe, Grenze von Workers), Sitzung 8 Stunden als HttpOnly, SameSite Strict Cookie (in der Datenbank nur der Hash), Sperre nach 5 Fehlversuchen je Benutzername (30 s, verdoppelt sich bis 15 min), Origin und Kopfzeile `X-Yumini` bei allen Änderungen, `no-store` und `noindex` auf allen Backend Routen, ohne Sitzung nur 401. Spamschutz online: Honeypot, höchstens 3 künftige Reservierungen je Telefonnummer und Standort, Turnstile sobald `TURNSTILE_SECRET` gesetzt ist (Widget im Tablet fehlt noch). Es werden keine IP Adressen gespeichert.

## Noch offen

- Zwei Faktor Anmeldung (TOTP): Spalte `benutzer.totp_secret` ist vorbereitet.
- Mails (Bestätigung, Erinnerung, Storno Link für Gäste) mit Resend, Löschung nach 30 Tagen über einen Worker mit Zeitplan.
- Tische je Standort: Beispieltische sind erfunden. Echte Anzahl, Plätze, Kombinationen und Bereiche vom Inhaber (Frage 2 in `docs/plan.md`).
- Zum Livegang `TESTPHASE` in `wrangler.jsonc` auf `"false"` setzen.
- Die Sperre nach Fehlversuchen kann ein Konto bis 15 Minuten blockieren, wer den Benutzernamen kennt. Für die Testphase akzeptiert.
- Nicht geprüft: Safari, echte Tablets, Last.
