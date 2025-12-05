# Story 34.5: Implement Ski Shop Upsert Logic

## Priority: High

## Phase: Core

## Context

Create the database operations to insert new ski shops or update existing ones, with proper deduplication based on slug.

## Requirements

1. Create Supabase service for ski shop operations
2. Implement upsert based on slug
3. Handle partial updates (don't overwrite manual edits)
4. Track created vs updated counts
5. Implement batch operations for efficiency

## Implementation

### src/services/supabase.ts

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { Resort, SkiShop, ResortSkiShop } from '../types';
import { logger } from '../utils/logger';

export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );
  }

  // =========================================================================
  // Resort Queries
  // =========================================================================

  async getResortsToEnrich(options?: {
    state?: string;
    slug?: string;
    limit?: number;
  }): Promise<Resort[]> {
    let query = this.client
      .from('resorts_full')
      .select('id, name, slug, lat, lng, nearest_city, state, state_name')
      .eq('is_active', true)
      .not('lat', 'is', null)
      .not('lng', 'is', null);

    if (options?.state) {
      query = query.eq('state', options.state.toLowerCase());
    }

    if (options?.slug) {
      query = query.eq('slug', options.slug);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch resorts', { error });
      throw error;
    }

    return data as Resort[];
  }

  // =========================================================================
  // Ski Shop Operations
  // =========================================================================

  async upsertSkiShop(shop: SkiShop): Promise<{ shop: SkiShop; isNew: boolean }> {
    // Check if shop exists by slug
    const { data: existing } = await this.client
      .from('ski_shops')
      .select('id, verified, source')
      .eq('slug', shop.slug)
      .single();

    if (existing) {
      // Don't overwrite if manually verified or from manual source
      if (existing.verified || existing.source === 'manual') {
        logger.info(`Skipping update for verified shop: ${shop.name}`);
        return { shop: { ...shop, id: existing.id }, isNew: false };
      }

      // Update existing
      const { data, error } = await this.client
        .from('ski_shops')
        .update({
          name: shop.name,
          description: shop.description,
          address_line1: shop.address_line1,
          city: shop.city,
          state: shop.state,
          postal_code: shop.postal_code,
          latitude: shop.latitude,
          longitude: shop.longitude,
          phone: shop.phone,
          website_url: shop.website_url,
          shop_type: shop.shop_type,
          services: shop.services,
          updated_at: new Date().toISOString(),
          last_enriched_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        logger.error(`Failed to update shop: ${shop.name}`, { error });
        throw error;
      }

      return { shop: data as SkiShop, isNew: false };
    } else {
      // Insert new
      const { data, error } = await this.client
        .from('ski_shops')
        .insert({
          ...shop,
          last_enriched_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        logger.error(`Failed to insert shop: ${shop.name}`, { error });
        throw error;
      }

      return { shop: data as SkiShop, isNew: true };
    }
  }

  async upsertSkiShopsBatch(shops: SkiShop[]): Promise<{
    created: number;
    updated: number;
    skipped: number;
  }> {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const shop of shops) {
      try {
        const result = await this.upsertSkiShop(shop);
        if (result.isNew) {
          created++;
        } else {
          updated++;
        }
      } catch (error) {
        logger.warn(`Skipped shop due to error: ${shop.name}`);
        skipped++;
      }
    }

    return { created, updated, skipped };
  }

  async getSkiShopBySlug(slug: string): Promise<SkiShop | null> {
    const { data, error } = await this.client
      .from('ski_shops')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error(`Failed to get shop by slug: ${slug}`, { error });
      throw error;
    }

    return data as SkiShop | null;
  }

  // =========================================================================
  // Resort-Shop Linking
  // =========================================================================

  async linkShopToResort(
    resortId: string,
    shopId: string,
    distanceMiles: number,
    isOnMountain: boolean = false
  ): Promise<void> {
    const { error } = await this.client
      .from('resort_ski_shops')
      .upsert(
        {
          resort_id: resortId,
          ski_shop_id: shopId,
          distance_miles: Math.round(distanceMiles * 100) / 100,
          is_on_mountain: isOnMountain || distanceMiles < 0.5,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'resort_id,ski_shop_id',
        }
      );

    if (error) {
      logger.error(`Failed to link shop ${shopId} to resort ${resortId}`, {
        error,
      });
      throw error;
    }
  }

  async getShopsForResort(resortId: string): Promise<SkiShop[]> {
    const { data, error } = await this.client
      .from('resort_ski_shops')
      .select(`
        distance_miles,
        is_on_mountain,
        ski_shops (*)
      `)
      .eq('resort_id', resortId)
      .order('distance_miles');

    if (error) {
      logger.error(`Failed to get shops for resort ${resortId}`, { error });
      throw error;
    }

    return data.map((row: any) => ({
      ...row.ski_shops,
      distance_miles: row.distance_miles,
      is_on_mountain: row.is_on_mountain,
    }));
  }

  // =========================================================================
  // Enrichment Logging
  // =========================================================================

  async logEnrichment(log: {
    resort_id: string;
    resort_name: string;
    search_radius_miles: number;
    search_lat: number;
    search_lng: number;
    status: string;
    shops_found: number;
    shops_created: number;
    shops_updated: number;
    shops_linked: number;
    error_message?: string;
    model_used: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_cost: number;
    raw_response: any;
    duration_ms: number;
  }): Promise<void> {
    const { error } = await this.client
      .from('ski_shop_enrichment_logs')
      .insert({
        ...log,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      logger.error('Failed to log enrichment', { error });
      // Don't throw - logging failure shouldn't stop enrichment
    }
  }
}
```

## Acceptance Criteria

- [ ] Upsert creates new shops with unique slugs
- [ ] Upsert updates existing shops by slug
- [ ] Verified/manual shops are not overwritten
- [ ] Batch operations handle individual failures
- [ ] Resort-shop links created with distance
- [ ] Enrichment logs stored for audit
- [ ] All errors logged with context

## Testing

1. Insert new shop and verify creation
2. Update existing shop and verify changes
3. Verify verified shops are skipped
4. Test batch insert with mix of new/existing
5. Test resort-shop linking
6. Verify enrichment logging

## Effort: Medium (2-3 hours)
