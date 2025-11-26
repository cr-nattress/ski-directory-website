# Epic 10: SEO Optimization & Structured Data

## Overview

Implement comprehensive SEO improvements based on Next.js 14 best practices for directory websites. This epic addresses critical gaps identified in the site's search engine optimization including missing sitemaps, robots.txt, structured data enhancements, and metadata improvements.

**Reference Document:** `apps/v1/SEO-RECOMMENDATIONS.md`

## Goals

1. Improve search engine discoverability and indexing
2. Enable rich results in Google search through proper structured data
3. Prevent duplicate content issues with canonical URLs
4. Modernize configuration to current Next.js 14 standards
5. Improve click-through rates with dynamic OG images

## Success Metrics

- Sitemap accessible at `/sitemap.xml`
- Robots.txt accessible at `/robots.txt`
- No `metadataBase` warnings in console
- All pages have canonical URLs
- Structured data validates in Google Rich Results Test
- Core Web Vitals scores maintained or improved

---

## User Stories

### Story 10.1: Add metadataBase and Enhanced Root Metadata

**Priority:** Critical | **Effort:** Small | **Sprint:** 1

**As a** search engine crawler,
**I want** properly configured metadata with a base URL,
**So that** I can correctly resolve OpenGraph images and canonical URLs.

**Acceptance Criteria:**
- [ ] `metadataBase` is set to production URL in `app/layout.tsx`
- [ ] Title template configured with `default` and `template` pattern
- [ ] Robot directives include googleBot configuration
- [ ] Console warning "metadata.metadataBase is not set" no longer appears
- [ ] Environment variable `NEXT_PUBLIC_BASE_URL` used for flexibility

**Technical Notes:**
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com'),
  title: {
    default: 'Colorado Ski Resorts | Find Your Perfect Mountain',
    template: '%s | Ski Colorado',
  },
  // ... robots, verification, etc.
};
```

**Files to Modify:**
- `apps/v1/app/layout.tsx`
- Create `.env.example` with `NEXT_PUBLIC_BASE_URL`

---

### Story 10.2: Create Dynamic Sitemap

**Priority:** Critical | **Effort:** Medium | **Sprint:** 1

**As a** search engine,
**I want** a comprehensive XML sitemap,
**So that** I can efficiently discover and prioritize all pages for indexing.

**Acceptance Criteria:**
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Homepage included with priority 1.0, changeFrequency 'daily'
- [ ] Directory page included with priority 0.9
- [ ] All active resort pages included with priority 0.8
- [ ] Ski Links and Social Links pages included with priority 0.7
- [ ] Each URL includes `lastModified`, `changeFrequency`, `priority`
- [ ] Sitemap validates using online XML sitemap validator

**Technical Notes:**
```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap { ... }
```

**Files to Create:**
- `apps/v1/app/sitemap.ts`

---

### Story 10.3: Create robots.txt

**Priority:** Critical | **Effort:** Small | **Sprint:** 1

**As a** search engine crawler,
**I want** a robots.txt file with clear directives,
**So that** I know which pages to crawl and avoid duplicate content from filtered URLs.

**Acceptance Criteria:**
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Allow all crawlers access to root
- [ ] Disallow `/api/` path
- [ ] Disallow filter query parameters (`?sort=*`, `?filter=*`, `?q=*`, `?platform=*`, `?topic=*`, `?region=*`)
- [ ] Sitemap URL included
- [ ] Host directive included

**Technical Notes:**
```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { ... }
```

**Files to Create:**
- `apps/v1/app/robots.ts`

---

### Story 10.4: Add Canonical URLs to All Pages

**Priority:** High | **Effort:** Medium | **Sprint:** 1

**As a** search engine,
**I want** canonical URLs on every page,
**So that** I can avoid indexing duplicate content and consolidate page authority.

**Acceptance Criteria:**
- [ ] Homepage has `canonical: '/'`
- [ ] Directory page has `canonical: '/directory'`
- [ ] Ski Links page has `canonical: '/ski-links'`
- [ ] Social Links page has `canonical: '/social-links'`
- [ ] All resort pages have `canonical: '/colorado/[slug]'`
- [ ] Canonical URLs render correctly in page source `<link rel="canonical">`

**Technical Notes:**
```typescript
// In generateMetadata
return {
  alternates: {
    canonical: `/colorado/${params.slug}`,
  },
};
```

**Files to Modify:**
- `apps/v1/app/page.tsx`
- `apps/v1/app/directory/page.tsx`
- `apps/v1/app/ski-links/page.tsx`
- `apps/v1/app/social-links/page.tsx`
- `apps/v1/app/colorado/[slug]/page.tsx`

---

### Story 10.5: Create JSON-LD Schema Components

**Priority:** High | **Effort:** Medium | **Sprint:** 2

**As a** user searching for ski resorts,
**I want** rich search results with breadcrumbs and sitelinks,
**So that** I can navigate the site more easily from search results.

**Acceptance Criteria:**
- [ ] `JsonLd` base component created for type-safe schema injection
- [ ] `BreadcrumbJsonLd` component created
- [ ] `WebsiteJsonLd` component created with SearchAction
- [ ] Schema validates at https://validator.schema.org
- [ ] Components are properly typed using `schema-dts` or manual types

**Technical Notes:**
```typescript
// components/schema/JsonLd.tsx
export function JsonLd<T>({ data }: { data: T }) {
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

**Files to Create:**
- `apps/v1/components/schema/JsonLd.tsx`
- `apps/v1/components/schema/BreadcrumbJsonLd.tsx`
- `apps/v1/components/schema/WebsiteJsonLd.tsx`
- `apps/v1/components/schema/index.ts`

---

### Story 10.6: Add Breadcrumb JSON-LD to Resort Pages

**Priority:** High | **Effort:** Small | **Sprint:** 2

**As a** user viewing search results,
**I want** to see breadcrumb navigation in search results,
**So that** I understand the page hierarchy before clicking.

**Acceptance Criteria:**
- [ ] `BreadcrumbJsonLd` component added to `ResortDetail.tsx`
- [ ] Breadcrumb includes: Home > Directory > Resort Name
- [ ] Each breadcrumb item has proper `name` and `item` (URL)
- [ ] JSON-LD appears in page source with correct structure
- [ ] Validates in Google Rich Results Test

**Files to Modify:**
- `apps/v1/components/resort-detail/ResortDetail.tsx`

---

### Story 10.7: Add WebSite Schema to Homepage

**Priority:** Medium | **Effort:** Small | **Sprint:** 2

**As a** user searching on Google,
**I want** a sitelinks search box to appear,
**So that** I can search the site directly from Google results.

**Acceptance Criteria:**
- [ ] `WebsiteJsonLd` component added to homepage or root layout
- [ ] Schema includes `@type: 'WebSite'` with site name and URL
- [ ] `SearchAction` configured with URL template pointing to `/directory?q={search_term}`
- [ ] JSON-LD validates in schema validator

**Files to Modify:**
- `apps/v1/app/page.tsx` or `apps/v1/app/layout.tsx`

---

### Story 10.8: Modernize next.config Image Configuration

**Priority:** Medium | **Effort:** Small | **Sprint:** 2

**As a** developer,
**I want** to use modern Next.js image configuration,
**So that** we avoid deprecation warnings and have better image optimization.

**Acceptance Criteria:**
- [ ] Rename `next.config.js` to `next.config.ts` (TypeScript)
- [ ] Replace deprecated `domains` with `remotePatterns`
- [ ] Add `formats: ['image/avif', 'image/webp']` for modern formats
- [ ] Add `deviceSizes` configuration for responsive images
- [ ] Add `minimumCacheTTL: 2678400` (31 days) for better caching
- [ ] No deprecation warnings in build output

**Files to Modify/Rename:**
- `apps/v1/next.config.js` → `apps/v1/next.config.ts`

---

### Story 10.9: Enhance SkiResort Structured Data

**Priority:** Medium | **Effort:** Medium | **Sprint:** 2

**As a** user searching for ski resorts,
**I want** rich resort information in search results,
**So that** I can see key details like ratings, amenities, and stats without clicking.

**Acceptance Criteria:**
- [ ] Add `@id` with unique identifier for the resort
- [ ] Add `url` property with full canonical URL
- [ ] Add `priceRange` property (e.g., '$$-$$$')
- [ ] Add `sameAs` with resort's official website (if available)
- [ ] Enhance `amenityFeature` with specific values:
  - Skiable Acres (number)
  - Vertical Drop (string with 'ft')
  - Lifts count (number)
  - Boolean features (Terrain Park, Halfpipe, Night Skiing, etc.)
- [ ] Add multiple images array (hero image + trail map)
- [ ] Schema validates in Google Rich Results Test

**Files to Modify:**
- `apps/v1/components/resort-detail/ResortStructuredData.tsx`

---

### Story 10.10: Create Dynamic OG Images for Resort Pages

**Priority:** Medium | **Effort:** Medium | **Sprint:** 3

**As a** user sharing a resort page on social media,
**I want** a custom branded preview image,
**So that** the shared link looks professional and contains key resort info.

**Acceptance Criteria:**
- [ ] Create `opengraph-image.tsx` in resort route folder
- [ ] Generated image includes resort name, location, acreage
- [ ] Image includes star rating and vertical drop
- [ ] Image size is 1200x630 (standard OG size)
- [ ] Image uses brand colors (ski-blue background)
- [ ] OG image URL appears in page source meta tags
- [ ] Preview looks correct in Facebook/Twitter debuggers

**Technical Notes:**
```typescript
// app/colorado/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
```

**Files to Create:**
- `apps/v1/app/colorado/[slug]/opengraph-image.tsx`

---

### Story 10.11: Implement ISR for Resort Pages

**Priority:** Medium | **Effort:** Small | **Sprint:** 3

**As a** user viewing resort pages,
**I want** pages to show fresh data while maintaining fast load times,
**So that** I see current snow conditions without slow page loads.

**Acceptance Criteria:**
- [ ] Add `revalidate = 3600` (1 hour) to resort page
- [ ] Add `dynamicParams = true` for new resorts
- [ ] Verify pages still work with static generation
- [ ] Test that pages regenerate after the revalidation period
- [ ] No impact on build performance

**Files to Modify:**
- `apps/v1/app/colorado/[slug]/page.tsx`

---

### Story 10.12: Add Core Web Vitals Monitoring

**Priority:** Low | **Effort:** Small | **Sprint:** 3

**As a** developer,
**I want** to monitor Core Web Vitals metrics,
**So that** I can track and improve page performance over time.

**Acceptance Criteria:**
- [ ] Create `WebVitals` client component using `useReportWebVitals`
- [ ] Metrics logged to console in development
- [ ] Optional: Send metrics to Google Analytics (if GA is set up)
- [ ] Component added to root layout
- [ ] LCP, INP, and CLS metrics captured

**Technical Notes:**
```typescript
// components/WebVitals.tsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';
```

**Files to Create:**
- `apps/v1/components/WebVitals.tsx`

**Files to Modify:**
- `apps/v1/app/layout.tsx`

---

## Sprint Planning

### Sprint 1: Critical Foundation (Stories 10.1-10.4)
- Add metadataBase
- Create sitemap.ts
- Create robots.ts
- Add canonical URLs

**Estimated Effort:** 4-6 hours

### Sprint 2: Structured Data (Stories 10.5-10.9)
- Create JSON-LD components
- Add BreadcrumbJsonLd
- Add WebsiteJsonLd
- Update next.config
- Enhance SkiResort schema

**Estimated Effort:** 6-8 hours

### Sprint 3: Enhancements (Stories 10.10-10.12)
- Dynamic OG images
- ISR implementation
- Core Web Vitals monitoring

**Estimated Effort:** 4-6 hours

---

## Dependencies

- No external API dependencies
- May require `schema-dts` npm package for TypeScript schema types (optional)
- Environment variable for production URL (`NEXT_PUBLIC_BASE_URL`)

## Validation Checklist

After completing all stories:

1. [ ] Sitemap validates at https://www.xml-sitemaps.com/validate-xml-sitemap.html
2. [ ] Robots.txt validates at https://en.ryte.com/free-tools/robots-txt/
3. [ ] All structured data validates at https://validator.schema.org
4. [ ] Resort pages pass Google Rich Results Test
5. [ ] No console warnings about metadataBase
6. [ ] OG images preview correctly in Facebook/Twitter debuggers
7. [ ] PageSpeed Insights Core Web Vitals are green

---

## Related Documents

- `apps/v1/SEO-RECOMMENDATIONS.md` - Detailed technical recommendations
- `research/ski-resort-seo.md` - Best practices research document
