import { SkiShop } from '../types';
import { SupabaseService } from '../services/supabase';
import { logger } from '../utils/logger';

export interface DeduplicationResult {
  shop: SkiShop;
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
   * Check if a shop already exists and return deduplication result
   */
  async checkShop(shop: SkiShop): Promise<DeduplicationResult> {
    // First check if we've already seen this slug in the current batch
    if (this.seenSlugs.has(shop.slug)) {
      logger.debug('Duplicate in batch', { slug: shop.slug });
      return { shop, isNew: false };
    }
    this.seenSlugs.add(shop.slug);

    // Check by slug first
    const existingBySlug = await this.supabase.findExistingShop(shop.slug);
    if (existingBySlug) {
      logger.debug('Found existing shop by slug', { slug: shop.slug, id: existingBySlug.id });
      return { shop: { ...shop, id: existingBySlug.id }, isNew: false, existingId: existingBySlug.id };
    }

    // Check by name and city (fuzzy match)
    const existingByNameCity = await this.supabase.findShopByNameAndCity(
      shop.name,
      shop.city,
      shop.state
    );
    if (existingByNameCity) {
      logger.debug('Found existing shop by name/city', {
        name: shop.name,
        city: shop.city,
        id: existingByNameCity.id,
      });
      return {
        shop: { ...shop, id: existingByNameCity.id, slug: existingByNameCity.slug },
        isNew: false,
        existingId: existingByNameCity.id,
      };
    }

    return { shop, isNew: true };
  }

  /**
   * Reset the seen slugs (call between resorts to allow same shop for different resorts)
   */
  resetBatch(): void {
    this.seenSlugs.clear();
  }
}
