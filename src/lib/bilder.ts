// Alle Bilder an einer Stelle, damit astro:assets sie optimiert (AVIF und WebP, passende Breiten).
// Quelle: Bestandsseite yumini.de, Rechte beim Betreiber. Freigabe zur Nutzung bestätigt der Inhaber (20.10.2026).
import sushiPlatte from '../assets/fotos/sushi-platte.jpg';
import nigiriSchiefer from '../assets/fotos/nigiri-schiefer.jpg';
import skizze from '../assets/fotos/skizze.png';
import sushi from '../assets/kategorien/sushi.jpg';
import grill from '../assets/kategorien/grill.jpg';
import salad from '../assets/kategorien/salad.jpg';
import dinner from '../assets/kategorien/dinner.jpg';
import dessert from '../assets/kategorien/dessert.jpg';
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

export const fotos = { sushiPlatte, nigiriSchiefer, skizze };
export const kategorien = { sushi, grill, salad, dinner, dessert };
export const gerichte = {
  sake, maguro, ebi, unagi, 'sake-aburi': sakeAburi, ikura,
  'tempura-california': tempuraCalifornia, 'yaki-tori': yakiTori, 'tekka-maki': tekkaMaki,
  'gruener-tee-eis': gruenerTeeEis, 'ebi-tempura': ebiTempura,
} as const;
export type GerichtId = keyof typeof gerichte;
