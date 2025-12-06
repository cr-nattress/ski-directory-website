# Story 39.4: JavaScript Bundle Optimization

## Priority: P0 (Critical)
## Estimated Savings: 2.09s (+ TBT improvement)

## User Story

As a user, I want the page to become interactive faster, so that I can click and scroll without delays.

## Problem

Lighthouse reports:
- **Reduce unused JavaScript**: 2.09s potential savings
- **Total Blocking Time (TBT)**: 1,120ms (target <200ms)
- **Time to Interactive (TTI)**: 21.8s (target <5s)
- **JavaScript execution time**: 2.5s
- **20 long tasks found** blocking main thread
- **Main-thread work**: 6.2s

## Current State Analysis

The JavaScript bundle is likely bloated with:
- Full libraries loaded when only parts are needed
- Components loaded eagerly that could be lazy
- Third-party scripts blocking render
- Leaflet/map code loaded on all pages

## Acceptance Criteria

- [ ] Total Blocking Time < 300ms
- [ ] Unused JavaScript reduced by 50%+
- [ ] Time to Interactive < 8s
- [ ] No more than 5 long tasks on initial load
- [ ] Map component code-split and loaded only when needed
- [ ] Third-party scripts deferred or loaded async

## Technical Implementation

### 1. Analyze Bundle

```bash
# Add bundle analyzer
npm install @next/bundle-analyzer

# Update next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

# Run analysis
ANALYZE=true npm run build
```

### 2. Dynamic Imports for Heavy Components

```tsx
// Current: Loads map on every page
import { ResortMapView } from '@/components/ResortMapView';

// Better: Lazy load map component
import dynamic from 'next/dynamic';

const ResortMapView = dynamic(
  () => import('@/components/ResortMapView').then(mod => mod.ResortMapView),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);
```

### 3. Components to Code-Split

| Component | Size Impact | Load Condition |
|-----------|-------------|----------------|
| `ResortMapView` | ~200KB (Leaflet) | Only on map view |
| `WeatherForecastCard` | API calls | Below fold |
| `PhotoGallery` | Lightbox lib | On interaction |
| `TrailMapCard` | Large images | Below fold |

### 4. Tree Shaking Imports

```tsx
// Bad - imports entire library
import _ from 'lodash';
_.debounce(fn);

// Good - imports only needed function
import debounce from 'lodash/debounce';
debounce(fn);

// Bad - imports all icons
import { FaSnowflake } from 'react-icons/fa';

// Good - tree-shakeable import
import { FaSnowflake } from 'react-icons/fa6';
```

### 5. Defer Third-Party Scripts

```tsx
// Move analytics/tracking to load after interaction
<Script
  src="https://analytics.example.com/script.js"
  strategy="lazyOnload"  // or "afterInteractive"
/>
```

### 6. Remove Unused Dependencies

Audit and remove:
```bash
# Check for unused packages
npx depcheck

# Common culprits to audit:
# - moment.js (replace with date-fns or dayjs)
# - lodash (use native methods or specific imports)
# - unused UI component libraries
```

### 7. Optimize Supabase Client

```typescript
// Only import what's needed
import { createClient } from '@supabase/supabase-js';
// Not: import { createClient, SupabaseClient, ... } from '@supabase/supabase-js';
```

### 8. Route-Based Code Splitting

Next.js does this by default, but verify:
- Each page should have its own chunk
- Shared components in common chunk
- Heavy page-specific code not in common

## Testing

1. Run `ANALYZE=true npm run build`
2. Review bundle analyzer output
3. Identify largest chunks
4. Run Lighthouse before/after each change
5. Test TTI improvement

## Metrics to Track

| Metric | Before | Target |
|--------|--------|--------|
| TBT | 1,120ms | <300ms |
| TTI | 21.8s | <8s |
| JS execution | 2.5s | <1s |
| Long tasks | 20 | <5 |

## Files to Modify

- `apps/v1/next.config.js` - Bundle analyzer, optimization config
- `apps/v1/components/ResortMapView.tsx` - Dynamic import
- `apps/v1/components/PhotoGallery.tsx` - Dynamic import lightbox
- Various components - Tree shake imports
- `apps/v1/package.json` - Remove unused deps

## Definition of Done

- [ ] Bundle analysis completed
- [ ] Map component dynamically loaded
- [ ] Unused dependencies removed
- [ ] TBT reduced to <300ms
- [ ] TTI reduced significantly
- [ ] No visual/functional regression
