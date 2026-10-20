# Yumini Sushi & Grill

Neue Website für Yumini, Japanese Sushi & Grill, All you can eat mit fünf Standorten in Bochum,
Dortmund, Gelsenkirchen, Lüdenscheid und Siegen. Gebaut nach dem Plugin `webdesign-conversion`
(Repository `hennebergwebdesign/design-skill`): Regelwerk `webdesign-conversion`, Ablauf
`agentur-website-builder`.

## Stand

**Phase 3, Umsetzungskonzept in Abstimmung.** Es ist noch kein Code gebaut. Der Plan für Startseite,
Unterseiten und Reservierung liegt dem Inhaber vor, die Rückfragen sind offen. Gebaut wird erst nach
Freigabe des Plans.

## Kunde und Ziel

| Punkt | Stand |
| --- | --- |
| Projektart | Homepage, Gesamtauftritt für alle fünf Standorte, kein Leadsystem |
| Primäre Handlung | Tisch reservieren (Vorschlag, noch nicht bestätigt) |
| Zweite Handlung | Speisekarte ansehen |
| Ansprache | Sie (so auf der Bestandsseite) |
| Bestandsseite | yumini.de mit Standortseiten wie `/gelsenkirchen`, aus der Cloud Umgebung nicht abrufbar, Inventar steht aus |

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

## Geplante Seitenstruktur (Entwurf, nicht freigegeben)

1. `/` Startseite
2. `/speisekarte`
3. je Standort eine Seite, Pfade wie auf der Bestandsseite (`/bochum`, `/dortmund`, `/gelsenkirchen`, `/luedenscheid`, `/siegen`)
4. `/reservieren`
5. `/impressum`, `/datenschutz`, 404

## Offene Punkte

1. Antworten auf die Rückfragen zum Plan (Reservierungssystem, Preise, Angebote, Bilder, Standortdaten).
2. Inventar und Markenmessung der Bestandsseite, sobald ein Zugang besteht.
3. Referenzrecherche Tor 1: Kandidaten vorlegen, erst nach Freigabe erfassen.
4. Logo für hellen Grund und Signet einzeln beim Kunden anfragen.

## Änderungsverlauf

1. **20.10.2026** Projekt angelegt, Designsystem gelesen, Plan für Startseite und Unterseiten zur
   Abstimmung vorgelegt. Kein Code.
