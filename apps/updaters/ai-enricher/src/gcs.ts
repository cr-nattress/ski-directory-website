import { Storage } from '@google-cloud/storage';
import { config } from './config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  WikiData,
  LiftieData,
  OTSData,
  SRIData,
  AggregatedData,
  DataQuality,
  AIEnrichmentOutput,
  ProgressData,
  CostReport,
} from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let storageClient: Storage | null = null;

/**
 * Get GCS client instance
 */
function getStorageClient(): Storage {
  if (!storageClient) {
    const keyFilePath = path.resolve(__dirname, '..', config.gcs.keyFile);
    storageClient = new Storage({
      keyFilename: keyFilePath,
    });
  }
  return storageClient;
}

/**
 * Download and parse a JSON file from GCS
 */
async function downloadJson<T>(filePath: string): Promise<T | null> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const file = bucket.file(filePath);

  try {
    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }

    const [contents] = await file.download();
    return JSON.parse(contents.toString('utf-8')) as T;
  } catch (error) {
    // Silently return null for missing files
    return null;
  }
}

/**
 * List all resorts that have data in GCS
 */
export async function listResortsWithData(): Promise<string[]> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);

  console.log('Scanning GCS for resorts with data...');

  // Look for any resort folders that have wikipedia or liftie data
  const [files] = await bucket.getFiles({
    prefix: 'resorts/',
    delimiter: '/',
  });

  // Get unique resort paths by looking for wiki-data.json files
  const [wikiFiles] = await bucket.getFiles({
    prefix: 'resorts/',
    matchGlob: '**/wiki-data.json',
  });

  const assetPaths = wikiFiles
    .map(file => {
      const match = file.name.match(/^resorts\/(.+)\/wiki-data\.json$/);
      return match ? match[1] : null;
    })
    .filter((path): path is string => path !== null);

  console.log(`Found ${assetPaths.length} resorts with data`);
  return assetPaths.sort();
}

/**
 * List resorts that already have AI enrichment
 */
export async function listEnrichedResorts(): Promise<string[]> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);

  const [files] = await bucket.getFiles({
    prefix: 'resorts/',
    matchGlob: '**/ai-enrichment.json',
  });

  const assetPaths = files
    .map(file => {
      const match = file.name.match(/^resorts\/(.+)\/ai-enrichment\.json$/);
      return match ? match[1] : null;
    })
    .filter((path): path is string => path !== null);

  return assetPaths.sort();
}

/**
 * Check if AI enrichment exists for a resort
 */
export async function hasExistingEnrichment(assetPath: string): Promise<boolean> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const file = bucket.file(`resorts/${assetPath}/ai-enrichment.json`);

  const [exists] = await file.exists();
  return exists;
}

/**
 * Aggregate all available data for a resort
 */
export async function aggregateResortData(
  assetPath: string,
  resortName: string,
  state: string,
  country: string
): Promise<AggregatedData> {
  const slug = assetPath.split('/').pop()!;
  const basePath = `resorts/${assetPath}`;

  // Download all available data sources in parallel
  const [wikipedia, liftie, onTheSnow, skiResortInfo] = await Promise.all([
    downloadJson<WikiData>(`${basePath}/wiki-data.json`),
    downloadJson<LiftieData>(`${basePath}/liftie/current.json`),
    downloadJson<OTSData>(`${basePath}/onthesnow/ots-details.json`),
    downloadJson<SRIData>(`${basePath}/skiresortinfo/sri-details.json`),
  ]);

  // Calculate data quality
  const dataQuality = calculateDataQuality(wikipedia, liftie, onTheSnow, skiResortInfo);

  return {
    slug,
    name: resortName,
    assetPath,
    state,
    country,
    wikipedia,
    liftie,
    onTheSnow,
    skiResortInfo,
    dataQuality,
  };
}

/**
 * Calculate data quality metrics
 */
function calculateDataQuality(
  wikipedia: WikiData | null,
  liftie: LiftieData | null,
  onTheSnow: OTSData | null,
  skiResortInfo: SRIData | null
): DataQuality {
  const hasWikipedia = wikipedia !== null;
  const hasLiftie = liftie !== null;
  const hasOnTheSnow = onTheSnow !== null;
  const hasSkiResortInfo = skiResortInfo !== null;

  const sourceCount = [hasWikipedia, hasLiftie, hasOnTheSnow, hasSkiResortInfo]
    .filter(Boolean).length;

  // Count total files/data points
  let fileCount = 0;
  if (hasWikipedia) fileCount++;
  if (hasLiftie) fileCount++;
  if (hasOnTheSnow) fileCount++;
  if (hasSkiResortInfo) fileCount++;

  // Calculate overall score (Wikipedia weighted higher)
  let score = 0;
  if (hasWikipedia) score += 0.5;
  if (hasLiftie) score += 0.2;
  if (hasOnTheSnow) score += 0.2;
  if (hasSkiResortInfo) score += 0.1;

  return {
    hasWikipedia,
    hasLiftie,
    hasOnTheSnow,
    hasSkiResortInfo,
    sourceCount,
    fileCount,
    overallScore: score,
  };
}

/**
 * Save AI enrichment result to GCS
 */
export async function saveEnrichmentResult(
  assetPath: string,
  output: AIEnrichmentOutput,
  options: { overwrite?: boolean } = {}
): Promise<{ success: boolean; error?: string }> {
  if (config.processing.dryRun) {
    console.log(`  [DRY RUN] Would save to: resorts/${assetPath}/ai-enrichment.json`);
    return { success: true };
  }

  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const filePath = `resorts/${assetPath}/ai-enrichment.json`;
  const file = bucket.file(filePath);

  // Check if exists and overwrite not enabled
  if (!options.overwrite) {
    const [exists] = await file.exists();
    if (exists) {
      return { success: false, error: 'File already exists (use --overwrite)' };
    }
  }

  try {
    await file.save(JSON.stringify(output, null, 2), {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'public, max-age=86400',
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Load progress data for resume support
 */
export async function loadProgress(): Promise<ProgressData | null> {
  return downloadJson<ProgressData>('resorts/_processing/ai-enrichment-progress.json');
}

/**
 * Save progress data
 */
export async function saveProgress(progress: ProgressData): Promise<void> {
  if (config.processing.dryRun) {
    return;
  }

  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const file = bucket.file('resorts/_processing/ai-enrichment-progress.json');

  await file.save(JSON.stringify(progress, null, 2), {
    contentType: 'application/json',
  });
}

/**
 * Save cost report
 */
export async function saveCostReport(report: CostReport): Promise<void> {
  if (config.processing.dryRun) {
    return;
  }

  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const filename = `resorts/_processing/cost-reports/${report.runId.replace(/:/g, '-')}.json`;
  const file = bucket.file(filename);

  await file.save(JSON.stringify(report, null, 2), {
    contentType: 'application/json',
  });
}
