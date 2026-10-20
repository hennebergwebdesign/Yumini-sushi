# Yumini Sushi & Grill

Neue Website für Yumini, Japanese Sushi & Grill, All you can eat mit fünf Standorten in Bochum,
Dortmund, Gelsenkirchen, Lüdenscheid und Siegen. Gebaut nach dem Plugin `webdesign-conversion`
(Repository `hennebergwebdesign/design-skill`): Regelwerk `webdesign-conversion`, Ablauf
`agentur-website-builder`.

## Stand

**Phase 3, Umsetzungsplan und Referenzen in Abstimmung.** Es ist noch kein Code gebaut.

1. Der Plan steht in `docs/plan.md` (zweite Fassung nach der ersten Abstimmung). Er ist die Quelle
   für Seitenstruktur, Abschnitte, Reservierungssystem, Speisekarte, Karriere und Bauphasen.
2. Referenzen werden nach Tor 1 vorgelegt. Ohne Freigabe wird keine fremde Seite abgerufen.
   Register und Brief liegen in `.designrecherche/` (nicht im Git).
3. Gebaut wird erst nach Freigabe von Plan und Referenzen, in den acht Phasen aus `docs/plan.md`,
   Abschnitt 16. Zuerst ein Pilot: Startseite mit Tablet und Reservierung auf Testdaten.

## Kunde und Ziel

| Punkt | Stand |
| --- | --- |
| Projektart | Homepage für alle Standorte, Reservierungssystem mit Tischplan und Dashboard, Karriere Landingpage mit Funnel |
| Primäre Handlung | Tisch reservieren |
| Zweite Handlung | Speisekarte ansehen |
| Ansprache | Sie (Karriere noch offen) |
| Domain | yumini.de bleibt und ist das Canonical, mit oder ohne www noch zu bestätigen |
| Bestandsseite | yumini.de mit Standortseiten wie `/gelsenkirchen`, aus der Cloud Umgebung nicht abrufbar (DNS und Proxy gesperrt), Inventar steht aus |

## Entscheidungen des Inhabers (20.10.2026)

1. Vertrauen schon im Heldenbereich: Bewertungen von Google, Trustpilot und Kolibri mit Logos.
2. Reservierung mit echter Verfügbarkeit, Tischplan und Dashboard. Zeitfenster 15 Minuten,
   1 bis 15 Personen nach Verfügbarkeit plus Plusfunktion, jeder Standort bekommt nur seine
   Reservierungen.
3. Preise an allen Standorten gleich. Getränke nicht inklusive.
4. Speisekarte an allen Standorten gleich, nur die Nummern unterscheiden sich je Standort.
   Gerichte mit „Dinner Only" nur abends und so markiert.
5. Bilder: kaum eigene Fotos, Shooting folgt. Bis dahin Stock oder Platzhalter. Gäste, Team und
   Karriere nie als Stock (Regel gegen erfundene Belege).
6. Rechtstexte liefert der Inhaber, bis dahin Platzhalter.
7. Zusätzlich Abschnitt Feiern und eigene Karriere Landingpage mit Auswahlfunnel.
8. Speisekarte auf der Startseite als Mockup nach `KatalogMockup.astro` aus
   `Thatsitmarketing/lumexx`, dazu ein Flipbook nach `Flipbook.astro` aus demselben Projekt.
   Die gedruckte Karte gestaltet der Inhaber in Claude Design, das Flipbook wird vorher mit
   Platzhalterseiten gebaut.
9. Tablet Mockup im Querformat, gerade, wegen der Bedienbarkeit.

## Stack (geplant)

Astro auf Cloudflare Pages, Serverlogik als Pages Functions (wie bei Lumexx, ohne Workers
Adapter), Reservierungen in Cloudflare D1, Mails über Resend, Spamschutz Turnstile. Zeitgesteuerte
Aufgaben (Erinnerungsmails, Löschung) brauchen einen kleinen eigenen Worker, weil Pages keine
geplanten Aufträge kann.

## Designsystem

Quelle ist das Designsystem „Yumini" in Claude Design (Artifact `6PyPFBPNPzZGqYqTrNgEx2`, Version 2,
20.10.2026), ausgelesen von der Bestandsseite und auf WCAG AA überarbeitet. Es gilt als Kundenmaterial
(Stufe 1 nach `24-designsystem-vorrang.md`), Referenzen dürfen nur Aufbau und Komposition beeinflussen.

| Bereich | Festlegung |
| --- | --- |
| Theme | dunkel primär (`black` #030504), hell für Inhaltssektionen |
| Aktion | `brand-red` #d92129, Hover `red-deep` #b81b22, ein rotes Flächenelement je Bildschirm |
| Akzent | `coral-soft` auf dunkel, `brand-red` auf hell |
| Schrift | IBM Plex Sans, selbst gehostet, Schnitte 300, 400, 500, 600 |
| Signatur | Standortname in 500, darunter „Japanese Sushi & Grill" in 300, gleiche Größe |
| Logo | Original SVG, nur auf dunklem Grund. Helle Variante und Signet einzeln fehlen |
| Logoelement | roter Kreis hinter dem M als Motiv: Held, Zwei Stunden Ring, Kartenpunkte, Auswahl im Tool |

## Standorte (aus dem Fuß der Bestandsseite)

| Standort | Adresse | Telefon | Mail |
| --- | --- | --- | --- |
| Bochum | Viktoria Straße 43 bis 45, 44787 Bochum | 0234 927 26 123 | bochum@yumini.de |
| Dortmund | Stubengasse 8, 44135 Dortmund | 0231 533 065 88 | dortmund@yumini.de |
| Gelsenkirchen | Willy-Brandt-Allee 54, 45891 Gelsenkirchen | 0209 3807829 | gelsenkirchen@yumini.de |
| Lüdenscheid | Humboldtstraße 36, 58511 Lüdenscheid, eigene Parkplätze | 02351 8940039 | luedenscheid@yumini.de |
| Siegen | Koblenzer Straße 18, 57072 Siegen | 0271 317 606 50 | siegen@yumini.de |

Schreibweise so wie auf der Bestandsseite. Eine vereinheitlichte Fassung liegt zur Abstimmung in
`docs/plan.md`, Abschnitt 14, und muss mit den Google Unternehmensprofilen übereinstimmen.

## Seitenstruktur (Entwurf)

Vollständig in `docs/plan.md`, Abschnitt 5: Startseite, Speisekarte mit Flipbook, fünf Standortseiten
mit den alten Pfaden, Reservieren, Reservierung ansehen und stornieren, Karriere, Dashboard `/team/`,
Rechtstexte, 404.

## Offene Punkte

1. Antworten auf die 17 Fragen in `docs/plan.md`, Abschnitt 17.
2. Referenzen freigeben (Tor 1).
3. Inventar der Bestandsseite, sobald ein Zugang oder Export besteht.
4. Logo für hellen Grund und Signet einzeln beim Kunden anfragen.
5. Speisekarte als PDF aus Claude Design für das Flipbook.

## Änderungsverlauf

1. **20.10.2026** Projekt angelegt, Designsystem gelesen, erste Fassung des Plans im Chat vorgelegt.
2. **20.10.2026** Antworten des Inhabers eingearbeitet, Plan als `docs/plan.md` angelegt,
   `.gitignore` mit den Arbeitsordnern der Agenturwerkzeuge, Designrecherche-Brief angelegt,
   Referenzkandidaten werden vorgelegt.
