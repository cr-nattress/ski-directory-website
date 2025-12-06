/**
 * useLogger React Hook
 *
 * Provides a logging interface for React components with automatic
 * component name context.
 *
 * Usage:
 * ```tsx
 * function ResortCard({ resort }) {
 *   const log = useLogger({ component: 'ResortCard' });
 *
 *   useEffect(() => {
 *     log.info('Resort card rendered', { resortId: resort.id });
 *   }, []);
 * }
 * ```
 */

import { useMemo } from 'react';
import { logger, type ComponentLogger } from '@/lib/logging';

export interface UseLoggerOptions {
  /** Component name for log context */
  component: string;
  /** Additional static context to include in all logs */
  context?: Record<string, unknown>;
}

export interface Logger {
  /** Log debug message (development only) */
  debug: (message: string, data?: Record<string, unknown>) => void;
  /** Log info message */
  info: (message: string, data?: Record<string, unknown>) => void;
  /** Log warning message */
  warn: (message: string, data?: Record<string, unknown>) => void;
  /** Log error message */
  error: (message: string, data?: Record<string, unknown>) => void;
}

/**
 * React hook for component-level logging
 *
 * @param options - Logger configuration
 * @returns Logger interface with debug, info, warn, error methods
 */
export function useLogger(options: UseLoggerOptions): Logger {
  const { component, context } = options;

  // Memoize the logger to prevent unnecessary re-creation
  const componentLogger = useMemo((): Logger => {
    const childLogger: ComponentLogger = logger.child(component);

    // If there's additional context, wrap the logger to include it
    if (context) {
      return {
        debug: (message: string, data?: Record<string, unknown>) => {
          childLogger.debug(message, { ...context, ...data });
        },
        info: (message: string, data?: Record<string, unknown>) => {
          childLogger.info(message, { ...context, ...data });
        },
        warn: (message: string, data?: Record<string, unknown>) => {
          childLogger.warn(message, { ...context, ...data });
        },
        error: (message: string, data?: Record<string, unknown>) => {
          childLogger.error(message, { ...context, ...data });
        },
      };
    }

    // Return the child logger directly if no additional context
    return childLogger;
  }, [component, context]);

  return componentLogger;
}

/**
 * Create a logger for use outside of React components
 * (e.g., in utility functions or services)
 */
export function createLogger(component: string): Logger {
  return logger.child(component);
}
