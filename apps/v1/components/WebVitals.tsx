'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { logger } from '@/lib/logging';

/**
 * Core Web Vitals monitoring component
 * Captures LCP, INP, CLS, FCP, and TTFB metrics
 *
 * Logs metrics to:
 * - Console in development
 * - Grafana Cloud Loki when observability logging is enabled
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
  });

  return null;
}
