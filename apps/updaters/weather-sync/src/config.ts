/**
 * Configuration for Weather Sync
 */

import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  supabase: {
    url: requireEnv('SUPABASE_URL'),
    serviceKey: requireEnv('SUPABASE_SERVICE_KEY'),
  },
  openMeteo: {
    baseUrl: 'https://api.open-meteo.com/v1/forecast',
    // No API key required for Open-Meteo!
  },
  processing: {
    // Dry run mode - don't write to database
    dryRun: process.env.DRY_RUN === 'true',
    // Verbose logging
    verbose: process.env.VERBOSE === 'true',
    // Filter to specific resort(s)
    filter: process.env.FILTER || null,
    // Batch size for API requests
    batchSize: parseInt(process.env.BATCH_SIZE || '10', 10),
    // Delay between batches (ms) to avoid rate limiting
    batchDelayMs: parseInt(process.env.BATCH_DELAY_MS || '1000', 10),
  },
} as const;
