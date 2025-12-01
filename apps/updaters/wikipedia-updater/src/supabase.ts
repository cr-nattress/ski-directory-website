import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

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
}

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return supabaseClient;
}

/**
 * Fetch all ski resorts from Supabase
 */
export async function fetchAllResorts(): Promise<Resort[]> {
  const client = getSupabaseClient();

  console.log('Fetching all resorts from Supabase...');

  const { data, error } = await client
    .from('resorts_full')
    .select(`
      id,
      slug,
      name,
      state,
      state_name,
      country,
      country_name,
      asset_path,
      nearest_city,
      lat,
      lng,
      is_active,
      is_lost,
      website_url,
      description
    `)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch resorts: ${error.message}`);
  }

  console.log(`Fetched ${data?.length ?? 0} resorts from Supabase`);

  return (data ?? []) as Resort[];
}

/**
 * Fetch active resorts only (excludes lost ski areas)
 */
export async function fetchActiveResorts(): Promise<Resort[]> {
  const allResorts = await fetchAllResorts();
  return allResorts.filter(r => r.is_active && !r.is_lost);
}
