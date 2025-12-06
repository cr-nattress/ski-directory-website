/**
 * Shared Config barrel export
 * All configuration available from @shared/config
 */

// Feature flags
export {
  featureFlags,
  getFeatureFlag,
  isFeatureEnabled,
} from './feature-flags';
export type { FeatureFlag } from './feature-flags';

// Environment configuration
export { env, validateEnvironment } from './env';
export type { EnvConfig } from './env';

// Pagination configuration
export { paginationConfig } from './pagination';
export type { PaginationConfigSection } from './pagination';

// Observability configuration
export {
  getObservabilityConfig,
  validateObservabilityConfig,
  isGrafanaConfigured,
  observabilityConfig,
} from './observability';
export type { ObservabilityConfig } from './observability';
