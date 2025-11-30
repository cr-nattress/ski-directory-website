import { JsonLd } from './JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com';

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
    description: 'Discover 30+ Colorado ski resorts with real-time conditions, expert reviews, and detailed mountain stats.',
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
