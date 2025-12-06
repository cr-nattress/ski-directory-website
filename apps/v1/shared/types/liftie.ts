/**
 * Liftie Data Types
 *
 * Represents the structure of data fetched from Liftie.info for ski resorts.
 * This data is stored in GCS at resorts/{country}/{state}/{slug}/liftie/
 */

// ============================================================================
// LIFT STATUS TYPES
// ============================================================================

/** Possible lift status values from Liftie */
export type LiftStatus = 'open' | 'closed' | 'hold' | 'scheduled';

/** Lift statistics counts */
export interface LiftStats {
  open: number;
  hold: number;
  scheduled: number;
  closed: number;
}

/** Lift statistics with percentages */
export interface LiftStatsWithPercentage extends LiftStats {
  percentage: {
    open: number;
    hold: number;
    scheduled: number;
    closed: number;
  };
}

// ============================================================================
// LIFTIE FILE TYPES
// ============================================================================

/**
 * Liftie summary.json structure
 * Contains overview data and feature flags
 */
export interface LiftieSummary {
  /** Liftie's internal resort ID */
  id: string;
  /** Resort name */
  name: string;
  /** Whether lift data is available */
  hasLifts: boolean;
  /** Whether weather data is available */
  hasWeather: boolean;
  /** Whether webcam data is available */
  hasWebcams: boolean;
  /** Lift statistics with counts and percentages */
  liftStats: LiftStatsWithPercentage;
  /** ISO timestamp when data was collected */
  timestamp: string;
}

/**
 * Liftie lifts.json structure
 * Contains individual lift statuses
 */
export interface LiftieLifts {
  /** Map of lift name to status */
  status: Record<string, LiftStatus>;
  /** Aggregate statistics */
  stats: LiftStats;
}

/**
 * Liftie weather.json structure
 * Contains NOAA weather forecast data
 */
export interface LiftieWeather {
  /** Forecast date (YYYY-MM-DD) */
  date: string;
  /** Weather icon class names for display */
  icon: string[];
  /** Full NOAA forecast text */
  text: string;
  /** Short weather condition description */
  conditions: string;
  /** Temperature data */
  temperature: {
    /** High temperature in Fahrenheit */
    max: number;
  };
}

/**
 * Single webcam entry
 */
export interface LiftieWebcam {
  /** Webcam name/location */
  name: string;
  /** Source URL (webcam provider page) */
  source: string;
  /** Direct image URL */
  image: string;
}

/**
 * Liftie webcams.json structure
 * Contains array of webcam data
 */
export interface LiftieWebcams {
  webcams: LiftieWebcam[];
}

// ============================================================================
// COMBINED TYPES
// ============================================================================

/**
 * Complete Liftie data for a resort
 * Combines all four JSON files into one structure
 */
export interface LiftieResortData {
  summary: LiftieSummary | null;
  lifts: LiftieLifts | null;
  weather: LiftieWeather | null;
  webcams: LiftieWebcams | null;
}

/**
 * Resort conditions as stored in the database
 */
export interface ResortConditions {
  resortId: string;

  // Lift status
  liftsOpen: number;
  liftsTotal: number;
  liftsPercentage: number;
  liftsStatus: Record<string, LiftStatus>;

  // Weather
  weatherHigh: number | null;
  weatherCondition: string | null;
  weatherText: string | null;
  weatherIcon: string[];
  weatherDate: string | null;

  // Webcams
  webcams: LiftieWebcam[];
  hasWebcams: boolean;

  // Feature flags
  hasLifts: boolean;
  hasWeather: boolean;

  // Source tracking
  liftieId: string | null;
  sourceTimestamp: string | null;
  updatedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate the total number of lifts from lift stats
 */
export function getTotalLifts(stats: LiftStats): number {
  return stats.open + stats.hold + stats.scheduled + stats.closed;
}

/**
 * Get a color class based on lift percentage open
 * @param percentage - Percentage of lifts open (0-100)
 * @returns Tailwind color class
 */
export function getLiftStatusColor(percentage: number): string {
  if (percentage >= 75) return 'text-green-600';
  if (percentage >= 25) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get a background color class based on lift percentage open
 * @param percentage - Percentage of lifts open (0-100)
 * @returns Tailwind background color class
 */
export function getLiftStatusBgColor(percentage: number): string {
  if (percentage >= 75) return 'bg-green-500';
  if (percentage >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get status icon/color for individual lift status
 */
export function getLiftStatusStyle(status: LiftStatus): {
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (status) {
    case 'open':
      return { color: 'text-green-600', bgColor: 'bg-green-500', icon: '●' };
    case 'hold':
      return { color: 'text-yellow-600', bgColor: 'bg-yellow-500', icon: '◐' };
    case 'scheduled':
      return { color: 'text-blue-600', bgColor: 'bg-blue-500', icon: '○' };
    case 'closed':
    default:
      return { color: 'text-red-600', bgColor: 'bg-red-500', icon: '●' };
  }
}

/**
 * Format weather icon classes for display
 * Liftie uses class names like "basecloud", "icon-snowy"
 */
export function getWeatherIconClass(icons: string[]): string {
  return icons.join(' ');
}

/**
 * Check if conditions data is stale (older than threshold)
 * @param updatedAt - ISO timestamp of last update
 * @param thresholdMinutes - Staleness threshold in minutes (default 120 = 2 hours)
 */
export function isConditionsStale(
  updatedAt: string | null,
  thresholdMinutes: number = 120
): boolean {
  if (!updatedAt) return true;

  const updated = new Date(updatedAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - updated.getTime()) / (1000 * 60);

  return diffMinutes > thresholdMinutes;
}

/**
 * Format the "updated X ago" text
 * @param updatedAt - ISO timestamp
 */
export function formatUpdatedAgo(updatedAt: string | null): string {
  if (!updatedAt) return 'Unknown';

  const updated = new Date(updatedAt);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
