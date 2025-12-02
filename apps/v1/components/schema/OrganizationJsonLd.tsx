import { JsonLd } from './JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skidirectory.org';

/**
 * Organization JSON-LD structured data
 * Helps search engines understand the site's brand identity
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}#organization`,
    name: 'Ski Directory',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    description: 'Discover 100+ ski resorts across the US and Canada. Compare terrain stats, real-time snow conditions, trail maps, and pass information.',
    sameAs: [
      'https://instagram.com/skidirectory',
      'https://twitter.com/skidirectory',
      'https://facebook.com/skidirectory',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${BASE_URL}/contact`,
    },
  };

  return <JsonLd data={jsonLd} />;
}
