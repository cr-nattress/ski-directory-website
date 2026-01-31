/**
 * Open-Meteo API Client
 * 
 * Free weather API with no API key required.
 * Provides current conditions, hourly, and daily forecasts.
 * Supports elevation-based forecasts for mountain weather.
 * 
 * Docs: https://open-meteo.com/en/docs
 */

import { config } from './config.js';
import type { OpenMeteoResponse } from './types.js';

/**
 * Fetch weather data from Open-Meteo API
 * 
 * @param latitude Resort latitude
 * @param longitude Resort longitude
 * @param elevation Optional elevation override (meters)
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  elevation?: number
): Promise<OpenMeteoResponse | null> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    // Current weather
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'snowfall',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    // Hourly forecast (next 48 hours)
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'rain',
      'snowfall',
      'snow_depth',
      'weather_code',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
    ].join(','),
    // Daily forecast (7 days)
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'rain_sum',
      'snowfall_sum',
      'precipitation_hours',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    // Use imperial units (Fahrenheit, mph, inches)
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    // Timezone
    timezone: 'America/Denver',
    // Forecast days
    forecast_days: '7',
  });

  // Add elevation if provided (for more accurate mountain forecasts)
  if (elevation) {
    // Open-Meteo uses meters
    params.set('elevation', elevation.toString());
  }

  const url = `${config.openMeteo.baseUrl}?${params}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json() as OpenMeteoResponse;
    return data;
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}

/**
 * Calculate snowfall totals for next N hours
 */
export function calculateSnowfallTotal(
  hourly: OpenMeteoResponse['hourly'],
  hours: number
): number {
  if (!hourly?.snowfall) return 0;
  
  const sliced = hourly.snowfall.slice(0, hours);
  return sliced.reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Get weather description from WMO code
 */
export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Light freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Heavy showers',
    85: 'Light snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Heavy thunderstorm',
  };
  
  return descriptions[code] || 'Unknown';
}
