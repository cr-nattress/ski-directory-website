import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';
import type { Resort } from './types.js';

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
      description,
      stats,
      terrain,
      features
    `)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch resorts: ${error.message}`);
  }

  console.log(`Fetched ${data?.length ?? 0} resorts from Supabase`);

  return (data ?? []) as Resort[];
}

/**
 * Update a resort with enriched data
 */
export async function updateResort(
  resortId: string,
  updates: Partial<{
    tagline: string;
    description: string;
    stats: Record<string, unknown>;
    terrain: Record<string, unknown>;
    features: Record<string, unknown>;
    website_url: string;
    nearest_city: string;
  }>
): Promise<void> {
  if (config.processing.dryRun) {
    console.log(`  [DRY RUN] Would update resort ${resortId}`);
    return;
  }

  const client = getSupabaseClient();

  // Try update, if tagline column doesn't exist, retry without it
  let { error } = await client
    .from('resorts')
    .update(updates)
    .eq('id', resortId);

  if (error && error.message.includes('tagline') && 'tagline' in updates) {
    console.log('  Note: tagline column not found, updating without tagline');
    const { tagline, ...updatesWithoutTagline } = updates;
    const result = await client
      .from('resorts')
      .update(updatesWithoutTagline)
      .eq('id', resortId);
    error = result.error;
  }

  if (error) {
    throw new Error(`Failed to update resort: ${error.message}`);
  }
}

/**
 * Update resort stats (JSONB merge)
 */
export async function updateResortStats(
  resortId: string,
  stats: Record<string, unknown>
): Promise<void> {
  if (config.processing.dryRun) {
    console.log(`  [DRY RUN] Would update stats for ${resortId}`);
    return;
  }

  const client = getSupabaseClient();

  // Get current stats to merge
  const { data: current, error: fetchError } = await client
    .from('resorts')
    .select('stats')
    .eq('id', resortId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch current stats: ${fetchError.message}`);
  }

  const mergedStats = { ...(current?.stats || {}), ...stats };

  const { error } = await client
    .from('resorts')
    .update({ stats: mergedStats })
    .eq('id', resortId);

  if (error) {
    throw new Error(`Failed to update stats: ${error.message}`);
  }
}

/**
 * Update resort terrain (JSONB merge)
 */
export async function updateResortTerrain(
  resortId: string,
  terrain: Record<string, unknown>
): Promise<void> {
  if (config.processing.dryRun) {
    console.log(`  [DRY RUN] Would update terrain for ${resortId}`);
    return;
  }

  const client = getSupabaseClient();

  const { data: current, error: fetchError } = await client
    .from('resorts')
    .select('terrain')
    .eq('id', resortId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch current terrain: ${fetchError.message}`);
  }

  const mergedTerrain = { ...(current?.terrain || {}), ...terrain };

  const { error } = await client
    .from('resorts')
    .update({ terrain: mergedTerrain })
    .eq('id', resortId);

  if (error) {
    throw new Error(`Failed to update terrain: ${error.message}`);
  }
}

/**
 * Update resort features (JSONB merge)
 */
export async function updateResortFeatures(
  resortId: string,
  features: Record<string, unknown>
): Promise<void> {
  if (config.processing.dryRun) {
    console.log(`  [DRY RUN] Would update features for ${resortId}`);
    return;
  }

  const client = getSupabaseClient();

  const { data: current, error: fetchError } = await client
    .from('resorts')
    .select('features')
    .eq('id', resortId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch current features: ${fetchError.message}`);
  }

  const mergedFeatures = { ...(current?.features || {}), ...features };

  const { error } = await client
    .from('resorts')
    .update({ features: mergedFeatures })
    .eq('id', resortId);

  if (error) {
    throw new Error(`Failed to update features: ${error.message}`);
  }
}
