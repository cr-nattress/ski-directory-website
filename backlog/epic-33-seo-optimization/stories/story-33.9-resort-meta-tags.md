# Story 33.9: Add Enhanced Meta Tags for Resort Detail Pages

## Priority: High

## Context

Resort detail pages need comprehensive meta tags optimized for search and social sharing. This includes better descriptions, keywords, and Open Graph tags specific to each resort.

## Current State

- Basic metadata exists but could be improved
- Missing resort-specific keywords
- Description may not be optimized for search intent

## Requirements

1. Enhance title tag format for better CTR
2. Create compelling, keyword-rich descriptions
3. Add relevant meta keywords (low priority but still useful)
4. Improve Open Graph tags for social sharing
5. Add Twitter Card metadata

## Implementation

### Enhanced Metadata Generation

```tsx
// app/[countryCode]/[stateCode]/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resort = await getResort(params.slug);

  if (!resort) {
    return {
      title: 'Resort Not Found',
    };
  }

  // Build keyword-rich description
  const description = buildDescription(resort);

  // Build title with key info
  const title = `${resort.name} | ${resort.stats.skiableAcres.toLocaleString()} Acres | ${resort.nearestCity}, ${resort.stateCode.toUpperCase()}`;

  // Generate keywords
  const keywords = buildKeywords(resort);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/${params.countryCode}/${params.stateCode}/${params.slug}`,
    },
    openGraph: {
      title: `${resort.name} Ski Resort`,
      description,
      type: 'website',
      url: `https://skidirectory.org/${params.countryCode}/${params.stateCode}/${params.slug}`,
      siteName: 'Ski Directory',
      images: resort.heroImage ? [
        {
          url: resort.heroImage,
          width: 1200,
          height: 630,
          alt: `${resort.name} ski resort`,
        }
      ] : undefined,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${resort.name} Ski Resort`,
      description,
      images: resort.heroImage ? [resort.heroImage] : undefined,
    },
    other: {
      'geo.region': `US-${resort.stateCode.toUpperCase()}`,
      'geo.placename': resort.nearestCity,
      'geo.position': `${resort.location.lat};${resort.location.lng}`,
      'ICBM': `${resort.location.lat}, ${resort.location.lng}`,
    },
  };
}

function buildDescription(resort: Resort): string {
  const parts = [
    `${resort.name} ski resort`,
    `near ${resort.nearestCity}, ${resort.stateCode.toUpperCase()}`,
  ];

  // Add terrain info
  parts.push(`offers ${resort.stats.skiableAcres.toLocaleString()} skiable acres`);
  parts.push(`${resort.stats.runsCount} runs`);
  parts.push(`${resort.stats.verticalDrop.toLocaleString()}ft vertical drop`);

  // Add pass info if available
  if (resort.passAffiliations.length > 0) {
    const passes = resort.passAffiliations
      .map(p => p.charAt(0).toUpperCase() + p.slice(1) + ' Pass')
      .join(', ');
    parts.push(`Accepts ${passes}`);
  }

  // Add snowfall
  if (resort.stats.avgAnnualSnowfall) {
    parts.push(`${resort.stats.avgAnnualSnowfall}" avg annual snowfall`);
  }

  return parts.join('. ') + '.';
}

function buildKeywords(resort: Resort): string[] {
  const keywords = [
    resort.name,
    `${resort.name} ski resort`,
    `${resort.name} skiing`,
    `skiing ${resort.nearestCity}`,
    `ski resorts ${resort.stateCode}`,
    `${resort.stateCode} skiing`,
    resort.nearestCity,
  ];

  // Add pass keywords
  resort.passAffiliations.forEach(pass => {
    keywords.push(`${pass} pass resorts`);
    keywords.push(`${pass} pass ${resort.stateCode}`);
  });

  // Add feature keywords
  if (resort.features?.hasNightSkiing) {
    keywords.push('night skiing');
  }
  if (resort.features?.hasPark) {
    keywords.push('terrain park');
  }
  if (resort.features?.hasBackcountryAccess) {
    keywords.push('backcountry skiing');
  }

  return keywords;
}
```

### Title Format Options

Consider these formats for optimal CTR:

1. **Feature-focused**: `{Resort} | {Acres} Acres, {Runs} Runs | {City}, {State}`
2. **Location-focused**: `{Resort} Ski Resort near {City}, {State} | Ski Directory`
3. **Pass-focused**: `{Resort} | {Pass} Resort | {Acres} Acres | {State}`

Recommendation: Test different formats and monitor CTR in Search Console.

## Acceptance Criteria

- [ ] Title tags include key resort stats
- [ ] Descriptions are unique and keyword-rich
- [ ] Open Graph tags properly configured
- [ ] Twitter Cards working
- [ ] Geo meta tags added for location
- [ ] All metadata server-rendered (view source confirms)

## Testing

1. View page source to verify meta tags
2. Use Facebook Sharing Debugger for OG tags
3. Use Twitter Card Validator
4. Check Google Rich Results Test
5. Monitor CTR changes in Search Console

## Effort: Small (1-2 hours)
