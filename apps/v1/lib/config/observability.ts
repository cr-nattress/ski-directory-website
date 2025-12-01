/**
 * Observability Configuration
 *
 * Environment-based configuration for Grafana Cloud logging.
 * Reads from environment variables and provides typed access.
 */

import { featureFlags } from './feature-flags';

export interface ObservabilityConfig {
  /** Whether observability logging is enabled */
  enabled: boolean;
  /** Grafana Loki push endpoint URL */
  lokiUrl: string | undefined;
  /** Grafana Loki username */
  lokiUsername: string | undefined;
  /** Grafana Loki API token */
  lokiToken: string | undefined;
  /** Application name for log labels */
  appName: string;
  /** Current environment (development, production, etc.) */
  environment: string;
  /** Static labels attached to all logs */
  labels: {
    app: string;
    source: string;
    environment: string;
  };
  /** Batching configuration */
  batching: {
    /** Maximum number of log entries per batch */
    maxBatchSize: number;
    /** Maximum time (ms) to wait before flushing a batch */
    flushInterval: number;
    /** Maximum retries for failed batches */
    maxRetries: number;
    /** Base delay (ms) for exponential backoff */
    retryBaseDelay: number;
  };
  /** Performance thresholds */
  thresholds: {
    /** API call duration (ms) considered slow */
    slowApiThreshold: number;
    /** Error rate percentage to trigger warnings */
    highErrorRateThreshold: number;
  };
}

/**
 * Get the observability configuration
 * This is a function to ensure environment variables are read at runtime
 */
export function getObservabilityConfig(): ObservabilityConfig {
  const environment = process.env.NODE_ENV || 'development';
  const appName = process.env.NEXT_PUBLIC_GRAFANA_APP_NAME || 'ski-directory-ui';

  return {
    enabled: featureFlags.observabilityLogging,
    lokiUrl: process.env.NEXT_PUBLIC_GRAFANA_LOKI_URL,
    lokiUsername: process.env.NEXT_PUBLIC_GRAFANA_LOKI_USERNAME,
    lokiToken: process.env.NEXT_PUBLIC_GRAFANA_LOKI_API_TOKEN,
    appName,
    environment,
    labels: {
      app: appName,
      source: 'browser',
      environment,
    },
    batching: {
      maxBatchSize: 50,
      flushInterval: 10000, // 10 seconds
      maxRetries: 3,
      retryBaseDelay: 1000, // 1 second
    },
    thresholds: {
      slowApiThreshold: 2000, // 2 seconds
      highErrorRateThreshold: 5, // 5%
    },
  };
}

/**
 * Validate the observability configuration
 * Returns warnings for missing or invalid configuration
 */
export function validateObservabilityConfig(): string[] {
  const config = getObservabilityConfig();
  const warnings: string[] = [];

  if (config.enabled) {
    if (!config.lokiUrl) {
      warnings.push('NEXT_PUBLIC_GRAFANA_LOKI_URL is not set - logs will not be shipped to Grafana');
    }
    if (!config.lokiUsername) {
      warnings.push('NEXT_PUBLIC_GRAFANA_LOKI_USERNAME is not set - authentication may fail');
    }
    if (!config.lokiToken) {
      warnings.push('NEXT_PUBLIC_GRAFANA_LOKI_API_TOKEN is not set - authentication may fail');
    }
  }

  return warnings;
}

/**
 * Check if Grafana logging is properly configured
 */
export function isGrafanaConfigured(): boolean {
  const config = getObservabilityConfig();
  return !!(config.enabled && config.lokiUrl && config.lokiUsername && config.lokiToken);
}

// Export singleton config for convenience
export const observabilityConfig = getObservabilityConfig();
