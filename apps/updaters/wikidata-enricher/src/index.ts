#!/usr/bin/env node

import { config, validateConfig, calculateCost } from './config.js';
import { fetchAllResorts, updateResort, updateResortStats, updateResortTerrain, updateResortFeatures } from './supabase.js';
import { downloadWikiData, listResortsWithWikiData, saveEnrichedData } from './gcs.js';
import { extractDataWithLLM, sleep } from './openai.js';
import { mapExtractedData, buildSupabaseUpdates } from './mapper.js';
import { formatResult, formatSummaryReport, formatResortList } from './output.js';
import type { CliOptions, ProcessingResult, ProcessingStats, Resort } from './types.js';

/**
 * Parse command line arguments
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    skipExisting: false,
    minConfidence: config.processing.minConfidence,
    apply: false,
    verbose: false,
    list: false,
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
      case '--skip-existing':
      case '-s':
        options.skipExisting = true;
        break;
      case '--min-confidence':
      case '-c':
        options.minConfidence = parseFloat(args[++i]);
        break;
      case '--apply':
      case '-a':
        options.apply = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--list':
        options.list = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          printHelp();
          process.exit(1);
        }
    }
  }

  // Override dry run if --apply is set
  if (options.apply) {
    (config.processing as { dryRun: boolean }).dryRun = false;
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Wikidata Enricher - Enrich ski resort data using OpenAI

Usage: npm run dev -- [options]

Options:
  --filter, -f <name>     Filter to resorts matching name (case-insensitive)
  --limit, -l <n>         Process only first N resorts
  --skip-existing, -s     Skip fields that already have values
  --min-confidence, -c    Minimum confidence threshold (default: 0.7)
  --apply, -a             Apply changes to Supabase (default: dry run)
  --verbose, -v           Show detailed output including skipped fields
  --list                  List all resorts with wiki data and exit
  --help, -h              Show this help message

Examples:
  npm run dev -- --list                    # List resorts with wiki data
  npm run dev -- --filter vail             # Process Vail only (dry run)
  npm run dev -- --limit 5 --verbose       # Process 5 resorts with details
  npm run dev -- --filter vail --apply     # Process Vail and apply changes
  npm run dev -- --apply --skip-existing   # Apply all, skip existing data
`);
}

/**
 * Process a single resort
 */
async function processResort(
  resort: Resort,
  options: CliOptions
): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    resortId: resort.id,
    resortName: resort.name,
    success: false,
    hasWikiData: false,
    extractedData: null,
    proposedChanges: [],
    skippedFields: [],
  };

  try {
    // Download wiki data from GCS
    const wikiData = await downloadWikiData(resort.asset_path);

    if (!wikiData) {
      result.hasWikiData = false;
      result.success = true; // Not an error, just no data
      return result;
    }

    result.hasWikiData = true;

    // Extract data using OpenAI
    const { data: extractedData, usage } = await extractDataWithLLM(resort, wikiData);
    result.extractedData = extractedData;
    result.tokenUsage = usage;

    // Map to Supabase schema
    const { proposedChanges, skippedFields } = mapExtractedData(
      resort,
      extractedData,
      options.skipExisting,
      options.minConfidence
    );
    result.proposedChanges = proposedChanges;
    result.skippedFields = skippedFields;

    // Apply changes if not dry run
    if (!config.processing.dryRun && proposedChanges.length > 0) {
      const { directUpdates, statsUpdates, terrainUpdates, featuresUpdates } =
        buildSupabaseUpdates(proposedChanges);

      // Apply direct updates
      if (Object.keys(directUpdates).length > 0) {
        await updateResort(resort.id, directUpdates as Parameters<typeof updateResort>[1]);
      }

      // Apply JSONB updates
      if (Object.keys(statsUpdates).length > 0) {
        await updateResortStats(resort.id, statsUpdates);
      }
      if (Object.keys(terrainUpdates).length > 0) {
        await updateResortTerrain(resort.id, terrainUpdates);
      }
      if (Object.keys(featuresUpdates).length > 0) {
        await updateResortFeatures(resort.id, featuresUpdates);
      }

      // Save enriched data to GCS for auditing
      await saveEnrichedData(resort.asset_path, {
        extractedAt: new Date().toISOString(),
        extractedData,
        proposedChanges,
        applied: true,
      });
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('');
  console.log('='.repeat(50));
  console.log('  WIKIDATA ENRICHER');
  console.log('='.repeat(50));
  console.log('');

  // Validate configuration
  try {
    validateConfig();
  } catch (error) {
    console.error('Configuration error:', error);
    process.exit(1);
  }

  // Parse CLI options
  const options = parseArgs();

  // List mode
  if (options.list) {
    const assetPaths = await listResortsWithWikiData();
    console.log(formatResortList(assetPaths));
    return;
  }

  // Show mode
  console.log(`Mode: ${config.processing.dryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Min confidence: ${(options.minConfidence * 100).toFixed(0)}%`);
  console.log(`Skip existing: ${options.skipExisting}`);
  if (options.filter) {
    console.log(`Filter: ${options.filter}`);
  }
  if (options.limit) {
    console.log(`Limit: ${options.limit}`);
  }
  console.log('');

  // Fetch all resorts
  const allResorts = await fetchAllResorts();

  // Filter resorts
  let resorts = allResorts;

  if (options.filter) {
    const filterLower = options.filter.toLowerCase();
    resorts = resorts.filter(r =>
      r.name.toLowerCase().includes(filterLower) ||
      r.slug.toLowerCase().includes(filterLower)
    );
    console.log(`Filtered to ${resorts.length} resorts matching "${options.filter}"`);
  }

  if (options.limit) {
    resorts = resorts.slice(0, options.limit);
    console.log(`Limited to ${resorts.length} resorts`);
  }

  // Initialize stats
  const stats: ProcessingStats = {
    total: resorts.length,
    processed: 0,
    withWikiData: 0,
    extractedSuccessfully: 0,
    applied: 0,
    failed: 0,
    skipped: 0,
    totalTokens: 0,
    estimatedCost: 0,
  };

  const results: ProcessingResult[] = [];

  // Process each resort
  for (const resort of resorts) {
    const result = await processResort(resort, options);
    results.push(result);

    // Update stats
    stats.processed++;

    if (result.hasWikiData) {
      stats.withWikiData++;
    } else {
      stats.skipped++;
    }

    if (result.success && result.extractedData) {
      stats.extractedSuccessfully++;
    }

    if (!result.success) {
      stats.failed++;
    }

    if (!config.processing.dryRun && result.proposedChanges.length > 0) {
      stats.applied += result.proposedChanges.length;
    }

    if (result.tokenUsage) {
      stats.totalTokens += result.tokenUsage.totalTokens;
      stats.estimatedCost += calculateCost(
        result.tokenUsage.promptTokens,
        result.tokenUsage.completionTokens
      );
    }

    // Print result
    console.log(formatResult(result, options.verbose));

    // Rate limiting between API calls
    if (result.hasWikiData) {
      await sleep(500); // 500ms between OpenAI calls
    }
  }

  // Print summary
  console.log(formatSummaryReport(stats, results));
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
