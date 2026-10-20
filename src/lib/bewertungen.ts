// Bewertungen je Plattform. Werte nur echt und mit Datum (docs/plan.md, Abschnitt 11).
// Google: VORLÄUFIG. Gesamtwert 4,4 aus 1.927 Google Bewertungen laut reviewhero.io/yumini-67bb (Recherche 20.10.2026),
// nicht gegen die Google Unternehmensprofile geprüft. Zum Livegang durch die Places API je Standort ersetzen.
// Trustpilot: kein belegter Wert, bleibt leer, bis das Profil und der Wert vorliegen.
export type Bewertung = { id: 'google' | 'trustpilot'; name: string; logo: string; wert: number | null; anzahl: number | null; stand: string; vorlaeufig: boolean };

export const bewertungen: Bewertung[] = [
  { id: 'google', name: 'Google', logo: '/images/plattformen/google.svg', wert: 4.4, anzahl: 1927, stand: '20.10.2026', vorlaeufig: true },
  { id: 'trustpilot', name: 'Trustpilot', logo: '/images/plattformen/trustpilot.svg', wert: null, anzahl: null, stand: '', vorlaeufig: false },
];

export const komma = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
