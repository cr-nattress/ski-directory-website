#!/usr/bin/env node

/**
 * Weather Sync
 *
 * Syncs detailed mountain weather forecasts from Open-Meteo to Supabase.
 * Provides current conditions, hourly forecasts, and 7-day outlooks.
 * 
 * Features:
 * - Current temperature, wind, humidity, conditions
 * - Snowfall predictions (24h, 48h, 72h)
 * - 7-day daily forecast with highs/lows
 * - Hourly forecast for next 24 hours
 * - Elevation-aware forecasts for mountain accuracy
 * 
 * Data source: Open-Meteo (free, no API key required)
 */

import { config } from './config.js';
import { fetchResortsWithCoordinates, upsertWeather, getExistingWeather } from './supabase.js';
import { fetchWeather } from './open-meteo.js';
import { mapOpenMeteoToWeather, formatWeatherSummary, hasWeatherChanged } from './mapper.js';
import type { Resort, SyncStats, ResortWeatherInsert } from './types.js';

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a single resort
 */
async function processResort(
  resort: Resort,
  stats: SyncStats
): Promise<ResortWeatherInsert | null> {
  const logPrefix = config.processing.verbose ? `  [${resort.slug}]` : '';

  // Skip if no coordinates
  if (!resort.latitude || !resort.longitude) {
    if (config.processing.verbose) {
      console.log(`${logPrefix} No coordinates`);
    }
    stats.noCoordinates++;
    stats.skipped++;
    return null;
  }

  try {
    // Use summit elevation for more accurate mountain weather if available
    // Convert feet to meters (Open-Meteo uses meters)
    const elevationMeters = resort.summit_elevation 
      ? Math.round(resort.summit_elevation * 0.3048)
      : undefined;

    // Fetch weather from Open-Meteo
    const data = await fetchWeather(resort.latitude, resort.longitude, elevationMeters);

    if (!data) {
      if (config.processing.verbose) {
        console.log(`${logPrefix} No weather data returned`);
      }
      stats.errors++;
      return null;
    }

    // Map to our format
    const weather = mapOpenMeteoToWeather(resort, data);

    // Check if update is needed
    if (!config.processing.dryRun) {
      const existing = await getExistingWeather(resort.id);
      if (!hasWeatherChanged(existing, weather)) {
        if (config.processing.verbose) {
          console.log(`${logPrefix} No significant changes`);
        }
        stats.skipped++;
        return null;
      }
    }

    if (config.processing.verbose || config.processing.dryRun) {
      console.log(`${logPrefix} ${formatWeatherSummary(weather)}`);
    }

    return weather;
  } catch (error) {
    console.error(`${logPrefix} Error: ${error instanceof Error ? error.message : error}`);
    stats.errors++;
    return null;
  }
}

/**
 * Process resorts in batches
 */
async function processBatch(
  resorts: Resort[],
  stats: SyncStats
): Promise<void> {
  const results: ResortWeatherInsert[] = [];

  for (const resort of resorts) {
    const weather = await processResort(resort, stats);
    if (weather) {
      results.push(weather);
      stats.updated++;
    }
  }

  // Batch upsert if not dry run
  if (!config.processing.dryRun && results.length > 0) {
    for (const weather of results) {
      await upsertWeather(weather);
    }
  }
}

/**
 * Main sync function
 */
async function sync(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Weather Sync - Mountain Weather Forecasts');
  console.log('='.repeat(60));
  console.log('Source: Open-Meteo (free, no API key)');

  if (config.processing.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Fetch all resorts with coordinates
  const allResorts = await fetchResortsWithCoordinates();

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
    noCoordinates: 0,
  };

  console.log(`\nProcessing ${resorts.length} resorts in batches of ${config.processing.batchSize}...\n`);

  // Process in batches
  for (let i = 0; i < resorts.length; i += config.processing.batchSize) {
    const batch = resorts.slice(i, i + config.processing.batchSize);
    const batchNum = Math.floor(i / config.processing.batchSize) + 1;
    const totalBatches = Math.ceil(resorts.length / config.processing.batchSize);

    if (!config.processing.verbose) {
      process.stdout.write(`\rBatch ${batchNum}/${totalBatches} - Processing...`.padEnd(60));
    } else {
      console.log(`\n--- Batch ${batchNum}/${totalBatches} ---`);
    }

    await processBatch(batch, stats);

    // Delay between batches (except last one)
    if (i + config.processing.batchSize < resorts.length) {
      await sleep(config.processing.batchDelayMs);
    }
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
  console.log(`  - No coordinates: ${stats.noCoordinates}`);
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
