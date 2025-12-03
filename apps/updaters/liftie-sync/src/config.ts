import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface Config {
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
  gcs: {
    bucket: string;
  };
  processing: {
    dryRun: boolean;
    filter: string | null;
    verbose: boolean;
  };
}

function getEnvVar(name: string, fallbackName?: string): string {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) {
    throw new Error(`Environment variable ${name}${fallbackName ? ` or ${fallbackName}` : ''} is required`);
  }
  return value;
}

function parseArgs(): { dryRun: boolean; filter: string | null; verbose: boolean } {
  const args = process.argv.slice(2);
  let dryRun = false;
  let filter: string | null = null;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--filter' && args[i + 1]) {
      filter = args[i + 1];
      i++;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Liftie Sync - Sync real-time conditions from GCS to Supabase

Usage: npm run dev [options]

Options:
  --dry-run       Preview changes without writing to database
  --filter <slug> Only process resorts matching this slug pattern
  --verbose, -v   Show detailed output
  --help, -h      Show this help message

Examples:
  npm run dev                          # Sync all resorts
  npm run dev -- --dry-run             # Preview all changes
  npm run dev -- --filter vail         # Only sync Vail
  npm run dev -- --filter mammoth -v   # Sync Mammoth with verbose output
`);
      process.exit(0);
    }
  }

  return { dryRun, filter, verbose };
}

const args = parseArgs();

export const config: Config = {
  supabase: {
    url: getEnvVar('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },
  gcs: {
    bucket: process.env.GCS_BUCKET || process.env.GCS_BUCKET_NAME || 'sda-assets-prod',
  },
  processing: {
    dryRun: args.dryRun,
    filter: args.filter,
    verbose: args.verbose,
  },
};
