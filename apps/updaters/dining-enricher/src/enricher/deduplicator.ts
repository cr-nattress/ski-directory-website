import { DiningVenue } from '../types';
import { SupabaseService } from '../services/supabase';
import { logger } from '../utils/logger';

export interface DeduplicationResult {
  venue: DiningVenue;
  isNew: boolean;
  existingId?: string;
}

export class Deduplicator {
  private supabase: SupabaseService;
  private seenSlugs: Set<string> = new Set();

  constructor(supabase: SupabaseService) {
    this.supabase = supabase;
  }

  /**
   * Check if a venue already exists and return deduplication result
   */
  async checkVenue(venue: DiningVenue): Promise<DeduplicationResult> {
    // First check if we've already seen this slug in the current batch
    if (this.seenSlugs.has(venue.slug)) {
      logger.debug('Duplicate in batch', { slug: venue.slug });
      return { venue, isNew: false };
    }
    this.seenSlugs.add(venue.slug);

    // Check by slug first
    const existingBySlug = await this.supabase.findExistingVenue(venue.slug);
    if (existingBySlug) {
      logger.debug('Found existing venue by slug', { slug: venue.slug, id: existingBySlug.id });
      return { venue: { ...venue, id: existingBySlug.id }, isNew: false, existingId: existingBySlug.id };
    }

    // Check by name and city (fuzzy match)
    const existingByNameCity = await this.supabase.findVenueByNameAndCity(
      venue.name,
      venue.city,
      venue.state
    );
    if (existingByNameCity) {
      logger.debug('Found existing venue by name/city', {
        name: venue.name,
        city: venue.city,
        id: existingByNameCity.id,
      });
      return {
        venue: { ...venue, id: existingByNameCity.id, slug: existingByNameCity.slug },
        isNew: false,
        existingId: existingByNameCity.id,
      };
    }

    return { venue, isNew: true };
  }

  /**
   * Reset the seen slugs (call between resorts to allow same venue for different resorts)
   */
  resetBatch(): void {
    this.seenSlugs.clear();
  }
}
