import 'dotenv/config';

/**
 * OpenAI pricing (as of December 2024)
 */
export const MODEL_PRICING = {
  'gpt-4o': {
    input: 0.0025,   // per 1K tokens
    output: 0.01,    // per 1K tokens
  },
  'gpt-4o-mini': {
    input: 0.00015,
    output: 0.0006,
  },
  'gpt-4-turbo': {
    input: 0.01,
    output: 0.03,
  },
} as const;

/**
 * Application configuration loaded from environment variables
 */
export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  gcs: {
    bucketName: process.env.GCS_BUCKET_NAME || 'sda-assets-prod',
    keyFile: process.env.GCS_KEY_FILE || '../../../gcp/service-account-key.json',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },
  processing: {
    minConfidence: parseFloat(process.env.MIN_CONFIDENCE || '0.7'),
    dryRun: process.env.DRY_RUN !== 'false', // Default to dry run
  },
} as const;

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.supabase.url) {
    errors.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required');
  }
  if (!config.supabase.serviceRoleKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
  }
  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}

/**
 * Calculate estimated cost from token usage
 */
export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING]
    || MODEL_PRICING['gpt-4o'];

  return (
    (promptTokens / 1000) * pricing.input +
    (completionTokens / 1000) * pricing.output
  );
}
