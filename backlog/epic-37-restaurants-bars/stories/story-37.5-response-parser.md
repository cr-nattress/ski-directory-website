# Story 37.5: Dining Enricher - Response Parser

## Description

Create the response parser that validates and transforms OpenAI responses into structured DiningVenue objects with Zod validation.

## Acceptance Criteria

- [ ] Zod schemas for all venue fields
- [ ] Parse raw JSON response from OpenAI
- [ ] Validate coordinate bounds (North America)
- [ ] Normalize venue_type and cuisine_type arrays
- [ ] Generate slugs from venue names
- [ ] Handle missing/null fields gracefully
- [ ] Return validation errors for invalid venues

## Zod Validation Schemas

```typescript
// schemas/dining-venue.ts
import { z } from 'zod';

export const VenueTypeSchema = z.enum([
  'restaurant', 'bar', 'brewery', 'cafe', 'food_truck', 'lodge_dining'
]);

export const CuisineTypeSchema = z.enum([
  'american', 'italian', 'mexican', 'asian', 'pizza', 'burgers',
  'seafood', 'steakhouse', 'bbq', 'pub_food', 'fine_dining', 'deli',
  'sushi', 'thai', 'indian', 'french', 'mediterranean'
]);

export const PriceRangeSchema = z.enum(['$', '$$', '$$$', '$$$$']);

export const AmbianceSchema = z.enum([
  'casual', 'upscale', 'family_friendly', 'sports_bar', 'apres_ski',
  'romantic', 'lively', 'cozy', 'trendy'
]);

export const VenueFeatureSchema = z.enum([
  'outdoor_seating', 'patio', 'fireplace', 'live_music', 'happy_hour',
  'late_night', 'reservations_recommended', 'walk_ins_only', 'takeout',
  'delivery', 'pet_friendly', 'craft_cocktails', 'local_beer',
  'wine_list', 'mountain_views'
]);

export const MountainLocationSchema = z.enum([
  'base', 'mid_mountain', 'summit', 'village', 'off_mountain'
]);

export const OpenAIDiningVenueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  address: z.string().optional().default(''),
  city: z.string().min(1),
  state: z.string().min(1).max(2),
  postal_code: z.string().optional().default(''),
  latitude: z.number().min(24).max(72),  // North America bounds
  longitude: z.number().min(-170).max(-50),
  phone: z.string().optional().default(''),
  website: z.string().url().optional().or(z.literal('')),
  venue_type: z.array(z.string()).transform(arr =>
    arr.filter(v => VenueTypeSchema.safeParse(v).success)
  ),
  cuisine_type: z.array(z.string()).transform(arr =>
    arr.filter(c => CuisineTypeSchema.safeParse(c).success)
  ),
  price_range: PriceRangeSchema.optional().default('$$'),
  serves_breakfast: z.boolean().optional().default(false),
  serves_lunch: z.boolean().optional().default(false),
  serves_dinner: z.boolean().optional().default(false),
  serves_drinks: z.boolean().optional().default(false),
  has_full_bar: z.boolean().optional().default(false),
  ambiance: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  is_on_mountain: z.boolean().optional().default(false),
  mountain_location: z.string().optional().default('off_mountain'),
  is_ski_in_ski_out: z.boolean().optional().default(false),
  hours_notes: z.string().optional().default(''),
});

export const OpenAIResponseSchema = z.object({
  venues: z.array(OpenAIDiningVenueSchema),
});
```

## Response Parser Implementation

```typescript
// enricher/response-parser.ts
import { OpenAIResponseSchema, OpenAIDiningVenueSchema } from '../schemas/dining-venue';
import { DiningVenue, OpenAIDiningVenue, Resort } from '../types';
import { generateSlug } from '../utils/slug';
import { logger } from '../utils/logger';

export interface ParseResult {
  venues: DiningVenue[];
  errors: ParseError[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export interface ParseError {
  index: number;
  name?: string;
  errors: string[];
}

export class ResponseParser {
  parse(rawJson: string, resort: Resort): ParseResult {
    const errors: ParseError[] = [];
    const venues: DiningVenue[] = [];

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch (e) {
      throw new Error(`Failed to parse JSON response: ${e.message}`);
    }

    // Validate structure
    const result = OpenAIResponseSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`Invalid response structure: ${result.error.message}`);
    }

    // Process each venue
    for (let i = 0; i < result.data.venues.length; i++) {
      const rawVenue = result.data.venues[i];

      try {
        const venue = this.transformVenue(rawVenue, resort);
        venues.push(venue);
      } catch (e) {
        errors.push({
          index: i,
          name: rawVenue.name,
          errors: [e.message],
        });
        logger.warn(`Skipping invalid venue: ${rawVenue.name}`, { error: e.message });
      }
    }

    return {
      venues,
      errors,
      stats: {
        total: result.data.venues.length,
        valid: venues.length,
        invalid: errors.length,
      },
    };
  }

  private transformVenue(raw: OpenAIDiningVenue, resort: Resort): DiningVenue {
    // Validate coordinates are reasonable distance from resort
    const distance = this.calculateDistance(
      resort.latitude, resort.longitude,
      raw.latitude, raw.longitude
    );

    if (distance > 50) {
      throw new Error(`Venue too far from resort: ${distance.toFixed(1)} miles`);
    }

    return {
      name: raw.name.trim(),
      slug: generateSlug(raw.name),
      description: raw.description || '',
      address_line1: raw.address || '',
      city: raw.city,
      state: raw.state.toUpperCase(),
      postal_code: raw.postal_code || '',
      country: 'USA',
      latitude: raw.latitude,
      longitude: raw.longitude,
      phone: this.normalizePhone(raw.phone),
      website_url: raw.website || '',
      venue_type: raw.venue_type as any[],
      cuisine_type: raw.cuisine_type as any[],
      price_range: raw.price_range as any,
      serves_breakfast: raw.serves_breakfast,
      serves_lunch: raw.serves_lunch,
      serves_dinner: raw.serves_dinner,
      serves_drinks: raw.serves_drinks,
      has_full_bar: raw.has_full_bar,
      ambiance: raw.ambiance as any[],
      features: raw.features as any[],
      is_on_mountain: raw.is_on_mountain,
      mountain_location: raw.mountain_location as any,
      is_ski_in_ski_out: raw.is_ski_in_ski_out,
      hours_notes: raw.hours_notes || '',
      source: 'openai',
      verified: false,
      is_active: true,
    };
  }

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

## Effort

Medium (2-3 hours)
