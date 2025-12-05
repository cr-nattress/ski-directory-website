import { EnrichmentConfig, config } from '../config';
import { Resort, EnrichmentResult, EnrichmentLogEntry, ResortSkiShop } from '../types';
import { SupabaseService } from '../services/supabase';
import { OpenAIService, OpenAIResponse } from '../services/openai';
import { GCSService, SkiShopsJsonData } from '../services/gcs';
import { calculateDistance, isOnMountain } from '../services/geocoding';
import { parseOpenAIResponse } from './response-parser';
import { Deduplicator } from './deduplicator';
import { RateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

interface EnrichmentSummary {
  totalResorts: number;
  successfulResorts: number;
  failedResorts: number;
  totalShopsFound: number;
  totalShopsCreated: number;
  totalShopsLinked: number;
  totalCost: number;
  totalDuration: number;
}

export class SkiShopEnricher {
  private supabase: SupabaseService;
  private openai: OpenAIService;
  private gcs: GCSService;
  private deduplicator: Deduplicator;
  private rateLimiter: RateLimiter;
  private config: EnrichmentConfig;
  private summary: EnrichmentSummary;

  constructor(enrichmentConfig?: Partial<EnrichmentConfig>) {
    this.supabase = new SupabaseService();
    this.openai = new OpenAIService();
    this.gcs = new GCSService();
    this.deduplicator = new Deduplicator(this.supabase);
    this.rateLimiter = new RateLimiter(config.enrichment.delayBetweenRequests);
    this.config = { ...config.enrichment, ...enrichmentConfig };
    this.summary = this.initSummary();
  }

  private initSummary(): EnrichmentSummary {
    return {
      totalResorts: 0,
      successfulResorts: 0,
      failedResorts: 0,
      totalShopsFound: 0,
      totalShopsCreated: 0,
      totalShopsLinked: 0,
      totalCost: 0,
      totalDuration: 0,
    };
  }

  async enrichResort(resort: Resort): Promise<EnrichmentResult> {
    const startTime = Date.now();
    logger.info(`Enriching ${resort.name}`, { state: resort.state_name });

    if (this.config.dryRun) {
      logger.info('[DRY RUN] Would enrich resort', { resort: resort.name });
      return {
        resort_id: resort.id,
        resort_name: resort.name,
        status: 'success',
        shops_found: 0,
        shops_created: 0,
        shops_updated: 0,
        shops_linked: 0,
        duration_ms: Date.now() - startTime,
      };
    }

    let openaiResponse: OpenAIResponse;

    try {
      // Call OpenAI
      await this.rateLimiter.wait();
      openaiResponse = await this.openai.getSkiShopsForResort(
        resort,
        this.config.searchRadiusMiles,
        this.config.maxShopsPerResort
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const result: EnrichmentResult = {
        resort_id: resort.id,
        resort_name: resort.name,
        status: 'failed',
        shops_found: 0,
        shops_created: 0,
        shops_updated: 0,
        shops_linked: 0,
        error: errorMsg,
        duration_ms: Date.now() - startTime,
      };

      await this.logEnrichment(resort, result, null);
      this.summary.failedResorts++;
      return result;
    }

    // Parse response
    const parseResult = parseOpenAIResponse({ shops: openaiResponse.shops });

    // Save to GCS first (before Supabase) for audit trail
    if (resort.asset_path) {
      const gcsData: SkiShopsJsonData = {
        version: '1.0',
        enriched_at: new Date().toISOString(),
        model: this.config.openaiModel,
        resort: {
          id: resort.id,
          name: resort.name,
          slug: resort.slug,
          asset_path: resort.asset_path,
        },
        search: {
          radius_miles: this.config.searchRadiusMiles,
          latitude: resort.latitude,
          longitude: resort.longitude,
        },
        statistics: {
          shops_found: openaiResponse.shops.length,
          shops_valid: parseResult.validShops.length,
          prompt_tokens: openaiResponse.promptTokens,
          completion_tokens: openaiResponse.completionTokens,
          total_cost: openaiResponse.totalCost,
        },
        raw_response: openaiResponse.rawResponse,
        shops: parseResult.validShops.map((shop) => ({
          name: shop.name,
          slug: shop.slug,
          description: shop.description,
          address: shop.address_line1,
          city: shop.city,
          state: shop.state,
          postal_code: shop.postal_code,
          latitude: shop.latitude,
          longitude: shop.longitude,
          phone: shop.phone,
          website_url: shop.website_url,
          shop_type: shop.shop_type,
          services: shop.services,
          distance_miles: calculateDistance(resort.latitude, resort.longitude, shop.latitude, shop.longitude),
          is_on_mountain: isOnMountain(
            calculateDistance(resort.latitude, resort.longitude, shop.latitude, shop.longitude)
          ),
        })),
      };

      try {
        await this.gcs.saveSkiShopsJson(resort.asset_path, gcsData, this.config.dryRun);
      } catch (error) {
        logger.warn('Failed to save to GCS, continuing with Supabase', {
          resort: resort.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      logger.warn('Resort has no asset_path, skipping GCS save', { resort: resort.name });
    }

    if (parseResult.validShops.length === 0) {
      const result: EnrichmentResult = {
        resort_id: resort.id,
        resort_name: resort.name,
        status: 'no_results',
        shops_found: openaiResponse.shops.length,
        shops_created: 0,
        shops_updated: 0,
        shops_linked: 0,
        duration_ms: Date.now() - startTime,
        total_cost: openaiResponse.totalCost,
      };

      await this.logEnrichment(resort, result, openaiResponse);
      return result;
    }

    // Process each shop
    let shopsCreated = 0;
    let shopsUpdated = 0;
    let shopsLinked = 0;

    this.deduplicator.resetBatch();

    for (const shop of parseResult.validShops) {
      try {
        // Check for duplicates
        const dedupResult = await this.deduplicator.checkShop(shop);

        // Upsert shop
        const savedShop = await this.supabase.upsertSkiShop(dedupResult.shop);

        if (dedupResult.isNew) {
          shopsCreated++;
          logger.debug('Created new shop', { name: shop.name, id: savedShop.id });
        } else {
          shopsUpdated++;
          logger.debug('Updated existing shop', { name: shop.name, id: savedShop.id });
        }

        // Calculate distance and link to resort
        const distance = calculateDistance(
          resort.latitude,
          resort.longitude,
          shop.latitude,
          shop.longitude
        );

        // Skip if too far (in case OpenAI returned shops outside radius)
        if (distance > this.config.searchRadiusMiles * 1.5) {
          logger.warn('Shop too far from resort, skipping link', {
            shop: shop.name,
            distance: distance.toFixed(1),
          });
          continue;
        }

        const link: ResortSkiShop = {
          resort_id: resort.id,
          ski_shop_id: savedShop.id!,
          distance_miles: Math.round(distance * 100) / 100,
          is_on_mountain: isOnMountain(distance),
          is_preferred: false,
        };

        await this.supabase.linkResortToShop(link);
        shopsLinked++;
      } catch (error) {
        logger.error('Failed to process shop', {
          shop: shop.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const result: EnrichmentResult = {
      resort_id: resort.id,
      resort_name: resort.name,
      status: shopsLinked > 0 ? 'success' : 'partial',
      shops_found: parseResult.validShops.length,
      shops_created: shopsCreated,
      shops_updated: shopsUpdated,
      shops_linked: shopsLinked,
      duration_ms: Date.now() - startTime,
      total_cost: openaiResponse.totalCost,
    };

    await this.logEnrichment(resort, result, openaiResponse);

    // Update summary
    this.summary.totalResorts++;
    this.summary.successfulResorts++;
    this.summary.totalShopsFound += parseResult.validShops.length;
    this.summary.totalShopsCreated += shopsCreated;
    this.summary.totalShopsLinked += shopsLinked;
    this.summary.totalCost += openaiResponse.totalCost;
    this.summary.totalDuration += result.duration_ms;

    logger.info(`Completed ${resort.name}`, {
      found: parseResult.validShops.length,
      created: shopsCreated,
      linked: shopsLinked,
      cost: `$${openaiResponse.totalCost.toFixed(4)}`,
    });

    return result;
  }

  private async logEnrichment(
    resort: Resort,
    result: EnrichmentResult,
    openaiResponse: OpenAIResponse | null
  ): Promise<void> {
    const log: EnrichmentLogEntry = {
      resort_id: resort.id,
      resort_name: resort.name,
      search_radius_miles: this.config.searchRadiusMiles,
      search_lat: resort.latitude,
      search_lng: resort.longitude,
      shops_found: result.shops_found,
      shops_created: result.shops_created,
      shops_updated: result.shops_updated,
      shops_linked: result.shops_linked,
      status: result.status,
      error_message: result.error,
      model_used: this.config.openaiModel,
      prompt_tokens: openaiResponse?.promptTokens || 0,
      completion_tokens: openaiResponse?.completionTokens || 0,
      total_cost: openaiResponse?.totalCost || 0,
      raw_response: openaiResponse?.rawResponse || null,
      started_at: new Date(Date.now() - result.duration_ms),
      completed_at: new Date(),
      duration_ms: result.duration_ms,
    };

    await this.supabase.logEnrichment(log);
  }

  async enrichAll(options?: { limit?: number }): Promise<void> {
    const resorts = await this.supabase.getResortsToEnrich({ limit: options?.limit });
    this.summary = this.initSummary();

    logger.info(`Starting enrichment for ${resorts.length} resorts`);

    for (let i = 0; i < resorts.length; i++) {
      const resort = resorts[i];
      logger.progress(i + 1, resorts.length, resort.name);
      await this.enrichResort(resort);
    }

    logger.progressEnd();
    this.printSummary();
  }

  async enrichResortBySlug(slug: string): Promise<void> {
    const resorts = await this.supabase.getResortsToEnrich({ slug });
    this.summary = this.initSummary();

    if (resorts.length === 0) {
      logger.error(`Resort not found: ${slug}`);
      return;
    }

    await this.enrichResort(resorts[0]);
    this.printSummary();
  }

  async enrichState(state: string, options?: { limit?: number }): Promise<void> {
    const resorts = await this.supabase.getResortsToEnrich({
      state,
      limit: options?.limit,
    });
    this.summary = this.initSummary();

    if (resorts.length === 0) {
      logger.error(`No resorts found in state: ${state.toUpperCase()}`);
      return;
    }

    logger.info(`Starting enrichment for ${resorts.length} resorts in ${state.toUpperCase()}`);

    for (let i = 0; i < resorts.length; i++) {
      const resort = resorts[i];
      logger.progress(i + 1, resorts.length, resort.name);
      await this.enrichResort(resort);
    }

    logger.progressEnd();
    this.printSummary();
  }

  async showStatus(): Promise<void> {
    const stats = await this.supabase.getEnrichmentStats();

    console.log('\n' + '='.repeat(50));
    console.log('ENRICHMENT STATUS');
    console.log('='.repeat(50));
    console.log(`Total Ski Shops:       ${stats.totalShops}`);
    console.log(`Resort-Shop Links:     ${stats.linkedShops}`);
    console.log(`Resorts with Shops:    ${stats.resortsWithShops}`);
    console.log(`Total Active Resorts:  ${stats.totalResorts}`);
    console.log('='.repeat(50));
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('ENRICHMENT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Resorts Processed:     ${this.summary.totalResorts}`);
    console.log(`Successful:            ${this.summary.successfulResorts}`);
    console.log(`Failed:                ${this.summary.failedResorts}`);
    console.log('-'.repeat(50));
    console.log(`Shops Found:           ${this.summary.totalShopsFound}`);
    console.log(`Shops Created:         ${this.summary.totalShopsCreated}`);
    console.log(`Shops Linked:          ${this.summary.totalShopsLinked}`);
    console.log('-'.repeat(50));
    console.log(`Total Cost:            $${this.summary.totalCost.toFixed(4)}`);
    console.log(`Total Duration:        ${(this.summary.totalDuration / 1000).toFixed(1)}s`);
    console.log('='.repeat(50));
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
