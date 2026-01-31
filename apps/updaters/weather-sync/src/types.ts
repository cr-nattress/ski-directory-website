/**
 * Type definitions for Weather Sync
 * Uses Open-Meteo API for detailed mountain weather forecasts
 */

// ============================================================================
// OPEN-METEO API RESPONSE TYPES
// ============================================================================

export interface OpenMeteoCurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  snowfall: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  snowfall: number[];
  snow_depth: number[];
  weather_code: number[];
  visibility: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: number[];
  uv_index: number[];
}

export interface OpenMeteoDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  snowfall_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  current?: OpenMeteoCurrentWeather;
  hourly?: OpenMeteoHourly;
  daily?: OpenMeteoDaily;
}

// ============================================================================
// RESORT TYPES (from Supabase)
// ============================================================================

export interface Resort {
  id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  base_elevation: number | null;
  summit_elevation: number | null;
  country_code: string;
  state_slug: string;
}

// ============================================================================
// WEATHER TABLE TYPES (for Supabase)
// ============================================================================

/**
 * Weather data to upsert into resort_conditions table
 * These fields extend the existing table created by liftie-sync
 */
export interface ResortWeatherInsert {
  resort_id: string;
  // Current conditions
  current_temp: number | null;
  current_feels_like: number | null;
  current_humidity: number | null;
  current_wind_speed: number | null;
  current_wind_gust: number | null;
  current_wind_direction: number | null;
  current_precipitation: number | null;
  current_snowfall: number | null;
  current_weather_code: number | null;
  current_visibility: number | null;
  is_day: boolean;
  // Today's forecast
  today_high: number | null;
  today_low: number | null;
  today_precip_chance: number | null;
  today_snowfall: number | null;
  today_weather_code: number | null;
  sunrise: string | null;
  sunset: string | null;
  uv_index: number | null;
  // Snowfall predictions (critical for ski resorts!)
  snow_next_24h: number | null;
  snow_next_48h: number | null;
  snow_next_72h: number | null;
  // Extended forecasts (JSONB)
  daily_forecast: DailyForecast[];
  hourly_forecast: HourlyForecast[];
  // Metadata
  elevation_used: number;
  weather_fetched_at: string;
  weather_source: string;
  // Flag to indicate we have weather data
  has_weather: boolean;
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  weather_code: number;
  precip_chance: number;
  snowfall: number;
  wind_speed_max: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  feels_like: number;
  weather_code: number;
  precip_chance: number;
  snowfall: number;
  wind_speed: number;
  wind_gust: number;
}

// ============================================================================
// WMO WEATHER CODES
// ============================================================================

export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: 'sunny' },
  1: { description: 'Mainly clear', icon: 'partly-cloudy' },
  2: { description: 'Partly cloudy', icon: 'partly-cloudy' },
  3: { description: 'Overcast', icon: 'cloudy' },
  45: { description: 'Fog', icon: 'fog' },
  48: { description: 'Depositing rime fog', icon: 'fog' },
  51: { description: 'Light drizzle', icon: 'drizzle' },
  53: { description: 'Moderate drizzle', icon: 'drizzle' },
  55: { description: 'Dense drizzle', icon: 'drizzle' },
  56: { description: 'Light freezing drizzle', icon: 'freezing-drizzle' },
  57: { description: 'Dense freezing drizzle', icon: 'freezing-drizzle' },
  61: { description: 'Slight rain', icon: 'rain' },
  63: { description: 'Moderate rain', icon: 'rain' },
  65: { description: 'Heavy rain', icon: 'heavy-rain' },
  66: { description: 'Light freezing rain', icon: 'freezing-rain' },
  67: { description: 'Heavy freezing rain', icon: 'freezing-rain' },
  71: { description: 'Slight snow', icon: 'snow' },
  73: { description: 'Moderate snow', icon: 'snow' },
  75: { description: 'Heavy snow', icon: 'heavy-snow' },
  77: { description: 'Snow grains', icon: 'snow' },
  80: { description: 'Slight rain showers', icon: 'showers' },
  81: { description: 'Moderate rain showers', icon: 'showers' },
  82: { description: 'Violent rain showers', icon: 'heavy-showers' },
  85: { description: 'Slight snow showers', icon: 'snow-showers' },
  86: { description: 'Heavy snow showers', icon: 'heavy-snow-showers' },
  95: { description: 'Thunderstorm', icon: 'thunderstorm' },
  96: { description: 'Thunderstorm with slight hail', icon: 'thunderstorm-hail' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'thunderstorm-hail' },
};

// ============================================================================
// SYNC STATISTICS
// ============================================================================

export interface SyncStats {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
  noCoordinates: number;
}
