# Epic 26: SEO Improvements

## High-Level SEO Summary

### Overall Health: Good (7/10)

The codebase has a solid SEO foundation with many best practices already implemented.

### Strengths

1. **Well-structured metadata** - Uses Next.js 14 App Router `generateMetadata` for dynamic pages with proper title templates
2. **JSON-LD structured data** - `SkiResort` schema on resort pages, `WebSite` and `BreadcrumbList` schemas implemented
3. **Clean URL structure** - SEO-friendly `/{country}/{state}/{slug}` pattern (e.g., `/us/colorado/vail`)
4. **Proper robots.txt** - Blocks API routes, filtered URLs, and includes sitemap reference
5. **Dynamic sitemap** - Generates sitemap from Supabase with all resort pages
6. **ISR with revalidation** - Resort pages revalidate hourly for fresh content

### Top Weaknesses

1. **Inconsistent branding** - Site says "Colorado Ski Resorts" but covers North America - FIXED (now SkiDirectory.org)
2. **Missing OG images** - No Open Graph images specified for social sharing - FIXED
3. **Header uses `<a>` instead of Next.js `<Link>`** - Loses client-side navigation SEO benefits - FIXED
4. **Footer has many dead `#` links** - Broken internal linking hurts crawlability - FIXED
5. **Homepage lacks unique `<h1>`** - Hero has `<h1>` but it's generic - FIXED
6. **No Organization schema** - Missing for brand identity in search results - FIXED
7. **Missing image alt attributes in some places** - ResortCard uses `role="img"` with `aria-label` instead of proper `alt` - FIXED

---

## Prioritized Issues (Impact vs Effort)

| ID | Area | Description | Impact | Effort | Priority | Key Files |
|----|------|-------------|--------|--------|----------|-----------|
| SEO-001 | On-page | Update site branding from "Colorado" to "North America" | High | Low | P0 | `layout.tsx`, `WebsiteJsonLd.tsx`, `Footer.tsx` |
| SEO-002 | Technical | Add Open Graph images for all pages | High | Medium | P0 | `layout.tsx`, resort `page.tsx`, all page files |
| SEO-003 | Architecture | Replace `<a>` with `<Link>` in Header navigation | Medium | Low | P1 | `Header.tsx` |
| SEO-004 | Architecture | Fix dead links (`#`) in Footer | Medium | Low | P1 | `Footer.tsx` |
| SEO-005 | Technical | Add Organization schema to root layout | Medium | Low | P1 | `components/schema/` |
| SEO-006 | On-page | Add keyword-rich `<h1>` to homepage | Medium | Low | P1 | `Hero.tsx` or `page.tsx` |
| SEO-007 | Technical | Add `alt` attributes to all images (fix ResortCard) | Medium | Low | P1 | `ResortCard.tsx` |
| SEO-008 | Technical | Add Twitter/OG images to individual pages | Medium | Medium | P1 | Resort, Directory, Ski-links pages |
| SEO-009 | On-page | Add meta descriptions to filtered directory URLs | Medium | Medium | P2 | `DirectoryContent.tsx` |
| SEO-010 | Performance | Optimize hero background image (LCP) | Medium | Medium | P2 | `Hero.tsx`, `public/images/` |
| SEO-011 | Technical | Add `hreflang` for future i18n support | Low | Medium | P2 | `layout.tsx` |
| SEO-012 | Architecture | Add state/region landing pages for topical clustering | High | High | P2 | New route structure |
| SEO-013 | Technical | Implement FAQ schema on relevant pages | Low | Low | P2 | New component |

---

## User Stories

### Story 26.1: Update Site Branding to North America (P0)

**As a** search engine crawler
**I want** consistent branding across the site
**So that** the site ranks for North American ski resort queries, not just Colorado

**Acceptance Criteria:**
- [ ] Update `layout.tsx` metadata title from "Colorado Ski Resorts" to "Ski Resorts | North America's Complete Guide"
- [ ] Update description to mention US and Canada
- [ ] Update keywords to include national terms
- [ ] Update `WebsiteJsonLd.tsx` description
- [ ] Update `Footer.tsx` tagline from "Colorado ski resorts" to "North American ski resorts"
- [ ] Update BASE_URL references if needed (currently skicolorado.com)

**Files to modify:**
- `apps/v1/app/layout.tsx`
- `apps/v1/components/schema/WebsiteJsonLd.tsx`
- `apps/v1/components/Footer.tsx`

---

### Story 26.2: Add Open Graph Images (P0)

**As a** user sharing resort pages on social media
**I want** attractive preview images
**So that** links look professional and get more clicks

**Acceptance Criteria:**
- [ ] Add default OG image to root layout (1200x630px)
- [ ] Add dynamic OG images for resort pages using resort hero images
- [ ] Add static OG images for directory, ski-links, social-links pages
- [ ] Test with Facebook Debugger and Twitter Card Validator

**Files to modify:**
- `apps/v1/app/layout.tsx` - Add `openGraph.images`
- `apps/v1/app/[country]/[state]/[slug]/page.tsx` - Add image to generateMetadata
- `apps/v1/app/directory/page.tsx`
- `apps/v1/app/ski-links/page.tsx`
- `apps/v1/app/social-links/page.tsx`
- `apps/v1/public/images/og-default.jpg` - Create default OG image

---

### Story 26.3: Fix Header Navigation with Next.js Link (P1)

**As a** search engine crawler
**I want** proper internal links using Next.js Link component
**So that** client-side navigation and prefetching work correctly

**Acceptance Criteria:**
- [ ] Replace all `<a href="/">` with `<Link href="/">`
- [ ] Import Link from `next/link`
- [ ] Remove non-existent routes (Weather, Articles, Shops) or add coming soon pages
- [ ] Keep menu functionality working

**Files to modify:**
- `apps/v1/components/Header.tsx`

**Current (problematic):**
```tsx
<a href="/" className="...">
  <span>Ski Directory</span>
</a>
```

**Recommended:**
```tsx
import Link from 'next/link';
// ...
<Link href="/" className="...">
  <span>Ski Directory</span>
</Link>
```

---

### Story 26.4: Fix Footer Dead Links (P1)

**As a** search engine crawler
**I want** all footer links to point to real pages
**So that** crawl budget isn't wasted on dead ends

**Acceptance Criteria:**
- [ ] Replace `href="#"` with actual routes or remove links
- [ ] Remove or gray out links for pages that don't exist yet
- [ ] Add `rel="nofollow"` to external social links
- [ ] Convert `<a>` tags to Next.js `<Link>` for internal routes

**Files to modify:**
- `apps/v1/components/Footer.tsx`

**Dead links to fix:**
- I-70 Corridor, Summit County, Front Range (regional pages don't exist)
- Articles, Pass Guide, Conditions (pages don't exist)
- About, Contact, Careers, Terms (pages don't exist)
- Social icons point to `#`

---

### Story 26.5: Add Organization Schema (P1)

**As a** search engine
**I want** to understand the site's brand identity
**So that** I can display knowledge panel and branded results

**Acceptance Criteria:**
- [ ] Create `OrganizationJsonLd.tsx` component
- [ ] Include name, url, logo, sameAs (social profiles)
- [ ] Add to root layout
- [ ] Validate with Google Rich Results Test

**Files to create/modify:**
- `apps/v1/components/schema/OrganizationJsonLd.tsx` (new)
- `apps/v1/components/schema/index.ts`
- `apps/v1/app/layout.tsx` or `page.tsx`

**Example implementation:**
```tsx
export function OrganizationJsonLd() {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Ski Directory',
      url: BASE_URL,
      logo: `${BASE_URL}/images/logo.png`,
      sameAs: [
        'https://instagram.com/skidirectory',
        'https://twitter.com/skidirectory',
      ],
    }} />
  );
}
```

---

### Story 26.6: Optimize Homepage H1 and Hero (P1)

**As a** search engine
**I want** a clear, keyword-rich H1 on the homepage
**So that** I understand the page's primary topic

**Acceptance Criteria:**
- [ ] Ensure exactly one `<h1>` on homepage with primary keywords
- [ ] Current H1 "Find your perfect ski resort" is good but could be more specific
- [ ] Consider: "Find Your Perfect Ski Resort in North America"
- [ ] Verify heading hierarchy (h1 > h2 > h3)

**Files to modify:**
- `apps/v1/components/Hero.tsx`

---

### Story 26.7: Fix Image Alt Attributes (P1)

**As a** screen reader user and search engine
**I want** descriptive alt text on all images
**So that** I understand image content

**Acceptance Criteria:**
- [ ] ResortCard uses `role="img"` with `aria-label` on a div - convert to proper `<Image>` with `alt`
- [ ] Ensure all `ResortImage` components have meaningful alt text
- [ ] Hero background image should have accessible alternative
- [ ] Trail map images should have alt text

**Files to modify:**
- `apps/v1/components/ResortCard.tsx` - Replace div background with `<Image>`
- `apps/v1/components/Hero.tsx`
- `apps/v1/components/resort-detail/TrailMapCard.tsx`

---

### Story 26.8: Add OG Images to Individual Pages (P1)

**As a** user sharing a specific resort
**I want** the resort's image to appear in the social preview
**So that** my share looks professional

**Acceptance Criteria:**
- [ ] Resort pages use hero image as OG image
- [ ] Directory page has custom OG image
- [ ] Handle image URL resolution (absolute URLs required)

**Files to modify:**
- `apps/v1/app/[country]/[state]/[slug]/page.tsx`

**Example:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const resort = await getResortBySlug(params.slug);
  return {
    // ... existing
    openGraph: {
      images: [{ url: resort.heroImage, width: 1200, height: 630 }],
    },
  };
}
```

---

### Story 26.9: Dynamic Meta for Filtered Directory (P2)

**As a** search engine
**I want** unique meta descriptions for filtered directory views
**So that** state-specific pages rank for state keywords

**Acceptance Criteria:**
- [ ] When URL has `?state=colorado`, update page title and description
- [ ] Consider creating actual routes like `/directory/colorado` instead of query params
- [ ] Add canonical tags to prevent duplicate content

**Files to modify:**
- `apps/v1/app/directory/page.tsx`
- `apps/v1/components/directory/DirectoryContent.tsx`

---

### Story 26.10: Optimize Hero LCP Image (P2)

**As a** user
**I want** the hero image to load quickly
**So that** Core Web Vitals (LCP) scores improve

**Acceptance Criteria:**
- [ ] Convert hero background image to Next.js `<Image>` with `priority`
- [ ] Use appropriate `sizes` attribute
- [ ] Consider using AVIF/WebP formats
- [ ] Preload critical image in `<head>`

**Files to modify:**
- `apps/v1/components/Hero.tsx`
- `apps/v1/public/images/steamboat-town-mtn.jpg` - Optimize size

---

### Story 26.11: Create State Landing Pages (P2)

**As a** user searching for "Colorado ski resorts"
**I want** a dedicated Colorado landing page
**So that** I find a page specifically about Colorado resorts

**Acceptance Criteria:**
- [ ] Create route structure `/directory/[state]` or `/[country]/[state]`
- [ ] Include state-specific H1, meta title, description
- [ ] List all resorts in that state
- [ ] Add BreadcrumbList schema
- [ ] Update sitemap to include state pages

**Files to create:**
- `apps/v1/app/directory/[state]/page.tsx` (new)

---

### Story 26.12: Add FAQ Schema to Resort Pages (P2)

**As a** search engine
**I want** FAQ structured data
**So that** FAQ rich results appear in search

**Acceptance Criteria:**
- [ ] Create `FAQJsonLd.tsx` component
- [ ] Add common questions: "How far from Denver?", "What passes are accepted?", etc.
- [ ] Generate FAQs dynamically from resort data

**Files to create:**
- `apps/v1/components/schema/FAQJsonLd.tsx` (new)

---

## Quick Wins Checklist

- [ ] Update root layout title/description for national coverage
- [ ] Add default OG image to layout
- [ ] Replace `<a>` with `<Link>` in Header
- [ ] Remove dead `#` links from Footer
- [ ] Add Organization schema
- [ ] Convert ResortCard div to proper `<Image>` with alt
- [ ] Add OG images to resort generateMetadata
- [ ] Verify single H1 per page across all routes
- [ ] Add `rel="nofollow"` to external social links
- [ ] Validate all JSON-LD with Google Rich Results Test

---

## Longer-Term SEO Enhancements

### 1. State/Region Landing Pages

Create dedicated landing pages for each state (e.g., `/us/colorado`, `/us/utah`) with curated content, local SEO optimization, and topical authority building.

- **Expected benefit:** Rank for "[State] ski resorts" keywords
- **Complexity:** Medium

### 2. Blog/Content Section

Implement a blog section for ski-related content: resort reviews, trip planning guides, gear recommendations. Use MDX for content authoring.

- **Expected benefit:** Long-tail keyword ranking, internal linking opportunities
- **Complexity:** High

### 3. Pass Comparison Pages

Create dedicated pages for each pass type (Epic, Ikon, Indy) comparing included resorts, pricing, and value.

- **Expected benefit:** Rank for "[Pass] resorts" and comparison queries
- **Complexity:** Medium

### 4. Local Business Integration

Add `LocalBusiness` schema for resort pages, integrate Google Maps Place IDs, and add review aggregation from Google/Yelp.

- **Expected benefit:** Rich local results, review stars in search
- **Complexity:** High

### 5. Performance Optimization Bundle

Comprehensive Core Web Vitals optimization: image lazy loading, code splitting, font optimization, critical CSS inlining.

- **Expected benefit:** Better search ranking from page experience signals
- **Complexity:** High
