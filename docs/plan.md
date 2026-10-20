# Umsetzungsplan Yumini

Stand 20.10.2026, zweite Fassung nach der ersten Abstimmung mit dem Inhaber. Noch nicht freigegeben.
Gebaut wird erst, wenn dieser Plan und die Referenzen freigegeben sind.

## Inhalt

1. Ziel, Belege, Erkenntnis
2. Entscheidungen aus der ersten Abstimmung
3. Lesart und Regler
4. Designsystem und Logo
5. Seitenstruktur
6. Startseite, Abschnitt für Abschnitt
7. Unterseiten
8. Reservierungssystem mit Tischplan und Dashboard
9. Speisekarte, Mockup und Flipbook
10. Karriere mit Auswahlfunnel
11. Bewertungen und Vertrauen
12. Bilder
13. Consent, Dienste, Recht
14. SEO und lokale Sichtbarkeit
15. Zielkonflikte und wie sie gelöst sind
16. Bauphasen
17. Offene Fragen
18. Offene Punkte und Platzhalter

## 1. Ziel, Belege, Erkenntnis

| Punkt | Satz |
| --- | --- |
| Ziel | Mehr Tische, die online reserviert werden, an allen fünf Standorten, und weniger Anrufe für Standardreservierungen. |
| Belege | Bewertungen auf Google, Trustpilot und weiteren Portalen; über 100 Speisen als All you can eat; fünf Standorte in NRW. |
| Erkenntnis | Wer All you can eat sucht, will drei Dinge schnell wissen: was es kostet, wie es funktioniert und ob heute Abend noch ein Tisch frei ist. Die Seite beantwortet alle drei, bevor jemand scrollen muss. |

## 2. Entscheidungen aus der ersten Abstimmung

| Thema | Entscheidung |
| --- | --- |
| Projektart | Homepage für alle Standorte, dazu Reservierungssystem und Karriere Landingpage |
| Primäre Handlung | Tisch reservieren |
| Vertrauen | Bewertungen von Google und Trustpilot (Kolibri entfällt, Entscheidung 20.10.2026) mit Logos schon im Heldenbereich |
| Reservierung | echte Verfügbarkeit, Tischplan, Dashboard für die Mitarbeiter |
| Zeitfenster | alle 15 Minuten |
| Personen | 1 bis 15 online nach Verfügbarkeit, darüber eine Plusfunktion. Realistisch liegt die Grenze meist bei 10 |
| Empfänger | jeder Standort bekommt nur seine eigenen Reservierungen |
| Preise | an allen Standorten gleich |
| Speisekarte | an allen Standorten dieselben Gerichte, nur die Nummern unterscheiden sich je Standort. Gerichte mit „Dinner Only" nur abends |
| Getränke | nicht inklusive, All you can eat gilt nur für Speisen |
| Bilder | kaum eigene Fotos, ein Shooting folgt. Bis dahin Stockbilder oder Platzhalter |
| Rechtstexte | kommen vom Inhaber, bis dahin Platzhalter |
| Zusätzlich | Abschnitt Feiern, eigene Karriere Landingpage mit kleinem Auswahlfunnel |
| Domain | yumini.de bleibt, ist auch das Canonical |
| Speisekarte auf der Startseite | als Mockup wie im Projekt Lumexx (`KatalogMockup.astro`), dazu ein Flipbook. Die gedruckte Karte gestaltet der Inhaber in Claude Design, das Flipbook wird vorher als Funktion gebaut |
| Tablet Mockup | Querformat, gerade, damit das Tool gut bedienbar ist |

## 3. Lesart und Regler

**Lesart in einem Satz:** Ein Abend im Yumini fühlt sich an wie gutes Essen im Dunkeln mit einem Scheinwerfer drauf: schwarz, ruhig, ein roter Punkt, und das Essen ist der Star.

| Regler | Wert | Grund |
| --- | --- | --- |
| Varianz | 6 | Food braucht große, angeschnittene Bilder und versetzte Kompositionen, die Regeln und Preise brauchen ruhige Raster |
| Bewegung | 4 | Gastronomie: dezente Bewegung, ein orchestrierter Moment beim Laden, dazu der Zwei Stunden Ring. Kein 3D, keine Scrollvideos (Kapitel 38 des Regelwerks) |
| Dichte | 4 | normale Unternehmensseite, viele Informationen (Preise, Zeiten, Standorte), aber großzügige Abstände wie im Designsystem gefordert |

## 4. Designsystem und Logo

Quelle ist das Designsystem „Yumini" Version 2 in Claude Design. Es ist Kundenmaterial und hat Vorrang vor jeder Referenz. Referenzen beeinflussen nur Aufbau, Komposition und Interaktion.

| Bereich | Festlegung |
| --- | --- |
| Theme | dunkel primär (`black`), helle Sektionen nur für Inhalt mit viel Text (Preise, Fragen) |
| Rot | genau ein rotes Flächenelement je Bildschirm, meist „Tisch reservieren" |
| Schrift | IBM Plex Sans, selbst gehostet, 300, 400, 500, 600 |
| Signatur | Ortsname in 500, darunter „Japanese Sushi & Grill" in 300, gleiche Größe |
| Radien | 4, 8, 12, 16 px. Standortkarten 12, Dialoge 16 |
| Buttons | 48 px hoch, Primär `action`, Sekundär Rahmen in `border` |

**Element aus dem Logo, der rote Kreis hinter dem M:**

1. Im Heldenbereich als großer Kreis hinter einem Teller, so wie Kreis und M im Logo.
2. Als Zwei Stunden Ring: der Kreis wird zur Uhr und füllt sich beim Scrollen. Das ist die Sektion, die nur für Yumini gebaut wird (harte Grenze „eigene Handschrift").
3. Als roter Punkt je Stadt auf der selbst gezeichneten NRW Karte.
4. Im Reservierungstool als Markierung des gewählten Tages und der gewählten Uhrzeit.
5. Das rote „&" aus SUSHI & GRILL an genau einer Stelle als typografischer Akzent.

## 5. Seitenstruktur

| Pfad | Zweck | Index |
| --- | --- | --- |
| `/` | Startseite | ja |
| `/speisekarte/` | Online Speisekarte mit Standortwahl für die Nummern | ja |
| `/speisekarte/blaettern/` | Flipbook als teilbarer Link (Prinzip `/katalog/<id>/` aus Lumexx) | nein |
| `/bochum/`, `/dortmund/`, `/gelsenkirchen/`, `/luedenscheid/`, `/siegen/` | Standortseiten, Pfade wie auf der Bestandsseite | ja |
| `/reservieren/` | Reservierungstool als eigene Seite, `?standort=` wählt vor | ja |
| `/reservierung/<code>/` | Reservierung ansehen oder stornieren, Link aus der Bestätigungsmail | nein |
| `/karriere/` | Karriere Landingpage mit Auswahlfunnel, ohne Hauptnavigation | ja |
| `/karriere/danke/` | Bestätigung nach der Bewerbung | nein |
| `/team/` | Dashboard für die Mitarbeiter, Anmeldung nötig | nein, dreifach gesperrt |
| `/impressum/`, `/datenschutz/`, `/datenschutz-bewerbung/` | Rechtstexte, bis zur Lieferung Platzhalter | nein |
| 404 | eigene Seite mit Standorten und Reservierung | nein |

Navigation: Speisekarte, Standorte, Angebote, Feiern, Karriere. Rechts „Tisch reservieren". Auf dem Handy bleibt ab dem Ende des Heldenbereichs eine Leiste mit „Tisch reservieren" unten stehen.

## 6. Startseite, Abschnitt für Abschnitt

| # | Abschnitt | Inhalt | Handlung |
| --- | --- | --- | --- |
| 0 | Kopfzeile | Logo, Navigation, „Tisch reservieren" | Tisch reservieren |
| 1 | Held, volle Bildschirmhöhe | Foto mit Sushi, roter Kreis aus dem Logo, „Yumini" in 500 und „Japanese Sushi & Grill" in 300. Eine Zeile zum Angebot (All you can eat, 2 Stunden, 5 Standorte). **Vertrauen direkt unter den Buttons:** Logos von Google und Trustpilot mit Sternewert, Anzahl und Stand | Tisch reservieren, Speisekarte ansehen |
| 2 | So funktioniert All you can eat | Zwei Stunden Ring, drei Schritte: Platz nehmen, am Tablet bestellen (6 Speisen je Runde mittags, 5 abends, je Person), zwei Stunden genießen. Preise Mittag, Abend, Wochenende, Kinder. Hinweis zu Resten (1,00 € je Stück Sushi und Salat, 2,00 € je warmes Gericht, Erlös wird gespendet). Getränke nicht inklusive | Preise im Detail |
| 3 | Standorte | fünf Karten mit Foto, Adresse, Telefon, heutigen Öffnungszeiten, „Jetzt geöffnet". Daneben die NRW Karte mit fünf roten Punkten, Hover über eine Karte lässt ihren Punkt aufleuchten. Keine Google Maps, also kein Consent nötig | Hier reservieren, Route |
| 4 | Reservierung im Tablet | Tablet im Querformat, gerade, darin das echte Tool (Abschnitt 8). Auf dem Handy fällt der Rahmen weg, das Tool nimmt die volle Breite | Tisch reservieren |
| 5 | Speisekarte | Mockup wie Lumexx: aufgeschlagene Karte, darauf schräg die Titelseite, auf Schiefer. Daneben Kategorien und vier Lieblingsgerichte | Speisekarte ansehen, Karte durchblättern |
| 6 | Angebote | drei bis vier Karten mit echten Angeboten des Inhabers | je Angebot |
| 7 | Feiern und Gruppen | Geburtstag, Firmenfeier, Gruppen ab 16 Personen. Bild, drei Punkte, Anfrage geht an den gewählten Standort | Feier anfragen |
| 8 | Einblicke | Bildstrecke: Gäste beim Essen, Sushitheke, Grill, Räume | keine |
| 9 | Bewertungen | Stimmen von Google je Standort, Gesamtwert je Plattform mit Stand und Link zum Profil | Alle Bewertungen |
| 10 | Karriere | schmales Band: „Wir suchen Verstärkung an allen Standorten" | Jobs ansehen |
| 11 | Fragen | Kinder, Allergene, vegetarisch, Dinner Only, Getränke, Gruppen, Reservierung nötig, Parken. Mit `FAQPage` Auszeichnung | keine |
| 12 | Abschluss | „Ihr Tisch wartet" mit Standortwahl | Tisch reservieren |
| 13 | Fuß | alle fünf Standorte mit Adresse, Telefon, Mail, Öffnungszeiten, Rechtliches, Cookie Einstellungen | |

Regelwerk dazu: höchstens eine kleine Zeile über einer Überschrift (Eyebrow) je drei Abschnitte, höchstens ein Laufband auf der Seite (geplant: keins), Kacheln und Karten mit Hover.

## 7. Unterseiten

**Standortseite (je Stadt):** Held mit Foto des Restaurants und Ortsname in der Signatur, Reservierung mit vorgewähltem Standort, Adresse, Anfahrt mit Parken (Lüdenscheid: eigene Parkplätze), Öffnungszeiten, Preise, Bewertungen dieses Standorts, Einblicke, Fragen. Jede Seite bekommt eigenen Text, keinen Austauschtext mit anderem Ortsnamen (Kapitel 46).

**Speisekarte:** siehe Abschnitt 9.

**Reservieren:** das Tool aus Abschnitt 8 ohne Tabletrahmen, darunter die Regeln und die Kontaktwege der Standorte.

**Karriere:** siehe Abschnitt 10.

## 8. Reservierungssystem mit Tischplan und Dashboard

Eigenbau, kein fremder Dienst. Daten liegen in Cloudflare D1, die Logik in Cloudflare Pages Functions (wie bei Lumexx, ohne Workers Adapter), Mails über Resend.

### Ablauf für den Gast

1. Standort (vorgewählt, wenn man von einer Standortkarte oder Standortseite kommt)
2. Datum im Kalender, geschlossene Tage gesperrt
3. Personen 1 bis 15, dazu „Mehr als 15" (führt in die Feieranfrage)
4. Uhrzeit im 15 Minuten Raster. Nicht verfügbare Zeiten bleiben sichtbar, aber gesperrt und mit „ausgebucht" beschriftet, damit klar ist, dass es nicht am Tool liegt
5. Name, Telefon, Mail, Anmerkung (Kinderstuhl, Geburtstag), Datenschutzhinweis
6. Bestätigung im Tablet, Mail an den Gast mit Link zum Stornieren, Mail an den Standort

### Verfügbarkeit

| Regel | Vorschlag |
| --- | --- |
| Dauer einer Reservierung | 2 Stunden, wie das All you can eat |
| Puffer danach | 15 Minuten zum Abräumen und Eindecken |
| Zeitraster | 15 Minuten |
| Letzte Reservierung | zwei Stunden vor Schluss |
| Tischwahl | das System sucht den kleinsten passenden Tisch, bei Gruppen eine erlaubte Tischkombination |
| Doppelbuchung | ausgeschlossen: jede Buchung belegt je Tisch alle 15 Minuten Felder ihrer Dauer, die Datenbank lässt jedes Feld nur einmal zu. Zwei gleichzeitige Buchungen auf denselben Tisch scheitern dann zwangsläufig an einer davon, die andere bekommt sofort neue Zeiten angezeigt |

### Dashboard unter `/team/`

| Funktion | Inhalt |
| --- | --- |
| Anmeldung | je Standort ein Zugang, der nur diesen Standort sieht, dazu ein Zugang für die Leitung mit allen Standorten. Passwort nur als Hash, Sitzung acht Stunden, Wartezeit nach Fehlversuchen |
| Tagesansicht | Zeitachse des Tages mit allen Reservierungen, Personen, Tisch, Anmerkung |
| Tischplan | Grundriss mit Tischen, Belegung zur gewählten Uhrzeit, freie Tische hell, belegte mit Namen |
| Eintragen | telefonische Reservierung und Laufkundschaft direkt eintragen, damit online nichts doppelt vergeben wird |
| Status | bestätigt, angekommen, nicht erschienen, storniert |
| Sperren | einzelne Zeiten, Tische oder ganze Tage sperren (Feier, Ruhetag, Personalengpass) |
| Einstellungen | Öffnungszeiten, Sondertage, Tische und Kombinationen je Standort |

Bewusst nicht im ersten Schritt: Auswertungen, Anzahlungen, SMS. Das kann später kommen.

### Datenschutz

Reservierungen werden gespeichert. Deshalb: Hinweis im Formular, Löschung nach Vorschlag 30 Tagen nach dem Besuch, keine IP Adressen. Erinnerungsmails und Löschung brauchen einen geplanten Auftrag, den Pages nicht kann: dafür ein kleiner eigener Worker mit Zeitplan. Auftragsverarbeitung mit Cloudflare und Resend. Die Sicherheitsprüfung aus dem Bauablauf (`sicherheitspruefung.md`) läuft auf allen Routen, besonders: Dashboard Routen ohne Sitzung dürfen nichts liefern.

## 9. Speisekarte, Mockup und Flipbook

**Datenquelle:** eine Datei `src/data/speisekarte.json`. Jedes Gericht steht einmal, mit Kategorie, Name, Beschreibung, Allergenen und Zusatzstoffen, „Dinner Only", vegetarisch und scharf, Foto. Die Nummer steht je Standort am Gericht, weil sich nur die Nummern unterscheiden.

**Seite `/speisekarte/`:** oben die Regeln des All you can eat, darunter eine Standortwahl (die Nummern passen dann zum Tablet im Restaurant), feste Kategorienleiste, Filter (vegetarisch, scharf, ohne Dinner Only), Kennzeichnung „Dinner Only", Legende für Allergene und Zusatzstoffe. Getränke als eigene Kategorie mit Hinweis, dass sie nicht inklusive sind.

**Mockup auf der Startseite:** nach `KatalogMockup.astro` aus Lumexx: aufgeschlagene Doppelseite, darauf schräg die Titelseite, hier auf Schiefer statt auf Grau. Bis die Karte aus Claude Design da ist, mit einer gesetzten Platzhalterkarte aus der Datenquelle.

**Flipbook:** Prinzip aus Lumexx (`Flipbook.astro`, natives `<dialog>`, keine fremde Bibliothek): Seiten als WebP aus dem PDF gerendert, Doppelseiten mit umblätternder Seite, auf dem Handy Einzelseiten zum Wischen, Inhalt nach Kategorien, Zoom, Vollbild, PDF Download, Tastatur, teilbarer Link. Gebaut wird es jetzt mit Platzhalterseiten, die echte Karte wird später nur ausgetauscht.

## 10. Karriere mit Auswahlfunnel

Eigene Landingpage nach dem Playbook für Recruiting: ohne Hauptnavigation, ein Handlungstext auf der ganzen Seite („In 2 Minuten bewerben"), mobil zuerst.

| # | Abschnitt |
| --- | --- |
| 1 | Held mit echtem Arbeitsplatz, Versprechen, Button |
| 2 | Funnel: Standort, Bereich (Küche, Sushi, Grill, Service, Theke, Aushilfe), Erfahrung, ab wann, Kontakt mit drei Feldern, kein Lebenslauf nötig |
| 3 | Was Sie oder du bekommst, jeder Punkt prüfbar |
| 4 | Ein Tag bei Yumini, konkret mit Uhrzeiten |
| 5 | Team mit Gesichtern und Namen |
| 6 | Ablauf nach der Bewerbung mit Zeitangaben |
| 7 | Fragen |

Bewerbungen gehen per Mail an den gewählten Standort oder zentral (offene Frage). Eigene Datenschutzhinweise für Bewerber, Auszeichnung `JobPosting` je offener Stelle, Bewerberdaten in keiner Statistik.

## 11. Bewertungen und Vertrauen

| Plattform | Weg |
| --- | --- |
| Google | serverseitig über die Places API mit Cache (Agenturstandard), je Standort eine Place ID, Stand des Abrufs sichtbar |
| Trustpilot | ohne fremdes Skript: Wert und Anzahl über die Schnittstelle, falls das Trustpilot Konto sie anbietet, sonst von Hand gepflegt mit Stand. Das Trustpilot Widget wäre ein fremdes Skript und bräuchte Consent |
| Kolibri | Plattform noch zu klären, Wert von Hand mit Stand |

Logos der Plattformen als Original SVG nach deren Markenrichtlinien, nie als getippter Text. Werte nur echt und mit Datum, nie gerundet nach oben. Ein Gesamtwert über alle Standorte wird als Durchschnitt aus der Anzahl gewichtet und so beschriftet.

## 12. Bilder

Bis zum Shooting: lizenzfreie Stockbilder (Lizenz geprüft und in `public/images/BILDER.md` festgehalten) für Food, Räume und Stimmung, Platzhalter im richtigen Format für alles, was echt sein muss. Vor dem Livegang wird jedes Stockbild ersetzt oder bewusst freigegeben.

Was nie Stock wird: Gäste von Yumini, Team, Karriereseite, Räume einer bestimmten Filiale. Dort stehen Platzhalter mit `[[FEHLT: …]]`, weil ein Stockfoto dort etwas zeigen würde, das es so nicht gibt.

Für das Shooting gibt es eine Bildliste je Abschnitt mit Format und Mindestbreite (`BILDER.md`).

## 13. Consent, Dienste, Recht

| Dienst | Zweck | Consent |
| --- | --- | --- |
| Cloudflare Pages, D1, Turnstile | Auslieferung, Reservierungen, Spamschutz | nein, notwendig |
| Resend | Mails zu Reservierung, Feier, Bewerbung | nein, notwendig |
| Google Places API | Bewertungen, nur serverseitig | nein |
| Karte | eigene SVG Karte, Route als Link | nein |
| Statistik | noch offen | ja, falls gewünscht |

Eigener Consent Banner nach Agenturstandard, sobald ein einwilligungspflichtiger Dienst dazukommt. Rechtstexte als Platzhalter mit sichtbarem Entwurfshinweis, bis der Inhaber sie liefert. Allergene und Zusatzstoffe sind Pflichtangaben in der Speisekarte.

## 14. SEO und lokale Sichtbarkeit

Canonical `https://www.yumini.de` (zu bestätigen, siehe Fragen). Je Seite eigener Titel und Beschreibung, `Restaurant` Auszeichnung je Standort mit Adresse, Telefon, Öffnungszeiten, Küche und Preisspanne, `Organization` für die Gruppe, `FAQPage`, `Menu` für die Speisekarte, `JobPosting` für Stellen. Name, Adresse und Telefon überall in genau einer Schreibweise, gleich wie im Google Unternehmensprofil. Die alten Pfade der Standortseiten bleiben, alle übrigen alten Adressen bekommen Weiterleitungen.

Schreibweise zur Abstimmung (aus dem Fuß der Bestandsseite, vereinheitlicht):

| Standort | Adresse | Telefon | Mail |
| --- | --- | --- | --- |
| Bochum | Viktoriastraße 43 bis 45, 44787 Bochum | 0234 92726123 | bochum@yumini.de |
| Dortmund | Stubengasse 8, 44135 Dortmund | 0231 53306588 | dortmund@yumini.de |
| Gelsenkirchen | Willy-Brandt-Allee 54, 45891 Gelsenkirchen | 0209 3807829 | gelsenkirchen@yumini.de |
| Lüdenscheid | Humboldtstraße 36, 58511 Lüdenscheid (eigene Parkplätze) | 02351 8940039 | luedenscheid@yumini.de |
| Siegen | Koblenzer Straße 18, 57072 Siegen | 0271 31760650 | siegen@yumini.de |

## 15. Zielkonflikte und wie sie gelöst sind

| Konflikt | Lösung |
| --- | --- |
| viele Bilder gewünscht gegen Ladezeit unter 2 Sekunden | Bilder als AVIF und WebP in passenden Breiten, nur das Heldenbild sofort, alle anderen spät geladen |
| Stockbilder gewünscht gegen Regel „keine erfundenen Belege" | Stock nur für Food und Stimmung als Platzhalter bis zum Shooting, nie für Gäste, Team und Karriere |
| Trust Logos im Held gegen Ruhe im Held | eine schmale Zeile unter den Buttons, Logos in Weiß oder Grau, Werte klein |
| Tablet Mockup gegen Bedienbarkeit auf dem Handy | Rahmen nur ab Tabletbreite, darunter das Tool in voller Breite |
| Rot nur einmal je Bildschirm gegen roter Kreis als Motiv | der Kreis ist im Held das eine rote Element, der Button dort bekommt Rot, der Kreis dann nur als Umriss oder Coral, im Detail beim Bau entschieden und dokumentiert |
| Rangfolge bei Konflikten | 1 Recht und Barrierefreiheit, 2 Reservierung funktioniert, 3 Ladezeit, 4 Gestaltung |

## 16. Bauphasen

Jede Phase wird einzeln gepusht und kann geprüft werden. Zuerst ein Pilot: die Startseite mit dem Tablet und einer Reservierung auf Testdaten, danach die Serie.

| Phase | Inhalt |
| --- | --- |
| 1 | Grundgerüst: Astro, Tokens aus dem Designsystem, IBM Plex Sans, Layout, Kopf, Fuß mit allen Standorten, leere Seiten |
| 2 | Startseite mit allen Abschnitten, Platzhalterbildern und dem Tablet mit Reservierungsoberfläche auf Testdaten (Pilot) |
| 3 | Speisekarte: Datenquelle, Seite, Mockup, Flipbook mit Platzhalterseiten |
| 4 | Standortseiten |
| 5 | Reservierung echt: Datenbank, Verfügbarkeit, Buchung, Storno, Mails |
| 6 | Dashboard mit Tagesansicht, Tischplan, Eintragen, Sperren, Einstellungen |
| 7 | Karriere Landingpage mit Funnel |
| 8 | Bewertungen, Feieranfrage, Consent, Rechtstexte als Platzhalter, SEO, 404, Prüfskripte, Abnahme |

## 17. Offene Fragen

**Reservierung**

1. Welches System nutzt ihr heute für Reservierungen? Gibt es dort zukünftige Reservierungen, die beim Umzug übernommen werden müssen?
2. Tische je Standort: Anzahl, Plätze je Tisch, welche Tische sich zusammenstellen lassen, gibt es Bereiche (innen, Terrasse)? Am besten ein Grundriss oder eine Liste je Standort.
3. Plusfunktion: Habe ich richtig verstanden, dass 1 bis 15 Personen online nach Verfügbarkeit gebucht werden und „Mehr als 15" als Anfrage an den Standort geht? Oder soll online schon bei 10 Schluss sein?
4. Wird eine Reservierung sofort bestätigt, oder bestätigt der Standort jede von Hand? Vorschlag: sofort.
5. Puffer nach den zwei Stunden: 15 Minuten in Ordnung?
6. Soll der Gast eine Erinnerung am Vortag bekommen, und bis wann darf er online stornieren? Vorschlag: Erinnerung ja, Storno bis zwei Stunden vorher.
7. Wer arbeitet im Dashboard, und auf welchem Gerät (Tablet am Empfang, PC)? Braucht ihr einen Zugang für die Leitung, der alle Standorte sieht?

**Inhalte**

8. Öffnungszeiten je Standort, Ruhetage, Mittag und Abend mit Uhrzeiten.
9. Preise Mittag, Abend, Wochenende und Feiertage, Kinder.
10. Angebote: welche gibt es konkret?
11. Speisekarte: Gibt es eine Datei mit Gerichten, Nummern je Standort, Allergenen, Zusatzstoffen und „Dinner Only" (Excel, Kassensystem, PDF)?
12. Feiern: Was bietet ihr an (eigener Bereich, Menü, Deko), und ab wie vielen Personen?

**Vertrauen**

13. Welche Plattform ist „Kolibri" genau, und wie lauten die Profillinks von Trustpilot und Kolibri? Habt ihr bei Trustpilot ein Geschäftskonto mit Schnittstelle?

**Karriere**

14. Welche Stellen sucht ihr, an welchen Standorten? Du oder Sie auf der Karriereseite? Wer bekommt die Bewerbungen?
15. Dürfen wir beim Shooting auch Teamfotos für die Karriereseite machen? Ohne echte Gesichter wirkt sie deutlich schwächer.

**Technik**

16. Canonical mit oder ohne www? Vorschlag: `https://www.yumini.de`, so wie die Bestandsseite.
17. Stimmt die Schreibweise der Adressen und Telefonnummern in Abschnitt 14 mit euren Google Profilen überein?

## 18. Offene Punkte und Platzhalter

1. Referenzen vorlegen und freigeben lassen (Tor 1), erst dann erfassen.
2. Inventar der Bestandsseite yumini.de, sobald sie aus der Cloud Umgebung erreichbar ist oder als Export vorliegt.
3. Rechtstexte vom Inhaber.
4. Logo für hellen Grund und Signet einzeln.
5. Speisekarte aus Claude Design als PDF für das Flipbook.
6. Fotoshooting mit Bildliste.
