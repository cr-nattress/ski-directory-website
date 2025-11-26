'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Core Web Vitals monitoring component
 * Captures LCP, INP, CLS, FCP, and TTFB metrics
 *
 * In development: Logs to console
 * In production: Can be extended to send to analytics
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metrics in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating, // 'good', 'needs-improvement', or 'poor'
        id: metric.id,
      });
    }

    // In production, you can send to analytics
    // Example: Send to Google Analytics
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // });

    // Example: Send to custom analytics endpoint
    // if (process.env.NODE_ENV === 'production') {
    //   fetch('/api/analytics/vitals', {
    //     method: 'POST',
    //     body: JSON.stringify(metric),
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }
  });

  return null;
}
