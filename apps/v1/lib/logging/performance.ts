/**
 * Performance Monitoring
 *
 * Tracks custom performance metrics.
 *
 * Note: Core Web Vitals (LCP, FID, CLS, FCP, TTFB) are tracked by the
 * WebVitals component using Next.js's built-in useReportWebVitals hook.
 * This module provides utilities for custom performance tracking.
 */

import { logger } from './browser-logger';

/**
 * Initialize performance monitoring
 * Note: Web Vitals are handled by the WebVitals component
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') {
    return;
  }

  logger.info('Performance monitoring initialized');
}

/**
 * Track a custom performance metric
 */
export function trackMetric(
  name: string,
  value: number,
  metadata?: Record<string, unknown>
): void {
  logger.info(`Performance metric: ${name}`, {
    metric: name,
    value: Math.round(value * 100) / 100,
    ...metadata,
    page: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

/**
 * Measure the duration of an async operation
 */
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    trackMetric(name, duration, {
      ...metadata,
      success: true,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    trackMetric(name, duration, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Create a performance mark and measure
 */
export function createMeasure(name: string): {
  start: () => void;
  end: () => number;
} {
  const markName = `${name}-start`;
  let startTime = 0;

  return {
    start: () => {
      startTime = performance.now();
      if (typeof performance.mark === 'function') {
        performance.mark(markName);
      }
    },
    end: () => {
      const duration = performance.now() - startTime;

      if (typeof performance.measure === 'function') {
        try {
          performance.measure(name, markName);
        } catch {
          // Mark may not exist
        }
      }

      trackMetric(name, duration);
      return duration;
    },
  };
}

/**
 * Track time to first resort render
 */
export function trackFirstResortRender(resortCount: number): void {
  if (typeof window === 'undefined') return;

  const navigationStart = performance.timing?.navigationStart || 0;
  const now = performance.now();

  trackMetric('time-to-first-resort', now, {
    resortCount,
    navigationStart,
  });
}

/**
 * Track search latency
 */
export function trackSearchLatency(
  query: string,
  resultCount: number,
  duration: number
): void {
  trackMetric('search-latency', duration, {
    queryLength: query.length,
    resultCount,
    hasResults: resultCount > 0,
  });
}
