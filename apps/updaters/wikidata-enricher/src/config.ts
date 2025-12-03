import 'dotenv/config';

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
  // Cost estimates per 1K tokens (as of Dec 2024)
  costs: {
    inputPer1K: 0.0025, // GPT-4o input
    outputPer1K: 0.01,  // GPT-4o output
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
export function calculateCost(promptTokens: number, completionTokens: number): number {
  const inputCost = (promptTokens / 1000) * config.costs.inputPer1K;
  const outputCost = (completionTokens / 1000) * config.costs.outputPer1K;
  return inputCost + outputCost;
}
