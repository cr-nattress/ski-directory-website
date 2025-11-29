/**
 * Parser for reading region data from local JSON files
 */

import * as fs from 'fs';
import * as path from 'path';
import { RegionData, RegionResort, RegionMetadata } from './types';
import { config } from './config';

/**
 * Read and parse a region JSON file
 */
export function readRegionFile(country: string, state: string): RegionData | null {
  const filePath = path.join(
    config.regionsPath,
    country,
    state,
    `region-${country}-${state}.json`
  );

  if (!fs.existsSync(filePath)) {
    console.log(`  No region file found: ${filePath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content) as RegionData;
    return data;
  } catch (error) {
    console.error(`  Error reading ${filePath}:`, error);
    return null;
  }
}

/**
 * List all states/provinces for a country
 */
export function listStates(country: string): string[] {
  const countryPath = path.join(config.regionsPath, country);

  if (!fs.existsSync(countryPath)) {
    return [];
  }

  return fs.readdirSync(countryPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * List all countries
 */
export function listCountries(): string[] {
  if (!fs.existsSync(config.regionsPath)) {
    return [];
  }

  return fs.readdirSync(config.regionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * Generate region metadata from resort data
 */
export function generateRegionMetadata(
  country: string,
  state: string,
  resorts: RegionResort[]
): RegionMetadata {
  const activeResorts = resorts.filter(r => r.status === 'active');
  const defunctResorts = resorts.filter(r => r.status === 'defunct');

  // Calculate aggregate stats
  const totalAcres = activeResorts.reduce(
    (sum, r) => sum + (r.stats?.skiableAcres || 0),
    0
  );
  const avgSnowfall = activeResorts.length > 0
    ? Math.round(
        activeResorts.reduce((sum, r) => sum + (r.stats?.avgAnnualSnowfall || 0), 0) /
        activeResorts.filter(r => r.stats?.avgAnnualSnowfall).length || 1
      )
    : 0;

  // Calculate bounds
  const resortsWithLocation = resorts.filter(r => r.location);
  let bounds = undefined;
  if (resortsWithLocation.length > 0) {
    bounds = {
      north: Math.max(...resortsWithLocation.map(r => r.location!.lat)),
      south: Math.min(...resortsWithLocation.map(r => r.location!.lat)),
      east: Math.max(...resortsWithLocation.map(r => r.location!.lng)),
      west: Math.min(...resortsWithLocation.map(r => r.location!.lng)),
    };
  }

  return {
    code: state,
    name: config.stateNames[state] || state,
    country: config.countries[country]?.name || country.toUpperCase(),
    countryCode: country,
    stats: {
      totalResorts: resorts.length,
      activeResorts: activeResorts.length,
      defunctResorts: defunctResorts.length,
      totalSkiableAcres: totalAcres,
      avgSnowfall,
    },
    bounds,
    resorts: resorts.map(r => r.slug),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Transform a resort for individual JSON export
 */
export function transformResortForExport(
  resort: RegionResort,
  country: string,
  state: string
): Record<string, unknown> {
  return {
    id: `resort:${resort.slug}`,
    slug: resort.slug,
    name: resort.name,
    country,
    countryName: config.countries[country]?.name || country.toUpperCase(),
    state,
    stateName: config.stateNames[state] || state,
    status: resort.status,
    isActive: resort.status === 'active',
    isLost: resort.status === 'defunct',
    location: resort.location,
    nearestCity: resort.nearestCity,
    stats: resort.stats,
    terrain: resort.terrain,
    passAffiliations: resort.passAffiliations || [],
    features: resort.features,
    websiteUrl: resort.websiteUrl,
    description: resort.description,
    tags: resort.tags || [],
    assetLocation: {
      country,
      state,
      slug: resort.slug,
    },
    lastUpdated: new Date().toISOString(),
  };
}
