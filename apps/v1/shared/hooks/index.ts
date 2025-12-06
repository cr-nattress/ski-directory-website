/**
 * Shared Hooks barrel export
 * Cross-cutting hooks available from @shared/hooks
 */

// Intersection Observer
export {
  useIntersectionObserver,
  useIntersectionCallback,
} from './useIntersectionObserver';

// Feature Flags
export { useFeatureFlag, useFeatureFlags } from './useFeatureFlag';

// Pull to Refresh
export { usePullToRefresh } from './usePullToRefresh';

// Logging
export { useLogger, createLogger } from './useLogger';
export type { UseLoggerOptions, Logger } from './useLogger';

// Impression/Click Tracking
export {
  useImpressionTracking,
  useClickTracking,
  useResortTracking,
} from './useImpressionTracking';
