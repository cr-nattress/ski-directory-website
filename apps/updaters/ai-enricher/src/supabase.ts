import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';
import type { Resort, AIEnrichmentResult, UpdateResult, UpdateOptions, ScoredValue } from './types.js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client instance
 */
function getSupabaseClient(): SupabaseClient {
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
      tagline,
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
 * Get a single resort by slug
 */
export async function getResortBySlug(slug: string): Promise<Resort | null> {
  const client = getSupabaseClient();

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
      tagline,
      stats,
      terrain,
      features
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch resort: ${error.message}`);
  }

  return data as Resort;
}

/**
 * Update resort with AI enrichment data
 */
export async function updateResortWithEnrichment(
  slug: string,
  enrichment: AIEnrichmentResult,
  options: UpdateOptions = {}
): Promise<UpdateResult> {
  const { dryRun = true, minConfidence = 0.7, skipExisting = false } = options;

  // Get current resort data
  const resort = await getResortBySlug(slug);
  if (!resort) {
    return { success: false, fieldsUpdated: [], fieldsSkipped: [], error: 'Resort not found' };
  }

  const fieldsUpdated: string[] = [];
  const fieldsSkipped: string[] = [];
  const updates: Record<string, unknown> = {};

  // Helper to check and add a field
  const addField = <T>(
    fieldName: string,
    scored: ScoredValue<T | null>,
    currentValue: T | null | undefined,
    targetObject?: Record<string, unknown>,
    targetKey?: string
  ) => {
    // Skip if value is null
    if (scored.value === null) {
      fieldsSkipped.push(`${fieldName} (no value)`);
      return;
    }

    // Skip if below confidence threshold
    if (scored.confidence < minConfidence) {
      fieldsSkipped.push(`${fieldName} (confidence: ${(scored.confidence * 100).toFixed(0)}%)`);
      return;
    }

    // Skip if existing value and skipExisting is true
    if (skipExisting && currentValue != null && currentValue !== '') {
      fieldsSkipped.push(`${fieldName} (existing value)`);
      return;
    }

    // Add to appropriate target
    if (targetObject && targetKey) {
      targetObject[targetKey] = scored.value;
    } else {
      updates[fieldName] = scored.value;
    }
    fieldsUpdated.push(fieldName);
  };

  // Content fields (top-level)
  addField('tagline', enrichment.content.tagline, resort.tagline);
  addField('description', enrichment.content.description, resort.description);

  // Stats (JSONB - merge with existing)
  const existingStats = resort.stats || {};
  const statsUpdates: Record<string, unknown> = {};

  addField('stats.skiableAcres', enrichment.stats.skiableAcres, existingStats.skiableAcres, statsUpdates, 'skiableAcres');
  addField('stats.liftsCount', enrichment.stats.liftsCount, existingStats.liftsCount, statsUpdates, 'liftsCount');
  addField('stats.runsCount', enrichment.stats.runsCount, existingStats.runsCount, statsUpdates, 'runsCount');
  addField('stats.verticalDrop', enrichment.stats.verticalDrop, existingStats.verticalDrop, statsUpdates, 'verticalDrop');
  addField('stats.baseElevation', enrichment.stats.baseElevation, existingStats.baseElevation, statsUpdates, 'baseElevation');
  addField('stats.summitElevation', enrichment.stats.summitElevation, existingStats.summitElevation, statsUpdates, 'summitElevation');
  addField('stats.avgAnnualSnowfall', enrichment.stats.avgAnnualSnowfall, existingStats.avgAnnualSnowfall, statsUpdates, 'avgAnnualSnowfall');

  if (Object.keys(statsUpdates).length > 0) {
    updates.stats = { ...existingStats, ...statsUpdates };
  }

  // Terrain (JSONB - merge with existing)
  const existingTerrain = resort.terrain || {};
  const terrainUpdates: Record<string, unknown> = {};

  addField('terrain.beginner', enrichment.terrain.beginner, existingTerrain.beginner, terrainUpdates, 'beginner');
  addField('terrain.intermediate', enrichment.terrain.intermediate, existingTerrain.intermediate, terrainUpdates, 'intermediate');
  addField('terrain.advanced', enrichment.terrain.advanced, existingTerrain.advanced, terrainUpdates, 'advanced');
  addField('terrain.expert', enrichment.terrain.expert, existingTerrain.expert, terrainUpdates, 'expert');

  if (Object.keys(terrainUpdates).length > 0) {
    updates.terrain = { ...existingTerrain, ...terrainUpdates };
  }

  // If no updates, return early
  if (Object.keys(updates).length === 0) {
    return { success: true, fieldsUpdated, fieldsSkipped };
  }

  // Dry run - just return what would be updated
  if (dryRun) {
    console.log('  [DRY RUN] Would update:', Object.keys(updates).join(', '));
    return { success: true, fieldsUpdated, fieldsSkipped };
  }

  // Apply updates
  const client = getSupabaseClient();

  // Try update, handle tagline column potentially not existing
  let { error } = await client
    .from('resorts')
    .update(updates)
    .eq('id', resort.id);

  if (error && error.message.includes('tagline') && 'tagline' in updates) {
    console.log('  Note: tagline column not found, updating without tagline');
    const { tagline, ...updatesWithoutTagline } = updates;
    const result = await client
      .from('resorts')
      .update(updatesWithoutTagline)
      .eq('id', resort.id);
    error = result.error;

    // Remove tagline from fieldsUpdated
    const taglineIndex = fieldsUpdated.indexOf('tagline');
    if (taglineIndex > -1) {
      fieldsUpdated.splice(taglineIndex, 1);
      fieldsSkipped.push('tagline (column not found)');
    }
  }

  if (error) {
    return {
      success: false,
      fieldsUpdated: [],
      fieldsSkipped,
      error: error.message,
    };
  }

  return { success: true, fieldsUpdated, fieldsSkipped };
}
