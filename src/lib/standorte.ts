// Standortdaten aus dem Infopaket vom 20.10.2026 (docs/quellen/standorte.json, ausgelesen von yumini.de).
// Schreibweise der Adressen wie in docs/plan.md Abschnitt 14 (zur Abstimmung mit den Google Profilen).
// ACHTUNG: Die Preise unterscheiden sich je Standort und die Buffetdauer in Dortmund ist 2,5 Stunden.
// Das widerspricht der Aussage "Preise an allen Standorten gleich" und ist beim Inhaber zu klären.

export type Zeile = { label: string; wert: string };
export type Mahlzeit = { zeit: string; kueche: string; preise: Zeile[]; hinweis?: string };

export type Standort = {
  id: 'bochum' | 'dortmund' | 'gelsenkirchen' | 'luedenscheid' | 'siegen';
  name: string;
  strasse: string;
  ort: string;
  telefon: string;
  tel: string;
  mail: string;
  ruhetag?: string;
  lunch: Mahlzeit | null;
  dinner: Mahlzeit;
  kinder: string;
  dauer: string;
  parken: string[];
  parkHinweis?: string;
  feiertag?: string;
  maps?: string;
  facebook?: string;
  gericht: string; // Bild für die Karte, Dekor und kein Foto des Restaurants
  lon: number;
  lat: number;
};

export const standorte: Standort[] = [
  {
    id: 'bochum',
    name: 'Bochum',
    strasse: 'Viktoriastraße 43 bis 45',
    ort: '44787 Bochum',
    telefon: '0234 92726123',
    tel: '+4923492726123',
    mail: 'bochum@yumini.de',
    lunch: {
      zeit: '12:00 bis 15:00',
      kueche: 'Küche bis 14:45',
      preise: [
        { label: 'Montag bis Donnerstag', wert: '18,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '21,90 €' },
      ],
    },
    dinner: {
      zeit: '17:30 bis 23:00',
      kueche: 'Küche bis 22:45',
      preise: [
        { label: 'Montag bis Donnerstag', wert: '28,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '30,90 €' },
      ],
    },
    kinder: 'Bis 4 Jahre frei. Bis 12 Jahre 10,90 € mittags und 15,90 € abends.',
    dauer: '2 Stunden',
    parken: ['P2 Dr.-Ruer-Platz, Viktoriastraße 10', 'P8 Konrad-Adenauer-Platz'],
    maps: 'https://goo.gl/maps/BwyAvCov1obF6MTQ8',
    facebook: 'https://www.facebook.com/yumini.bochum',
    gericht: 'sake',
    lon: 7.216,
    lat: 51.481,
  },
  {
    id: 'dortmund',
    name: 'Dortmund',
    strasse: 'Stubengasse 8',
    ort: '44135 Dortmund',
    telefon: '0231 53306588',
    tel: '+4923153306588',
    mail: 'dortmund@yumini.de',
    lunch: {
      zeit: '12:00 bis 15:00',
      kueche: 'Küche bis 14:45',
      preise: [
        { label: 'Montag bis Donnerstag', wert: '19,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '21,90 €' },
      ],
    },
    dinner: {
      zeit: '17:30 bis 23:00',
      kueche: 'Küche bis 22:45',
      preise: [
        { label: 'Montag bis Donnerstag', wert: '31,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '32,90 €' },
      ],
    },
    kinder: 'Bis 4 Jahre frei. Bis 12 Jahre 10,90 € mittags und 16,90 € abends.',
    dauer: '2,5 Stunden',
    feiertag: 'An Valentinstag und Silvester gelten die Preise vom Feiertag.',
    parken: ['Parkhaus Kuckelke, Kuckelke 3', 'Konzerthaus Tiefgarage, Burgwall 8'],
    facebook: 'https://www.facebook.com/yumini.dortmund',
    gericht: 'maguro',
    lon: 7.466,
    lat: 51.514,
  },
  {
    id: 'gelsenkirchen',
    name: 'Gelsenkirchen',
    strasse: 'Willy-Brandt-Allee 54',
    ort: '45891 Gelsenkirchen',
    telefon: '0209 3807829',
    tel: '+492093807829',
    mail: 'gelsenkirchen@yumini.de',
    ruhetag: 'Montag geschlossen',
    lunch: {
      zeit: '12:00 bis 15:00',
      kueche: 'Küche bis 14:45',
      preise: [
        { label: 'Dienstag bis Donnerstag', wert: '18,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '21,90 €' },
      ],
    },
    dinner: {
      zeit: '17:30 bis 22:30',
      kueche: 'Küche bis 22:00',
      preise: [
        { label: 'Dienstag bis Donnerstag', wert: '28,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '30,90 €' },
      ],
    },
    kinder: 'Bis 3 Jahre frei. Von 4 bis 11 Jahren der halbe Preis.',
    dauer: '2 Stunden',
    parken: ['Parkplatz Veltins-Arena, Berni-Klodt-Weg', 'Schalke Parkplatz, Adenauerallee 110'],
    facebook: 'https://www.facebook.com/YUMINI-Gelsenkirchen-1005684199518313',
    gericht: 'ebi',
    lon: 7.1,
    lat: 51.517,
  },
  {
    id: 'luedenscheid',
    name: 'Lüdenscheid',
    strasse: 'Humboldtstraße 36',
    ort: '58511 Lüdenscheid',
    telefon: '02351 8940039',
    tel: '+4923518940039',
    mail: 'luedenscheid@yumini.de',
    lunch: {
      zeit: '12:00 bis 15:00',
      kueche: 'Küche bis 14:45',
      preise: [{ label: 'Freitag bis Sonntag und Feiertage', wert: '19,90 €' }],
      hinweis: 'Montag bis Donnerstag öffnen wir erst abends, außer an Feiertagen.',
    },
    dinner: {
      zeit: '17:00 bis 23:00',
      kueche: 'Küche bis 22:45',
      preise: [
        { label: 'Montag bis Donnerstag', wert: '29,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '31,90 €' },
      ],
    },
    kinder: 'Bis 3 Jahre frei. Bis 11 Jahre der halbe Preis.',
    dauer: '2 Stunden',
    feiertag: 'An Valentinstag und Silvester gelten die Preise vom Feiertag.',
    parken: ['Über 30 eigene Parkplätze in der Nähe, kostenlos'],
    parkHinweis: 'Eigene Parkplätze',
    maps: 'https://maps.app.goo.gl/nR6XHMopZt86XWEZ6',
    gericht: 'unagi',
    lon: 7.627,
    lat: 51.219,
  },
  {
    id: 'siegen',
    name: 'Siegen',
    strasse: 'Koblenzer Straße 18',
    ort: '57072 Siegen',
    telefon: '0271 31760650',
    tel: '+4927131760650',
    mail: 'siegen@yumini.de',
    lunch: {
      zeit: '12:00 bis 15:00',
      kueche: 'Küche bis 14:30',
      preise: [
        { label: 'Montag bis Donnerstag', wert: '18,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '20,90 €' },
      ],
    },
    dinner: {
      zeit: '17:30 bis 23:30',
      kueche: 'Küche bis 22:30, Freitag bis Sonntag und an Feiertagen bis 23:00',
      preise: [
        { label: 'Montag bis Donnerstag', wert: '28,90 €' },
        { label: 'Freitag bis Sonntag und Feiertage', wert: '30,90 €' },
      ],
    },
    kinder: 'Bis 3 Jahre frei. Bis 11 Jahre der halbe Preis.',
    dauer: '2 Stunden',
    feiertag: 'An Valentinstag und Silvester gelten die Preise vom Feiertag.',
    parken: ['APCOA Parkhaus Apollotheater, Morleystraße', 'CONTIPARK Tiefgarage Unteres Schloss, Obergraben 30'],
    maps: 'https://goo.gl/maps/ajrJF478tBnTkFB8A',
    facebook: 'https://www.facebook.com/yumini.siegen',
    gericht: 'ikura',
    lon: 8.024,
    lat: 50.875,
  },
];

export const ab = (s: Standort) => {
  const alle = [...(s.lunch?.preise ?? []), ...s.dinner.preise].map((p) => parseFloat(p.wert.replace(',', '.')));
  return Math.min(...alle).toFixed(2).replace('.', ',') + ' €';
};

export const routeUrl = (s: Standort) =>
  s.maps ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${s.strasse}, ${s.ort}`)}`;
