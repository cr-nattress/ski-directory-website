/**
 * Environment Variable Configuration
 *
 * Centralized, type-safe access to environment variables with validation.
 *
 * IMPORTANT: For Next.js client-side env vars (NEXT_PUBLIC_*), we must use
 * direct process.env.NEXT_PUBLIC_X access so the values get inlined at build time.
 * Using dynamic key access like process.env[key] doesn't work for client bundles.
 */

// Direct access to NEXT_PUBLIC_ vars - these get inlined at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE;
const GRAFANA_LOKI_URL = process.env.NEXT_PUBLIC_GRAFANA_LOKI_URL;
const GRAFANA_LOKI_USERNAME = process.env.NEXT_PUBLIC_GRAFANA_LOKI_USERNAME;
const GRAFANA_LOKI_API_TOKEN = process.env.NEXT_PUBLIC_GRAFANA_LOKI_API_TOKEN;
const GRAFANA_APP_NAME = process.env.NEXT_PUBLIC_GRAFANA_APP_NAME || 'ski-directory-ui';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://skidirectory.com';

/**
 * Environment configuration with typed access
 */
export const env = {
  /** Current Node environment */
  NODE_ENV: process.env.NODE_ENV || 'development',

  /** Whether running in production */
  isProduction: process.env.NODE_ENV === 'production',

  /** Whether running in development */
  isDevelopment: process.env.NODE_ENV === 'development',

  /** Supabase configuration */
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    useSupabase: USE_SUPABASE === 'true',
  },

  /** Grafana/Loki observability configuration */
  grafana: {
    lokiUrl: GRAFANA_LOKI_URL,
    lokiUsername: GRAFANA_LOKI_USERNAME,
    lokiToken: GRAFANA_LOKI_API_TOKEN,
    appName: GRAFANA_APP_NAME,
    get isConfigured() {
      return !!(this.lokiUrl && this.lokiUsername && this.lokiToken);
    },
  },

  /** Site URL for canonical URLs and redirects */
  siteUrl: SITE_URL,
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
