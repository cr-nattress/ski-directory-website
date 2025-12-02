import { JsonLd } from './JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skidirectory.org';

/**
 * WebSite JSON-LD structured data
 * Enables sitelinks search box in Google search results
 */
export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}#website`,
    name: 'Ski Directory',
    url: BASE_URL,
    description: 'Discover 100+ ski resorts across the US and Canada. Compare terrain stats, real-time snow conditions, trail maps, and pass information.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/directory?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={jsonLd} />;
}
