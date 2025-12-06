import { z } from 'zod';
import {
  VenueType,
  CuisineType,
  PriceRange,
  Ambiance,
  VenueFeature,
  MountainLocation,
  DiningVenue,
  OpenAIDiningVenueResponse,
} from '../types';
import { generateSlug } from '../utils/slug';
import { isValidCoordinate } from '../services/geocoding';
import { logger } from '../utils/logger';

// Zod schemas for validation
const VenueTypeSchema = z.enum(['restaurant', 'bar', 'brewery', 'cafe', 'food_truck', 'lodge_dining']);
const CuisineTypeSchema = z.enum([
  'american', 'italian', 'mexican', 'asian', 'japanese', 'chinese', 'thai', 'indian',
  'french', 'mediterranean', 'pizza', 'burgers', 'seafood', 'steakhouse', 'bbq',
  'pub_food', 'deli', 'bakery', 'coffee', 'vegetarian', 'vegan', 'international',
]);
const PriceRangeSchema = z.enum(['$', '$$', '$$$', '$$$$']);
const AmbianceSchema = z.enum([
  'casual', 'upscale', 'family_friendly', 'apres_ski', 'fine_dining',
  'sports_bar', 'romantic', 'lively', 'cozy',
]);
const FeatureSchema = z.enum([
  'outdoor_seating', 'fireplace', 'live_music', 'sports_tv', 'reservations_required',
  'happy_hour', 'dog_friendly', 'takeout', 'delivery', 'private_events',
  'craft_cocktails', 'local_beer',
]);
const MountainLocationSchema = z.enum(['base', 'mid_mountain', 'summit', 'village']);

const OpenAIVenueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2).max(3),
  postal_code: z.string().min(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  venue_type: z.array(z.string()).default([]),
  cuisine_type: z.array(z.string()).default([]),
  price_range: z.string().default('$$'),
  serves_breakfast: z.boolean().default(false),
  serves_lunch: z.boolean().default(false),
  serves_dinner: z.boolean().default(false),
  serves_drinks: z.boolean().default(false),
  has_full_bar: z.boolean().default(false),
  ambiance: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  is_on_mountain: z.boolean().default(false),
  mountain_location: z.string().optional().nullable(),
  is_ski_in_ski_out: z.boolean().default(false),
  hours_notes: z.string().optional().nullable(),
});

const OpenAIResponseSchema = z.object({
  venues: z.array(OpenAIVenueSchema).default([]),
});

export interface ParseResult {
  validVenues: DiningVenue[];
  invalidCount: number;
  errors: string[];
}

export function parseOpenAIResponse(response: OpenAIDiningVenueResponse): ParseResult {
  const validVenues: DiningVenue[] = [];
  const errors: string[] = [];
  let invalidCount = 0;

  // Validate overall response structure
  const parsed = OpenAIResponseSchema.safeParse(response);
  if (!parsed.success) {
    logger.error('Invalid response structure', { errors: parsed.error.errors });
    return { validVenues: [], invalidCount: 0, errors: ['Invalid response structure'] };
  }

  for (const venue of parsed.data.venues) {
    try {
      // Validate coordinates are in North America
      if (!isValidCoordinate(venue.latitude, venue.longitude)) {
        errors.push(`Invalid coordinates for ${venue.name}: ${venue.latitude}, ${venue.longitude}`);
        invalidCount++;
        continue;
      }

      // Parse and validate venue types
      const validVenueTypes: VenueType[] = venue.venue_type
        .map((t) => t.toLowerCase().trim().replace(/\s+/g, '_'))
        .filter((t): t is VenueType => VenueTypeSchema.safeParse(t).success);

      // Parse and validate cuisine types
      const validCuisineTypes: CuisineType[] = venue.cuisine_type
        .map((c) => c.toLowerCase().trim().replace(/\s+/g, '_'))
        .filter((c): c is CuisineType => CuisineTypeSchema.safeParse(c).success);

      // Parse and validate price range
      const priceRange = PriceRangeSchema.safeParse(venue.price_range);
      const validPriceRange: PriceRange = priceRange.success ? priceRange.data : '$$';

      // Parse and validate ambiance
      const validAmbiance: Ambiance[] = venue.ambiance
        .map((a) => a.toLowerCase().trim().replace(/\s+/g, '_'))
        .filter((a): a is Ambiance => AmbianceSchema.safeParse(a).success);

      // Parse and validate features
      const validFeatures: VenueFeature[] = venue.features
        .map((f) => f.toLowerCase().trim().replace(/\s+/g, '_'))
        .filter((f): f is VenueFeature => FeatureSchema.safeParse(f).success);

      // Parse mountain location
      let mountainLocation: MountainLocation | null = null;
      if (venue.mountain_location) {
        const locParsed = MountainLocationSchema.safeParse(
          venue.mountain_location.toLowerCase().trim().replace(/\s+/g, '_')
        );
        if (locParsed.success) {
          mountainLocation = locParsed.data;
        }
      }

      // Generate slug
      const slug = generateSlug(venue.name, venue.city, venue.state);

      // Clean phone number
      const cleanPhone = venue.phone
        ? venue.phone.replace(/[^\d-]/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3')
        : null;

      // Validate and clean URL
      let websiteUrl: string | null = null;
      if (venue.website_url) {
        try {
          const url = new URL(venue.website_url);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            websiteUrl = venue.website_url;
          }
        } catch {
          // Invalid URL, skip
        }
      }

      const validVenue: DiningVenue = {
        name: venue.name.trim(),
        slug,
        description: venue.description?.trim() || null,
        address_line1: venue.address.trim(),
        city: venue.city.trim(),
        state: venue.state.toUpperCase(),
        postal_code: venue.postal_code.trim(),
        country: 'US',
        latitude: venue.latitude,
        longitude: venue.longitude,
        phone: cleanPhone,
        website_url: websiteUrl,
        venue_type: validVenueTypes.length > 0 ? validVenueTypes : ['restaurant'],
        cuisine_type: validCuisineTypes.length > 0 ? validCuisineTypes : ['american'],
        price_range: validPriceRange,
        serves_breakfast: venue.serves_breakfast,
        serves_lunch: venue.serves_lunch,
        serves_dinner: venue.serves_dinner,
        serves_drinks: venue.serves_drinks,
        has_full_bar: venue.has_full_bar,
        ambiance: validAmbiance,
        features: validFeatures,
        is_on_mountain: venue.is_on_mountain,
        mountain_location: mountainLocation,
        is_ski_in_ski_out: venue.is_ski_in_ski_out,
        hours_notes: venue.hours_notes?.trim() || null,
        source: 'openai',
        verified: false,
        is_active: true,
      };

      validVenues.push(validVenue);
    } catch (error) {
      const errorMsg = `Failed to parse venue ${venue.name}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      invalidCount++;
    }
  }

  logger.debug('Parsed OpenAI response', {
    total: parsed.data.venues.length,
    valid: validVenues.length,
    invalid: invalidCount,
  });

  return { validVenues, invalidCount, errors };
}
