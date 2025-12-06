# Story 39.8: Cache Policy Optimization

## Priority: P1 (High)
## Issues: 22 resources with inefficient caching

## User Story

As a returning user, I want the site to load instantly from cache, so that I don't re-download the same assets every visit.

## Problem

Lighthouse reports "Serve static assets with an efficient cache policy" with 22 resources found. Assets are either not cached or cached for too short a period.

## Acceptance Criteria

- [ ] All static assets have appropriate cache headers
- [ ] Immutable assets (hashed filenames) cached for 1 year
- [ ] API responses cached appropriately
- [ ] Images cached with long TTL
- [ ] Lighthouse cache policy audit passes
- [ ] Repeat page visits show significant speed improvement

## Technical Implementation

### 1. Next.js Static Assets (Automatic)

Next.js automatically sets good cache headers for static assets:
```
/_next/static/* → Cache-Control: public, max-age=31536000, immutable
```

Verify this is working correctly.

### 2. Configure Headers in next.config.js

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        // Static assets from public folder
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Fonts
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes - short cache with revalidation
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};
```

### 3. Configure GCS Bucket Cache Headers

For images served from Google Cloud Storage:

```bash
# Set cache headers for entire bucket
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  gs://ski-directory-assets/**

# Or per-object during upload
gsutil -h "Cache-Control:public, max-age=31536000" cp image.jpg gs://bucket/
```

### 4. Configure Netlify Cache Headers

```toml
# netlify.toml

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# HTML pages - short cache
[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=3600, stale-while-revalidate=86400"
```

### 5. CDN-Level Caching (Netlify Edge)

```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = ".next"

# Enable edge caching
[[edge_handlers]]
  path = "/*"
  handler = "cache-handler"
```

### 6. Browser Service Worker (Optional)

For aggressive offline-first caching:

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/storage\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gcs-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,  // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  // ... rest of config
});
```

### 7. API Response Caching

```typescript
// app/api/resorts/[slug]/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const resort = await getResort(slug);

  return NextResponse.json(resort, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

## Cache Strategy by Asset Type

| Asset Type | Cache Duration | Strategy |
|------------|---------------|----------|
| JS/CSS bundles | 1 year | Immutable (hashed filenames) |
| Images (GCS) | 1 year | Long cache |
| Fonts | 1 year | Immutable |
| HTML pages | 0 (revalidate) | stale-while-revalidate |
| API responses | 1-5 minutes | stale-while-revalidate |
| Resort data | 1 hour | ISR revalidation |

## Testing

1. Check cache headers in DevTools Network tab
2. Use `curl -I` to inspect headers
3. Test repeat visit load times
4. Verify Lighthouse passes cache audit

```bash
# Check cache headers
curl -I https://skidirectory.org/_next/static/chunks/main.js
curl -I https://storage.googleapis.com/ski-directory-assets/vail/hero/main.jpg
```

## Definition of Done

- [ ] Static assets cached for 1 year
- [ ] GCS images have cache headers
- [ ] Netlify headers configured
- [ ] API responses have appropriate caching
- [ ] Lighthouse cache audit passes
- [ ] Repeat visits show < 1s load time
