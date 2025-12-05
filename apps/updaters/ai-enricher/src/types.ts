/**
 * Type definitions for the AI enricher
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
  tagline: string | null;
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
 * Liftie data structure from GCS
 */
export interface LiftieData {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'scheduled';
  lifts: {
    stats: {
      open: number;
      scheduled: number;
      closed: number;
      hold: number;
    };
    list: Record<string, {
      name: string;
      status: string;
      category: string;
    }>;
  };
  lastUpdated: string;
}

/**
 * OnTheSnow data structure from GCS
 */
export interface OTSData {
  resortName?: string;
  stats?: {
    acreage?: number;
    lifts?: number;
    runs?: number;
    vertical?: number;
    baseElevation?: number;
    summitElevation?: number;
    snowfall?: number;
  };
  terrain?: {
    beginner?: number;
    intermediate?: number;
    advanced?: number;
    expert?: number;
  };
  lastUpdated?: string;
}

/**
 * SkiResortInfo data structure from GCS
 */
export interface SRIData {
  name?: string;
  stats?: Record<string, unknown>;
  terrain?: Record<string, unknown>;
  lastUpdated?: string;
}

/**
 * Aggregated data from all GCS sources
 */
export interface AggregatedData {
  slug: string;
  name: string;
  assetPath: string;
  state: string;
  country: string;
  wikipedia: WikiData | null;
  liftie: LiftieData | null;
  onTheSnow: OTSData | null;
  skiResortInfo: SRIData | null;
  dataQuality: DataQuality;
}

/**
 * Data quality metrics
 */
export interface DataQuality {
  hasWikipedia: boolean;
  hasLiftie: boolean;
  hasOnTheSnow: boolean;
  hasSkiResortInfo: boolean;
  sourceCount: number;
  fileCount: number;
  overallScore: number;
}

/**
 * Value with confidence score from LLM extraction
 */
export interface ScoredValue<T> {
  value: T;
  confidence: number;
}

/**
 * AI enrichment result structure
 */
export interface AIEnrichmentResult {
  content: {
    tagline: ScoredValue<string>;
    description: ScoredValue<string>;
  };
  stats: {
    skiableAcres: ScoredValue<number | null>;
    liftsCount: ScoredValue<number | null>;
    runsCount: ScoredValue<number | null>;
    verticalDrop: ScoredValue<number | null>;
    baseElevation: ScoredValue<number | null>;
    summitElevation: ScoredValue<number | null>;
    avgAnnualSnowfall: ScoredValue<number | null>;
  };
  terrain: {
    beginner: ScoredValue<number | null>;
    intermediate: ScoredValue<number | null>;
    advanced: ScoredValue<number | null>;
    expert: ScoredValue<number | null>;
  };
}

/**
 * Full AI enrichment output saved to GCS
 */
export interface AIEnrichmentOutput {
  slug: string;
  assetPath: string;
  enrichment: AIEnrichmentResult;
  metadata: {
    version: string;
    processedAt: string;
    processingTimeMs: number;
    model: string;
    promptTokens: number;
    completionTokens: number;
    estimatedCost: number;
    minConfidenceThreshold: number;
  };
  inputDataQuality: DataQuality;
}

/**
 * Processing result for a single resort
 */
export interface ProcessingResult {
  slug: string;
  assetPath: string;
  success: boolean;
  skipped?: boolean;
  skipReason?: string;
  error?: string;
  processingTimeMs?: number;
  cost?: number;
  fieldsUpdated?: string[];
  fieldsSkipped?: string[];
}

/**
 * Progress tracking for resume support
 */
export interface ProgressData {
  lastRun: string;
  processedResorts: string[];
  failedResorts: Record<string, string>;
  stats: {
    total: number;
    processed: number;
    failed: number;
    skipped: number;
  };
}

/**
 * Cost report for auditing
 */
export interface CostReport {
  runId: string;
  startedAt: string;
  completedAt: string;
  model: string;
  resorts: Array<{
    slug: string;
    promptTokens: number;
    completionTokens: number;
    cost: number;
    processingTimeMs: number;
  }>;
  totals: {
    resortCount: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalCost: number;
    avgCostPerResort: number;
    totalProcessingTimeMs: number;
  };
}

/**
 * CLI options
 */
export interface CliOptions {
  filter?: string;
  limit?: number;
  skip?: number;
  skipExisting: boolean;
  overwrite: boolean;
  resume: boolean;
  dryRun: boolean;
  minConfidence: number;
  list: boolean;
  listEnriched: boolean;
  verbose: boolean;
  help: boolean;
}

/**
 * Supabase update options
 */
export interface UpdateOptions {
  dryRun?: boolean;
  minConfidence?: number;
  skipExisting?: boolean;
}

/**
 * Supabase update result
 */
export interface UpdateResult {
  success: boolean;
  fieldsUpdated: string[];
  fieldsSkipped: string[];
  error?: string;
}
