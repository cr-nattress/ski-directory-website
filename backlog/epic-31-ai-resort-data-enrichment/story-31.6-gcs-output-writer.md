# Story 31.6: Implement GCS Output Writer

## Description

Create a service that writes the AI enrichment results to GCS as `ai-enrichment.json` in each resort's folder. This provides an audit trail and enables re-processing without re-calling OpenAI.

## Acceptance Criteria

- [ ] Writes `ai-enrichment.json` to resort's GCS folder
- [ ] Preserves existing files (doesn't overwrite other data)
- [ ] Handles upload failures gracefully
- [ ] Logs successful writes
- [ ] Supports overwrite protection (optional)

## Technical Details

### Implementation (gcs.ts)

```typescript
import { Storage } from '@google-cloud/storage';
import { config } from './config';
import { AIEnrichmentOutput } from './types';

const storage = new Storage({
  keyFilename: config.gcs.keyFile,
});

const bucket = storage.bucket(config.gcs.bucketName);

/**
 * Save AI enrichment result to GCS
 */
export async function saveEnrichmentResult(
  assetPath: string,
  data: AIEnrichmentOutput,
  options?: { overwrite?: boolean }
): Promise<{ success: boolean; path: string; error?: string }> {
  const filePath = `resorts/${assetPath}/ai-enrichment.json`;
  const file = bucket.file(filePath);

  try {
    // Check if file exists and overwrite protection is enabled
    if (!options?.overwrite) {
      const [exists] = await file.exists();
      if (exists) {
        return {
          success: false,
          path: filePath,
          error: 'File already exists. Use --overwrite to replace.',
        };
      }
    }

    // Write JSON with pretty formatting
    const content = JSON.stringify(data, null, 2);

    await file.save(content, {
      contentType: 'application/json',
      metadata: {
        'x-goog-meta-enrichment-version': data.metadata.version,
        'x-goog-meta-processed-at': data.metadata.processedAt,
        'x-goog-meta-model': data.metadata.model,
      },
    });

    return {
      success: true,
      path: filePath,
    };
  } catch (error) {
    return {
      success: false,
      path: filePath,
      error: (error as Error).message,
    };
  }
}

/**
 * Check if enrichment already exists for a resort
 */
export async function hasExistingEnrichment(assetPath: string): Promise<boolean> {
  const filePath = `resorts/${assetPath}/ai-enrichment.json`;
  const [exists] = await bucket.file(filePath).exists();
  return exists;
}

/**
 * Load existing enrichment (for comparison or resume)
 */
export async function loadExistingEnrichment(
  assetPath: string
): Promise<AIEnrichmentOutput | null> {
  const filePath = `resorts/${assetPath}/ai-enrichment.json`;

  try {
    const [content] = await bucket.file(filePath).download();
    return JSON.parse(content.toString('utf-8')) as AIEnrichmentOutput;
  } catch {
    return null;
  }
}

/**
 * List all resorts with existing enrichment
 */
export async function listEnrichedResorts(): Promise<string[]> {
  const [files] = await bucket.getFiles({
    prefix: 'resorts/',
    matchGlob: '**/ai-enrichment.json',
  });

  return files.map((file) => {
    // Extract asset path from file path
    // resorts/us/colorado/vail/ai-enrichment.json -> us/colorado/vail
    const match = file.name.match(/resorts\/(.+)\/ai-enrichment\.json/);
    return match ? match[1] : '';
  }).filter(Boolean);
}
```

### Output File Example

```
sda-assets-prod/resorts/us/colorado/vail/ai-enrichment.json
```

```json
{
  "slug": "vail",
  "assetPath": "us/colorado/vail",
  "enrichment": {
    "content": {
      "tagline": { "value": "Colorado's premier powder destination...", "confidence": 0.95 },
      "description": { "value": "Vail Mountain stands as one of...", "confidence": 0.92 }
    },
    "terrain": { ... },
    "stats": { ... },
    "sources": ["Wikipedia infobox", "Wikipedia article body"],
    "notes": ""
  },
  "metadata": {
    "version": "1.0.0",
    "processedAt": "2025-12-04T05:00:00Z",
    "processingTimeMs": 3500,
    "model": "gpt-4o",
    "promptTokens": 1500,
    "completionTokens": 800,
    "estimatedCost": 0.0275,
    "minConfidenceThreshold": 0.7
  },
  "inputDataQuality": {
    "hasWikipedia": true,
    "hasLiftie": true,
    "fileCount": 5
  }
}
```

## Tasks

- [ ] Extend `src/gcs.ts` with output functions
- [ ] Implement `saveEnrichmentResult()`
- [ ] Implement `hasExistingEnrichment()`
- [ ] Implement `loadExistingEnrichment()`
- [ ] Implement `listEnrichedResorts()`
- [ ] Add metadata headers to uploaded files
- [ ] Test upload and download operations

## Effort

**Size:** S (Small - 1-2 hours)

## Dependencies

- Story 31.1: Project structure
- Story 31.5: JSON schema types

## References

- [GCS Node.js Client](https://cloud.google.com/storage/docs/reference/libraries)
