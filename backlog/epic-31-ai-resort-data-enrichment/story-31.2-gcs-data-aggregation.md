# Story 31.2: Implement GCS Data Aggregation Service

## Description

Create a service that aggregates all available data for a resort from its GCS folder, including Wikipedia content, wiki-data.json, and Liftie data. This aggregated data will be sent to OpenAI for enrichment.

## Acceptance Criteria

- [ ] Service reads all JSON files from resort's GCS folder
- [ ] Service reads README.md (Wikipedia content)
- [ ] Handles missing files gracefully (some resorts may not have all data)
- [ ] Returns structured aggregated data object
- [ ] Lists all resorts with available GCS data

## Technical Details

### Aggregated Data Structure

```typescript
interface AggregatedResortData {
  slug: string;
  assetPath: string;

  // Wikipedia data
  wikipedia?: {
    content: string;        // README.md content
    rawData: object;        // wiki-data.json parsed
    hasImage: boolean;
  };

  // Liftie data
  liftie?: {
    summary?: object;       // summary.json
    lifts?: object;         // lifts.json
    weather?: object;       // weather.json
    webcams?: object;       // webcams.json
  };

  // Metadata
  dataQuality: {
    hasWikipedia: boolean;
    hasLiftie: boolean;
    fileCount: number;
    lastUpdated?: string;
  };
}
```

### Implementation (aggregator.ts)

```typescript
import { Storage } from '@google-cloud/storage';
import { config } from './config';

const storage = new Storage({
  keyFilename: config.gcs.keyFile,
});

const bucket = storage.bucket(config.gcs.bucketName);

export async function listResortsWithData(): Promise<string[]> {
  // List all resort folders in GCS
  const [files] = await bucket.getFiles({
    prefix: 'resorts/',
    delimiter: '/',
  });
  // Extract unique resort paths
  // ...
}

export async function aggregateResortData(
  assetPath: string
): Promise<AggregatedResortData> {
  const prefix = `resorts/${assetPath}/`;

  // Read README.md
  const readme = await readFileIfExists(`${prefix}README.md`);

  // Read wiki-data.json
  const wikiData = await readJsonIfExists(`${prefix}wiki-data.json`);

  // Read Liftie data
  const liftieSummary = await readJsonIfExists(`${prefix}liftie/summary.json`);
  const liftieLifts = await readJsonIfExists(`${prefix}liftie/lifts.json`);
  const liftieWeather = await readJsonIfExists(`${prefix}liftie/weather.json`);
  const liftieWebcams = await readJsonIfExists(`${prefix}liftie/webcams.json`);

  // Check for primary image
  const hasImage = await fileExists(`${prefix}wikipedia/primary.jpg`);

  return {
    slug: assetPath.split('/').pop()!,
    assetPath,
    wikipedia: readme || wikiData ? {
      content: readme || '',
      rawData: wikiData || {},
      hasImage,
    } : undefined,
    liftie: liftieSummary || liftieLifts ? {
      summary: liftieSummary,
      lifts: liftieLifts,
      weather: liftieWeather,
      webcams: liftieWebcams,
    } : undefined,
    dataQuality: {
      hasWikipedia: !!(readme || wikiData),
      hasLiftie: !!(liftieSummary || liftieLifts),
      fileCount: [readme, wikiData, liftieSummary, liftieLifts, liftieWeather, liftieWebcams]
        .filter(Boolean).length,
    },
  };
}

async function readFileIfExists(path: string): Promise<string | null> {
  try {
    const [content] = await bucket.file(path).download();
    return content.toString('utf-8');
  } catch {
    return null;
  }
}

async function readJsonIfExists(path: string): Promise<object | null> {
  const content = await readFileIfExists(path);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const [exists] = await bucket.file(path).exists();
    return exists;
  } catch {
    return false;
  }
}
```

## Tasks

- [ ] Create `src/aggregator.ts`
- [ ] Implement `listResortsWithData()` function
- [ ] Implement `aggregateResortData()` function
- [ ] Implement helper functions for file reading
- [ ] Add error handling and logging
- [ ] Test with sample resorts

## Effort

**Size:** M (Medium - 2-4 hours)

## Dependencies

- Story 31.1: Project structure must be in place

## References

- [Existing GCS implementation](../../apps/updaters/wikidata-enricher/src/gcs.ts)
