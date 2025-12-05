import { config } from './config.js';
import {
  aggregateResortData,
  hasExistingEnrichment,
  saveEnrichmentResult,
  loadProgress,
  saveProgress,
  listResortsWithData,
} from './gcs.js';
import { enrichResortDataWithRateLimit, sleep } from './openai.js';
import { fetchAllResorts, updateResortWithEnrichment } from './supabase.js';
import { CostTracker } from './cost.js';
import * as output from './output.js';
import type {
  ProcessingResult,
  ProgressData,
  AIEnrichmentOutput,
  Resort,
} from './types.js';

export interface ProcessorOptions {
  filter?: string;
  limit?: number;
  skip?: number;
  skipExisting: boolean;
  overwrite: boolean;
  dryRun: boolean;
  resume: boolean;
  minConfidence: number;
  verbose: boolean;
}

/**
 * Process all resorts with AI enrichment
 */
export async function processAllResorts(
  options: ProcessorOptions
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];
  const costTracker = new CostTracker();

  // Load progress if resuming
  const progress = options.resume ? await loadProgress() : null;
  const processedSet = new Set(progress?.processedResorts || []);

  if (options.resume && progress) {
    output.info(`Resuming from previous run - ${processedSet.size} resorts already processed`);
  }

  // Fetch all resorts from Supabase
  const allResorts = await fetchAllResorts();

  // Create a map for quick lookup
  const resortMap = new Map<string, Resort>();
  allResorts.forEach(r => resortMap.set(r.asset_path, r));

  // Get list of resorts with GCS data
  let assetPaths = await listResortsWithData();
  output.info(`Found ${assetPaths.length} resorts with GCS data`);

  // Apply filter
  if (options.filter) {
    const filterLower = options.filter.toLowerCase();
    assetPaths = assetPaths.filter(path => {
      const resort = resortMap.get(path);
      return path.toLowerCase().includes(filterLower) ||
        (resort?.name.toLowerCase().includes(filterLower) ?? false);
    });
    output.info(`Filtered to ${assetPaths.length} resorts matching "${options.filter}"`);
  }

  // Apply skip
  if (options.skip && options.skip > 0) {
    assetPaths = assetPaths.slice(options.skip);
    output.info(`Skipped first ${options.skip} resorts`);
  }

  // Apply limit
  if (options.limit && options.limit > 0) {
    assetPaths = assetPaths.slice(0, options.limit);
    output.info(`Limited to ${options.limit} resorts`);
  }

  // Setup graceful shutdown
  let interrupted = false;
  const shutdown = () => {
    output.warn('\nInterrupted - saving progress...');
    interrupted = true;
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Process each resort
  for (let i = 0; i < assetPaths.length; i++) {
    if (interrupted) break;

    const assetPath = assetPaths[i];
    const resort = resortMap.get(assetPath);
    const slug = assetPath.split('/').pop()!;

    output.progress(i + 1, assetPaths.length, resort?.name || slug);

    // Skip if already processed (resume mode)
    if (options.resume && processedSet.has(assetPath)) {
      output.debug('Already processed (resume mode)', options.verbose);
      results.push({
        slug,
        assetPath,
        success: true,
        skipped: true,
        skipReason: 'already processed (resume)',
      });
      continue;
    }

    // Skip if enrichment exists and --skip-existing
    if (options.skipExisting && !options.overwrite) {
      const exists = await hasExistingEnrichment(assetPath);
      if (exists) {
        output.debug('Skipping (enrichment exists)', options.verbose);
        results.push({
          slug,
          assetPath,
          success: true,
          skipped: true,
          skipReason: 'enrichment exists',
        });
        continue;
      }
    }

    const startTime = Date.now();

    try {
      // Step 1: Aggregate data from GCS
      output.debug('1. Aggregating GCS data...', options.verbose);
      const aggregatedData = await aggregateResortData(
        assetPath,
        resort?.name || slug,
        resort?.state_name || '',
        resort?.country_name || 'USA'
      );

      // Check if we have enough data
      if (!aggregatedData.dataQuality.hasWikipedia) {
        output.warn('No Wikipedia data, skipping');
        results.push({
          slug,
          assetPath,
          success: false,
          error: 'No Wikipedia data available',
        });
        continue;
      }

      if (options.verbose) {
        output.dataQuality(aggregatedData.dataQuality);
      }

      // Step 2: Call OpenAI for enrichment
      output.debug('2. Calling OpenAI for enrichment...', options.verbose);
      const enrichmentResponse = await enrichResortDataWithRateLimit(aggregatedData);
      output.cost(enrichmentResponse.usage.estimatedCost);

      // Track cost
      costTracker.addResort(
        slug,
        enrichmentResponse.usage.promptTokens,
        enrichmentResponse.usage.completionTokens,
        Date.now() - startTime
      );

      // Step 3: Build output
      const enrichmentOutput: AIEnrichmentOutput = {
        slug,
        assetPath,
        enrichment: enrichmentResponse.result,
        metadata: {
          version: '1.0.0',
          processedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          model: config.openai.model,
          promptTokens: enrichmentResponse.usage.promptTokens,
          completionTokens: enrichmentResponse.usage.completionTokens,
          estimatedCost: enrichmentResponse.usage.estimatedCost,
          minConfidenceThreshold: options.minConfidence,
        },
        inputDataQuality: aggregatedData.dataQuality,
      };

      // Step 4: Save to GCS
      if (!options.dryRun) {
        output.debug('3. Saving to GCS...', options.verbose);
        const gcsResult = await saveEnrichmentResult(assetPath, enrichmentOutput, {
          overwrite: options.overwrite,
        });
        if (!gcsResult.success) {
          throw new Error(gcsResult.error);
        }
      } else {
        output.debug(`3. [DRY RUN] Would save to: resorts/${assetPath}/ai-enrichment.json`, options.verbose);
      }

      // Step 5: Update Supabase
      output.debug('4. Updating Supabase...', options.verbose);
      const updateResult = await updateResortWithEnrichment(slug, enrichmentResponse.result, {
        dryRun: options.dryRun,
        minConfidence: options.minConfidence,
        skipExisting: options.skipExisting,
      });

      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      // Log result
      const resultOutput = output.formatResult({
        slug,
        assetPath,
        success: true,
        processingTimeMs: Date.now() - startTime,
        cost: enrichmentResponse.usage.estimatedCost,
        fieldsUpdated: updateResult.fieldsUpdated,
        fieldsSkipped: updateResult.fieldsSkipped,
      }, options.verbose);
      console.log(resultOutput);

      // Track progress
      processedSet.add(assetPath);

      results.push({
        slug,
        assetPath,
        success: true,
        processingTimeMs: Date.now() - startTime,
        cost: enrichmentResponse.usage.estimatedCost,
        fieldsUpdated: updateResult.fieldsUpdated,
        fieldsSkipped: updateResult.fieldsSkipped,
      });

    } catch (error) {
      output.error(`Error: ${(error as Error).message}`);
      results.push({
        slug,
        assetPath,
        success: false,
        error: (error as Error).message,
      });
    }

    // Save progress periodically
    if ((i + 1) % 10 === 0 && !options.dryRun) {
      await saveProgressData(processedSet, results, assetPaths.length);
    }

    // Rate limiting between API calls
    await sleep(500);
  }

  // Final progress save
  if (!options.dryRun) {
    await saveProgressData(processedSet, results, assetPaths.length);
  }

  // Save and print cost report
  if (costTracker.getResortCount() > 0) {
    if (!options.dryRun) {
      await costTracker.saveReport();
    }
    costTracker.printSummary();
  }

  return results;
}

/**
 * Save progress data to GCS
 */
async function saveProgressData(
  processedSet: Set<string>,
  results: ProcessingResult[],
  total: number
): Promise<void> {
  const progressData: ProgressData = {
    lastRun: new Date().toISOString(),
    processedResorts: Array.from(processedSet),
    failedResorts: Object.fromEntries(
      results
        .filter(r => !r.success && r.error)
        .map(r => [r.assetPath, r.error!])
    ),
    stats: {
      total,
      processed: results.filter(r => r.success && !r.skipped).length,
      failed: results.filter(r => !r.success).length,
      skipped: results.filter(r => r.skipped).length,
    },
  };
  await saveProgress(progressData);
}
