/**
 * @module AdminResortService
 * @purpose Admin CRUD operations for resorts
 * @context Uses service role key for write operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Resort } from '@/lib/types';
import type { ResortStats, ResortTerrain, ResortFeatures, Database } from '@/types/supabase';
import { adaptResortFromSupabase } from './supabase-resort-adapter';
import { createLogger } from '@/lib/hooks/useLogger';

const log = createLogger('AdminResortService');

// Type for the admin client - using 'any' for schema to avoid complex generic issues
type AdminClient = SupabaseClient<Database>;

/**
 * Create admin Supabase client with service role key
 */
function getAdminClient(): AdminClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase admin configuration');
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Input type for creating a resort
 */
export interface CreateResortInput {
  slug: string;
  name: string;
  countryCode: string;
  stateSlug: string;
  status?: 'active' | 'defunct';
  latitude?: number;
  longitude?: number;
  nearestCity?: string;
  websiteUrl?: string;
  description?: string;
  stats?: ResortStats;
  terrain?: ResortTerrain;
  features?: ResortFeatures;
  passAffiliations?: string[];
  tags?: string[];
}

/**
 * Input type for updating a resort
 */
export interface UpdateResortInput extends Partial<CreateResortInput> {}

/**
 * Result type for admin operations
 */
export interface AdminResult<T> {
  data: T | null;
  error: string | null;
}

class AdminResortService {
  /**
   * Create a new resort
   */
  async createResort(input: CreateResortInput): Promise<AdminResult<Resort>> {
    log.info('Creating resort', { slug: input.slug });
    const supabase = getAdminClient();

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('resorts')
      .select('id')
      .eq('slug', input.slug)
      .single() as { data: { id: string } | null; error: unknown };

    if (existing) {
      return {
        data: null,
        error: `Resort with slug "${input.slug}" already exists`,
      };
    }

    // Validate state exists
    const { data: state } = await supabase
      .from('states')
      .select('slug')
      .eq('slug', input.stateSlug)
      .single() as { data: { slug: string } | null; error: unknown };

    if (!state) {
      return {
        data: null,
        error: `State "${input.stateSlug}" does not exist`,
      };
    }

    // Generate resort ID
    const resortId = `resort:${input.slug}`;

    // Build asset path
    const assetPath = `${input.countryCode}/${input.stateSlug}/${input.slug}`;

    // Insert resort - use type assertion to bypass generic inference issues
    const insertData = {
      id: resortId,
      slug: input.slug,
      name: input.name,
      country_code: input.countryCode,
      state_slug: input.stateSlug,
      status: input.status || 'active',
      nearest_city: input.nearestCity || null,
      website_url: input.websiteUrl || null,
      description: input.description || null,
      stats: input.stats,
      terrain: input.terrain,
      features: input.features,
      asset_path: assetPath,
    };

    // @ts-expect-error - Supabase generic type inference doesn't resolve properly in some build environments
    const { error: insertError } = await supabase.from('resorts').insert(insertData);

    if (insertError) {
      log.error('Failed to create resort', { error: insertError.message });
      return {
        data: null,
        error: insertError.message,
      };
    }

    // Add pass affiliations if provided
    if (input.passAffiliations?.length) {
      const passData = input.passAffiliations.map((passSlug) => ({
        resort_id: resortId,
        pass_slug: passSlug,
      }));
      // @ts-expect-error - Supabase generic type inference issue
      await supabase.from('resort_passes').insert(passData);
    }

    // Add tags if provided
    if (input.tags?.length) {
      const tagData = input.tags.map((tag) => ({
        resort_id: resortId,
        tag,
      }));
      // @ts-expect-error - Supabase generic type inference issue
      await supabase.from('resort_tags').insert(tagData);
    }

    // Fetch the created resort
    return this.getResortById(resortId);
  }

  /**
   * Update an existing resort
   */
  async updateResort(id: string, input: UpdateResortInput): Promise<AdminResult<Resort>> {
    log.info('Updating resort', { id });
    const supabase = getAdminClient();

    // Check resort exists
    const { data: existing } = await supabase
      .from('resorts')
      .select('id, slug')
      .eq('id', id)
      .single() as { data: { id: string; slug: string } | null; error: unknown };

    if (!existing) {
      return {
        data: null,
        error: `Resort with ID "${id}" not found`,
      };
    }

    // Check for slug conflict if changing slug
    if (input.slug && input.slug !== existing.slug) {
      const { data: slugConflict } = await supabase
        .from('resorts')
        .select('id')
        .eq('slug', input.slug)
        .neq('id', id)
        .single() as { data: { id: string } | null; error: unknown };

      if (slugConflict) {
        return {
          data: null,
          error: `Resort with slug "${input.slug}" already exists`,
        };
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.countryCode !== undefined) updateData.country_code = input.countryCode;
    if (input.stateSlug !== undefined) updateData.state_slug = input.stateSlug;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.nearestCity !== undefined) updateData.nearest_city = input.nearestCity;
    if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.stats !== undefined) updateData.stats = input.stats;
    if (input.terrain !== undefined) updateData.terrain = input.terrain;
    if (input.features !== undefined) updateData.features = input.features;

    // @ts-expect-error - Supabase generic type inference issue
    const { error: updateError } = await supabase
      .from('resorts')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      log.error('Failed to update resort', { error: updateError.message });
      return {
        data: null,
        error: updateError.message,
      };
    }

    // Update pass affiliations if provided
    if (input.passAffiliations !== undefined) {
      await supabase.from('resort_passes').delete().eq('resort_id', id);

      if (input.passAffiliations.length > 0) {
        const passData = input.passAffiliations.map((passSlug) => ({
          resort_id: id,
          pass_slug: passSlug,
        }));
        // @ts-expect-error - Supabase generic type inference issue
        await supabase.from('resort_passes').insert(passData);
      }
    }

    // Update tags if provided
    if (input.tags !== undefined) {
      await supabase.from('resort_tags').delete().eq('resort_id', id);

      if (input.tags.length > 0) {
        const tagData = input.tags.map((tag) => ({
          resort_id: id,
          tag,
        }));
        // @ts-expect-error - Supabase generic type inference issue
        await supabase.from('resort_tags').insert(tagData);
      }
    }

    return this.getResortById(id);
  }

  /**
   * Delete a resort (soft delete by default)
   */
  async deleteResort(id: string, hard: boolean = false): Promise<AdminResult<void>> {
    log.info('Deleting resort', { id, hard });
    const supabase = getAdminClient();

    // Check resort exists
    const { data: existing } = await supabase
      .from('resorts')
      .select('id')
      .eq('id', id)
      .single() as { data: { id: string } | null; error: unknown };

    if (!existing) {
      return {
        data: null,
        error: `Resort with ID "${id}" not found`,
      };
    }

    if (hard) {
      // Hard delete - remove from database
      const { error } = await supabase.from('resorts').delete().eq('id', id);

      if (error) {
        log.error('Failed to hard delete resort', { error: error.message });
        return { data: null, error: error.message };
      }
    } else {
      // Soft delete - set status to defunct
      const softDeleteData = {
        status: 'defunct' as const,
        updated_at: new Date().toISOString(),
      };

      // @ts-expect-error - Supabase generic type inference issue
      const { error } = await supabase
        .from('resorts')
        .update(softDeleteData)
        .eq('id', id);

      if (error) {
        log.error('Failed to soft delete resort', { error: error.message });
        return { data: null, error: error.message };
      }
    }

    return { data: undefined, error: null };
  }

  /**
   * Get resort by ID
   */
  async getResortById(id: string): Promise<AdminResult<Resort>> {
    const supabase = getAdminClient();

    // @ts-expect-error - Supabase generic type inference issue
    const { data, error } = await supabase
      .from('resorts_full')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return {
        data: null,
        error: error.message,
      };
    }

    return {
      data: adaptResortFromSupabase(data),
      error: null,
    };
  }

  /**
   * Update resort conditions
   */
  async updateConditions(
    resortId: string,
    conditions: {
      liftsOpen?: number;
      liftsTotal?: number;
      weatherCondition?: string;
      weatherHigh?: number;
    }
  ): Promise<AdminResult<void>> {
    log.info('Updating conditions', { resortId });
    const supabase = getAdminClient();

    // Verify resort exists
    const { data: resort } = await supabase
      .from('resorts')
      .select('id')
      .eq('id', resortId)
      .single() as { data: { id: string } | null; error: unknown };

    if (!resort) {
      return {
        data: null,
        error: `Resort with ID "${resortId}" not found`,
      };
    }

    const conditionsData = {
      resort_id: resortId,
      lifts_open: conditions.liftsOpen ?? 0,
      lifts_total: conditions.liftsTotal ?? 0,
      lifts_percentage:
        conditions.liftsTotal && conditions.liftsTotal > 0
          ? Math.round((conditions.liftsOpen ?? 0) / conditions.liftsTotal * 100)
          : 0,
      weather_condition: conditions.weatherCondition ?? null,
      weather_high: conditions.weatherHigh ?? null,
      updated_at: new Date().toISOString(),
    };

    // @ts-expect-error - Supabase generic type inference issue
    const { error } = await supabase
      .from('resort_conditions')
      .upsert(conditionsData, { onConflict: 'resort_id' });

    if (error) {
      log.error('Failed to update conditions', { error: error.message });
      return { data: null, error: error.message };
    }

    return { data: undefined, error: null };
  }
}

// Export singleton instance
export const adminResortService = new AdminResortService();
