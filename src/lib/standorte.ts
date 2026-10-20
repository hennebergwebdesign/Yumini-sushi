// Standortdaten aus dem Fuß der Bestandsseite, Schreibweise wie in docs/plan.md Abschnitt 14 (zur Abstimmung).
// Öffnungszeiten fehlen noch (offene Frage 8) und werden nicht erfunden.

export type Standort = {
  id: 'bochum' | 'dortmund' | 'gelsenkirchen' | 'luedenscheid' | 'siegen';
  name: string;
  strasse: string;
  ort: string;
  telefon: string;
  tel: string;
  mail: string;
  hinweis?: string;
  // Lage auf der Kartenskizze (Länge, Breite)
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
    hinweis: 'Eigene Parkplätze',
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
    lon: 8.024,
    lat: 50.875,
  },
];
