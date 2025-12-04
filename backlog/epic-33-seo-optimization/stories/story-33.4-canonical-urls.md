# Story 33.4: Implement Canonical URLs

## Priority: High

## Context

Canonical URLs prevent duplicate content issues by telling search engines which version of a page is the "official" one. This is especially important for pages that can be accessed via multiple URLs or have query parameters.

## Current State

- No canonical URLs implemented
- Risk of duplicate content indexing
- No handling of URL variations (trailing slashes, query params)

## Requirements

1. Add canonical URL to all pages
2. Handle query parameters correctly (exclude filter params from canonical)
3. Ensure consistency (no trailing slashes)
4. Use absolute URLs with https://

## Implementation

### Using Next.js Metadata API

```tsx
// app/layout.tsx - Add to metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://skidirectory.org'),
  // ... existing metadata
};

// app/page.tsx - Homepage
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

// app/[state]/[slug]/page.tsx - Resort detail pages
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resort = await getResort(params.slug);

  return {
    alternates: {
      canonical: `/${params.state}/${params.slug}`,
    },
    // ... other metadata
  };
}

// app/directory/page.tsx
export const metadata: Metadata = {
  alternates: {
    canonical: '/directory',
  },
};
```

### State Listing Pages

```tsx
// app/[countryCode]/[stateCode]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    alternates: {
      canonical: `/${params.countryCode}/${params.stateCode}`,
    },
  };
}
```

## Acceptance Criteria

- [ ] All pages have canonical URLs
- [ ] Canonical URLs are absolute with https://
- [ ] No trailing slashes in canonical URLs
- [ ] Query parameters excluded from canonical
- [ ] HTML output includes `<link rel="canonical" href="...">`

## Testing

1. View page source and verify `<link rel="canonical">` tag
2. Test pages with query parameters - canonical should exclude params
3. Validate with Google Rich Results Test
4. Check Google Search Console for duplicate content warnings

## Effort: Small (< 1 hour)
