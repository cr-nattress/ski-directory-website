import { z } from 'zod';
import { ShopType, ShopService, SkiShop, OpenAISkiShopResponse } from '../types';
import { generateSlug } from '../utils/slug';
import { isValidCoordinate } from '../services/geocoding';
import { logger } from '../utils/logger';

// Zod schemas for validation
const ShopTypeSchema = z.enum(['rental', 'retail', 'repair', 'demo']);
const ShopServiceSchema = z.enum([
  'ski_rental',
  'snowboard_rental',
  'boot_fitting',
  'tuning',
  'waxing',
  'repairs',
  'lessons',
]);

const OpenAIShopSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  postal_code: z.string().min(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  shop_type: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  is_on_mountain: z.boolean().default(false),
});

const OpenAIResponseSchema = z.object({
  shops: z.array(OpenAIShopSchema).default([]),
});

export interface ParseResult {
  validShops: SkiShop[];
  invalidCount: number;
  errors: string[];
}

export function parseOpenAIResponse(response: OpenAISkiShopResponse): ParseResult {
  const validShops: SkiShop[] = [];
  const errors: string[] = [];
  let invalidCount = 0;

  // Validate overall response structure
  const parsed = OpenAIResponseSchema.safeParse(response);
  if (!parsed.success) {
    logger.error('Invalid response structure', { errors: parsed.error.errors });
    return { validShops: [], invalidCount: 0, errors: ['Invalid response structure'] };
  }

  for (const shop of parsed.data.shops) {
    try {
      // Validate coordinates are in North America
      if (!isValidCoordinate(shop.latitude, shop.longitude)) {
        errors.push(`Invalid coordinates for ${shop.name}: ${shop.latitude}, ${shop.longitude}`);
        invalidCount++;
        continue;
      }

      // Parse and validate shop types
      const validShopTypes: ShopType[] = shop.shop_type
        .map((t) => t.toLowerCase().trim())
        .filter((t): t is ShopType => ShopTypeSchema.safeParse(t).success);

      // Parse and validate services
      const validServices: ShopService[] = shop.services
        .map((s) => s.toLowerCase().trim().replace(/\s+/g, '_'))
        .filter((s): s is ShopService => ShopServiceSchema.safeParse(s).success);

      // Generate slug
      const slug = generateSlug(shop.name, shop.city, shop.state);

      // Clean phone number
      const cleanPhone = shop.phone
        ? shop.phone.replace(/[^\d-]/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3')
        : null;

      // Validate and clean URL
      let websiteUrl: string | null = null;
      if (shop.website_url) {
        try {
          const url = new URL(shop.website_url);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            websiteUrl = shop.website_url;
          }
        } catch {
          // Invalid URL, skip
        }
      }

      const validShop: SkiShop = {
        name: shop.name.trim(),
        slug,
        description: shop.description?.trim() || null,
        address_line1: shop.address.trim(),
        city: shop.city.trim(),
        state: shop.state.toUpperCase(),
        postal_code: shop.postal_code.trim(),
        country: 'US',
        latitude: shop.latitude,
        longitude: shop.longitude,
        phone: cleanPhone,
        website_url: websiteUrl,
        shop_type: validShopTypes.length > 0 ? validShopTypes : ['retail'],
        services: validServices,
        source: 'openai',
        verified: false,
        is_active: true,
      };

      validShops.push(validShop);
    } catch (error) {
      const errorMsg = `Failed to parse shop ${shop.name}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      invalidCount++;
    }
  }

  logger.debug('Parsed OpenAI response', {
    total: parsed.data.shops.length,
    valid: validShops.length,
    invalid: invalidCount,
  });

  return { validShops, invalidCount, errors };
}
