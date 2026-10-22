// Alle Bilder an einer Stelle, damit astro:assets sie optimiert (AVIF und WebP, passende Breiten).
// Quelle: Bestandsseite yumini.de, Rechte beim Betreiber. Freigabe zur Nutzung bestätigt der Inhaber (20.10.2026).
import type { Standort } from './standorte';
import sushiPlatte from '../assets/fotos/sushi-platte.jpg';
import nigiriSchiefer from '../assets/fotos/nigiri-schiefer.jpg';
import schieferRund from '../assets/fotos/schiefer-rund.jpg';
import skizze from '../assets/fotos/skizze.png';
import sushi from '../assets/kategorien/sushi.jpg';
import grill from '../assets/kategorien/grill.jpg';
import salad from '../assets/kategorien/salad.jpg';
import dinner from '../assets/kategorien/dinner.jpg';
import dessert from '../assets/kategorien/dessert.jpg';
import halle from '../assets/raeume/halle.jpg';
import gasse from '../assets/raeume/gasse.jpg';
import sake from '../assets/gerichte/sake.png';
import maguro from '../assets/gerichte/maguro.png';
import ebi from '../assets/gerichte/ebi.png';
import unagi from '../assets/gerichte/unagi.png';
import sakeAburi from '../assets/gerichte/sake-aburi.png';
import ikura from '../assets/gerichte/ikura.png';
import tempuraCalifornia from '../assets/gerichte/tempura-california.png';
import yakiTori from '../assets/gerichte/yaki-tori.png';
import tekkaMaki from '../assets/gerichte/tekka-maki.png';
import gruenerTeeEis from '../assets/gerichte/gruener-tee-eis.png';
import ebiTempura from '../assets/gerichte/ebi-tempura.png';
import bochum1 from '../assets/standorte/bochum-1.jpg';
import dortmund1 from '../assets/standorte/dortmund-1.jpg';
import gelsenkirchen1 from '../assets/standorte/gelsenkirchen-1.jpg';
import luedenscheid1 from '../assets/standorte/luedenscheid-1.jpg';
import siegen1 from '../assets/standorte/siegen-1.jpg';

export const fotos = { sushiPlatte, nigiriSchiefer, schieferRund, skizze };
export const kategorien = { sushi, grill, salad, dinner, dessert };
export const gerichte = {
  sake, maguro, ebi, unagi, 'sake-aburi': sakeAburi, ikura,
  'tempura-california': tempuraCalifornia, 'yaki-tori': yakiTori, 'tekka-maki': tekkaMaki,
  'gruener-tee-eis': gruenerTeeEis, 'ebi-tempura': ebiTempura,
} as const;
export type GerichtId = keyof typeof gerichte;

// Bilder japanischer Restaurants (Unsplash Lizenz), KEINE Aufnahmen der Yumini Standorte.
// Nur noch als abgedunkelte Hintergründe auf der Karriereseite (Vorteile, Team), sichtbar nie (Wunsch des Inhabers, 21.10.2026).
export const raeume = {
  halle: { src: halle, alt: 'Großer Gastraum mit Laternen, Theke und gedämpftem Licht', von: 'hiding ninja' },
  gasse: { src: gasse, alt: 'Gasse mit großen Papierlaternen und Sitzplätzen', von: 'ayumi kubo' },
} as const;
export type RaumId = keyof typeof raeume;

// Echte Aufnahmen der Restaurants, vom Inhaber geliefert (21.10.2026, Bochum und Siegen 22.10.2026). Je Standort eine Liste:
// das erste Bild ist das Titelbild (Standortkarte, Held, großes Bild im Abschnitt Im Lokal),
// weitere Bilder einfach anhängen, sie füllen dann die Platzhalter im Abschnitt Im Lokal (bis zu drei).
// Das Foto Bochum trägt das Wasserzeichen blog.erdbeerkirsch.de, Nutzungsrecht beim Inhaber zu klären.
// [[FEHLT: weitere Fotos je Standort, Nutzungsrecht Foto Bochum (blog.erdbeerkirsch.de)]]
export type LokalFoto = { src: ImageMetadata; alt: string };
export const standortFotos: Partial<Record<Standort['id'], LokalFoto[]>> = {
  bochum: [
    { src: bochum1, alt: 'Gastraum von Yumini Bochum mit Bar, beleuchtetem Yumini Schriftzug, Kristallleuchtern und violetter Polsterwand' },
  ],
  dortmund: [
    { src: dortmund1, alt: 'Gastraum von Yumini Dortmund mit beleuchteter Bar, roten Hängelampen und Holzlamellen an der Wand' },
  ],
  gelsenkirchen: [
    { src: gelsenkirchen1, alt: 'Gastraum von Yumini Gelsenkirchen mit langer Bar, Kugelleuchten und Tischreihe am Fenster' },
  ],
  luedenscheid: [
    { src: luedenscheid1, alt: 'Heller Gastraum von Yumini Lüdenscheid mit Baum, großen Fenstern und Blick auf die Terrasse' },
  ],
  siegen: [
    { src: siegen1, alt: 'Gastraum von Yumini Siegen mit großem Koi Aquarium, Kugelleuchten und violett beleuchteter Decke' },
  ],
};
