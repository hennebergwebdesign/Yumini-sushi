# Marke und Designrichtung

Marke: YUMINI, Untertitel "Sushi | Grill", Wortmarke mit ®, weiß auf dunkel (logo.svg).
Positionierung: Japanese Sushi & Grill, All you can eat Buffet, Bestellung per Tablet, 5 Standorte im Ruhrgebiet/Südwestfalen.

## Stil
Dunkles, modernes Restaurant Layout: sehr dunkler Hero mit Foto (Sushi Platte auf schwarzem Schiefer), danach helle, ruhige Sektionen
(weiß / hellgrau) mit viel Weißraum. Rote Akzentfarbe für Buttons und aktive Zustände.
Dezente Strichzeichnungen (Sushi Rollen als Skizze, sehr blass) als Hintergrunddekor in hellen Sektionen.

## Farben (aus dem CSS ausgelesen)
- Akzent/Button/Primärrot: rgb(223,81,87) = #DF5157
- Cookie Banner / Signalrot: rgb(255,86,86) = #FF5656
- Seitenhintergrund dunkel: rgb(3,5,4) = #030504
- Text dunkel (Fließtext hell): rgb(59,67,81) = #3B4351
- Weiß #FFFFFF, Hellgrau Sektion rgb(247,248,249) = #F7F8F9
- Dunkelflächen: #14140F-ähnlich rgb(20,20,19), rgb(34,35,43)

## Typografie
IBM Plex Sans (Gewichte 100 bis 700), Headlines leicht (300) und groß (ca. 36 px), Sektionstitel in Großbuchstaben mit weitem Letterspacing
(z. B. "UNSERE ANGEBOTE", "ÖFFNUNGSZEIT UND PREISE", "ANFAHRT UND KONTAKT"). Monospace nur im Cookie Banner.

## Seitenaufbau Standortseite
1. Header: Logo, Nav (Startseite, Speisekarte, Anfahrt), Facebook Icon, Adresse, vertikale Standort Navigation rechts (BOCHUM, DORTMUND, GELSENKIRCHEN, LÜDENSCHEID, SIEGEN, aktiver Standort rot)
2. Hero: "WILLKOMMEN ZU / Yumini <Stadt> / Japanese Sushi & Grill", roter Button "Tisch Reservieren"; rechts großes Sushi Foto, kleine runde Sushi Boxen als Orbit Deko
3. (nur Lüdenscheid, Siegen) Rotes Band "SUSHI MENÜS" + Button "Jetzt Bestellen"
4. "Bestellen per Tablet" mit Beschreibung + Link Speisekarte
5. "UNSERE ANGEBOTE": 6 Kacheln mit Foto, weißem Icon und Label (Sushi, Warm Dishes, Salads|Soups|Noodles|Rice, Dinner Only, Dessert, Speisekarte als dunkle Kachel)
6. "ÖFFNUNGSZEIT UND PREISE": links Foto (Nigiri Platte), rechts Tabelle Lunch/Dinner, Kinderpreise
7. "ANFAHRT UND KONTAKT": Adresse, Telefon, E-Mail, Parkplätze, Karte
8. Footer: alle 5 Standorte mit Adresse/Tel/Mail, Copyright, Impressum, Datenschutz
Startseite (/): reine Standortwahl, Vollbild Sushi Muster Foto (Nigiri Raster) mit Logo mittig, 5 weiße Karten unten.
Speisekarte: Hinweisblock (All you can eat), Filter (Alle, Dinner Only, Dessert, Salad|Soups|Noodles|Rice, Saucen, Side Orders, Sushi, Warm Dishes), Schalter Favoriten / Außer Haus, Kartenraster mit Foto, Nummer, Name, Beschreibung, Preis, Herz.
Funktionen: Cookie Hinweis (Ok / Datenschutzerklärung), Impressum und Datenschutz als Modal.
Tech: Vite Build (assets/index-*.css), SPA, Remix Icons.
