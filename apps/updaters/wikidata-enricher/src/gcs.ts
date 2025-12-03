import { Storage } from '@google-cloud/storage';
import { config } from './config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import type { WikiData } from './types.js';

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
 * Check if wiki-data.json exists for a resort
 */
export async function wikiDataExists(assetPath: string): Promise<boolean> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const file = bucket.file(`resorts/${assetPath}/wiki-data.json`);

  const [exists] = await file.exists();
  return exists;
}

/**
 * Download and parse wiki-data.json for a resort
 */
export async function downloadWikiData(assetPath: string): Promise<WikiData | null> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const filePath = `resorts/${assetPath}/wiki-data.json`;
  const file = bucket.file(filePath);

  try {
    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }

    const [contents] = await file.download();
    const data = JSON.parse(contents.toString('utf-8')) as WikiData;
    return data;
  } catch (error) {
    console.error(`  Error downloading wiki-data.json for ${assetPath}:`, error);
    return null;
  }
}

/**
 * List all resorts that have wiki-data.json files
 */
export async function listResortsWithWikiData(): Promise<string[]> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);

  console.log('Scanning GCS for resorts with wiki-data.json...');

  const [files] = await bucket.getFiles({
    prefix: 'resorts/',
    matchGlob: '**/wiki-data.json',
  });

  // Extract asset paths from file names
  // Format: resorts/{country}/{state}/{slug}/wiki-data.json
  const assetPaths = files
    .map(file => {
      const match = file.name.match(/^resorts\/(.+)\/wiki-data\.json$/);
      return match ? match[1] : null;
    })
    .filter((path): path is string => path !== null);

  console.log(`Found ${assetPaths.length} resorts with wiki data`);

  return assetPaths;
}

/**
 * Save enriched data to GCS for caching/auditing
 */
export async function saveEnrichedData(
  assetPath: string,
  data: object
): Promise<string> {
  if (config.processing.dryRun) {
    console.log(`  [DRY RUN] Would save enriched-data.json to: resorts/${assetPath}/enriched-data.json`);
    return `gs://${config.gcs.bucketName}/resorts/${assetPath}/enriched-data.json`;
  }

  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const filePath = `resorts/${assetPath}/enriched-data.json`;
  const file = bucket.file(filePath);

  await file.save(JSON.stringify(data, null, 2), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'public, max-age=86400', // 24 hour cache
    },
  });

  const publicUrl = `https://storage.googleapis.com/${config.gcs.bucketName}/${filePath}`;
  return publicUrl;
}
