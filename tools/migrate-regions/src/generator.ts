/**
 * TypeScript file generator for resort data
 *
 * Generates resort.ts files from resort.json data stored in GCS
 */

import { Storage } from '@google-cloud/storage';
import { config } from './config';

/**
 * Resort data structure from JSON
 */
interface ResortJson {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryName: string;
  state: string;
  stateName: string;
  status: string;
  isActive: boolean;
  isLost: boolean;
  location?: { lat: number; lng: number };
  nearestCity?: string;
  stats?: Record<string, unknown>;
  terrain?: Record<string, unknown>;
  passAffiliations: string[];
  features?: Record<string, unknown>;
  websiteUrl?: string;
  description?: string;
  tags: string[];
  assetLocation: { country: string; state: string; slug: string };
  lastUpdated: string;
}

/**
 * Generation result for a single resort
 */
export interface GenerationResult {
  slug: string;
  success: boolean;
  skipped: boolean;
  error?: string;
}

/**
 * Generation summary for a state
 */
export interface StateGenerationResult {
  country: string;
  state: string;
  totalResorts: number;
  generated: number;
  skipped: number;
  errors: string[];
}

let storageClient: Storage | null = null;

/**
 * Get or create the GCS storage client
 */
function getStorageClient(): Storage {
  if (!storageClient) {
    storageClient = new Storage({
      keyFilename: config.keyFilePath,
    });
  }
  return storageClient;
}

/**
 * List all resort folders for a state
 */
export async function listResortFolders(
  country: string,
  state: string
): Promise<string[]> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.bucket);
  const prefix = `${config.basePath}/${country}/${state}/`;

  const [files] = await bucket.getFiles({ prefix });

  // Extract unique resort slugs from file paths
  const slugs = new Set<string>();
  for (const file of files) {
    const relativePath = file.name.replace(prefix, '');
    const slug = relativePath.split('/')[0];
    if (slug && slug !== '') {
      slugs.add(slug);
    }
  }

  return Array.from(slugs).sort();
}

/**
 * Check if a resort.ts file exists
 */
export async function resortTsExists(
  country: string,
  state: string,
  slug: string
): Promise<boolean> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.bucket);
  const filePath = `${config.basePath}/${country}/${state}/${slug}/resort.ts`;

  const [exists] = await bucket.file(filePath).exists();
  return exists;
}

/**
 * Fetch resort.json from GCS
 */
export async function fetchResortJson(
  country: string,
  state: string,
  slug: string
): Promise<ResortJson | null> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.bucket);
  const filePath = `${config.basePath}/${country}/${state}/${slug}/resort.json`;

  try {
    const [content] = await bucket.file(filePath).download();
    return JSON.parse(content.toString()) as ResortJson;
  } catch {
    return null;
  }
}

/**
 * Format a value for TypeScript output
 */
function formatValue(value: unknown, indent: number = 0): string {
  const spaces = '  '.repeat(indent);

  if (value === null || value === undefined) {
    return 'undefined';
  }

  if (typeof value === 'string') {
    // Escape single quotes and wrap in single quotes
    return `'${value.replace(/'/g, "\\'")}'`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    const items = value.map((v) => formatValue(v, indent + 1));
    if (items.every((i) => !i.includes('\n') && i.length < 30)) {
      return `[${items.join(', ')}]`;
    }
    return `[\n${spaces}  ${items.join(`,\n${spaces}  `)}\n${spaces}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return '{}';
    }
    const formatted = entries.map(
      ([key, val]) => `${spaces}  ${key}: ${formatValue(val, indent + 1)}`
    );
    return `{\n${formatted.join(',\n')}\n${spaces}}`;
  }

  return String(value);
}

/**
 * Generate TypeScript content from resort JSON
 */
export function generateTypeScript(resort: ResortJson): string {
  const timestamp = new Date().toISOString();

  // Calculate the correct import path depth based on asset location
  // Structure: resorts/{country}/{state}/{slug}/resort.ts
  // Schema is at: schemas/resort.types.ts (relative to project root)
  // For GCS, we use a relative reference assuming similar structure
  const importPath = '../../../../schemas/resort.types';

  const lines: string[] = [
    '/**',
    ` * ${resort.name}`,
    ` * Location: ${resort.stateName}, ${resort.countryName}`,
    ` * Status: ${resort.status}`,
    ' *',
    ` * GCS Path: gs://${config.bucket}/${config.basePath}/${resort.assetLocation.country}/${resort.assetLocation.state}/${resort.assetLocation.slug}/`,
    ` * Generated: ${timestamp}`,
    ' */',
    '',
    `import type { Resort } from '${importPath}';`,
    '',
    'export const resort: Resort = {',
    `  id: ${formatValue(resort.id)},`,
    `  slug: ${formatValue(resort.slug)},`,
    `  name: ${formatValue(resort.name)},`,
    `  country: ${formatValue(resort.country)},`,
    `  countryName: ${formatValue(resort.countryName)},`,
    `  state: ${formatValue(resort.state)},`,
    `  stateName: ${formatValue(resort.stateName)},`,
    `  status: ${formatValue(resort.status)},`,
    `  isActive: ${resort.isActive},`,
    `  isLost: ${resort.isLost},`,
  ];

  // Optional fields
  if (resort.location) {
    lines.push(`  location: ${formatValue(resort.location, 1)},`);
  }

  if (resort.nearestCity) {
    lines.push(`  nearestCity: ${formatValue(resort.nearestCity)},`);
  }

  if (resort.stats && Object.keys(resort.stats).length > 0) {
    lines.push(`  stats: ${formatValue(resort.stats, 1)},`);
  }

  if (resort.terrain && Object.keys(resort.terrain).length > 0) {
    lines.push(`  terrain: ${formatValue(resort.terrain, 1)},`);
  }

  // Always include passAffiliations (required field)
  lines.push(`  passAffiliations: ${formatValue(resort.passAffiliations)},`);

  if (resort.features && Object.keys(resort.features).length > 0) {
    lines.push(`  features: ${formatValue(resort.features, 1)},`);
  }

  if (resort.websiteUrl) {
    lines.push(`  websiteUrl: ${formatValue(resort.websiteUrl)},`);
  }

  if (resort.description) {
    lines.push(`  description: ${formatValue(resort.description)},`);
  }

  // Always include tags (required field)
  lines.push(`  tags: ${formatValue(resort.tags)},`);

  // Always include assetLocation (required field)
  lines.push(`  assetLocation: ${formatValue(resort.assetLocation, 1)},`);

  // Always include lastUpdated (required field)
  lines.push(`  lastUpdated: ${formatValue(resort.lastUpdated)},`);

  lines.push('};');
  lines.push('');
  lines.push('export default resort;');
  lines.push('');

  return lines.join('\n');
}

/**
 * Upload generated TypeScript to GCS
 */
export async function uploadGeneratedTs(
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

    console.log(`  Generated: gs://${config.bucket}/${fullPath}`);
    return true;
  } catch (error) {
    console.error(`  Error uploading ${fullPath}:`, error);
    return false;
  }
}

/**
 * Generate TypeScript for a single resort
 */
export async function generateForResort(
  country: string,
  state: string,
  slug: string,
  dryRun: boolean = false,
  force: boolean = false
): Promise<GenerationResult> {
  // Check if resort.ts already exists (unless force is true)
  if (!force) {
    const exists = await resortTsExists(country, state, slug);
    if (exists) {
      return { slug, success: true, skipped: true };
    }
  }

  // Fetch resort.json
  const resortData = await fetchResortJson(country, state, slug);
  if (!resortData) {
    return { slug, success: false, skipped: false, error: 'Could not fetch resort.json' };
  }

  // Generate TypeScript content
  const tsContent = generateTypeScript(resortData);

  // Upload to GCS
  const uploaded = await uploadGeneratedTs(country, state, slug, tsContent, dryRun);
  if (!uploaded) {
    return { slug, success: false, skipped: false, error: 'Upload failed' };
  }

  return { slug, success: true, skipped: false };
}

/**
 * Generate TypeScript files for all resorts in a state
 */
export async function generateForState(
  country: string,
  state: string,
  dryRun: boolean = false,
  verbose: boolean = false,
  force: boolean = false
): Promise<StateGenerationResult> {
  const result: StateGenerationResult = {
    country,
    state,
    totalResorts: 0,
    generated: 0,
    skipped: 0,
    errors: [],
  };

  // List all resort folders
  const slugs = await listResortFolders(country, state);
  result.totalResorts = slugs.length;

  if (slugs.length === 0) {
    return result;
  }

  if (verbose) {
    console.log(`  Found ${slugs.length} resort folders`);
  }

  // Process each resort
  for (const slug of slugs) {
    const genResult = await generateForResort(country, state, slug, dryRun, force);

    if (genResult.skipped) {
      result.skipped++;
      if (verbose) {
        console.log(`  Skipped: ${slug} (resort.ts already exists)`);
      }
    } else if (genResult.success) {
      result.generated++;
    } else {
      result.errors.push(`${slug}: ${genResult.error}`);
    }
  }

  return result;
}

/**
 * List all states in a country
 */
export async function listStatesInGcs(country: string): Promise<string[]> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.bucket);
  const prefix = `${config.basePath}/${country}/`;

  // Use getFiles with autoPaginate to get all files, then extract unique state folders
  const [files] = await bucket.getFiles({ prefix });

  // Get unique state folders
  const states = new Set<string>();
  for (const file of files) {
    const relativePath = file.name.replace(prefix, '');
    const parts = relativePath.split('/');
    const state = parts[0];
    if (state && state !== '' && parts.length > 1) {
      states.add(state);
    }
  }

  return Array.from(states).sort();
}

/**
 * List all countries in GCS
 */
export async function listCountriesInGcs(): Promise<string[]> {
  const storage = getStorageClient();
  const bucket = storage.bucket(config.bucket);
  const prefix = `${config.basePath}/`;

  // Use getFiles with autoPaginate to get all files, then extract unique country folders
  const [files] = await bucket.getFiles({ prefix });

  // Get unique country folders
  const countries = new Set<string>();
  for (const file of files) {
    const relativePath = file.name.replace(prefix, '');
    const parts = relativePath.split('/');
    const country = parts[0];
    if (country && country !== '' && parts.length > 1 && country !== 'schema') {
      countries.add(country);
    }
  }

  return Array.from(countries).sort();
}
