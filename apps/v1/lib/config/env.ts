/**
 * Environment Variable Configuration
 *
 * Centralized, type-safe access to environment variables with validation.
 * Provides compile-time type checking and runtime validation.
 */

/**
 * Get a required environment variable, throwing if not set
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Parse a boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Parse a numeric environment variable
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Environment configuration with typed access
 */
export const env = {
  /** Current Node environment */
  NODE_ENV: getOptionalEnv('NODE_ENV', 'development'),

  /** Whether running in production */
  isProduction: process.env.NODE_ENV === 'production',

  /** Whether running in development */
  isDevelopment: process.env.NODE_ENV === 'development',

  /** Supabase configuration */
  supabase: {
    get url() {
      return getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    },
    get anonKey() {
      return getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    },
    get serviceRoleKey() {
      return process.env.SUPABASE_SERVICE_ROLE_KEY;
    },
  },

  /** Grafana/Loki observability configuration */
  grafana: {
    lokiUrl: process.env.NEXT_PUBLIC_GRAFANA_LOKI_URL,
    lokiUsername: process.env.NEXT_PUBLIC_GRAFANA_LOKI_USERNAME,
    lokiToken: process.env.NEXT_PUBLIC_GRAFANA_LOKI_API_TOKEN,
    appName: getOptionalEnv('NEXT_PUBLIC_GRAFANA_APP_NAME', 'ski-directory-ui'),
    get isConfigured() {
      return !!(this.lokiUrl && this.lokiUsername && this.lokiToken);
    },
  },

  /** Site URL for canonical URLs and redirects */
  siteUrl: getOptionalEnv('NEXT_PUBLIC_SITE_URL', 'https://skidirectory.com'),
} as const;

/**
 * Validate all required environment variables at startup
 * Call this in server initialization to fail fast on missing config
 */
export function validateEnvironment(): string[] {
  const errors: string[] = [];

  // Check required variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  return errors;
}

/**
 * Type representing the env configuration
 */
export type EnvConfig = typeof env;
