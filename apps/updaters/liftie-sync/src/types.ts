/**
 * Type definitions for Liftie Sync
 */

// ============================================================================
// LIFTIE DATA TYPES (from GCS)
// ============================================================================

export type LiftStatus = 'open' | 'closed' | 'hold' | 'scheduled';

export interface LiftStats {
  open: number;
  hold: number;
  scheduled: number;
  closed: number;
}

export interface LiftStatsWithPercentage extends LiftStats {
  percentage: {
    open: number;
    hold: number;
    scheduled: number;
    closed: number;
  };
}

export interface LiftieSummary {
  id: string;
  name: string;
  hasLifts: boolean;
  hasWeather: boolean;
  hasWebcams: boolean;
  liftStats: LiftStatsWithPercentage;
  timestamp: string;
}

export interface LiftieLifts {
  status: Record<string, LiftStatus>;
  stats: LiftStats;
}

export interface LiftieWeather {
  date: string;
  icon: string[];
  text: string;
  conditions: string;
  temperature: {
    max: number;
  };
}

export interface LiftieWebcam {
  name: string;
  source: string;
  image: string;
}

export interface LiftieWebcams {
  webcams: LiftieWebcam[];
}

export interface LiftieData {
  summary: LiftieSummary | null;
  lifts: LiftieLifts | null;
  weather: LiftieWeather | null;
  webcams: LiftieWebcams | null;
}

// ============================================================================
// RESORT TYPES (from Supabase)
// ============================================================================

export interface Resort {
  id: string;
  slug: string;
  name: string;
  country_code: string;
  state_slug: string;
  asset_path: string;
  is_active: boolean;
  is_lost: boolean;
}

// ============================================================================
// CONDITIONS TABLE TYPES
// ============================================================================

export interface ResortConditionsInsert {
  resort_id: string;
  lifts_open: number;
  lifts_total: number;
  lifts_percentage: number;
  lifts_status: Record<string, LiftStatus>;
  weather_high: number | null;
  weather_condition: string | null;
  weather_text: string | null;
  weather_icon: string[];
  weather_date: string | null;
  webcams: LiftieWebcam[];
  has_webcams: boolean;
  has_lifts: boolean;
  has_weather: boolean;
  liftie_id: string | null;
  source_timestamp: string | null;
}

// ============================================================================
// SYNC STATISTICS
// ============================================================================

export interface SyncStats {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
  noLiftieData: number;
}
