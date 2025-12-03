import type {
  LiftieData,
  ResortConditionsInsert,
  LiftStatus,
} from './types.js';

/**
 * Calculate total lifts from stats
 */
function getTotalLifts(stats: { open: number; hold: number; scheduled: number; closed: number }): number {
  return stats.open + stats.hold + stats.scheduled + stats.closed;
}

/**
 * Map Liftie data to resort_conditions table format
 */
export function mapLiftieToConditions(
  resortId: string,
  liftieData: LiftieData
): ResortConditionsInsert {
  const { summary, lifts, weather, webcams } = liftieData;

  // Calculate lift stats
  let liftsOpen = 0;
  let liftsTotal = 0;
  let liftsPercentage = 0;
  let liftsStatus: Record<string, LiftStatus> = {};

  if (summary?.liftStats) {
    liftsOpen = summary.liftStats.open;
    liftsTotal = getTotalLifts(summary.liftStats);
    liftsPercentage = summary.liftStats.percentage?.open ?? 0;
  }

  if (lifts?.status) {
    liftsStatus = lifts.status;
    // If we have individual lift data but no summary, calculate totals
    if (liftsTotal === 0) {
      liftsTotal = Object.keys(lifts.status).length;
      liftsOpen = Object.values(lifts.status).filter(s => s === 'open').length;
      liftsPercentage = liftsTotal > 0 ? (liftsOpen / liftsTotal) * 100 : 0;
    }
  }

  // Map weather data
  const weatherHigh = weather?.temperature?.max ?? null;
  const weatherCondition = weather?.conditions ?? null;
  const weatherText = weather?.text ?? null;
  const weatherIcon = weather?.icon ?? [];
  const weatherDate = weather?.date ?? null;

  // Map webcams
  const webcamsList = webcams?.webcams ?? [];
  const hasWebcams = webcamsList.length > 0;

  // Feature flags
  const hasLifts = summary?.hasLifts ?? (liftsTotal > 0);
  const hasWeather = summary?.hasWeather ?? (weatherCondition !== null);

  // Source tracking
  const liftieId = summary?.id ?? null;
  const sourceTimestamp = summary?.timestamp ?? null;

  return {
    resort_id: resortId,
    lifts_open: liftsOpen,
    lifts_total: liftsTotal,
    lifts_percentage: liftsPercentage,
    lifts_status: liftsStatus,
    weather_high: weatherHigh,
    weather_condition: weatherCondition,
    weather_text: weatherText,
    weather_icon: weatherIcon,
    weather_date: weatherDate,
    webcams: webcamsList,
    has_webcams: hasWebcams,
    has_lifts: hasLifts,
    has_weather: hasWeather,
    liftie_id: liftieId,
    source_timestamp: sourceTimestamp,
  };
}

/**
 * Check if conditions have meaningfully changed
 * Returns true if update is needed
 */
export function hasConditionsChanged(
  existing: ResortConditionsInsert | null,
  updated: ResortConditionsInsert
): boolean {
  if (!existing) return true;

  // Check key fields that indicate meaningful change
  if (existing.lifts_open !== updated.lifts_open) return true;
  if (existing.lifts_total !== updated.lifts_total) return true;
  if (existing.weather_high !== updated.weather_high) return true;
  if (existing.weather_condition !== updated.weather_condition) return true;
  if (existing.source_timestamp !== updated.source_timestamp) return true;

  // Check if webcams changed
  const existingWebcamCount = Array.isArray(existing.webcams) ? existing.webcams.length : 0;
  const updatedWebcamCount = Array.isArray(updated.webcams) ? updated.webcams.length : 0;
  if (existingWebcamCount !== updatedWebcamCount) return true;

  return false;
}

/**
 * Format conditions summary for logging
 */
export function formatConditionsSummary(conditions: ResortConditionsInsert): string {
  const parts: string[] = [];

  if (conditions.has_lifts) {
    parts.push(`Lifts: ${conditions.lifts_open}/${conditions.lifts_total} (${conditions.lifts_percentage.toFixed(0)}%)`);
  }

  if (conditions.has_weather && conditions.weather_condition) {
    const temp = conditions.weather_high !== null ? `${conditions.weather_high}°F` : '';
    parts.push(`Weather: ${conditions.weather_condition}${temp ? ` ${temp}` : ''}`);
  }

  if (conditions.has_webcams) {
    const count = Array.isArray(conditions.webcams) ? conditions.webcams.length : 0;
    parts.push(`Webcams: ${count}`);
  }

  return parts.length > 0 ? parts.join(' | ') : 'No data';
}
