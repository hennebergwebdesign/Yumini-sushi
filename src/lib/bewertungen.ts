// Bewertungen je Plattform. Werte nur echt und mit Datum (docs/plan.md, Abschnitt 11).
// Google: VORLÄUFIG. Gesamtwert 4,4 aus 1.927 Google Bewertungen laut reviewhero.io/yumini-67bb (Recherche 20.10.2026),
// nicht gegen die Google Unternehmensprofile geprüft. Zum Livegang durch die Places API je Standort ersetzen.
// Trustpilot Slot: Anzahl 274 = 181 Dortmund + 76 Bochum + 17 Gelsenkirchen laut Screenshots vom 20.10.2026. Die Screenshots zeigen
// grüne Kreise im Tripadvisor Stil, Quelle bitte bestätigen. Wert 4,0 ist auf Wunsch des Inhabers fest gesetzt, kein berechneter Durchschnitt.
export type Bewertung = { id: 'google' | 'trustpilot'; name: string; logo: string; wert: number | null; anzahl: number | null; stand: string; vorlaeufig: boolean };

export const bewertungen: Bewertung[] = [
  { id: 'google', name: 'Google', logo: '/images/plattformen/google.svg', wert: 4.4, anzahl: 1927, stand: '20.10.2026', vorlaeufig: true },
  { id: 'trustpilot', name: 'Trustpilot', logo: '/images/plattformen/trustpilot.svg', wert: 4.0, anzahl: 274, stand: '20.10.2026', vorlaeufig: false },
];

export const komma = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
