import { EnrichmentConfig, config } from '../config';
import { Resort, EnrichmentResult, EnrichmentLogEntry, ResortDiningVenue } from '../types';
import { SupabaseService } from '../services/supabase';
import { OpenAIService, OpenAIResponse } from '../services/openai';
import { GCSService, DiningVenuesJsonData } from '../services/gcs';
import { calculateDistance, isOnMountain, estimateDriveTime } from '../services/geocoding';
import { parseOpenAIResponse } from './response-parser';
import { Deduplicator } from './deduplicator';
import { RateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

interface EnrichmentSummary {
  totalResorts: number;
  successfulResorts: number;
  failedResorts: number;
  totalVenuesFound: number;
  totalVenuesCreated: number;
  totalVenuesLinked: number;
  totalCost: number;
  totalDuration: number;
}

export class DiningEnricher {
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
      totalVenuesFound: 0,
      totalVenuesCreated: 0,
      totalVenuesLinked: 0,
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
        venues_found: 0,
        venues_created: 0,
        venues_updated: 0,
        venues_linked: 0,
        duration_ms: Date.now() - startTime,
      };
    }

    let openaiResponse: OpenAIResponse;

    try {
      // Call OpenAI
      await this.rateLimiter.wait();
      openaiResponse = await this.openai.getDiningVenuesForResort(
        resort,
        this.config.searchRadiusMiles,
        this.config.maxVenuesPerResort
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const result: EnrichmentResult = {
        resort_id: resort.id,
        resort_name: resort.name,
        status: 'failed',
        venues_found: 0,
        venues_created: 0,
        venues_updated: 0,
        venues_linked: 0,
        error: errorMsg,
        duration_ms: Date.now() - startTime,
      };

      await this.logEnrichment(resort, result, null);
      this.summary.failedResorts++;
      return result;
    }

    // Parse response
    const parseResult = parseOpenAIResponse({ venues: openaiResponse.venues });

    // Save to GCS first (before Supabase) for audit trail
    if (resort.asset_path) {
      const gcsData: DiningVenuesJsonData = {
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
          venues_found: openaiResponse.venues.length,
          venues_valid: parseResult.validVenues.length,
          prompt_tokens: openaiResponse.promptTokens,
          completion_tokens: openaiResponse.completionTokens,
          total_cost: openaiResponse.totalCost,
        },
        raw_response: openaiResponse.rawResponse,
        venues: parseResult.validVenues.map((venue) => ({
          name: venue.name,
          slug: venue.slug,
          description: venue.description,
          address: venue.address_line1,
          city: venue.city,
          state: venue.state,
          postal_code: venue.postal_code,
          latitude: venue.latitude,
          longitude: venue.longitude,
          phone: venue.phone,
          website_url: venue.website_url,
          venue_type: venue.venue_type,
          cuisine_type: venue.cuisine_type,
          price_range: venue.price_range,
          serves_breakfast: venue.serves_breakfast,
          serves_lunch: venue.serves_lunch,
          serves_dinner: venue.serves_dinner,
          serves_drinks: venue.serves_drinks,
          has_full_bar: venue.has_full_bar,
          ambiance: venue.ambiance,
          features: venue.features,
          is_on_mountain: venue.is_on_mountain,
          mountain_location: venue.mountain_location,
          is_ski_in_ski_out: venue.is_ski_in_ski_out,
          hours_notes: venue.hours_notes,
          distance_miles: calculateDistance(resort.latitude, resort.longitude, venue.latitude, venue.longitude),
        })),
      };

      try {
        await this.gcs.saveDiningVenuesJson(resort.asset_path, gcsData, this.config.dryRun);
      } catch (error) {
        logger.warn('Failed to save to GCS, continuing with Supabase', {
          resort: resort.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      logger.warn('Resort has no asset_path, skipping GCS save', { resort: resort.name });
    }

    if (parseResult.validVenues.length === 0) {
      const result: EnrichmentResult = {
        resort_id: resort.id,
        resort_name: resort.name,
        status: 'no_results',
        venues_found: openaiResponse.venues.length,
        venues_created: 0,
        venues_updated: 0,
        venues_linked: 0,
        duration_ms: Date.now() - startTime,
        total_cost: openaiResponse.totalCost,
      };

      await this.logEnrichment(resort, result, openaiResponse);
      return result;
    }

    // Process each venue
    let venuesCreated = 0;
    let venuesUpdated = 0;
    let venuesLinked = 0;

    this.deduplicator.resetBatch();

    for (const venue of parseResult.validVenues) {
      try {
        // Check for duplicates
        const dedupResult = await this.deduplicator.checkVenue(venue);

        // Upsert venue
        const savedVenue = await this.supabase.upsertDiningVenue(dedupResult.venue);

        if (dedupResult.isNew) {
          venuesCreated++;
          logger.debug('Created new venue', { name: venue.name, id: savedVenue.id });
        } else {
          venuesUpdated++;
          logger.debug('Updated existing venue', { name: venue.name, id: savedVenue.id });
        }

        // Calculate distance and link to resort
        const distance = calculateDistance(
          resort.latitude,
          resort.longitude,
          venue.latitude,
          venue.longitude
        );

        // Skip if too far (in case OpenAI returned venues outside radius)
        if (distance > this.config.searchRadiusMiles * 1.5) {
          logger.warn('Venue too far from resort, skipping link', {
            venue: venue.name,
            distance: distance.toFixed(1),
          });
          continue;
        }

        const link: ResortDiningVenue = {
          resort_id: resort.id,
          dining_venue_id: savedVenue.id!,
          distance_miles: Math.round(distance * 100) / 100,
          drive_time_minutes: estimateDriveTime(distance),
          is_on_mountain: isOnMountain(distance) || venue.is_on_mountain,
          is_preferred: false,
        };

        await this.supabase.linkResortToVenue(link);
        venuesLinked++;
      } catch (error) {
        logger.error('Failed to process venue', {
          venue: venue.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const result: EnrichmentResult = {
      resort_id: resort.id,
      resort_name: resort.name,
      status: venuesLinked > 0 ? 'success' : 'partial',
      venues_found: parseResult.validVenues.length,
      venues_created: venuesCreated,
      venues_updated: venuesUpdated,
      venues_linked: venuesLinked,
      duration_ms: Date.now() - startTime,
      total_cost: openaiResponse.totalCost,
    };

    await this.logEnrichment(resort, result, openaiResponse);

    // Update summary
    this.summary.totalResorts++;
    this.summary.successfulResorts++;
    this.summary.totalVenuesFound += parseResult.validVenues.length;
    this.summary.totalVenuesCreated += venuesCreated;
    this.summary.totalVenuesLinked += venuesLinked;
    this.summary.totalCost += openaiResponse.totalCost;
    this.summary.totalDuration += result.duration_ms;

    logger.info(`Completed ${resort.name}`, {
      found: parseResult.validVenues.length,
      created: venuesCreated,
      linked: venuesLinked,
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
      venues_found: result.venues_found,
      venues_created: result.venues_created,
      venues_updated: result.venues_updated,
      venues_linked: result.venues_linked,
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
    console.log('DINING ENRICHMENT STATUS');
    console.log('='.repeat(50));
    console.log(`Total Dining Venues:   ${stats.totalVenues}`);
    console.log(`Resort-Venue Links:    ${stats.linkedVenues}`);
    console.log(`Resorts with Venues:   ${stats.resortsWithVenues}`);
    console.log(`Total Active Resorts:  ${stats.totalResorts}`);
    console.log('='.repeat(50));
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('DINING ENRICHMENT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Resorts Processed:     ${this.summary.totalResorts}`);
    console.log(`Successful:            ${this.summary.successfulResorts}`);
    console.log(`Failed:                ${this.summary.failedResorts}`);
    console.log('-'.repeat(50));
    console.log(`Venues Found:          ${this.summary.totalVenuesFound}`);
    console.log(`Venues Created:        ${this.summary.totalVenuesCreated}`);
    console.log(`Venues Linked:         ${this.summary.totalVenuesLinked}`);
    console.log('-'.repeat(50));
    console.log(`Total Cost:            $${this.summary.totalCost.toFixed(4)}`);
    console.log(`Total Duration:        ${(this.summary.totalDuration / 1000).toFixed(1)}s`);
    console.log('='.repeat(50));
  }
}
