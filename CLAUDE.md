# Yumini Sushi & Grill

Neue Website für Yumini, Japanese Sushi & Grill, All you can eat mit fünf Standorten in Bochum,
Dortmund, Gelsenkirchen, Lüdenscheid und Siegen. Gebaut nach dem Plugin `webdesign-conversion`
(Repository `hennebergwebdesign/design-skill`): Regelwerk `webdesign-conversion`, Ablauf
`agentur-website-builder`.

## Stand

**Phase 3, Plan in Abstimmung, Prototyp der Startseite steht.** Auf ausdrückliche Anweisung des Inhabers
(Startseite zuerst bauen, provisorisch und ohne Funktion) ist die Startseite als Astro Prototyp gebaut,
vor der formalen Freigabe der Referenzen. Das ist ein Format Entwurf, keine Abnahme.

1. Der Plan steht in `docs/plan.md` (zweite Fassung nach der ersten Abstimmung). Er ist die Quelle
   für Seitenstruktur, Abschnitte, Reservierungssystem, Speisekarte, Karriere und Bauphasen.
2. Referenzen werden nach Tor 1 vorgelegt. Ohne Freigabe wird keine fremde Seite abgerufen.
   Register und Brief liegen in `.designrecherche/` (nicht im Git).
3. Gebaut wird in den acht Phasen aus `docs/plan.md`, Abschnitt 16. Der Pilot (Startseite mit Tablet und
   Reservierung auf Testdaten) ist als Prototyp vorgezogen, siehe Abschnitt Prototyp.

## Prototyp Startseite (Stand 20.10.2026)

Befehle: `npm install`, `npm run dev`, `npm run build`, `npm run preview`. Astro, statisch, kein Adapter,
ohne CSS Framework und ohne Skript. Schrift IBM Plex Sans über `@fontsource`, in den Build gebündelt.

| Datei | Zweck |
| --- | --- |
| `src/styles/tokens.css` | Designtokens, Werte ohne Quelle im Designsystem sind als „provisorisch" kommentiert |
| `src/layouts/Base.astro` | Kopf, Fuß, Sprite, `noindex` solange Prototyp |
| `src/components/sektionen/` | eine Datei je Abschnitt der Startseite, Reihenfolge in `src/pages/index.astro` |
| `src/components/ReservierungsTool.astro` | Vorschau des Tools mit Beispieldaten, nur Auswahl per Radiofelder, ohne Funktion |
| `src/components/ui/Sprite.astro` | gezeichnete Sushi Elemente als Platzhalter bis zum Shooting |
| `src/components/ui/Logo.astro` | Original `public/images/logo.svg` von yumini.de, nur auf dunklem Grund |
| `src/lib/bilder.ts` | alle Fotos zentral, über `astro:assets` optimiert (`src/assets/`) |
| `docs/quellen/` | Infopaket vom 20.10.2026 (Standorte, Texte, Marke der Bestandsseite), `src/data/menu/*.csv` Speisekarten je Standort |
| `src/lib/standorte.ts` | Adressen, Zeiten, Preise, Kinderpreise, Parken je Standort aus dem Infopaket |

Entscheidungen mit Grund:

1. Kopfzeile als frei stehende Pille, „Tisch reservieren" dort nur als Umriss, damit im Held genau ein rotes
   Flächenelement bleibt (der Hauptbutton). Der rote Kreis im Held ist getönt und mit Ring, nicht deckend.
2. Vertrauensband nach Vorbild des vom Inhaber gezeigten Bandes (Überschrift links, Siegel rechts, große
   Kennzahlen darunter). Bewertungswerte und Plattform Logos fehlen und stehen als `[[FEHLT]]`.
3. Zwei Stunden Ring und mobile Leiste laufen über CSS Scroll Zeitleisten. Die Zeitleiste steht in einer eigenen
   Regel, weil der Minifier sie sonst in die Kurzschreibweise von `animation` zieht, die Chrome ignoriert.
4. Alle Texte ohne Gedankenstriche, `hyphens: none`. Nichts erfunden: fehlende Preise, Zeiten, Stimmen,
   Angebote und Antworten sind als `[[FEHLT: …]]` sichtbar.
5. Die NRW Karte ist eine grobe Skizze, kein exakter Grenzverlauf, und im Bild so beschriftet.
6. Lumexx (`KatalogMockup.astro`, `Flipbook.astro`) ist privat und aus der Cloud Umgebung nicht lesbar. Das Mockup
   ist nach Beschreibung neu gezeichnet, das Flipbook (Phase 3) steht noch aus.

Bilder: Fotos und Gerichte stammen von yumini.de (Rechte beim Betreiber, Nutzung vom Inhaber freigegeben).
Restaurant, Gäste und Team gibt es noch nicht, sie bleiben `[[FEHLT]]`. Die Dekor Gerichte auf den Standortkarten
sind keine Fotos der Restaurants.

**Widersprüche zu klären (Daten der Bestandsseite gegen Entscheidungen vom 20.10.2026):**

1. Preise sind nicht an allen Standorten gleich (Abend Mo bis Do: 28,90 € bis 31,90 €, Lunch Fr bis So: 19,90 € bis 21,90 €).
2. Zeit am Tisch: Dortmund 2,5 Stunden, alle anderen 2 Stunden.
3. Gelsenkirchen hat Montag Ruhetag, Lüdenscheid mittags Mo bis Do geschlossen.
4. Bestandsseite: Sushi Menüs mit „Jetzt Bestellen" in Lüdenscheid und Siegen, Ziel unbekannt.
5. Gerichtenummern der Speisekarte unterscheiden sich je Standort wie erwartet, die Zahl der Gerichte auch (136 bis 138).
6. Marke: Logo SVG und Plan nennen `#d92129`, die Bestandsseite nutzt für Buttons `#DF5157`. Hier gilt `#d92129`.

**Stand 2 (20.10.2026, nach Rückmeldung des Inhabers):**

1. Kopfzeile: Logo groß links frei stehend, schmale Menüpille in der Mitte.
2. Held: „All you can eat" in Archivo, Drehteller mit dem Brett der Bestandsseite im roten Ring, fünf Schalen kreisen und bleiben aufrecht,
   darunter drei Bewertungs Widgets (Google, Trustpilot, Kolibri) mit Umriss Sternen. Werte fehlen, es gibt keinen eigenen Vertrauensabschnitt mehr.
3. Direkt unter dem Held das interaktive Tablet (`ReservierungsTool.astro`, Skript im selben Bauteil): Standort, Kalender (Gelsenkirchen Montag zu),
   Personen 1 bis 15 und „Mehr", Uhrzeit als Dropdown mit allen Zeiten (Mittag und Abend, Raster 15 Minuten), Bestätigung. Die Verfügbarkeit
   ist simuliert (`src/lib/zeiten.ts`), letzte Reservierung = Schluss minus Buffetdauer ist eine Annahme.
4. Standortseiten `/bochum/`, `/dortmund/`, `/gelsenkirchen/`, `/luedenscheid/`, `/siegen/` über `src/pages/[standort].astro`: eigener Held, Tablet mit
   vorgewähltem Standort, Preise, Speisekartennummern dieses Standorts (aus `src/data/menu/*.csv`), Anfahrt und Parken, FAQ, Links zu den anderen Orten.
5. SEO: `Restaurant` (mit Öffnungszeiten), `FAQPage`, `BreadcrumbList`, `Organization`, Canonical, Open Graph, Sitemap (`@astrojs/sitemap`), `robots.txt`.
   Solange der Prototyp läuft, steht alles auf `noindex`. Zum Livegang `PUBLIC_INDEXIEREN=true` setzen, dann öffnet sich auch `robots.txt`.
6. Keine Verläufe mehr (Wunsch des Inhabers). Bildhintergründe mit flacher Abdunklung, Schrift mit Foto Füllung (Abschnitte Einblicke und Abschluss).
   Weiße Abschnitte nur Preise und Fragen.
7. Speisekarte als Design in Claude Design: Artifact `https://claude.ai/artifact/HohNQPai61Gn3r9ze8MFZy` mit Umschlag, drei Doppelseiten (alle 136 Gerichte
   der Karte Bochum), Mockup für die Startseite. Offene Tippfehler der Bestandsseite wurden dort stillschweigend korrigiert (Garnelen statt Schrimps,
   Heilbutt, Spinat mit, Gebackene Klößchen). „Süßwasserschrimps" steht noch im Original. Allergene fehlen.
8. Nicht erreichbar von hier: Awwwards, Behance, Lapa Ninja, Unsplash (Bot Schutz). Referenzen dieser Runde: haven-annecy.fr (Wortmarke mit Foto Füllung),
   mrspringmrsfresh.com (Markenschrift, Stempel). Nur Aufbau und Idee übernommen, nichts kopiert.

**Stand 3 (20.10.2026): Speisekarten je Standort.** Die Karten der fünf Standorte unterscheiden sich nicht nur in den Nummern, Dortmund hat über 40
eigene Gerichte, Lüdenscheid und Siegen weitere. Deshalb gibt es `/speisekarte/` (Standortwahl) und `/speisekarte/<standort>/` mit allen Gerichten als
Fotokarten (Filter Alle, Dinner Only, Sushi, Warm Dishes, Salate/Suppen/Nudeln/Reis, Dessert, Saucen, Schalter „Außer Haus" für Preise, reines CSS),
dazu `Menu` Auszeichnung. Datenquelle `src/data/speisekarte.json` mit Fotos in `public/images/speisekarte/` (214 WebP, 420 px). Die Kategorien sind per
Stichwort abgeleitet und gehören stichprobenartig geprüft. 24 neue Gerichte in Lüdenscheid und Siegen haben kein Foto. Die Fotos enthalten teils eingebrannte
Siegel „Vegetarisch" und „Vegan", die nicht geprüft sind. Die Rohdaten (CSV) liegen in der Git Historie (Commit e9418d4), das Erzeugungsskript nicht im Repository.

**Stand 4 (20.10.2026): Mockup, Karriere, Feiern, Bilder, Bewertungen.**

1. Speisekarten Mockup `src/components/ui/KatalogMockup.astro`: aufgeschlagene Karte mit echten Gerichten (Bochum) und geschlossenes Exemplar mit Lesebändchen, nur HTML und CSS, skaliert mit `cqw`. Die gedruckte Karte aus Claude Design ersetzt später nur den Inhalt.
2. `/karriere/` komplett: Held, Funnel in fünf Schritten (Standort, Bereich, Erfahrung, Eintritt, Kontakt, ohne Lebenslauf), sechs Stellenanzeigen (`src/lib/karriere.ts`, Auf Stelle bewerben springt vorbelegt in den Funnel), Vorteile, Ablauf eines Dienstes, Team Platzhalter, Ablauf nach der Bewerbung, Fragen. Ansprache „du" ist ein Entwurf (offen). Stellen, Konditionen und Zeiten sind erfunden und als `[[FEHLT]]` markiert, deshalb noch keine `JobPosting` Auszeichnung. Der Funnel überträgt nichts (Prototyp).
3. `/feiern/` mit Platzhaltertexten für Geburtstag, Firmenfeier und Gruppen und einer Anfrage (überträgt nichts). Dieselben Texte stehen im Abschnitt Feiern der Startseite.
4. Raumbilder: Unsplash Symbolbilder (`src/assets/raeume/`, `raeume` in `bilder.ts`), auf Wunsch des Inhabers statt Platzhalter, im Bild als „Symbolbild" beschriftet. Es sind KEINE Aufnahmen der Standorte, echte Fotos von Google Maps oder der Bestandsseite waren nicht erreichbar. Wird nach dem Shooting je Standort ersetzt. Eingebaut im Abschnitt Einblicke und als Abschnitt „Im Lokal" auf den Standortseiten.
5. Bewertungen: Kolibri entfernt. Google und Trustpilot mit Logo (Simple Icons) und gefüllten Sternen, Werte in `src/lib/bewertungen.ts`. Google 4,4 aus 1.927 Bewertungen ist VORLÄUFIG (Quelle reviewhero.io, nicht gegen die Google Profile geprüft). Trustpilot hat keinen belegten Wert und bleibt `[[FEHLT]]`.

**Stand 5 (20.10.2026): Karriereseite überarbeitet.** Headline in zwei Zeilen, Kennzahlen als große Glaskacheln rechts im Held, Stellen als Bildkarten zum Aufklappen (Bild je Bereich, Raumbilder als Symbolbild gekennzeichnet), sechs Vorteile in drei Spalten mit eigenen Icons (`src/components/ui/KarriereIcon.astro`), Glas Kacheln (`backdrop-filter`) auf flach abgedunkelten Bildgründen, Team mit Bereichsfotos statt Personen (Namen und Fotos `[[FEHLT]]`), Ablauf als Zeitleiste mit CSS Scroll Zeitleisten, CTAs nach jedem Abschnitt. Der Bewerbungsfunnel steht jetzt als letzter Abschnitt vor dem Fuß. Geprüft: Build grün, Chromium 1440 und 390 px, keine Konsolenfehler, kein horizontales Scrollen.

**Stand 6 (20.10.2026): Karriere und Kopfzeile.** Held auf 100 % Höhe mit Platz für ein späteres Video (Kommentar und `.hvideo` Regel in `karriere/index.astro`, Hinweis `[[FEHLT: Video]]`), Auftrittsanimation und hochzählende Kennzahlen, Lesefortschritt oben. Offene Stellen auf dunklem Grund, Bilder überall als kleine Vorschau (17 rem Desktop, 6,5 rem Mobil). Vorteile mit Hintergrundbild `halle`. „Nach deiner Bewerbung" hell, Linie verbindet nur die Punkte 1 bis 4 und füllt sich beim Scrollen. Kopfzeile: Home Button und Dropdown „Standorte" mit den fünf Standortseiten (Hover und Tastatur, mobil als Unterliste). Geprüft: Build grün, Chromium 1440, 820 und 390 px, keine Konsolenfehler, kein horizontales Scrollen.

**Stand 7 (20.10.2026): Responsive Überarbeitung.** Alles in rem, die Wurzelgröße steigt auf großen Bildschirmen stufenweise (`global.css`: 106 % ab 1600 px, 119 % ab 1920 px, 150 % ab 2560 px, 225 % ab 3840 px), fließende Schriftgrößen als Tokens `--fs-*`. Abschnitte Held, Reservierung, So funktioniert, Auswahl, Preise, Feiern, Einblicke (und auf Standort-, Feiern- und Karriereseiten Held, Reservierung, Bewerbung) füllen mit `.fullh` mindestens die Bildschirmhöhe (`100svh`), Inhalt wächst bei kleinen Displays mit. Das Tablet hat eine kompakte Variante für Höhen unter 72 rem. Menü: Pfeil bricht nicht mehr um, Umschaltung zum Handymenü ab 68 rem. Einblend Animationen über `data-reveal` (Skript in `Base.astro`, aus mit `autoReveal={false}`, Karriere hat eigene), Standorte mit Scroll Hervorhebung des Kartenpunkts. Bewertungen als durchlaufendes Google Band (`src/data/google-bewertungen.json`): nur 4 echte Stimmen aus Bochum (2023, Quelle ReviewHero), die anderen Standorte als `[[FEHLT]]`, keine Zitate erfunden. Karriere Band auf der Startseite mit Foto und Bereichskacheln, Bewerbungsfunnel mittig. Geprüft in Chromium von 320 bis 1920 px Breite, kein horizontales Scrollen, keine Konsolenfehler. Nicht geprüft: Safari und echte Geräte.

Noch nicht geprüft: Kontrastwerte für Weiß auf `brand-red`, Lighthouse, Tastaturdurchlauf, Browser außer Chromium.

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
| Schrift | IBM Plex Sans, selbst gehostet, Schnitte 300, 400, 500, 600. Überschriften in Archivo Expanded 800 bis 900 (nahe an der Wortmarke), auf Wunsch des Inhabers (20.10.2026) |
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
4. Logo für hellen Grund und Signet einzeln beim Kunden anfragen (Original SVG für dunklen Grund liegt vor).
6. Bewertungen: keine belegten Werte, Google Place IDs und Profile fehlen.
7. Awards Recherche: Awwwards, Behance, Lapa Ninja sind aus der Cloud Umgebung nicht erreichbar, die Chrome Erweiterung läuft nur auf dem Rechner des Nutzers. Screenshots oder Links kommen vom Nutzer.
5. Speisekarte als PDF aus Claude Design für das Flipbook.

## Änderungsverlauf

1. **20.10.2026** Projekt angelegt, Designsystem gelesen, erste Fassung des Plans im Chat vorgelegt.
2. **20.10.2026** Antworten des Inhabers eingearbeitet, Plan als `docs/plan.md` angelegt,
   `.gitignore` mit den Arbeitsordnern der Agenturwerkzeuge, Designrecherche-Brief angelegt,
   Referenzkandidaten werden vorgelegt.
3. **20.10.2026** Prototyp der Startseite in Astro gebaut (14 Abschnitte, Tablet mit Reservierungsvorschau,
   Standortkarten mit NRW Skizze). Geprüft: Build grün, Chromium Durchlauf auf 1440 und 390 px, keine Konsolenfehler,
   kein horizontales Scrollen. Weitere Referenzen noch nicht erfasst.
4. **20.10.2026** Infopaket der Bestandsseite eingearbeitet: echte Preise, Zeiten, Kinderpreise, Parken, Original Logo,
   echte Fotos (Nigiri Platte, Kategorien, freigestellte Gerichte). Held mit Foto im Kreis, Preise je Standort als Tabs,
   Speisekarten Favoriten, Auswahl Kacheln statt erfundener Angebote, FAQ mit belegten Antworten. Geprüft: Build grün,
   Chromium auf 1440 und 390 px, keine Konsolenfehler, kein horizontales Scrollen.
5. **20.10.2026** Zweite Runde: Kopfzeile, Drehteller Held, interaktives Tablet, Standortseiten mit SEO, Archivo Überschriften, keine Verläufe,
   Speisekarte in Claude Design. Geprüft: Build grün (6 Seiten), Chromium auf 1440 und 390 px, Tablet Durchlauf mit Eingaben,
   keine Konsolenfehler, kein horizontales Scrollen.
6. **20.10.2026** Dritte Runde: Speisekarten Mockup, Karriereseite mit Funnel, Feiern Seite, Symbolbilder Gastraum, Bewertungen Google und Trustpilot. Geprüft: Build grün (14 Seiten), Chromium 1440 und 390 px, Funnel durchgespielt, keine Konsolenfehler, kein horizontales Scrollen.
