/**
 * GCS uploader for resort data
 */

import { Storage } from '@google-cloud/storage';
import { config } from './config';

let storageClient: Storage | null = null;

/**
 * Get or create the GCS storage client
 */
export function getStorageClient(): Storage {
  if (!storageClient) {
    storageClient = new Storage({
      keyFilename: config.keyFilePath,
    });
  }
  return storageClient;
}

/**
 * Upload a JSON file to GCS
 */
export async function uploadJson(
  gcsPath: string,
  data: unknown,
  cacheControl: string = config.cacheControl.json,
  dryRun: boolean = false
): Promise<boolean> {
  const fullPath = `${config.basePath}/${gcsPath}`;

  if (dryRun) {
    console.log(`  [DRY RUN] Would upload: gs://${config.bucket}/${fullPath}`);
    return true;
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(config.bucket);
    const file = bucket.file(fullPath);

    const content = JSON.stringify(data, null, 2);

    await file.save(content, {
      contentType: 'application/json',
      metadata: {
        cacheControl,
      },
    });

    console.log(`  Uploaded: gs://${config.bucket}/${fullPath}`);
    return true;
  } catch (error) {
    console.error(`  Error uploading ${fullPath}:`, error);
    return false;
  }
}

/**
 * Upload region metadata
 */
export async function uploadRegionMetadata(
  country: string,
  state: string,
  metadata: unknown,
  dryRun: boolean = false
): Promise<boolean> {
  const gcsPath = `${country}/${state}/region.json`;
  return uploadJson(gcsPath, metadata, config.cacheControl.json, dryRun);
}

/**
 * Upload all resorts as a single aggregated file
 */
export async function uploadResortsAggregate(
  country: string,
  state: string,
  resorts: unknown[],
  dryRun: boolean = false
): Promise<boolean> {
  const gcsPath = `${country}/${state}/resorts.json`;
  return uploadJson(gcsPath, { resorts, count: resorts.length, lastUpdated: new Date().toISOString() }, config.cacheControl.json, dryRun);
}

/**
 * Create a resort folder by uploading a .gitkeep placeholder
 */
export async function createResortFolder(
  country: string,
  state: string,
  slug: string,
  dryRun: boolean = false
): Promise<boolean> {
  const fullPath = `${config.basePath}/${country}/${state}/${slug}/.gitkeep`;

  if (dryRun) {
    console.log(`  [DRY RUN] Would create folder: gs://${config.bucket}/${config.basePath}/${country}/${state}/${slug}/`);
    return true;
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(config.bucket);
    const file = bucket.file(fullPath);

    await file.save('', {
      contentType: 'text/plain',
    });

    console.log(`  Created folder: gs://${config.bucket}/${config.basePath}/${country}/${state}/${slug}/`);
    return true;
  } catch (error) {
    console.error(`  Error creating folder for ${slug}:`, error);
    return false;
  }
}

/**
 * Upload resort JSON to its folder
 */
export async function uploadResortJson(
  country: string,
  state: string,
  slug: string,
  data: unknown,
  dryRun: boolean = false
): Promise<boolean> {
  const gcsPath = `${country}/${state}/${slug}/resort.json`;
  return uploadJson(gcsPath, data, config.cacheControl.json, dryRun);
}

/**
 * Upload resort TS file to its folder
 */
export async function uploadResortTs(
  country: string,
  state: string,
  slug: string,
  content: string,
  dryRun: boolean = false
): Promise<boolean> {
  const fullPath = `${config.basePath}/${country}/${state}/${slug}/resort.ts`;

  if (dryRun) {
    console.log(`  [DRY RUN] Would upload: gs://${config.bucket}/${fullPath}`);
    return true;
  }

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(config.bucket);
    const file = bucket.file(fullPath);

    await file.save(content, {
      contentType: 'text/plain',
      metadata: {
        cacheControl: config.cacheControl.json,
      },
    });

    console.log(`  Uploaded: gs://${config.bucket}/${fullPath}`);
    return true;
  } catch (error) {
    console.error(`  Error uploading ${fullPath}:`, error);
    return false;
  }
}

/**
 * Upload country index
 */
export async function uploadCountryIndex(
  country: string,
  states: Array<{ code: string; name: string; resortCount: number }>,
  dryRun: boolean = false
): Promise<boolean> {
  const gcsPath = `${country}/index.json`;
  const data = {
    country,
    countryName: config.countries[country]?.name || country.toUpperCase(),
    states,
    totalResorts: states.reduce((sum, s) => sum + s.resortCount, 0),
    lastUpdated: new Date().toISOString(),
  };
  return uploadJson(gcsPath, data, config.cacheControl.index, dryRun);
}

/**
 * Upload master index
 */
export async function uploadMasterIndex(
  countries: Array<{ code: string; name: string; stateCount: number; resortCount: number }>,
  dryRun: boolean = false
): Promise<boolean> {
  const gcsPath = 'index.json';
  const data = {
    countries,
    totalStates: countries.reduce((sum, c) => sum + c.stateCount, 0),
    totalResorts: countries.reduce((sum, c) => sum + c.resortCount, 0),
    lastUpdated: new Date().toISOString(),
  };
  return uploadJson(gcsPath, data, config.cacheControl.index, dryRun);
}

/**
 * Get the public URL for a GCS path
 */
export function getPublicUrl(gcsPath: string): string {
  return `https://storage.googleapis.com/${config.bucket}/${config.basePath}/${gcsPath}`;
}
