# SEO Recommendations for Ski Colorado Directory

This document outlines 10 high-priority SEO improvements based on an analysis of the current site architecture against Next.js 14 best practices for directory websites.

---

## Current State Summary

### What's Working Well
- **Static Generation**: Resort pages use `generateStaticParams()` for SSG
- **Dynamic Metadata**: Resort pages have `generateMetadata()` with OpenGraph/Twitter cards
- **JSON-LD Structured Data**: `ResortStructuredData.tsx` implements SkiResort schema
- **Font Optimization**: Using `next/font/google` with font variables
- **Semantic HTML**: Proper heading hierarchy and section structure
- **Breadcrumbs**: Visual breadcrumb navigation on resort pages

### Critical Gaps Identified
- No `sitemap.xml` or `robots.txt`
- Missing `metadataBase` in root layout
- No canonical URLs defined
- Incomplete robots directives
- No breadcrumb JSON-LD schema
- No WebSite schema for sitelinks search box
- Deprecated image configuration in `next.config.js`

---

## Recommendation 1: Add metadataBase to Root Layout

**Priority: Critical** | **Impact: High** | **Effort: Low**

The current warning `metadata.metadataBase is not set` appears in the console. This affects all OpenGraph images and canonical URL generation.

**Current (`app/layout.tsx`):**
```typescript
export const metadata: Metadata = {
  title: "Colorado Ski Resorts...",
  description: "...",
};
```

**Recommended:**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://skicolorado.com'),
  title: {
    default: 'Colorado Ski Resorts | Find Your Perfect Mountain',
    template: '%s | Ski Colorado',
  },
  description: 'Discover 30+ Colorado ski resorts with real-time conditions, expert reviews, and AI-powered recommendations.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};
```

---

## Recommendation 2: Create Dynamic Sitemap

**Priority: Critical** | **Impact: High** | **Effort: Medium**

No sitemap currently exists. Search engines rely on sitemaps to discover and prioritize pages.

**Create `app/sitemap.ts`:**
```typescript
import type { MetadataRoute } from 'next';
import { mockResorts } from '@/lib/mock-data';

const BASE_URL = 'https://skicolorado.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const resortUrls = mockResorts
    .filter((r) => r.isActive)
    .map((resort) => ({
      url: `${BASE_URL}/colorado/${resort.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/directory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ski-links`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/social-links`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...resortUrls,
  ];
}
```

---

## Recommendation 3: Create robots.txt

**Priority: Critical** | **Impact: High** | **Effort: Low**

No robots.txt exists. This is essential for controlling crawler access and preventing duplicate content.

**Create `app/robots.ts`:**
```typescript
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/*?sort=*',
          '/*?filter=*',
          '/*?q=*',
          '/*?platform=*',
          '/*?topic=*',
          '/*?region=*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
```

---

## Recommendation 4: Add Canonical URLs to All Pages

**Priority: High** | **Impact: High** | **Effort: Medium**

No canonical URLs are defined, which can lead to duplicate content issues.

**Update resort page metadata (`app/colorado/[slug]/page.tsx`):**
```typescript
export async function generateMetadata({ params }: ResortPageProps): Promise<Metadata> {
  const resort = getResortBySlug(params.slug);

  return {
    title: `${resort.name} - Colorado Ski Directory`,
    description: resort.description,
    alternates: {
      canonical: `/colorado/${params.slug}`,
    },
    openGraph: {
      // ... existing OG config
    },
  };
}
```

**Apply similar pattern to all page routes:**
- Homepage: `canonical: '/'`
- Directory: `canonical: '/directory'`
- Ski Links: `canonical: '/ski-links'`
- Social Links: `canonical: '/social-links'`

---

## Recommendation 5: Add Breadcrumb JSON-LD Schema

**Priority: High** | **Impact: Medium** | **Effort: Low**

Visual breadcrumbs exist but lack structured data markup for rich results.

**Create `components/schema/BreadcrumbJsonLd.tsx`:**
```typescript
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Add to `ResortDetail.tsx`:**
```typescript
<BreadcrumbJsonLd
  items={[
    { name: 'Home', url: 'https://skicolorado.com' },
    { name: 'Colorado', url: 'https://skicolorado.com/directory' },
    { name: resort.name, url: `https://skicolorado.com/colorado/${resort.slug}` },
  ]}
/>
```

---

## Recommendation 6: Add WebSite Schema for Sitelinks Search Box

**Priority: Medium** | **Impact: Medium** | **Effort: Low**

Adding WebSite schema can enable the sitelinks search box in Google results.

**Create `components/schema/WebsiteJsonLd.tsx`:**
```typescript
export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://skicolorado.com#website',
    name: 'Ski Colorado',
    url: 'https://skicolorado.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://skicolorado.com/directory?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Add to `app/layout.tsx` or homepage.**

---

## Recommendation 7: Modernize next.config.js Image Configuration

**Priority: Medium** | **Impact: Medium** | **Effort: Low**

The current `domains` config is deprecated. Use `remotePatterns` instead.

**Current:**
```javascript
images: {
  domains: ['images.unsplash.com', 'source.unsplash.com', 'picsum.photos'],
},
```

**Recommended (`next.config.ts`):**
```typescript
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 2678400, // 31 days
  },
};

export default config;
```

---

## Recommendation 8: Enhance SkiResort Structured Data

**Priority: Medium** | **Impact: Medium** | **Effort: Medium**

The current `ResortStructuredData.tsx` is good but can be enhanced with additional properties.

**Enhancements:**
```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SkiResort',
  '@id': `https://skicolorado.com/colorado/${resort.slug}#skiresort`,
  name: resort.name,
  description: resort.description,
  url: `https://skicolorado.com/colorado/${resort.slug}`,
  image: [resort.heroImage, resort.trailMapUrl].filter(Boolean),
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
  // ADD: Website URL if available
  ...(resort.website && { sameAs: resort.website }),
  // ADD: Price range indicator
  priceRange: '$$-$$$',
  // ADD: Amenity features with 'value: true'
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Skiable Acres', value: resort.stats.skiableAcres },
    { '@type': 'LocationFeatureSpecification', name: 'Vertical Drop', value: `${resort.stats.verticalDrop} ft` },
    { '@type': 'LocationFeatureSpecification', name: 'Lifts', value: resort.stats.liftsCount },
    ...(resort.features.hasPark ? [{ '@type': 'LocationFeatureSpecification', name: 'Terrain Park', value: true }] : []),
    // ... other features
  ],
};
```

---

## Recommendation 9: Add Dynamic OG Images for Resort Pages

**Priority: Medium** | **Impact: Medium** | **Effort: Medium**

Custom OG images significantly improve click-through rates from social media and search results.

**Create `app/colorado/[slug]/opengraph-image.tsx`:**
```typescript
import { ImageResponse } from 'next/og';
import { getResortBySlug } from '@/lib/mock-data';

export const alt = 'Resort Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const resort = getResortBySlug(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e40af',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
          {resort.name}
        </div>
        <div style={{ fontSize: 32, color: '#93c5fd', marginTop: 20 }}>
          {resort.nearestCity}, CO • {resort.stats.skiableAcres.toLocaleString()} Acres
        </div>
        <div style={{ fontSize: 28, color: '#4ade80', marginTop: 20 }}>
          ★ {resort.rating}/5 • {resort.stats.verticalDrop.toLocaleString()}' Vertical
        </div>
      </div>
    ),
    { ...size }
  );
}
```

---

## Recommendation 10: Implement ISR for Resort Pages

**Priority: Medium** | **Impact: Medium** | **Effort: Low**

Adding Incremental Static Regeneration ensures pages stay fresh while maintaining performance.

**Update `app/colorado/[slug]/page.tsx`:**
```typescript
// Add at the top of the file
export const revalidate = 3600; // Regenerate every hour
export const dynamicParams = true;

// Update generateStaticParams
export async function generateStaticParams() {
  const { mockResorts } = await import('@/lib/mock-data');
  return mockResorts.map((resort) => ({
    slug: resort.slug,
  }));
}
```

This enables:
- Hourly page regeneration for fresh snow conditions
- On-demand regeneration when new resorts are added
- Excellent performance with CDN caching

---

## Implementation Priority Matrix

| Priority | Recommendation | Effort | Impact |
|----------|----------------|--------|--------|
| 1 | Add metadataBase | Low | Critical |
| 2 | Create sitemap.ts | Medium | Critical |
| 3 | Create robots.ts | Low | Critical |
| 4 | Add canonical URLs | Medium | High |
| 5 | Breadcrumb JSON-LD | Low | High |
| 6 | WebSite schema | Low | Medium |
| 7 | Update next.config | Low | Medium |
| 8 | Enhance SkiResort schema | Medium | Medium |
| 9 | Dynamic OG images | Medium | Medium |
| 10 | Implement ISR | Low | Medium |

---

## Quick Wins (Complete in <1 hour)

1. Add `metadataBase` to root layout
2. Create `robots.ts`
3. Add `display: 'swap'` to font configs (already done!)
4. Add canonical URLs to existing metadata

## Medium-Term (1-4 hours)

5. Create comprehensive `sitemap.ts`
6. Add BreadcrumbJsonLd component
7. Add WebsiteJsonLd to homepage
8. Update next.config.ts image patterns

## Longer-Term (4+ hours)

9. Generate dynamic OG images
10. Enhance structured data across all pages
11. Add ISR configuration
12. Implement Core Web Vitals monitoring

---

## Monitoring & Validation

After implementing these changes:

1. **Google Search Console**: Submit sitemap and monitor indexing
2. **Rich Results Test**: Validate structured data at https://search.google.com/test/rich-results
3. **PageSpeed Insights**: Monitor Core Web Vitals
4. **Schema Validator**: Test JSON-LD at https://validator.schema.org

---

*Generated based on analysis of `research/ski-resort-seo.md` best practices applied to current site architecture.*
