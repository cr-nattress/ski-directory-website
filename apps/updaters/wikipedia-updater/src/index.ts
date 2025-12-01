#!/usr/bin/env node

import { config, validateConfig } from './config.js';
import { fetchAllResorts, updateResortStatus, type Resort } from './supabase.js';
import { fetchWikipediaData, getBestImageUrl, type WikipediaResortData } from './wikipedia.js';
import { formatReadme } from './formatter.js';
import { uploadReadmeToGcs, uploadWikiDataToGcs, uploadImagesToGcs } from './gcs.js';

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Processing statistics
 */
interface ProcessingStats {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  noWikiData: number;
}

/**
 * Process a single resort
 */
async function processResort(
  resort: Resort,
  index: number,
  total: number
): Promise<{ success: boolean; hasWikiData: boolean }> {
  console.log(`\n[${index + 1}/${total}] Processing: ${resort.name} (${resort.state_name})`);

  try {
    // Skip resorts without asset_path
    if (!resort.asset_path) {
      console.log(`  Skipping: No asset_path defined`);
      return { success: false, hasWikiData: false };
    }

    // Fetch Wikipedia data - only returns data if a dedicated article exists
    const wikiData = await fetchWikipediaData(resort.name, resort.state_name);

    if (!wikiData) {
      console.log(`  No dedicated Wikipedia article found - skipping upload`);
      // Mark resort as inactive since no Wikipedia page exists
      if (!config.dryRun) {
        console.log(`  Marking resort as inactive (no Wikipedia page)`);
        await updateResortStatus(resort.id, false);
      } else {
        console.log(`  [DRY RUN] Would mark resort as inactive (no Wikipedia page)`);
      }
      return { success: true, hasWikiData: false };
    }

    console.log(`  Found dedicated Wikipedia article: "${wikiData.title}"`);
    console.log(`  Found ${wikiData.media.length} images`);

    // Determine if resort should be active based on having a Wikipedia page AND images
    const hasImages = wikiData.media.length > 0;
    const shouldBeActive = hasImages;

    if (!config.dryRun) {
      console.log(`  Marking resort as ${shouldBeActive ? 'active' : 'inactive'} (Wikipedia page: yes, images: ${hasImages ? 'yes' : 'no'})`);
      await updateResortStatus(resort.id, shouldBeActive);
    } else {
      console.log(`  [DRY RUN] Would mark resort as ${shouldBeActive ? 'active' : 'inactive'} (Wikipedia page: yes, images: ${hasImages ? 'yes' : 'no'})`);
    }

    // Format README
    const readmeContent = formatReadme(resort, wikiData);

    // Upload README to GCS
    await uploadReadmeToGcs(resort.asset_path, readmeContent);

    // Also upload raw wiki data as JSON
    await uploadWikiDataToGcs(resort.asset_path, wikiData);

    // Upload only the first image (hero image) from Wikipedia
    if (wikiData.media.length > 0) {
      // Find lead image first, otherwise use the first available image
      const leadImage = wikiData.media.find(m => m.leadImage) || wikiData.media[0];
      const url = getBestImageUrl(leadImage);

      if (url) {
        // Always save as primary.jpg for consistency (GCS will serve correct content-type)
        const imagesToUpload = [{ url, filename: 'primary.jpg' }];

        console.log(`  Uploading primary image...`);
        const uploadedUrls = await uploadImagesToGcs(resort.asset_path, imagesToUpload);
        console.log(`  Uploaded ${uploadedUrls.length} image to GCS`);
      }
    }

    return { success: true, hasWikiData: true };
  } catch (error) {
    console.error(`  Error processing ${resort.name}:`, error);
    return { success: false, hasWikiData: false };
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Wikipedia Updater - Ski Directory');
  console.log('='.repeat(60));
  console.log('');

  // Validate configuration
  try {
    validateConfig();
  } catch (error) {
    console.error('Configuration error:', error);
    process.exit(1);
  }

  if (config.dryRun) {
    console.log('*** DRY RUN MODE - No files will be uploaded ***');
    console.log('');
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  const skipArg = args.find(a => a.startsWith('--skip='));
  const skip = skipArg ? parseInt(skipArg.split('=')[1], 10) : 0;
  const filterArg = args.find(a => a.startsWith('--filter='));
  const filter = filterArg ? filterArg.split('=')[1].toLowerCase() : undefined;
  const delayArg = args.find(a => a.startsWith('--delay='));
  const delayBetweenResorts = delayArg ? parseInt(delayArg.split('=')[1], 10) * 1000 : 0; // Convert seconds to ms

  // Fetch all resorts from Supabase
  let resorts: Resort[];
  try {
    resorts = await fetchAllResorts();
  } catch (error) {
    console.error('Failed to fetch resorts:', error);
    process.exit(1);
  }

  // Apply filter if specified
  if (filter) {
    resorts = resorts.filter(r =>
      r.name.toLowerCase().includes(filter) ||
      r.state_name.toLowerCase().includes(filter) ||
      r.slug.toLowerCase().includes(filter)
    );
    console.log(`Filtered to ${resorts.length} resorts matching "${filter}"`);
  }

  // Apply skip
  if (skip > 0) {
    resorts = resorts.slice(skip);
    console.log(`Skipping first ${skip} resorts`);
  }

  // Apply limit
  if (limit && limit > 0) {
    resorts = resorts.slice(0, limit);
    console.log(`Limited to ${limit} resorts`);
  }

  console.log(`\nProcessing ${resorts.length} resorts...`);
  console.log(`Rate limit: ${config.wikipedia.rateLimitMs}ms between Wikipedia requests`);
  if (delayBetweenResorts > 0) {
    console.log(`Delay between resorts: ${delayBetweenResorts / 1000} seconds`);
  }
  console.log('');

  // Initialize stats
  const stats: ProcessingStats = {
    total: resorts.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    noWikiData: 0,
  };

  // Process each resort
  for (let i = 0; i < resorts.length; i++) {
    const resort = resorts[i];

    if (!resort.asset_path) {
      stats.skipped++;
      stats.processed++;
      continue;
    }

    const result = await processResort(resort, i, resorts.length);
    stats.processed++;

    if (result.success) {
      stats.succeeded++;
      if (!result.hasWikiData) {
        stats.noWikiData++;
      }
    } else {
      stats.failed++;
    }

    // Wait between resorts if delay is specified (skip delay after last resort)
    if (delayBetweenResorts > 0 && i < resorts.length - 1) {
      console.log(`  Waiting ${delayBetweenResorts / 1000} seconds before next resort...`);
      await sleep(delayBetweenResorts);
    }
  }

  // Print summary
  console.log('');
  console.log('='.repeat(60));
  console.log('Processing Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Statistics:');
  console.log(`  Total resorts:     ${stats.total}`);
  console.log(`  Processed:         ${stats.processed}`);
  console.log(`  Succeeded:         ${stats.succeeded}`);
  console.log(`  Failed:            ${stats.failed}`);
  console.log(`  Skipped:           ${stats.skipped}`);
  console.log(`  No Wikipedia data: ${stats.noWikiData}`);
  console.log('');

  if (config.dryRun) {
    console.log('*** DRY RUN - No files were actually uploaded ***');
  }
}

// Run the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
