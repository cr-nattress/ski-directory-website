import { Storage } from '@google-cloud/storage';
import { config } from './config.js';
import type {
  LiftieSummary,
  LiftieLifts,
  LiftieWeather,
  LiftieWebcams,
  LiftieData,
} from './types.js';

const storage = new Storage();
const bucket = storage.bucket(config.gcs.bucket);

/**
 * Check if a file exists in GCS
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    const [exists] = await bucket.file(path).exists();
    return exists;
  } catch {
    return false;
  }
}

/**
 * Read and parse a JSON file from GCS
 */
async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const file = bucket.file(path);
    const [exists] = await file.exists();

    if (!exists) {
      return null;
    }

    const [content] = await file.download();
    return JSON.parse(content.toString()) as T;
  } catch (error) {
    if (config.processing.verbose) {
      console.error(`  Error reading ${path}:`, error);
    }
    return null;
  }
}

/**
 * Get the Liftie folder path for a resort
 */
function getLiftieBasePath(assetPath: string): string {
  // asset_path is like "resorts/us/colorado/vail"
  return `${assetPath}/liftie`;
}

/**
 * Check if a resort has Liftie data
 */
export async function hasLiftieData(assetPath: string): Promise<boolean> {
  const basePath = getLiftieBasePath(assetPath);
  return await fileExists(`${basePath}/summary.json`);
}

/**
 * Fetch all Liftie data for a resort
 */
export async function fetchLiftieData(assetPath: string): Promise<LiftieData> {
  const basePath = getLiftieBasePath(assetPath);

  // Fetch all files in parallel
  const [summary, lifts, weather, webcams] = await Promise.all([
    readJsonFile<LiftieSummary>(`${basePath}/summary.json`),
    readJsonFile<LiftieLifts>(`${basePath}/lifts.json`),
    readJsonFile<LiftieWeather>(`${basePath}/weather.json`),
    readJsonFile<LiftieWebcams>(`${basePath}/webcams.json`),
  ]);

  return { summary, lifts, weather, webcams };
}

/**
 * List all resort asset paths that have Liftie data
 */
export async function listResortsWithLiftieData(): Promise<string[]> {
  const resortPaths: string[] = [];

  try {
    // List all files under resorts/ that have liftie/summary.json
    const [files] = await bucket.getFiles({
      prefix: 'resorts/',
      matchGlob: '**/liftie/summary.json',
    });

    for (const file of files) {
      // Extract resort path from file path
      // e.g., "resorts/us/colorado/vail/liftie/summary.json" -> "resorts/us/colorado/vail"
      const match = file.name.match(/^(resorts\/[^/]+\/[^/]+\/[^/]+)\/liftie\/summary\.json$/);
      if (match) {
        resortPaths.push(match[1]);
      }
    }
  } catch (error) {
    console.error('Error listing Liftie data:', error);
  }

  return resortPaths;
}
