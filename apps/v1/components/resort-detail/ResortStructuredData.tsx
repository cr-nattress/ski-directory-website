import { Resort } from '@/lib/mock-data';

interface ResortStructuredDataProps {
  resort: Resort;
}

export function ResortStructuredData({ resort }: ResortStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SkiResort',
    name: resort.name,
    description: resort.description,
    image: resort.heroImage,
    address: {
      '@type': 'PostalAddress',
      addressLocality: resort.nearestCity,
      addressRegion: 'CO',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: resort.location.lat,
      longitude: resort.location.lng,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: resort.rating,
      reviewCount: resort.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    url: `https://skidirectory.com/colorado/${resort.slug}`,
    amenityFeature: [
      ...(resort.features.hasPark
        ? [{ '@type': 'LocationFeatureSpecification', name: 'Terrain Park' }]
        : []),
      ...(resort.features.hasHalfpipe
        ? [{ '@type': 'LocationFeatureSpecification', name: 'Halfpipe' }]
        : []),
      ...(resort.features.hasNightSkiing
        ? [{ '@type': 'LocationFeatureSpecification', name: 'Night Skiing' }]
        : []),
      ...(resort.features.hasBackcountryAccess
        ? [
            {
              '@type': 'LocationFeatureSpecification',
              name: 'Backcountry Access',
            },
          ]
        : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
