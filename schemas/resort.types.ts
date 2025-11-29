/**
 * TypeScript type definitions for resort.json files
 *
 * These types correspond to the JSON schema at resort.schema.json
 * Use these when creating or working with resort data files.
 */

/**
 * Geographic coordinates
 */
export interface ResortLocation {
  /** Latitude in decimal degrees (-90 to 90) */
  lat: number;
  /** Longitude in decimal degrees (-180 to 180) */
  lng: number;
}

/**
 * Resort statistics and measurements
 */
export interface ResortStats {
  /** Total skiable terrain in acres */
  skiableAcres?: number;
  /** Total number of ski lifts */
  liftsCount?: number;
  /** Total number of marked runs/trails */
  runsCount?: number;
  /** Vertical drop in feet */
  verticalDrop?: number;
  /** Base elevation in feet above sea level */
  baseElevation?: number;
  /** Summit elevation in feet above sea level */
  summitElevation?: number;
  /** Average annual snowfall in inches */
  avgAnnualSnowfall?: number;
}

/**
 * Terrain breakdown by difficulty
 * Percentages should sum to 100
 */
export interface ResortTerrain {
  /** Percentage of beginner (green) terrain */
  beginner?: number;
  /** Percentage of intermediate (blue) terrain */
  intermediate?: number;
  /** Percentage of advanced (black diamond) terrain */
  advanced?: number;
  /** Percentage of expert (double black diamond) terrain */
  expert?: number;
}

/**
 * Available amenities and features
 */
export interface ResortFeatures {
  /** Has terrain park */
  hasPark?: boolean;
  /** Has halfpipe */
  hasHalfpipe?: boolean;
  /** Offers night skiing */
  hasNightSkiing?: boolean;
  /** Provides backcountry access gates */
  hasBackcountryAccess?: boolean;
  /** Has spa and village amenities */
  hasSpaVillage?: boolean;
}

/**
 * GCS asset path components
 */
export interface AssetLocation {
  /** Country code (us or ca) */
  country: 'us' | 'ca';
  /** State/province slug */
  state: string;
  /** Resort slug */
  slug: string;
}

/**
 * Ski pass affiliations
 */
export type PassAffiliation =
  | 'epic'
  | 'ikon'
  | 'indy'
  | 'mountain-collective'
  | 'powder-alliance';

/**
 * Resort operating status
 */
export type ResortStatus = 'active' | 'defunct';

/**
 * Country codes
 */
export type CountryCode = 'us' | 'ca';

/**
 * Full resort data structure
 *
 * This is the complete type for resort.json files stored in GCS
 * at: gs://sda-assets-prod/resorts/{country}/{state}/{slug}/resort.json
 */
export interface Resort {
  /** Unique identifier in format 'resort:{slug}' */
  id: string;

  /** URL-friendly identifier (lowercase, hyphens, no spaces) */
  slug: string;

  /** Official resort name */
  name: string;

  /** Two-letter country code (lowercase) */
  country: CountryCode;

  /** Full country name */
  countryName: 'United States' | 'Canada';

  /** State/province slug (lowercase, hyphens) */
  state: string;

  /** Full state/province name */
  stateName: string;

  /** Operating status of the resort */
  status: ResortStatus;

  /** True if resort is currently operating */
  isActive: boolean;

  /** True if resort is no longer operating (lost/defunct) */
  isLost: boolean;

  /** Geographic coordinates */
  location?: ResortLocation;

  /** Nearest major city or town */
  nearestCity?: string;

  /** Resort statistics and measurements */
  stats?: ResortStats;

  /** Terrain breakdown by difficulty */
  terrain?: ResortTerrain;

  /** Ski pass programs the resort participates in */
  passAffiliations: PassAffiliation[];

  /** Available amenities and features */
  features?: ResortFeatures;

  /** Official resort website URL */
  websiteUrl?: string;

  /** Brief description of the resort */
  description?: string;

  /** Searchable tags for categorization */
  tags: string[];

  /** GCS asset path components */
  assetLocation: AssetLocation;

  /** ISO 8601 timestamp of last update */
  lastUpdated: string;
}

/**
 * Helper type for creating a new resort
 * Makes optional fields explicit
 */
export type CreateResort = Omit<Resort, 'id' | 'isActive' | 'isLost' | 'lastUpdated'> & {
  id?: string;
  isActive?: boolean;
  isLost?: boolean;
  lastUpdated?: string;
};

/**
 * Helper function to generate resort ID from slug
 */
export function generateResortId(slug: string): string {
  return `resort:${slug}`;
}

/**
 * Helper function to generate GCS URL for resort
 */
export function getResortGcsUrl(assetLocation: AssetLocation): string {
  const { country, state, slug } = assetLocation;
  return `https://storage.googleapis.com/sda-assets-prod/resorts/${country}/${state}/${slug}/resort.json`;
}
