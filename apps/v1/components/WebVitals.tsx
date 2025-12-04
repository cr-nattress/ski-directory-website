'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { logger } from '@/lib/logging';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

/**
 * Core Web Vitals monitoring component
 * Captures LCP, INP, CLS, FCP, and TTFB metrics
 *
 * Logs metrics to:
 * - Console in development
 * - Grafana Cloud Loki when observability logging is enabled
 * - Google Analytics 4 for performance monitoring
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Format value for logging (CLS is a decimal, others are milliseconds)
    const value = metric.name === 'CLS'
      ? Math.round(metric.value * 1000) / 1000
      : Math.round(metric.value);

    // Log to our observability system
    logger.info(`Core Web Vital: ${metric.name}`, {
      metric: metric.name,
      value,
      rating: metric.rating,
      delta: Math.round(metric.delta),
      id: metric.id,
      navigationType: metric.navigationType,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    });

    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        // CLS value needs to be multiplied by 1000 for GA4 (expects integer)
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        // Custom dimensions for analysis
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_rating: metric.rating, // 'good', 'needs-improvement', 'poor'
      });
    }
  });

  return null;
}
