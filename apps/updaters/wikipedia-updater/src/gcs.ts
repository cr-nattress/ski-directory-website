import { Storage } from '@google-cloud/storage';
import { config } from './config.js';
import path from 'path';
import { fileURLToPath } from 'url';

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
 * Upload a README file to GCS for a specific resort
 *
 * @param assetPath - The resort's asset path (e.g., "colorado/vail")
 * @param content - The README markdown content
 * @returns The GCS URL of the uploaded file
 */
export async function uploadReadmeToGcs(
  assetPath: string,
  content: string
): Promise<string> {
  if (config.dryRun) {
    console.log(`  [DRY RUN] Would upload README to: resorts/${assetPath}/README.md`);
    return `gs://${config.gcs.bucketName}/resorts/${assetPath}/README.md`;
  }

  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const filePath = `resorts/${assetPath}/README.md`;
  const file = bucket.file(filePath);

  // file.save() overwrites any existing file with the same name
  await file.save(content, {
    contentType: 'text/markdown; charset=utf-8',
    metadata: {
      cacheControl: 'public, max-age=3600', // 1 hour cache
    },
  });

  const publicUrl = `https://storage.googleapis.com/${config.gcs.bucketName}/${filePath}`;
  console.log(`  Uploaded README to: ${publicUrl}`);

  return publicUrl;
}

/**
 * Check if a README already exists in GCS
 */
export async function readmeExists(assetPath: string): Promise<boolean> {
  if (config.dryRun) {
    return false;
  }

  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const file = bucket.file(`resorts/${assetPath}/README.md`);

  const [exists] = await file.exists();
  return exists;
}

/**
 * Upload Wikipedia data as JSON for potential future use
 */
export async function uploadWikiDataToGcs(
  assetPath: string,
  data: object
): Promise<string> {
  if (config.dryRun) {
    console.log(`  [DRY RUN] Would upload wiki-data.json to: resorts/${assetPath}/wiki-data.json`);
    return `gs://${config.gcs.bucketName}/resorts/${assetPath}/wiki-data.json`;
  }

  const storage = getStorageClient();
  const bucket = storage.bucket(config.gcs.bucketName);
  const filePath = `resorts/${assetPath}/wiki-data.json`;
  const file = bucket.file(filePath);

  // file.save() overwrites any existing file with the same name
  await file.save(JSON.stringify(data, null, 2), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'public, max-age=86400', // 24 hour cache
    },
  });

  const publicUrl = `https://storage.googleapis.com/${config.gcs.bucketName}/${filePath}`;
  console.log(`  Uploaded wiki-data.json to: ${publicUrl}`);

  return publicUrl;
}
