import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { Resort, DiningVenue, ResortDiningVenue, EnrichmentLogEntry } from '../types';
import { logger } from '../utils/logger';

export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    this.client = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }

  async getResortsToEnrich(options?: {
    slug?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }): Promise<Resort[]> {
    let query = this.client
      .from('resorts_map_pins')
      .select('id, name, slug, latitude, longitude, nearest_city, state_code')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (options?.slug) {
      query = query.eq('slug', options.slug);
    }

    if (options?.state) {
      query = query.ilike('state_code', options.state);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    query = query.order('name');

    const { data: viewData, error: viewError } = await query;

    if (viewError) {
      logger.error('Failed to fetch resorts from view', { error: viewError.message });
      throw viewError;
    }

    if (!viewData || viewData.length === 0) {
      return [];
    }

    // Get asset_path for these resorts from the resorts table
    const resortIds = (viewData as Array<{ id: string }>).map((r) => r.id);
    const { data: assetData, error: assetError } = await this.client
      .from('resorts')
      .select('id, asset_path')
      .in('id', resortIds);

    if (assetError) {
      logger.warn('Failed to fetch asset paths', { error: assetError.message });
    }

    // Create a map of id -> asset_path
    const assetMap = new Map<string, string | null>();
    if (assetData) {
      for (const row of assetData as Array<{ id: string; asset_path: string | null }>) {
        assetMap.set(row.id, row.asset_path);
      }
    }

    // Map view fields to Resort type
    return (viewData as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      latitude: row.latitude as number,
      longitude: row.longitude as number,
      nearest_city: (row.nearest_city as string) || '',
      state: (row.state_code as string) || '',
      state_name: (row.state_code as string) || '',
      asset_path: assetMap.get(row.id as string) || null,
    }));
  }

  async findExistingVenue(slug: string): Promise<DiningVenue | null> {
    const { data, error } = await this.client
      .from('dining_venues')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error finding venue', { error: error.message, slug });
    }

    return data;
  }

  async findVenueByNameAndCity(name: string, city: string, state: string): Promise<DiningVenue | null> {
    const { data, error } = await this.client
      .from('dining_venues')
      .select('*')
      .ilike('name', name)
      .ilike('city', city)
      .ilike('state', state)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error finding venue by name/city', { error: error.message, name, city });
    }

    return data;
  }

  async upsertDiningVenue(venue: Omit<DiningVenue, 'id'>): Promise<DiningVenue> {
    const { data, error } = await this.client
      .from('dining_venues')
      .upsert(
        {
          ...venue,
          updated_at: new Date().toISOString(),
          last_enriched_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (error) {
      logger.error('Failed to upsert dining venue', { error: error.message, venue: venue.name });
      throw error;
    }

    return data;
  }

  async linkResortToVenue(link: ResortDiningVenue): Promise<void> {
    const { error } = await this.client.from('resort_dining_venues').upsert(
      {
        ...link,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'resort_id,dining_venue_id' }
    );

    if (error) {
      logger.error('Failed to link resort to venue', { error: error.message, link });
      throw error;
    }
  }

  async checkExistingLink(resortId: string, venueId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('resort_dining_venues')
      .select('id')
      .eq('resort_id', resortId)
      .eq('dining_venue_id', venueId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error checking link', { error: error.message });
    }

    return !!data;
  }

  async logEnrichment(log: EnrichmentLogEntry): Promise<void> {
    const { error } = await this.client.from('dining_enrichment_logs').insert({
      resort_id: log.resort_id,
      resort_name: log.resort_name,
      search_radius_miles: log.search_radius_miles,
      search_lat: log.search_lat,
      search_lng: log.search_lng,
      venues_found: log.venues_found,
      venues_created: log.venues_created,
      venues_updated: log.venues_updated,
      venues_linked: log.venues_linked,
      status: log.status,
      error_message: log.error_message,
      model_used: log.model_used,
      prompt_tokens: log.prompt_tokens,
      completion_tokens: log.completion_tokens,
      total_cost: log.total_cost,
      raw_response: log.raw_response,
      started_at: log.started_at.toISOString(),
      completed_at: log.completed_at.toISOString(),
      duration_ms: log.duration_ms,
    });

    if (error) {
      logger.error('Failed to log enrichment', { error: error.message });
    }
  }

  async getEnrichmentStats(): Promise<{
    totalVenues: number;
    linkedVenues: number;
    resortsWithVenues: number;
    totalResorts: number;
  }> {
    const [venuesResult, linksResult, resortsWithVenuesResult, totalResortsResult] =
      await Promise.all([
        this.client.from('dining_venues').select('*', { count: 'exact', head: true }),
        this.client.from('resort_dining_venues').select('*', { count: 'exact', head: true }),
        this.client.from('resort_dining_venues').select('resort_id', { count: 'exact', head: true }),
        this.client
          .from('resorts')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
      ]);

    return {
      totalVenues: venuesResult.count || 0,
      linkedVenues: linksResult.count || 0,
      resortsWithVenues: resortsWithVenuesResult.count || 0,
      totalResorts: totalResortsResult.count || 0,
    };
  }
}
