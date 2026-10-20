import { SITE } from './config';
import { standorte, type Standort } from './standorte';

const tage = (label: string) => {
  if (label.startsWith('Montag bis Donnerstag')) return ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  if (label.startsWith('Dienstag bis Donnerstag')) return ['Tuesday', 'Wednesday', 'Thursday'];
  return ['Friday', 'Saturday', 'Sunday'];
};
const zeiten = (z: string) => z.split(' bis ');

export function restaurantLd(s: Standort) {
  const spec: object[] = [];
  const add = (m: { zeit: string; preise: { label: string }[] } | null) => {
    if (!m) return;
    const [auf, zu] = zeiten(m.zeit);
    for (const p of m.preise) spec.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: tage(p.label), opens: auf, closes: zu });
  };
  add(s.lunch);
  add(s.dinner);
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE}/${s.id}/#restaurant`,
    name: `Yumini ${s.name}`,
    alternateName: 'Yumini Japanese Sushi & Grill',
    url: `${SITE}/${s.id}/`,
    telephone: s.tel,
    email: s.mail,
    image: `${SITE}/images/og.jpg`,
    servesCuisine: ['Japanisch', 'Sushi', 'Teppanyaki', 'All you can eat'],
    priceRange: '€€',
    acceptsReservations: true,
    hasMenu: `${SITE}/speisekarte/`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.strasse.replace(' bis ', ' - '),
      postalCode: s.ort.split(' ')[0],
      addressLocality: s.name,
      addressCountry: 'DE',
    },
    openingHoursSpecification: spec,
    sameAs: s.facebook ? [s.facebook] : undefined,
    parentOrganization: { '@id': `${SITE}/#organisation` },
  };
}

export const organisationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}/#organisation`,
  name: 'Yumini Japanese Sushi & Grill',
  url: `${SITE}/`,
  logo: `${SITE}/images/logo.svg`,
  department: standorte.map((s) => ({ '@id': `${SITE}/${s.id}/#restaurant` })),
};

export const faqLd = (fragen: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: fragen.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
