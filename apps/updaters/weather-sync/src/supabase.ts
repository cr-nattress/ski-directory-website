/**
 * Supabase client for Weather Sync
 */

import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
import type { Resort, ResortWeatherInsert } from './types.js';

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

/**
 * Fetch all active resorts with coordinates
 */
export async function fetchResortsWithCoordinates(): Promise<Resort[]> {
  const { data, error } = await supabase
    .from('resorts')
    .select('id, slug, name, latitude, longitude, base_elevation, summit_elevation, country_code, state_slug')
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch resorts: ${error.message}`);
  }

  return (data || []) as Resort[];
}

/**
 * Get existing weather data for a resort from resort_conditions table
 */
export async function getExistingWeather(resortId: string): Promise<ResortWeatherInsert | null> {
  const { data, error } = await supabase
    .from('resort_conditions')
    .select('*')
    .eq('resort_id', resortId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine
    throw new Error(`Failed to get existing weather: ${error.message}`);
  }

  return data as ResortWeatherInsert | null;
}

/**
 * Upsert weather data into resort_conditions table
 * This extends the existing conditions data with detailed weather
 */
export async function upsertWeather(weather: ResortWeatherInsert): Promise<void> {
  const { error } = await supabase
    .from('resort_conditions')
    .upsert(weather, { onConflict: 'resort_id' });

  if (error) {
    throw new Error(`Failed to upsert weather: ${error.message}`);
  }
}

/**
 * Batch upsert weather data
 */
export async function batchUpsertWeather(weatherData: ResortWeatherInsert[]): Promise<void> {
  if (weatherData.length === 0) return;

  const { error } = await supabase
    .from('resort_conditions')
    .upsert(weatherData, { onConflict: 'resort_id' });

  if (error) {
    throw new Error(`Failed to batch upsert weather: ${error.message}`);
  }
}
