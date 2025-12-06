# Epic 39: Performance Optimization

## Overview

Address critical performance issues identified in Lighthouse audit. Current score is **32/100** - targeting **75+** after optimizations.

## Current Lighthouse Metrics (Baseline)

| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Performance Score | 32 | 75+ | Overall |
| First Contentful Paint (FCP) | 1.2s | <1.0s | Low priority (already decent) |
| Time to Interactive (TTI) | 21.8s | <5s | **Critical** |
| Speed Index | 14.9s | <4s | **Critical** |
| Total Blocking Time (TBT) | 1,120ms | <200ms | **Critical** |
| Largest Contentful Paint (LCP) | 3.9s | <2.5s | High priority |
| Cumulative Layout Shift (CLS) | 0.712 | <0.1 | **Critical** |

## Key Opportunities (by Estimated Savings)

1. **Defer offscreen images** - 21.71s savings
2. **Serve images in next-gen formats** - 10.57s savings
3. **Reduce unused JavaScript** - 2.09s savings
4. **Reduce initial server response time** - 1.98s savings
5. **Properly size images** - 1.45s savings

## Diagnostics Summary

| Issue | Current | Impact |
|-------|---------|--------|
| Network payload | 6,728 KiB | **Enormous** - target <1,600 KiB |
| DOM size | 2,576 elements | Excessive - target <1,500 |
| Main-thread work | 6.2s | High - target <2s |
| JS execution time | 2.5s | High - target <1s |
| Long tasks | 20 found | Many - target <5 |
| Cache policy issues | 22 resources | Need efficient caching |

## Stories

| Story | Title | Priority | Est. Savings |
|-------|-------|----------|--------------|
| 39.1 | Image Optimization - Lazy Loading | P0 | 21.71s |
| 39.2 | Image Optimization - Next-gen Formats | P0 | 10.57s |
| 39.3 | Image Optimization - Proper Sizing | P1 | 1.45s |
| 39.4 | JavaScript Bundle Optimization | P0 | 2.09s |
| 39.5 | Server Response Time Optimization | P1 | 1.98s |
| 39.6 | Layout Shift Prevention (CLS) | P0 | CLS fix |
| 39.7 | DOM Size Reduction | P2 | TTI improvement |
| 39.8 | Cache Policy Optimization | P1 | Repeat visits |

## Success Criteria

- [ ] Lighthouse Performance score >= 75
- [ ] Time to Interactive < 5s
- [ ] Total Blocking Time < 300ms
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Total payload < 2MB

## Technical Approach

### Phase 1: Quick Wins (Stories 39.1, 39.6)
- Implement lazy loading for offscreen images
- Add explicit dimensions to prevent layout shifts
- Expected impact: Score 32 → 50+

### Phase 2: Image Pipeline (Stories 39.2, 39.3)
- Convert images to WebP/AVIF via Next.js Image component
- Generate responsive image sizes
- Expected impact: Score 50 → 65+

### Phase 3: JavaScript Optimization (Story 39.4)
- Code splitting and dynamic imports
- Remove unused dependencies
- Tree shaking optimization
- Expected impact: Score 65 → 75+

### Phase 4: Infrastructure (Stories 39.5, 39.8)
- Server-side caching improvements
- CDN cache headers
- Expected impact: Score 75 → 80+

### Phase 5: Polish (Story 39.7)
- Reduce DOM complexity
- Virtualization for long lists
- Expected impact: Score 80 → 85+

## Dependencies

- Next.js Image component configuration
- GCS bucket for optimized images
- Netlify CDN configuration
