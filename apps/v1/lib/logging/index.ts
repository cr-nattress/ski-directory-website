/**
 * Logging Module Exports
 *
 * Central export point for all logging utilities.
 */

// Browser logger (main entry point)
export { logger, type LogLevel, type LogEntry, type ComponentLogger } from './browser-logger';

// Log context utilities
export {
  getLogContext,
  getMinimalContext,
  initializeSession,
  type LogContext,
} from './log-context';

// Performance monitoring
export {
  initPerformanceMonitoring,
  trackMetric,
  measureAsync,
  createMeasure,
  trackFirstResortRender,
  trackSearchLatency,
} from './performance';
