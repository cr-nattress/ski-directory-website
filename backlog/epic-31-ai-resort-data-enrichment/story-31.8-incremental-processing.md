# Story 31.8: Implement Incremental Processing with Resume Support

## Description

Implement incremental processing that tracks progress, enables resumption from interruption, and skips already-processed resorts.

## Acceptance Criteria

- [ ] Tracks which resorts have been processed
- [ ] Can resume from last successful resort
- [ ] Supports `--skip-existing` flag
- [ ] Progress saved to GCS or local file
- [ ] Handles interruption gracefully (Ctrl+C)
- [ ] Reports progress during processing

## Technical Details

### Progress Tracking File

Save progress to GCS for persistence across runs:

```
sda-assets-prod/resorts/_processing/ai-enrichment-progress.json
```

```json
{
  "lastRun": "2025-12-04T05:00:00Z",
  "processedResorts": ["us/colorado/vail", "us/colorado/breckenridge"],
  "failedResorts": {
    "us/colorado/aspen": "OpenAI timeout",
    "us/california/heavenly": "No Wikipedia data"
  },
  "stats": {
    "total": 500,
    "processed": 250,
    "failed": 5,
    "skipped": 10
  }
}
```

### Implementation (processor.ts)

```typescript
import { AggregatedResortData, AIEnrichmentOutput } from './types';
import { aggregateResortData, listResortsWithData } from './aggregator';
import { enrichResortDataWithRateLimit } from './openai';
import { saveEnrichmentResult, hasExistingEnrichment } from './gcs';
import { updateResortWithEnrichment } from './supabase';
import { loadProgress, saveProgress } from './progress';
import { config } from './config';

export interface ProcessorOptions {
  filter?: string;
  limit?: number;
  skip?: number;
  skipExisting?: boolean;
  overwrite?: boolean;
  dryRun?: boolean;
  resume?: boolean;
}

export interface ProcessingResult {
  slug: string;
  success: boolean;
  skipped?: boolean;
  error?: string;
  processingTimeMs?: number;
  cost?: number;
}

/**
 * Process all resorts with enrichment
 */
export async function processAllResorts(
  options: ProcessorOptions = {}
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  // Load progress if resuming
  const progress = options.resume ? await loadProgress() : null;
  const processedSet = new Set(progress?.processedResorts || []);

  // Get list of resorts with GCS data
  let resorts = await listResortsWithData();
  console.log(`Found ${resorts.length} resorts with GCS data`);

  // Apply filter
  if (options.filter) {
    resorts = resorts.filter((r) =>
      r.toLowerCase().includes(options.filter!.toLowerCase())
    );
    console.log(`Filtered to ${resorts.length} resorts matching "${options.filter}"`);
  }

  // Apply skip
  if (options.skip && options.skip > 0) {
    resorts = resorts.slice(options.skip);
    console.log(`Skipped first ${options.skip} resorts`);
  }

  // Apply limit
  if (options.limit && options.limit > 0) {
    resorts = resorts.slice(0, options.limit);
    console.log(`Limited to ${options.limit} resorts`);
  }

  // Setup graceful shutdown
  let interrupted = false;
  const shutdown = () => {
    console.log('\nInterrupted - saving progress...');
    interrupted = true;
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Process each resort
  for (let i = 0; i < resorts.length; i++) {
    if (interrupted) break;

    const assetPath = resorts[i];
    const slug = assetPath.split('/').pop()!;

    console.log(`\n[${i + 1}/${resorts.length}] Processing: ${slug}`);

    // Skip if already processed (resume mode)
    if (options.resume && processedSet.has(assetPath)) {
      console.log('  → Already processed (resume mode)');
      results.push({ slug, success: true, skipped: true });
      continue;
    }

    // Skip if enrichment exists and --skip-existing
    if (options.skipExisting) {
      const exists = await hasExistingEnrichment(assetPath);
      if (exists) {
        console.log('  → Skipping (enrichment exists)');
        results.push({ slug, success: true, skipped: true });
        continue;
      }
    }

    const startTime = Date.now();

    try {
      // Step 1: Aggregate data
      console.log('  1. Aggregating GCS data...');
      const aggregatedData = await aggregateResortData(assetPath);

      if (!aggregatedData.dataQuality.hasWikipedia) {
        console.log('  → Skipping (no Wikipedia data)');
        results.push({ slug, success: false, error: 'No Wikipedia data' });
        continue;
      }

      // Step 2: Call OpenAI
      console.log('  2. Calling OpenAI for enrichment...');
      const enrichmentResponse = await enrichResortDataWithRateLimit(aggregatedData);
      console.log(`     Cost: $${enrichmentResponse.usage.estimatedCost.toFixed(4)}`);

      // Step 3: Build output
      const output: AIEnrichmentOutput = {
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
          minConfidenceThreshold: config.minConfidence,
        },
        inputDataQuality: aggregatedData.dataQuality,
      };

      // Step 4: Save to GCS
      if (!options.dryRun) {
        console.log('  3. Saving to GCS...');
        const gcsResult = await saveEnrichmentResult(assetPath, output, {
          overwrite: options.overwrite,
        });
        if (!gcsResult.success) {
          throw new Error(gcsResult.error);
        }
      }

      // Step 5: Update Supabase
      console.log('  4. Updating Supabase...');
      const updateResult = await updateResortWithEnrichment(slug, enrichmentResponse.result, {
        dryRun: options.dryRun,
        minConfidence: config.minConfidence,
      });

      console.log(`     Updated: ${updateResult.fieldsUpdated.length} fields`);
      console.log(`     Skipped: ${updateResult.fieldsSkipped.length} fields`);

      // Track progress
      processedSet.add(assetPath);

      results.push({
        slug,
        success: true,
        processingTimeMs: Date.now() - startTime,
        cost: enrichmentResponse.usage.estimatedCost,
      });

    } catch (error) {
      console.error(`  ✗ Error: ${(error as Error).message}`);
      results.push({
        slug,
        success: false,
        error: (error as Error).message,
      });
    }

    // Save progress periodically
    if ((i + 1) % 10 === 0 && !options.dryRun) {
      await saveProgress({
        lastRun: new Date().toISOString(),
        processedResorts: Array.from(processedSet),
        failedResorts: Object.fromEntries(
          results.filter((r) => !r.success && r.error).map((r) => [r.slug, r.error!])
        ),
        stats: {
          total: resorts.length,
          processed: results.filter((r) => r.success && !r.skipped).length,
          failed: results.filter((r) => !r.success).length,
          skipped: results.filter((r) => r.skipped).length,
        },
      });
    }
  }

  // Final progress save
  if (!options.dryRun) {
    await saveProgress({
      lastRun: new Date().toISOString(),
      processedResorts: Array.from(processedSet),
      failedResorts: Object.fromEntries(
        results.filter((r) => !r.success && r.error).map((r) => [r.slug, r.error!])
      ),
      stats: {
        total: resorts.length,
        processed: results.filter((r) => r.success && !r.skipped).length,
        failed: results.filter((r) => !r.success).length,
        skipped: results.filter((r) => r.skipped).length,
      },
    });
  }

  return results;
}
```

## Tasks

- [ ] Create `src/processor.ts` with main processing loop
- [ ] Create `src/progress.ts` for progress tracking
- [ ] Implement progress save/load to GCS
- [ ] Add resume support
- [ ] Add graceful shutdown handling (SIGINT/SIGTERM)
- [ ] Add periodic progress saves
- [ ] Test with interruption and resume

## Effort

**Size:** M (Medium - 2-4 hours)

## Dependencies

- Story 31.2: GCS aggregation
- Story 31.4: OpenAI integration
- Story 31.6: GCS output writer
- Story 31.7: Supabase update

## References

- [Node.js Process Signals](https://nodejs.org/api/process.html#signal-events)
