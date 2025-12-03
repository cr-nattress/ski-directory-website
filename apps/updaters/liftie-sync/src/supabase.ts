import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';
import type { Resort, ResortConditionsInsert } from './types.js';

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
 * Fetch all resorts from Supabase
 */
export async function fetchAllResorts(): Promise<Resort[]> {
  const client = getSupabaseClient();

  console.log('Fetching all resorts from Supabase...');

  const { data, error } = await client
    .from('resorts')
    .select('id, slug, name, country_code, state_slug, asset_path, is_active, is_lost')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch resorts: ${error.message}`);
  }

  console.log(`Fetched ${data?.length ?? 0} resorts from Supabase`);

  return (data ?? []) as Resort[];
}

/**
 * Upsert resort conditions
 */
export async function upsertConditions(
  conditions: ResortConditionsInsert
): Promise<void> {
  if (config.processing.dryRun) {
    console.log(`  [DRY RUN] Would upsert conditions for resort ${conditions.resort_id}`);
    return;
  }

  const client = getSupabaseClient();

  const { error } = await client
    .from('resort_conditions')
    .upsert(conditions, {
      onConflict: 'resort_id',
    });

  if (error) {
    throw new Error(`Failed to upsert conditions: ${error.message}`);
  }
}

/**
 * Delete conditions for a resort (if Liftie data no longer exists)
 */
export async function deleteConditions(resortId: string): Promise<void> {
  if (config.processing.dryRun) {
    console.log(`  [DRY RUN] Would delete conditions for resort ${resortId}`);
    return;
  }

  const client = getSupabaseClient();

  const { error } = await client
    .from('resort_conditions')
    .delete()
    .eq('resort_id', resortId);

  if (error) {
    throw new Error(`Failed to delete conditions: ${error.message}`);
  }
}

/**
 * Get existing conditions for comparison
 */
export async function getExistingConditions(
  resortId: string
): Promise<ResortConditionsInsert | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('resort_conditions')
    .select('*')
    .eq('resort_id', resortId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    throw new Error(`Failed to fetch existing conditions: ${error.message}`);
  }

  return data as ResortConditionsInsert | null;
}
