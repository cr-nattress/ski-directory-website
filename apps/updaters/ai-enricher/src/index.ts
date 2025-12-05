#!/usr/bin/env node

import { config, validateConfig } from './config.js';
import { processAllResorts } from './processor.js';
import { listResortsWithData, listEnrichedResorts } from './gcs.js';
import * as output from './output.js';
import type { CliOptions } from './types.js';

/**
 * Parse command line arguments
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    skipExisting: false,
    overwrite: false,
    resume: false,
    dryRun: config.processing.dryRun,
    minConfidence: config.processing.minConfidence,
    list: false,
    listEnriched: false,
    verbose: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--filter':
      case '-f':
        options.filter = args[++i];
        break;
      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--skip':
      case '-s':
        options.skip = parseInt(args[++i], 10);
        break;
      case '--skip-existing':
        options.skipExisting = true;
        break;
      case '--overwrite':
        options.overwrite = true;
        break;
      case '--resume':
        options.resume = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--apply':
      case '-a':
        options.dryRun = false;
        break;
      case '--min-confidence':
      case '-c':
        options.minConfidence = parseFloat(args[++i]);
        break;
      case '--list':
        options.list = true;
        break;
      case '--list-enriched':
        options.listEnriched = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          printHelp();
          process.exit(1);
        }
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
AI Resort Data Enricher
-----------------------
Enriches ski resort data using OpenAI GPT-4o to generate taglines,
descriptions, and extract stats from multiple data sources.

Usage: npm run dev -- [options]

Processing Options:
  --filter, -f <pattern>     Filter resorts by name/slug/state
  --limit, -l <number>       Process only N resorts
  --skip, -s <number>        Skip first N resorts
  --skip-existing            Skip resorts with existing enrichment
  --overwrite                Overwrite existing enrichment files
  --resume                   Resume from last successful run
  --dry-run                  Preview without writing (default)
  --apply, -a                Apply changes to GCS/Supabase

Quality Options:
  --min-confidence, -c <n>   Minimum confidence threshold (default: 0.7)

Listing Options:
  --list                     List all resorts with GCS data
  --list-enriched            List resorts with existing enrichment

Other:
  --verbose, -v              Show detailed output
  --help, -h                 Show this help message

Examples:
  # List resorts with data
  npm run dev -- --list

  # Dry run for a single resort
  npm run dev -- --filter vail

  # Process 5 resorts with verbose output
  npm run dev -- --limit 5 --verbose

  # Apply changes for Colorado resorts
  npm run dev -- --filter colorado --apply

  # Resume interrupted processing
  npm run dev -- --resume --apply

  # Skip already enriched resorts
  npm run dev -- --skip-existing --apply

Environment Variables:
  OPENAI_API_KEY             OpenAI API key (required)
  OPENAI_MODEL               Model to use (default: gpt-4o)
  SUPABASE_URL               Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY  Supabase service role key
  GCS_BUCKET_NAME            GCS bucket (default: sda-assets-prod)
  GCS_KEY_FILE               Path to GCS service account key
  MIN_CONFIDENCE             Default confidence threshold (0.0-1.0)
  DRY_RUN                    Default to dry-run mode (true/false)
`);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('');
  console.log('='.repeat(50));
  console.log('  AI RESORT DATA ENRICHER v1.0.0');
  console.log('='.repeat(50));
  console.log('');

  // Parse CLI options
  const options = parseArgs();

  if (options.help) {
    printHelp();
    return;
  }

  // Validate configuration
  try {
    validateConfig();
  } catch (error) {
    output.error(`Configuration error: ${(error as Error).message}`);
    process.exit(1);
  }

  // List mode
  if (options.list) {
    const assetPaths = await listResortsWithData();
    console.log(output.formatResortList(assetPaths, 'Resorts with GCS data'));
    return;
  }

  if (options.listEnriched) {
    const assetPaths = await listEnrichedResorts();
    console.log(output.formatResortList(assetPaths, 'Resorts with AI enrichment'));
    return;
  }

  // Show configuration
  console.log('Configuration:');
  console.log(`  Model: ${config.openai.model}`);
  console.log(`  Min confidence: ${(options.minConfidence * 100).toFixed(0)}%`);
  console.log(`  Mode: ${options.dryRun ? 'DRY RUN' : 'APPLY'}`);
  if (options.filter) {
    console.log(`  Filter: ${options.filter}`);
  }
  if (options.limit) {
    console.log(`  Limit: ${options.limit}`);
  }
  if (options.skip) {
    console.log(`  Skip: ${options.skip}`);
  }
  if (options.skipExisting) {
    console.log(`  Skip existing: yes`);
  }
  if (options.resume) {
    console.log(`  Resume: yes`);
  }
  console.log('');

  // Show dry-run banner if applicable
  if (options.dryRun) {
    output.dryRunBanner();
  }

  // Process resorts
  const results = await processAllResorts({
    filter: options.filter,
    limit: options.limit,
    skip: options.skip,
    skipExisting: options.skipExisting,
    overwrite: options.overwrite,
    resume: options.resume,
    dryRun: options.dryRun,
    minConfidence: options.minConfidence,
    verbose: options.verbose,
  });

  // Print summary
  const successful = results.filter(r => r.success && !r.skipped);
  const skipped = results.filter(r => r.skipped);
  const failed = results.filter(r => !r.success);
  const totalCost = successful.reduce((sum, r) => sum + (r.cost || 0), 0);

  output.summary({
    processed: successful.length,
    skipped: skipped.length,
    failed: failed.length,
    totalCost,
  });

  if (failed.length > 0) {
    console.log('\nFailed resorts:');
    failed.forEach(r => console.log(`  - ${r.slug}: ${r.error}`));
  }

  if (options.dryRun) {
    console.log('\nDRY RUN - No changes were written');
    console.log('Run with --apply to apply changes');
  }
}

// Run
main().catch(error => {
  output.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
