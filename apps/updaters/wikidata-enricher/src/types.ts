/**
 * Type definitions for the wikidata enricher
 */

/**
 * Resort data from Supabase
 */
export interface Resort {
  id: string;
  slug: string;
  name: string;
  state: string;
  state_name: string;
  country: string;
  country_name: string;
  asset_path: string;
  nearest_city: string | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  is_lost: boolean;
  website_url: string | null;
  description: string | null;
  tagline?: string | null;
  stats: ResortStats | null;
  terrain: ResortTerrain | null;
  features: ResortFeatures | null;
}

export interface ResortStats {
  skiableAcres?: number | null;
  liftsCount?: number | null;
  runsCount?: number | null;
  verticalDrop?: number | null;
  baseElevation?: number | null;
  summitElevation?: number | null;
  avgAnnualSnowfall?: number | null;
}

export interface ResortTerrain {
  beginner?: number | null;
  intermediate?: number | null;
  advanced?: number | null;
  expert?: number | null;
}

export interface ResortFeatures {
  hasPark?: boolean | null;
  hasHalfpipe?: boolean | null;
  hasNightSkiing?: boolean | null;
  hasBackcountryAccess?: boolean | null;
  hasSpaVillage?: boolean | null;
}

/**
 * Wiki data structure from GCS (created by wikipedia-updater)
 */
export interface WikiData {
  title: string;
  pageid: number;
  url: string;
  extract: string;
  fullExtract: string;
  categories: string[];
  coordinates: { lat: number; lng: number } | null;
  infobox: Record<string, string>;
  media: WikiMediaItem[];
  lastUpdated: string;
}

export interface WikiMediaItem {
  title: string;
  type: string;
  leadImage: boolean;
  sectionId: number;
  caption?: string;
  srcset: Array<{
    src: string;
    scale: string;
  }>;
}

/**
 * Value with confidence score from LLM extraction
 */
export interface ConfidenceValue<T> {
  value: T | null;
  confidence: number;
}

/**
 * Extracted data from LLM
 */
export interface ExtractedData {
  content: {
    tagline: ConfidenceValue<string>;
    description: ConfidenceValue<string>;
  };
  stats: {
    skiableAcres: ConfidenceValue<number>;
    liftsCount: ConfidenceValue<number>;
    runsCount: ConfidenceValue<number>;
    verticalDrop: ConfidenceValue<number>;
    baseElevation: ConfidenceValue<number>;
    summitElevation: ConfidenceValue<number>;
    avgAnnualSnowfall: ConfidenceValue<number>;
  };
  terrain: {
    beginner: ConfidenceValue<number>;
    intermediate: ConfidenceValue<number>;
    advanced: ConfidenceValue<number>;
    expert: ConfidenceValue<number>;
  };
  features: {
    hasPark: ConfidenceValue<boolean>;
    hasHalfpipe: ConfidenceValue<boolean>;
    hasNightSkiing: ConfidenceValue<boolean>;
    hasBackcountryAccess: ConfidenceValue<boolean>;
  };
  general: {
    websiteUrl: ConfidenceValue<string>;
    nearestCity: ConfidenceValue<string>;
  };
  coordinates: {
    lat: ConfidenceValue<number>;
    lng: ConfidenceValue<number>;
  };
}

/**
 * Proposed change to apply to Supabase
 */
export interface ProposedChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  confidence: number;
}

/**
 * Result of processing a single resort
 */
export interface ProcessingResult {
  resortId: string;
  resortName: string;
  success: boolean;
  hasWikiData: boolean;
  extractedData: ExtractedData | null;
  proposedChanges: ProposedChange[];
  skippedFields: Array<{ field: string; reason: string; confidence?: number }>;
  error?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * CLI options
 */
export interface CliOptions {
  filter?: string;
  limit?: number;
  skipExisting: boolean;
  minConfidence: number;
  apply: boolean;
  verbose: boolean;
  list: boolean;
}

/**
 * Processing statistics
 */
export interface ProcessingStats {
  total: number;
  processed: number;
  withWikiData: number;
  extractedSuccessfully: number;
  applied: number;
  failed: number;
  skipped: number;
  totalTokens: number;
  estimatedCost: number;
}
