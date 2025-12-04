# Story 33.2: Implement GA4 SPA Page View Tracking

## Priority: High

## Context

The current Google Analytics implementation only tracks the initial page load. In a Single Page Application (SPA) like Next.js, client-side navigation doesn't trigger new page views automatically. This means we're missing data on how users navigate through the site.

## Current State

**Location:** `apps/v1/components/GoogleAnalytics.tsx`

```tsx
// Current implementation - only tracks initial page load
gtag('config', 'G-JE4S4F12GX');
```

## Requirements

1. Track page views on client-side route changes
2. Include full page path in tracking
3. Use Next.js App Router navigation events
4. Ensure tracking fires after navigation completes

## Implementation

```tsx
// components/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_MEASUREMENT_ID = 'G-JE4S4F12GX';

function GoogleAnalyticsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsTracking />
      </Suspense>
    </>
  );
}
```

Also add TypeScript declarations:

```tsx
// types/gtag.d.ts
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export {};
```

## Acceptance Criteria

- [ ] Page views tracked on initial load
- [ ] Page views tracked on client-side navigation
- [ ] URL parameters included in page path
- [ ] No duplicate page views on initial load
- [ ] Works with App Router navigation

## Testing

1. Open GA4 Real-Time reports
2. Navigate between pages using client-side links
3. Verify each navigation triggers a page view
4. Check that page paths are correct

## Effort: Small (< 1 hour)
