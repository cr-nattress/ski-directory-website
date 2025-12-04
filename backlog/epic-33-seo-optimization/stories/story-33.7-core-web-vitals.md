# Story 33.7: Add Core Web Vitals Reporting to GA4

## Priority: Medium

## Context

Core Web Vitals (LCP, FID, CLS) are ranking factors for Google. Tracking these metrics in GA4 helps identify performance issues and their impact on user experience.

## Current State

- No Core Web Vitals tracking
- No performance monitoring dashboard
- Unable to correlate performance with user behavior

## Requirements

1. Install web-vitals library
2. Send Core Web Vitals to GA4 as custom events
3. Track LCP, FID, CLS, FCP, TTFB
4. Create custom dimensions in GA4 for analysis

## Implementation

### Install web-vitals

```bash
npm install web-vitals
```

### Web Vitals Reporter

```tsx
// lib/web-vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

function sendToGA4(metric: Metric) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      // Custom dimensions
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating, // 'good', 'needs-improvement', 'poor'
    });
  }
}

export function reportWebVitals() {
  onCLS(sendToGA4);
  onFID(sendToGA4);
  onLCP(sendToGA4);
  onFCP(sendToGA4);
  onTTFB(sendToGA4);
}
```

### Integration with App

```tsx
// components/WebVitalsReporter.tsx
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return null;
}
```

```tsx
// app/layout.tsx
import { WebVitalsReporter } from '@/components/WebVitalsReporter';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <GoogleAnalytics />
      </head>
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
```

### GA4 Custom Dimensions Setup

In Google Analytics 4 Admin:

1. Go to Admin > Custom Definitions > Custom Dimensions
2. Create these dimensions:
   - `metric_id` (Event-scoped)
   - `metric_rating` (Event-scoped)

3. Create these custom metrics:
   - `metric_value` (Event-scoped, Number)
   - `metric_delta` (Event-scoped, Number)

### GA4 Exploration Report

Create a custom report in GA4 Explore:
- Dimensions: Event name, metric_rating
- Metrics: Event count, metric_value (average)
- Filter: Event category = "Web Vitals"

## Thresholds (Google's guidelines)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| TTFB | ≤ 800ms | 800ms - 1800ms | > 1800ms |

## Acceptance Criteria

- [ ] web-vitals library installed
- [ ] Core Web Vitals sent to GA4
- [ ] Events visible in GA4 Real-Time
- [ ] Custom dimensions configured
- [ ] Metric ratings included (good/needs-improvement/poor)

## Testing

1. Open GA4 Real-Time > Events
2. Load pages and verify Web Vitals events appear
3. Check event parameters include metric_value and metric_rating
4. Create exploration report to analyze metrics

## Effort: Small (1-2 hours)
