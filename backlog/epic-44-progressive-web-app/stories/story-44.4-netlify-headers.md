# Story 44.4: Netlify Cache Headers

## Description

Configure Netlify headers to ensure proper caching behavior for PWA files, especially the service worker which must not be cached aggressively.

## Acceptance Criteria

- [ ] `public/_headers` file created
- [ ] Service worker served with `no-cache` directive
- [ ] Manifest has reasonable cache time (1 hour)
- [ ] Static assets properly cached
- [ ] Headers verified in production deployment

## Technical Details

### Headers File: `public/_headers`

```
# Service Worker - Must not be cached by browser/CDN
/service-worker.js
  Cache-Control: no-cache, no-store, must-revalidate
  Content-Type: application/javascript

# Web App Manifest - Cache for 1 hour
/manifest.webmanifest
  Cache-Control: public, max-age=3600
  Content-Type: application/manifest+json

# PWA Icons - Cache for 1 week (rarely change)
/icons/*
  Cache-Control: public, max-age=604800, immutable

# Offline page - Cache for 1 day
/offline.html
  Cache-Control: public, max-age=86400

# Static assets (already handled by Next.js, but explicit for clarity)
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

# Images - Cache for 1 week
/images/*
  Cache-Control: public, max-age=604800
```

### Why Service Worker Cannot Be Cached

The service worker file must always be fetched fresh because:
1. Browser compares byte-for-byte with cached version
2. If SW is stale, updates won't propagate
3. 24-hour max-age is browser default, but `no-cache` ensures immediate updates

### Alternative: `netlify.toml` Approach

If preferred, headers can be in `netlify.toml`:

```toml
# netlify.toml
[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Content-Type = "application/javascript"

[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Cache-Control = "public, max-age=3600"
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/icons/*"
  [headers.values]
    Cache-Control = "public, max-age=604800, immutable"

[[headers]]
  for = "/offline.html"
  [headers.values]
    Cache-Control = "public, max-age=86400"
```

### Verify Headers

After deployment, verify with curl:

```bash
# Check service worker headers
curl -I https://skidirectory.org/service-worker.js

# Check manifest headers
curl -I https://skidirectory.org/manifest.webmanifest
```

Expected response for service-worker.js:
```
cache-control: no-cache, no-store, must-revalidate
content-type: application/javascript
```

## Tasks

1. [ ] Create `public/_headers` file
2. [ ] Deploy to Netlify (preview or production)
3. [ ] Verify headers with curl or browser dev tools
4. [ ] Document header configuration in README

## Effort

2 story points (Small)

## Notes

- Netlify processes `_headers` from the publish directory
- `public/` contents are copied to build output
- Headers in `_headers` file override any defaults
- Consider adding security headers if not already in `next.config.js`
