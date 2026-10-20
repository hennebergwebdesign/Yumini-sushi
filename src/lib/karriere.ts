// Inhalte der Karriereseite. ALLES HIER IST ENTWURF: Der Inhaber hat weder Stellen noch Konditionen genannt
// (docs/plan.md, Abschnitt 17, Fragen 14 und 15). Stellen, Aufgaben und Zusagen sind Platzhalter nach Branchenüblichem
// und werden vor dem Livegang bestätigt. Konkrete Zahlen stehen als [[FEHLT: …]]. Deshalb gibt es noch keine JobPosting Auszeichnung.

export type Bereich = { id: string; name: string; text: string };
export const bereiche: Bereich[] = [
  { id: 'sushi', name: 'Sushi', text: 'Nigiri, Maki und Rollen' },
  { id: 'kueche', name: 'Küche', text: 'Warme Gerichte, Frittiertes, Suppen' },
  { id: 'grill', name: 'Grill', text: 'Teppanyaki und Spieße' },
  { id: 'service', name: 'Service', text: 'Gäste, Tische, Tablets' },
  { id: 'theke', name: 'Theke', text: 'Getränke und Dessert' },
  { id: 'aushilfe', name: 'Aushilfe', text: 'Minijob, Werkstudent, Ferienjob' },
];

export type Stelle = {
  id: string;
  titel: string;
  bereich: string;
  art: string;
  kurz: string;
  aufgaben: string[];
  profil: string[];
  bieten: string[];
};

export const stellen: Stelle[] = [
  {
    id: 'sushikoch', titel: 'Sushikoch (m/w/d)', bereich: 'sushi', art: 'Vollzeit oder Teilzeit',
    kurz: 'Du bereitest Nigiri, Maki und Rollen frisch zu und hältst die Sushi Station sauber und gut gefüllt.',
    aufgaben: ['Reis, Fisch und Zutaten vorbereiten', 'Nigiri, Maki und Specialrollen frisch zubereiten', 'Die Sushi Station während des Dienstes nachfüllen', 'Hygiene und Kühlkette einhalten'],
    profil: ['Erfahrung mit Sushi ist von Vorteil, Einsteiger werden eingearbeitet', 'Sauberes, ruhiges Arbeiten auch bei vollem Haus', 'Du arbeitest gern im Team'],
    bieten: ['Einarbeitung durch erfahrene Kollegen', 'Bezahlung [[FEHLT: Spanne oder Tarif]]', 'Dienstplan [[FEHLT: wie weit im Voraus]]'],
  },
  {
    id: 'koch', titel: 'Koch warme Küche (m/w/d)', bereich: 'kueche', art: 'Vollzeit oder Teilzeit',
    kurz: 'Du kochst die warmen Gerichte der Karte, von Tempura bis Ramen, und behältst auch bei vielen Bestellungen den Überblick.',
    aufgaben: ['Warme Gerichte nach Rezept zubereiten', 'Bestellungen vom Tablet in der richtigen Reihenfolge abarbeiten', 'Mise en Place und Lagerhaltung', 'Hygienevorgaben und Reinigung'],
    profil: ['Erfahrung in einer Restaurantküche', 'Belastbar in Stoßzeiten', 'Zuverlässig und pünktlich'],
    bieten: ['Feste Rezepte und klare Abläufe', 'Bezahlung [[FEHLT: Spanne oder Tarif]]', 'Mitarbeiteressen [[FEHLT: bestätigen]]'],
  },
  {
    id: 'grillkoch', titel: 'Grillkoch Teppanyaki (m/w/d)', bereich: 'grill', art: 'Vollzeit oder Teilzeit',
    kurz: 'Du bereitest Gegrilltes, Spieße und Teppanyaki zu, gerade und konstant in der Qualität.',
    aufgaben: ['Fleisch, Fisch und Gemüse auf Grill und Teppanyaki zubereiten', 'Marinaden und Saucen vorbereiten', 'Grillstation sauber halten'],
    profil: ['Erfahrung am Grill ist von Vorteil', 'Gutes Gefühl für Garzeiten', 'Sorgfältig und schnell'],
    bieten: ['Eigene Station mit klaren Abläufen', 'Bezahlung [[FEHLT: Spanne oder Tarif]]'],
  },
  {
    id: 'service', titel: 'Servicekraft (m/w/d)', bereich: 'service', art: 'Vollzeit, Teilzeit oder Minijob',
    kurz: 'Du empfängst die Gäste, erklärst das Tablet System und sorgst dafür, dass jeder Tisch sich gut aufgehoben fühlt.',
    aufgaben: ['Gäste begrüßen und an den Tisch bringen', 'Das Bestellen per Tablet erklären', 'Speisen und Getränke servieren, Tische abräumen', 'Reservierungen im Blick behalten'],
    profil: ['Freundlich und aufmerksam', 'Erfahrung im Service ist von Vorteil, kein Muss', 'Gutes Deutsch, weitere Sprachen sind ein Plus'],
    bieten: ['Einarbeitung am Tablet System', 'Bezahlung [[FEHLT: Spanne oder Tarif]] plus Trinkgeld', 'Dienstzeiten [[FEHLT: Abend, Wochenende?]]'],
  },
  {
    id: 'theke', titel: 'Thekenkraft (m/w/d)', bereich: 'theke', art: 'Teilzeit oder Minijob',
    kurz: 'Du bereitest Getränke und Desserts zu und hältst die Theke einladend und organisiert.',
    aufgaben: ['Getränke zubereiten und ausgeben', 'Desserts und Eis anrichten', 'Theke und Gläser sauber halten'],
    profil: ['Du behältst bei vielen Bestellungen die Ruhe', 'Erfahrung ist von Vorteil, kein Muss'],
    bieten: ['Feste Abläufe und Einarbeitung', 'Bezahlung [[FEHLT: Spanne oder Tarif]]'],
  },
  {
    id: 'aushilfe', titel: 'Aushilfe, Minijob oder Werkstudent (m/w/d)', bereich: 'aushilfe', art: 'Minijob oder Werkstudent',
    kurz: 'Du packst da mit an, wo gerade Hilfe gebraucht wird: im Service, an der Spülstation oder beim Vorbereiten.',
    aufgaben: ['Service und Tischservice unterstützen', 'Spülküche und Vorbereitung', 'Aufbau und Abbau vor und nach dem Dienst'],
    profil: ['Zuverlässig und lernbereit', 'Keine Vorkenntnisse nötig', 'Ab 18 Jahren oder mit Jugendarbeitsschutz [[FEHLT: bestätigen]]'],
    bieten: ['Flexible Einsatzzeiten [[FEHLT: Absprache]]', 'Bezahlung [[FEHLT: Stundenlohn]]'],
  },
];

export const vorteile = [
  { icon: 'lohn', t: 'Faire Bezahlung', x: 'Pünktlich und transparent. Konkreter Lohn je Stelle: [[FEHLT: Spanne vom Inhaber]].' },
  { icon: 'plan', t: 'Planbare Dienste', x: 'Dein Dienstplan steht rechtzeitig: [[FEHLT: Frist vom Inhaber]].' },
  { icon: 'essen', t: 'Mitarbeiteressen', x: 'Wer bei Yumini arbeitet, isst auch dort. [[FEHLT: Regelung vom Inhaber]]' },
  { icon: 'lernen', t: 'Gute Einarbeitung', x: 'Du lernst Abläufe, Hygiene und Tablet System von erfahrenen Kollegen.' },
  { icon: 'team', t: 'Ein Team, fünf Standorte', x: 'Bochum, Dortmund, Gelsenkirchen, Lüdenscheid und Siegen. Wechsel und Aufstieg sind möglich: [[FEHLT: bestätigen]].' },
  { icon: 'schnell', t: 'Bewerben ohne Lebenslauf', x: 'Vier Klicks und drei Felder. Alles Weitere klären wir im Gespräch.' },
];

// Beispielablauf eines Abenddienstes. Zeiten sind Platzhalter und folgen den echten Öffnungszeiten je Standort.
export const tag = [
  { zeit: '15:30', t: 'Ankommen und Vorbereiten', x: 'Umziehen, Dienstbesprechung, Stationen einrichten.' },
  { zeit: '17:00', t: 'Die Türen öffnen', x: 'Die ersten Gäste kommen, die Tablets laufen, die Küche startet.' },
  { zeit: '19:00', t: 'Vollbetrieb', x: 'Alle Tische sind besetzt und alle Stationen laufen. Hier zählt das Team.' },
  { zeit: '21:30', t: 'Letzte Bestellrunde', x: 'Die letzten Gäste werden versorgt, die Küche fährt herunter.' },
  { zeit: '22:30', t: 'Feierabend', x: 'Aufräumen, Übergabe, Mitarbeiteressen [[FEHLT: bestätigen]].' },
];

export const ablauf = [
  { t: 'Du sendest die vier Angaben', x: 'Das dauert etwa zwei Minuten.' },
  { t: 'Der Standort meldet sich', x: 'Antwort innerhalb von [[FEHLT: Frist]].' },
  { t: 'Kennenlernen vor Ort', x: 'Ein kurzes Gespräch, gern mit Probearbeiten.' },
  { t: 'Zusage und Start', x: 'Wir besprechen Einsatzzeiten und deinen ersten Tag.' },
];

export const fragen = [
  { q: 'Brauche ich einen Lebenslauf?', a: 'Nein. Für die erste Bewerbung genügen dein Name, deine Telefonnummer und ein paar Klicks. Unterlagen kannst du später nachreichen.' },
  { q: 'Kann ich ohne Erfahrung anfangen?', a: 'Im Service, an der Theke und als Aushilfe ja, wir arbeiten dich ein. In Küche, Sushi und Grill ist Erfahrung von Vorteil.' },
  { q: 'Kann ich mich an mehreren Standorten bewerben?', a: 'Ja. Wähle im ersten Schritt „Egal, mehrere“, dann schauen wir, wo du am besten passt.' },
  { q: 'Wer bekommt meine Bewerbung?', a: 'Der Standort, den du wählst. Bei „Egal“ erhält sie [[FEHLT: zentrale Stelle]]. Deine Daten nutzen wir nur für die Bewerbung, Details stehen im Datenschutzhinweis für Bewerber [[FEHLT: Text vom Inhaber]].' },
  { q: 'Wie schnell bekomme ich eine Antwort?', a: 'Der Standort meldet sich innerhalb von [[FEHLT: Frist]].' },
];

/** Zerlegt Text in feste Teile und [[FEHLT: …]] Platzhalter, damit diese sichtbar markiert werden */
export const teile = (text: string) =>
  text.split(/(\[\[[^\]]+\]\])/).filter(Boolean).map((t) => ({ t, fehlt: t.startsWith('[[') }));
