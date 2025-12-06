# Story 39.5: Server Response Time Optimization

## Priority: P1 (High)
## Estimated Savings: 1.98s

## User Story

As a user, I want the server to respond quickly, so that content starts appearing sooner.

## Problem

Lighthouse reports "Reduce initial server response time" with 1.98s potential savings. The Time to First Byte (TTFB) is too high.

## Potential Causes

1. **Slow database queries** - Supabase queries taking too long
2. **No server-side caching** - Same data fetched repeatedly
3. **Unoptimized build** - Server-side rendering overhead
4. **Cold starts** - Serverless function spin-up time

## Acceptance Criteria

- [ ] TTFB < 600ms for most pages
- [ ] Database queries optimized with proper indexing
- [ ] Server-side caching implemented for static data
- [ ] Page generation strategy optimized (SSG vs SSR)
- [ ] Lighthouse server response time in green

## Technical Implementation

### 1. Analyze Current Response Times

```bash
# Test server response time
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" https://skidirectory.org/colorado/vail
```

### 2. Database Query Optimization

```sql
-- Check for missing indexes
EXPLAIN ANALYZE SELECT * FROM resorts_full WHERE slug = 'vail';

-- Add indexes if needed
CREATE INDEX idx_resorts_slug ON resorts(slug);
CREATE INDEX idx_resorts_state_code ON resorts(state_code);
```

### 3. Implement Server-Side Caching

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedResort = unstable_cache(
  async (slug: string) => {
    return await getResortBySlug(slug);
  },
  ['resort'],
  {
    revalidate: 3600,  // 1 hour
    tags: ['resort'],
  }
);
```

### 4. Optimize Static Generation

```typescript
// app/[country]/[state]/[slug]/page.tsx

// Enable ISR with longer revalidation
export const revalidate = 3600;  // Revalidate every hour

// Or use full static generation
export const dynamic = 'force-static';

// Pre-generate popular pages
export async function generateStaticParams() {
  // Generate top 100 most visited resorts
  const popularResorts = await getPopularResorts(100);
  return popularResorts.map(resort => ({
    country: resort.countryCode,
    state: resort.stateCode,
    slug: resort.slug,
  }));
}
```

### 5. Optimize Supabase Queries

```typescript
// Current: May be fetching too much
const { data } = await supabase
  .from('resorts_full')
  .select('*')
  .eq('slug', slug);

// Optimized: Select only needed fields
const { data } = await supabase
  .from('resorts_full')
  .select(`
    id, name, slug, description,
    state_code, country_code,
    latitude, longitude,
    stats, terrain, conditions
  `)
  .eq('slug', slug)
  .single();
```

### 6. Use Edge Runtime Where Possible

```typescript
// For simple API routes
export const runtime = 'edge';  // Use edge for faster cold starts
```

### 7. Netlify Configuration

```toml
# netlify.toml

# Enable on-demand builders for ISR
[functions]
  node_bundler = "esbuild"

# Cache headers
[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "public, max-age=60, stale-while-revalidate=300"
```

### 8. Connection Pooling

```typescript
// Ensure Supabase client reuses connections
// In lib/supabase.ts - verify singleton pattern
```

## Testing

1. Use WebPageTest for TTFB measurement
2. Test cold start vs warm start
3. Compare different routes (static vs dynamic)
4. Profile Supabase query performance

## Metrics

| Metric | Before | Target |
|--------|--------|--------|
| TTFB | ~2s | <600ms |
| Server response | 1.98s | <500ms |

## Files to Modify

- `apps/v1/app/[country]/[state]/[slug]/page.tsx` - Static generation
- `apps/v1/lib/api/*.ts` - Query optimization
- `apps/v1/lib/cache.ts` - Server caching (new)
- `netlify.toml` - Platform config

## Definition of Done

- [ ] TTFB < 600ms on popular pages
- [ ] Static generation for resort pages
- [ ] Server-side caching implemented
- [ ] Database indexes verified
- [ ] Lighthouse improvement confirmed
