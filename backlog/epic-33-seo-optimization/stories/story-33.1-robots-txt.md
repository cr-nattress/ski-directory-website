# Story 33.1: Add robots.txt File

## Priority: High

## Context

The site is missing a robots.txt file, which is essential for controlling search engine crawling behavior. This file tells search engines which pages to crawl and which to ignore, and provides the sitemap location.

## Current State

- No `public/robots.txt` file exists
- Sitemap exists at `/sitemap.xml` but isn't referenced
- API routes and admin areas are not explicitly blocked

## Requirements

1. Create robots.txt in public directory
2. Allow crawling of all public pages
3. Disallow API routes
4. Disallow any admin/internal routes
5. Reference the sitemap

## Implementation

```txt
# public/robots.txt

# Allow all crawlers
User-agent: *
Allow: /

# Disallow API routes
Disallow: /api/

# Disallow any debug/internal pages
Disallow: /_next/
Disallow: /admin/

# Sitemap location
Sitemap: https://skidirectory.org/sitemap.xml
```

## Acceptance Criteria

- [ ] robots.txt accessible at https://skidirectory.org/robots.txt
- [ ] Sitemap URL is correctly referenced
- [ ] API routes are blocked from crawling
- [ ] Public pages are allowed

## Testing

1. Deploy and verify robots.txt is accessible
2. Use Google Search Console to test robots.txt
3. Verify sitemap URL resolves correctly

## Effort: Small (< 30 minutes)
