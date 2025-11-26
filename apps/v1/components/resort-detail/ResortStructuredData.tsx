import { Resort } from '@/lib/mock-data';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com';

interface ResortStructuredDataProps {
  resort: Resort;
}

export function ResortStructuredData({ resort }: ResortStructuredDataProps) {
  // Build images array with hero and trail map
  const images = [resort.heroImage];
  if (resort.trailMapUrl) {
    images.push(resort.trailMapUrl);
  }

  // Build amenity features with specific values
  const amenityFeatures = [
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Skiable Acres',
      value: resort.stats.skiableAcres,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Vertical Drop',
      value: `${resort.stats.verticalDrop} ft`,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Summit Elevation',
      value: `${resort.stats.summitElevation} ft`,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Base Elevation',
      value: `${resort.stats.baseElevation} ft`,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Total Lifts',
      value: resort.stats.liftsCount,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Total Runs',
      value: resort.stats.runsCount,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Average Annual Snowfall',
      value: `${resort.stats.avgAnnualSnowfall} inches`,
    },
    // Boolean features
    ...(resort.features.hasPark
      ? [{ '@type': 'LocationFeatureSpecification', name: 'Terrain Park', value: true }]
      : []),
    ...(resort.features.hasHalfpipe
      ? [{ '@type': 'LocationFeatureSpecification', name: 'Halfpipe', value: true }]
      : []),
    ...(resort.features.hasNightSkiing
      ? [{ '@type': 'LocationFeatureSpecification', name: 'Night Skiing', value: true }]
      : []),
    ...(resort.features.hasBackcountryAccess
      ? [{ '@type': 'LocationFeatureSpecification', name: 'Backcountry Access', value: true }]
      : []),
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SkiResort',
    '@id': `${BASE_URL}/colorado/${resort.slug}#skiresort`,
    name: resort.name,
    description: resort.description,
    url: `${BASE_URL}/colorado/${resort.slug}`,
    image: images,
    priceRange: '$$-$$$',
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
    amenityFeature: amenityFeatures,
    // Link to official website if available
    ...(resort.website && { sameAs: resort.website }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
      }}
    />
  );
}
