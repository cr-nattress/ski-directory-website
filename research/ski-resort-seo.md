# Complete SEO implementation guide for Next.js skiing directory sites

Building a high-performing, search-optimized skiing directory in Next.js requires a strategic combination of technical SEO, structured data, performance optimization, and local search tactics. This guide provides production-ready TypeScript code and current best practices for late 2024/2025.

## The App Router advantage for SEO in 2025

**Next.js App Router is the definitive choice** for new directory websites. Server Components render content directly to HTML for crawlers, the Metadata API centralizes SEO management, and automatic code-splitting delivers superior Core Web Vitals. The App Router ships significantly less client-side JavaScript than Pages Router, directly improving LCP and INP scores that Google uses for rankings.

For a skiing directory, choose rendering strategies based on content volatility:
- **SSG** (Static Site Generation): Homepage, about pages, static content
- **ISR** (Incremental Static Regeneration): Resort listings, category pages with `revalidate: 3600`
- **SSR** (Server-side Rendering): Search results, real-time availability data

```typescript
// app/resorts/[slug]/page.tsx - ISR for resort pages
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Regenerate hourly
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const resorts = await fetch('https://api.example.com/resorts').then(r => r.json());
  return resorts.map((resort: { slug: string }) => ({ slug: resort.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resort = await getResort(slug);
  
  if (!resort) return { title: 'Resort Not Found' };
  
  return {
    title: `${resort.name} Ski Resort`,
    description: `${resort.name} in ${resort.location}. ${resort.trailCount} trails, ${resort.verticalDrop}ft vertical. Rating: ${resort.rating}/5.`,
    alternates: {
      canonical: `/resorts/${slug}`,
    },
    openGraph: {
      title: `${resort.name} - Ski Resort Directory`,
      description: resort.description,
      images: [{ url: resort.heroImage, width: 1200, height: 630 }],
      type: 'website',
    },
  };
}
```

## Metadata architecture with template inheritance

Configure a root layout with `metadataBase` and title templates to ensure consistent branding across all pages while allowing dynamic overrides:

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://skiresortdirectory.com'),
  title: {
    default: 'Ski Resort Directory | Find Your Perfect Mountain',
    template: '%s | Ski Resort Directory',
  },
  description: 'Discover and compare ski resorts worldwide with ratings, trail maps, and real reviews.',
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
  alternates: {
    canonical: './',
  },
  verification: {
    google: 'your-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

## Dynamic sitemap generation handles thousands of listings

For directory sites with potentially thousands of resort pages, implement dynamic sitemaps with the `generateSitemaps` function to create a sitemap index:

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://skiresortdirectory.com';
const URLS_PER_SITEMAP = 50000;

export async function generateSitemaps() {
  const { total } = await fetch('https://api.example.com/resorts/count').then(r => r.json());
  const sitemapCount = Math.ceil(total / URLS_PER_SITEMAP);
  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: { id: Promise<number> }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const start = id * URLS_PER_SITEMAP;
  
  const resorts = await fetch(
    `https://api.example.com/resorts?offset=${start}&limit=${URLS_PER_SITEMAP}`
  ).then(r => r.json());
  
  const categories = await fetch('https://api.example.com/categories').then(r => r.json());
  const regions = await fetch('https://api.example.com/regions').then(r => r.json());

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...regions.map((region: any) => ({
      url: `${BASE_URL}/regions/${region.slug}`,
      lastModified: new Date(region.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...categories.map((cat: any) => ({
      url: `${BASE_URL}/category/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...resorts.map((resort: any) => ({
      url: `${BASE_URL}/resorts/${resort.slug}`,
      lastModified: new Date(resort.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
```

## Robots.txt controls crawler access to faceted navigation

Block URL parameters that create duplicate content while allowing valuable category pages:

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skiresortdirectory.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/search?*',
          '/*?sort=*',
          '/*?filter=*',
          '/*?price=*',
        ],
      },
    ],
    sitemap: [`${BASE_URL}/sitemap.xml`],
    host: BASE_URL,
  };
}
```

## Schema.org structured data drives rich results

Implement JSON-LD structured data using a type-safe component pattern. The `schema-dts` package provides TypeScript interfaces for all Schema.org types:

```typescript
// components/JsonLd.tsx
import type { Thing, WithContext } from 'schema-dts';

export function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
```

### SkiResort schema for individual resort pages

```typescript
// components/schema/SkiResortJsonLd.tsx
import type { WithContext, SkiResort } from 'schema-dts';
import { JsonLd } from '../JsonLd';

interface ResortData {
  name: string;
  slug: string;
  description: string;
  address: { street: string; city: string; state: string; postalCode: string; country: string };
  coordinates: { latitude: number; longitude: number };
  phone?: string;
  priceRange?: string;
  rating?: { value: number; count: number };
  images: string[];
  amenities?: string[];
}

export function SkiResortJsonLd({ resort }: { resort: ResortData }) {
  const jsonLd: WithContext<SkiResort> = {
    '@context': 'https://schema.org',
    '@type': 'SkiResort',
    '@id': `https://skiresortdirectory.com/resorts/${resort.slug}#skiresort`,
    name: resort.name,
    description: resort.description,
    url: `https://skiresortdirectory.com/resorts/${resort.slug}`,
    image: resort.images,
    telephone: resort.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: resort.address.street,
      addressLocality: resort.address.city,
      addressRegion: resort.address.state,
      postalCode: resort.address.postalCode,
      addressCountry: resort.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: resort.coordinates.latitude,
      longitude: resort.coordinates.longitude,
    },
    priceRange: resort.priceRange,
    ...(resort.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: resort.rating.value,
        ratingCount: resort.rating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(resort.amenities && {
      amenityFeature: resort.amenities.map(name => ({
        '@type': 'LocationFeatureSpecification' as const,
        name,
        value: true,
      })),
    }),
  };

  return <JsonLd data={jsonLd} />;
}
```

### BreadcrumbList schema enhances SERP appearance

```typescript
// components/schema/BreadcrumbJsonLd.tsx
import type { WithContext, BreadcrumbList } from 'schema-dts';
import { JsonLd } from '../JsonLd';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={jsonLd} />;
}
```

### WebSite schema enables sitelinks search box

```typescript
// components/schema/WebsiteJsonLd.tsx
import type { WithContext, WebSite } from 'schema-dts';
import { JsonLd } from '../JsonLd';

export function WebsiteJsonLd() {
  const jsonLd: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://skiresortdirectory.com#website',
    name: 'Ski Resort Directory',
    url: 'https://skiresortdirectory.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://skiresortdirectory.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    } as any,
  };

  return <JsonLd data={jsonLd} />;
}
```

## Core Web Vitals optimization directly impacts rankings

Google uses **LCP ≤2.5s**, **INP ≤200ms**, and **CLS ≤0.1** as ranking signals. INP replaced FID in March 2024, making interaction responsiveness even more critical.

### Image optimization with next/image

```typescript
// components/ResortHeroImage.tsx
import Image from 'next/image';

interface ResortImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function ResortHeroImage({ src, alt, priority = false }: ResortImageProps) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px"
        quality={80}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48cmVjdCBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
        style={{ objectFit: 'cover' }}
        className="rounded-lg"
      />
    </div>
  );
}
```

### next.config.ts image configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 2678400,
  },
  modularizeImports: {
    'lodash': { transform: 'lodash/{{member}}' },
  },
};

export default config;
```

### Code splitting with dynamic imports

```typescript
// components/ResortMap.tsx
'use client';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
});

export function ResortMap({ coordinates }: { coordinates: { lat: number; lng: number } }) {
  return <InteractiveMap center={coordinates} zoom={12} />;
}
```

### Font optimization prevents CLS

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

## Directory site architecture maximizes crawl efficiency

A **flat architecture** (3-4 clicks maximum from homepage) distributes link equity effectively and ensures Google indexes all content. For a skiing directory:

```
Homepage (/)
├── Regions (/regions/[region])
│   └── Resort Pages (/resorts/[slug])
├── Categories (/category/[category])
│   └── Resort Pages (/resorts/[slug])
├── Activities (/activities/[activity])
└── Guides (/guides/[slug])
```

### Breadcrumb navigation component

```typescript
// components/Breadcrumbs.tsx
import Link from 'next/link';
import { BreadcrumbJsonLd } from './schema/BreadcrumbJsonLd';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schemaItems = items.map(item => ({
    name: item.name,
    url: `https://skiresortdirectory.com${item.href}`,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={schemaItems} />
      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && <span className="mx-2">›</span>}
              {index === items.length - 1 ? (
                <span className="text-gray-900 font-medium">{item.name}</span>
              ) : (
                <Link href={item.href} className="hover:text-blue-600">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

### Pagination with proper canonical handling

```typescript
// app/resorts/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNum = parseInt(page || '1', 10);

  return {
    title: pageNum === 1 ? 'All Ski Resorts' : `All Ski Resorts - Page ${pageNum}`,
    alternates: {
      canonical: pageNum === 1 ? '/resorts' : `/resorts?page=${pageNum}`,
    },
    robots: pageNum > 10 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function ResortsPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNum = parseInt(page || '1', 10);
  const { resorts, totalPages } = await getResorts(pageNum);

  return (
    <main>
      <h1>All Ski Resorts {pageNum > 1 && `- Page ${pageNum}`}</h1>
      {/* Resort listings */}
      <Pagination currentPage={pageNum} totalPages={totalPages} basePath="/resorts" />
    </main>
  );
}
```

## Mobile-first indexing requires content parity

Google exclusively uses mobile versions for indexing as of 2024. Critical requirements:
- **Viewport meta tag**: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- **Touch targets**: Minimum 48x48px with 8px spacing
- **Readable text**: 16px minimum font size
- **Same content** on mobile and desktop

## Dynamic Open Graph images boost click-through rates

Generate unique OG images for each resort page:

```typescript
// app/resorts/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const alt = 'Resort Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resort = await getResort(slug);

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
          backgroundColor: '#1a365d',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
          {resort.name}
        </div>
        <div style={{ fontSize: 32, color: '#90cdf4', marginTop: 20 }}>
          {resort.location} • {resort.trailCount} Trails
        </div>
        <div style={{ fontSize: 28, color: '#48bb78', marginTop: 20 }}>
          ★ {resort.rating}/5 • {resort.reviewCount} Reviews
        </div>
      </div>
    ),
    { ...size }
  );
}
```

## International SEO with next-intl

For multi-language directory sites, `next-intl` provides the most robust i18n solution:

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'fr', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  pathnames: {
    '/resorts/[slug]': {
      en: '/resorts/[slug]',
      de: '/skigebiete/[slug]',
      fr: '/stations/[slug]',
      es: '/estaciones/[slug]',
    },
  },
});
```

### hreflang implementation in metadata

```typescript
// app/[locale]/resorts/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = 'https://skiresortdirectory.com';

  const languages: Record<string, string> = {
    en: `${baseUrl}/en/resorts/${slug}`,
    de: `${baseUrl}/de/skigebiete/${slug}`,
    fr: `${baseUrl}/fr/stations/${slug}`,
    es: `${baseUrl}/es/estaciones/${slug}`,
    'x-default': `${baseUrl}/resorts/${slug}`,
  };

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}/resorts/${slug}`,
      languages,
    },
  };
}
```

## Local SEO for ski resort listings

Each resort listing should include complete local business information:

- **NAP consistency**: Exact name, address, phone format across all pages
- **Embedded Google Maps** with geo coordinates
- **SkiResort schema** with full address, coordinates, amenities
- **Reviews and ratings** with AggregateRating schema
- **Operating hours** with OpeningHoursSpecification

### Location-specific landing pages

Create geo-targeted content for major feeder markets:
- `/skiing-near-denver` - Targets "ski resorts near Denver"
- `/regions/colorado` - Comprehensive regional guide
- `/family-skiing-vermont` - Long-tail keyword targeting

## Analytics and monitoring setup

### Google Analytics 4 with @next/third-parties

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
```

### Core Web Vitals monitoring

```typescript
// components/WebVitals.tsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    window.gtag?.('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  });
  return null;
}
```

### Vercel Speed Insights integration

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Complete resort page implementation

```typescript
// app/resorts/[slug]/page.tsx
import type { Metadata } from 'next';
import { SkiResortJsonLd } from '@/components/schema/SkiResortJsonLd';
import { BreadcrumbJsonLd } from '@/components/schema/BreadcrumbJsonLd';
import { ResortHeroImage } from '@/components/ResortHeroImage';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const resorts = await getResorts();
  return resorts.map((r: { slug: string }) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resort = await getResort(slug);

  return {
    title: `${resort.name} Ski Resort`,
    description: `${resort.name} in ${resort.location}. ${resort.trailCount} trails, ${resort.verticalDrop}ft vertical drop.`,
    alternates: { canonical: `/resorts/${slug}` },
    openGraph: {
      title: `${resort.name} - Ski Resort Directory`,
      description: resort.description,
      type: 'website',
      images: [{ url: resort.heroImage }],
    },
  };
}

export default async function ResortPage({ params }: Props) {
  const { slug } = await params;
  const resort = await getResort(slug);

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Resorts', href: '/resorts' },
    { name: resort.region, href: `/regions/${resort.regionSlug}` },
    { name: resort.name, href: `/resorts/${slug}` },
  ];

  return (
    <>
      <SkiResortJsonLd resort={resort} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbs} />
        <ResortHeroImage src={resort.heroImage} alt={`${resort.name} ski resort`} priority />
        <h1 className="text-4xl font-bold mt-6">{resort.name}</h1>
        <p className="text-lg text-gray-600 mt-2">{resort.location}</p>
        {/* Additional content sections */}
      </main>
    </>
  );
}
```

## Key implementation priorities

1. **Metadata API for all SEO**: Use `generateMetadata` for dynamic pages, static exports for fixed pages
2. **JSON-LD on every listing**: SkiResort schema with address, coordinates, ratings, and amenities
3. **Dynamic sitemaps**: Use `generateSitemaps` for large directories with 50,000 URL limit per sitemap
4. **ISR for listings**: `revalidate: 3600` balances freshness with build performance
5. **Priority images above fold**: Use `priority` prop on hero images for LCP optimization
6. **Faceted navigation control**: Block filter parameters in robots.txt to prevent crawl waste
7. **Mobile-first testing**: All content and functionality must work identically on mobile
8. **Core Web Vitals monitoring**: Track LCP, INP, CLS continuously with useReportWebVitals

These patterns provide a complete SEO foundation that scales from dozens to thousands of ski resort listings while maintaining excellent search visibility and user experience.