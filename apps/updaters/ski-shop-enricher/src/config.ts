import dotenv from 'dotenv';

dotenv.config();

export interface EnrichmentConfig {
  searchRadiusMiles: number;
  maxShopsPerResort: number;
  batchSize: number;
  delayBetweenRequests: number;
  openaiModel: string;
  dryRun?: boolean;
}

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  gcs: {
    enabled: process.env.GCS_ENABLED !== 'false', // Enabled by default
    bucketName: process.env.GCS_BUCKET_NAME || 'sda-assets-prod',
    keyFile: process.env.GCS_KEY_FILE || '../../../gcp/service-account-key.json',
  },
  enrichment: {
    searchRadiusMiles: parseInt(process.env.SEARCH_RADIUS_MILES || '20'),
    maxShopsPerResort: parseInt(process.env.MAX_SHOPS_PER_RESORT || '10'),
    batchSize: parseInt(process.env.BATCH_SIZE || '5'),
    delayBetweenRequests: parseInt(process.env.DELAY_BETWEEN_REQUESTS_MS || '2000'),
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required config
export function validateConfig(): void {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY'];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
