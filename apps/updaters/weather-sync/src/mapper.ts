/**
 * Mapper functions for Weather Sync
 * Converts Open-Meteo API response to our database format
 */

import type { 
  OpenMeteoResponse, 
  Resort, 
  ResortWeatherInsert,
  DailyForecast,
  HourlyForecast 
} from './types.js';
import { calculateSnowfallTotal } from './open-meteo.js';

/**
 * Map Open-Meteo response to database format
 */
export function mapOpenMeteoToWeather(
  resort: Resort,
  data: OpenMeteoResponse
): ResortWeatherInsert {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  // Build daily forecast array
  const dailyForecast: DailyForecast[] = [];
  if (daily) {
    for (let i = 0; i < daily.time.length; i++) {
      dailyForecast.push({
        date: daily.time[i],
        high: daily.temperature_2m_max[i],
        low: daily.temperature_2m_min[i],
        weather_code: daily.weather_code[i],
        precip_chance: daily.precipitation_probability_max[i] || 0,
        snowfall: daily.snowfall_sum[i] || 0,
        wind_speed_max: daily.wind_speed_10m_max[i] || 0,
      });
    }
  }

  // Build hourly forecast array (next 24 hours)
  const hourlyForecast: HourlyForecast[] = [];
  if (hourly) {
    for (let i = 0; i < Math.min(24, hourly.time.length); i++) {
      hourlyForecast.push({
        time: hourly.time[i],
        temp: hourly.temperature_2m[i],
        feels_like: hourly.apparent_temperature[i],
        weather_code: hourly.weather_code[i],
        precip_chance: hourly.precipitation_probability[i] || 0,
        snowfall: hourly.snowfall[i] || 0,
        wind_speed: hourly.wind_speed_10m[i] || 0,
        wind_gust: hourly.wind_gusts_10m[i] || 0,
      });
    }
  }

  return {
    resort_id: resort.id,
    // Current conditions
    current_temp: current?.temperature_2m ?? null,
    current_feels_like: current?.apparent_temperature ?? null,
    current_humidity: current?.relative_humidity_2m ?? null,
    current_wind_speed: current?.wind_speed_10m ?? null,
    current_wind_gust: current?.wind_gusts_10m ?? null,
    current_wind_direction: current?.wind_direction_10m ?? null,
    current_precipitation: current?.precipitation ?? null,
    current_snowfall: current?.snowfall ?? null,
    current_weather_code: current?.weather_code ?? null,
    current_visibility: hourly?.visibility?.[0] ?? null,
    is_day: (current?.is_day ?? 1) === 1,
    // Today's forecast
    today_high: daily?.temperature_2m_max?.[0] ?? null,
    today_low: daily?.temperature_2m_min?.[0] ?? null,
    today_precip_chance: daily?.precipitation_probability_max?.[0] ?? null,
    today_snowfall: daily?.snowfall_sum?.[0] ?? null,
    today_weather_code: daily?.weather_code?.[0] ?? null,
    sunrise: daily?.sunrise?.[0] ?? null,
    sunset: daily?.sunset?.[0] ?? null,
    uv_index: daily?.uv_index_max?.[0] ?? null,
    // Snowfall predictions
    snow_next_24h: calculateSnowfallTotal(hourly, 24),
    snow_next_48h: calculateSnowfallTotal(hourly, 48),
    snow_next_72h: calculateSnowfallTotal(data.hourly, 72),
    // Forecast arrays
    daily_forecast: dailyForecast,
    hourly_forecast: hourlyForecast,
    // Metadata
    elevation_used: data.elevation,
    weather_fetched_at: new Date().toISOString(),
    weather_source: 'open-meteo',
    has_weather: true,
  };
}

/**
 * Format weather summary for logging
 */
export function formatWeatherSummary(weather: ResortWeatherInsert): string {
  const parts = [];
  
  if (weather.current_temp !== null) {
    parts.push(`${Math.round(weather.current_temp)}°F`);
  }
  
  if (weather.snow_next_24h && weather.snow_next_24h > 0) {
    parts.push(`🌨️ ${weather.snow_next_24h.toFixed(1)}" next 24h`);
  }
  
  if (weather.current_wind_speed !== null) {
    parts.push(`💨 ${Math.round(weather.current_wind_speed)} mph`);
  }
  
  return parts.join(' | ') || 'No data';
}

/**
 * Check if weather data has meaningfully changed
 */
export function hasWeatherChanged(
  existing: ResortWeatherInsert | null,
  updated: ResortWeatherInsert
): boolean {
  if (!existing) return true;

  // Check key fields for significant changes
  const tempDiff = Math.abs((existing.current_temp ?? 0) - (updated.current_temp ?? 0));
  const snowDiff = Math.abs((existing.snow_next_24h ?? 0) - (updated.snow_next_24h ?? 0));
  const windDiff = Math.abs((existing.current_wind_speed ?? 0) - (updated.current_wind_speed ?? 0));

  // Update if temp changed by 2°F, snow by 0.5", or wind by 5 mph
  return tempDiff >= 2 || snowDiff >= 0.5 || windDiff >= 5;
}
