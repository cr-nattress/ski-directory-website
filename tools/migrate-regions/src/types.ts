/**
 * Types for the migration tool
 */

export interface ResortStats {
  skiableAcres: number;
  liftsCount: number;
  runsCount: number;
  verticalDrop: number;
  baseElevation: number;
  summitElevation: number;
  avgAnnualSnowfall: number;
}

export interface ResortTerrain {
  beginner: number;
  intermediate: number;
  advanced: number;
  expert: number;
}

export interface ResortFeatures {
  hasPark: boolean;
  hasHalfpipe: boolean;
  hasNightSkiing: boolean;
  hasBackcountryAccess: boolean;
  hasSpaVillage: boolean;
}

export interface ResortLocation {
  lat: number;
  lng: number;
}

export interface RegionResort {
  name: string;
  slug: string;
  status: 'active' | 'defunct';
  location?: ResortLocation;
  nearestCity?: string;
  stats?: ResortStats;
  terrain?: ResortTerrain;
  passAffiliations?: string[];
  features?: ResortFeatures;
  websiteUrl?: string;
  description?: string;
  tags?: string[];
}

export interface RegionData {
  country: string;
  state: string;
  resorts: RegionResort[];
}

export interface RegionMetadata {
  code: string;
  name: string;
  country: string;
  countryCode: string;
  stats: {
    totalResorts: number;
    activeResorts: number;
    defunctResorts: number;
    totalSkiableAcres: number;
    avgSnowfall: number;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  resorts: string[];
  lastUpdated: string;
}

export interface MigrationConfig {
  bucket: string;
  basePath: string;
  regionsPath: string;
  dryRun: boolean;
  verbose: boolean;
}

export interface MigrationResult {
  state: string;
  country: string;
  resortsProcessed: number;
  filesUploaded: number;
  errors: string[];
  success: boolean;
}
