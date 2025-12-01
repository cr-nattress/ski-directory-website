import 'dotenv/config';

/**
 * Application configuration loaded from environment variables
 */
export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  gcs: {
    bucketName: process.env.GCS_BUCKET_NAME || 'sda-assets-prod',
    keyFile: process.env.GCS_KEY_FILE || '../../../gcp/service-account-key.json',
  },
  wikipedia: {
    rateLimitMs: parseInt(process.env.WIKIPEDIA_RATE_LIMIT_MS || '500', 10),
    userAgent: 'SkiDirectoryBot/1.0 (https://github.com/cr-nattress/ski-directory-website)',
  },
  dryRun: process.env.DRY_RUN === 'true',
} as const;

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required');
  }
  if (!config.supabase.serviceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
