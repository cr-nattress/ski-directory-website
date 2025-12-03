#!/usr/bin/env node

/**
 * Liftie Sync
 *
 * Syncs real-time lift status, weather, and webcam data
 * from Liftie (stored in GCS) to Supabase resort_conditions table.
 */

import { config } from './config.js';
import { fetchAllResorts, upsertConditions, getExistingConditions } from './supabase.js';
import { fetchLiftieData, hasLiftieData } from './gcs.js';
import { mapLiftieToConditions, hasConditionsChanged, formatConditionsSummary } from './mapper.js';
import type { Resort, SyncStats } from './types.js';

/**
 * Process a single resort
 */
async function processResort(
  resort: Resort,
  stats: SyncStats
): Promise<void> {
  const logPrefix = config.processing.verbose ? `  [${resort.slug}]` : '';

  try {
    // Check if resort has Liftie data
    const hasData = await hasLiftieData(resort.asset_path);

    if (!hasData) {
      if (config.processing.verbose) {
        console.log(`${logPrefix} No Liftie data found`);
      }
      stats.noLiftieData++;
      stats.skipped++;
      return;
    }

    // Fetch Liftie data from GCS
    const liftieData = await fetchLiftieData(resort.asset_path);

    // Check if we got any meaningful data
    if (!liftieData.summary && !liftieData.lifts && !liftieData.weather) {
      if (config.processing.verbose) {
        console.log(`${logPrefix} Liftie files empty or invalid`);
      }
      stats.skipped++;
      return;
    }

    // Map to conditions format
    const conditions = mapLiftieToConditions(resort.id, liftieData);

    // Check if update is needed
    const existing = await getExistingConditions(resort.id);
    if (!hasConditionsChanged(existing, conditions)) {
      if (config.processing.verbose) {
        console.log(`${logPrefix} No changes detected`);
      }
      stats.skipped++;
      return;
    }

    // Upsert conditions
    await upsertConditions(conditions);

    if (config.processing.verbose || config.processing.dryRun) {
      console.log(`${logPrefix} ${formatConditionsSummary(conditions)}`);
    }

    stats.updated++;
  } catch (error) {
    console.error(`${logPrefix} Error: ${error instanceof Error ? error.message : error}`);
    stats.errors++;
  }
}

/**
 * Main sync function
 */
async function sync(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Liftie Sync - Real-time Conditions Updater');
  console.log('='.repeat(60));

  if (config.processing.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Fetch all resorts
  const allResorts = await fetchAllResorts();

  // Filter resorts if specified
  let resorts: Resort[] = allResorts;
  if (config.processing.filter) {
    const filterPattern = config.processing.filter.toLowerCase();
    resorts = allResorts.filter(
      r => r.slug.toLowerCase().includes(filterPattern) ||
           r.name.toLowerCase().includes(filterPattern)
    );
    console.log(`\nFiltered to ${resorts.length} resorts matching "${config.processing.filter}"`);
  }

  // Initialize stats
  const stats: SyncStats = {
    total: resorts.length,
    updated: 0,
    skipped: 0,
    errors: 0,
    noLiftieData: 0,
  };

  console.log(`\nProcessing ${resorts.length} resorts...\n`);

  // Process each resort
  for (let i = 0; i < resorts.length; i++) {
    const resort = resorts[i];
    const progress = `[${i + 1}/${resorts.length}]`;

    if (!config.processing.verbose) {
      // Show progress indicator
      process.stdout.write(`\r${progress} Processing ${resort.name}...`.padEnd(60));
    } else {
      console.log(`\n${progress} ${resort.name}`);
    }

    await processResort(resort, stats);
  }

  // Clear progress line
  if (!config.processing.verbose) {
    process.stdout.write('\r'.padEnd(80) + '\r');
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Sync Complete');
  console.log('='.repeat(60));
  console.log(`Total resorts:      ${stats.total}`);
  console.log(`Updated:            ${stats.updated}`);
  console.log(`Skipped:            ${stats.skipped}`);
  console.log(`  - No Liftie data: ${stats.noLiftieData}`);
  console.log(`Errors:             ${stats.errors}`);

  if (config.processing.dryRun) {
    console.log('\n🔍 DRY RUN - No changes were made to the database');
  }
}

// Run the sync
sync().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
