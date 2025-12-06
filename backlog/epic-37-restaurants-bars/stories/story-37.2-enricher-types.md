# Story 37.2: TypeScript Types for Dining Enricher

## Description

Create TypeScript type definitions for the dining-enricher service, including venue interfaces, API responses, and enrichment log types.

## Acceptance Criteria

- [ ] DiningVenue interface with all fields
- [ ] ResortDiningVenue junction interface
- [ ] EnrichmentLogEntry interface
- [ ] VenueType, CuisineType, PriceRange, Ambiance, VenueFeature enums/types
- [ ] OpenAI response schemas
- [ ] Zod validation schemas for runtime validation

## Technical Details

### File: `apps/updaters/dining-enricher/src/types.ts`

```typescript
// ============ Enums / Type Unions ============

export type VenueType =
  | 'restaurant'
  | 'bar'
  | 'brewery'
  | 'cafe'
  | 'food_truck'
  | 'lodge_dining';

export type CuisineType =
  | 'american'
  | 'italian'
  | 'mexican'
  | 'asian'
  | 'pizza'
  | 'burgers'
  | 'seafood'
  | 'steakhouse'
  | 'bbq'
  | 'pub_food'
  | 'fine_dining'
  | 'deli'
  | 'sushi'
  | 'thai'
  | 'indian'
  | 'french'
  | 'mediterranean';

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export type Ambiance =
  | 'casual'
  | 'upscale'
  | 'family_friendly'
  | 'sports_bar'
  | 'apres_ski'
  | 'romantic'
  | 'lively'
  | 'cozy'
  | 'trendy';

export type VenueFeature =
  | 'outdoor_seating'
  | 'patio'
  | 'fireplace'
  | 'live_music'
  | 'happy_hour'
  | 'late_night'
  | 'reservations_recommended'
  | 'walk_ins_only'
  | 'takeout'
  | 'delivery'
  | 'pet_friendly'
  | 'craft_cocktails'
  | 'local_beer'
  | 'wine_list'
  | 'mountain_views';

export type MountainLocation =
  | 'base'
  | 'mid_mountain'
  | 'summit'
  | 'village'
  | 'off_mountain';

// ============ Core Interfaces ============

export interface Resort {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  nearest_city: string;
  state: string;
  state_name: string;
  asset_path: string;
}

export interface DiningVenue {
  id?: string;
  name: string;
  slug: string;
  description: string;

  // Location
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;

  // Contact
  phone: string;
  website_url: string;

  // Classification
  venue_type: VenueType[];
  cuisine_type: CuisineType[];

  // Dining Features
  price_range: PriceRange;
  serves_breakfast: boolean;
  serves_lunch: boolean;
  serves_dinner: boolean;
  serves_drinks: boolean;
  has_full_bar: boolean;

  // Atmosphere
  ambiance: Ambiance[];
  features: VenueFeature[];

  // Ski-specific
  is_on_mountain: boolean;
  mountain_location: MountainLocation;
  is_ski_in_ski_out: boolean;

  // Hours
  hours_notes: string;

  // Meta
  source: 'openai' | 'manual' | 'google_places';
  verified: boolean;
  is_active: boolean;
}

export interface ResortDiningVenue {
  resort_id: string;
  dining_venue_id: string;
  distance_miles: number;
  drive_time_minutes?: number;
  is_on_mountain: boolean;
  is_preferred: boolean;
}

export interface EnrichmentLogEntry {
  resort_id: string;
  resort_name: string;
  search_radius_miles: number;
  search_lat: number;
  search_lng: number;
  venues_found: number;
  venues_created: number;
  venues_updated: number;
  venues_linked: number;
  status: 'success' | 'partial' | 'error' | 'skipped';
  error_message?: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost: number;
  raw_response?: object;
  started_at: Date;
  completed_at: Date;
  duration_ms: number;
}

// ============ OpenAI Response Types ============

export interface OpenAIDiningResponse {
  venues: OpenAIDiningVenue[];
}

export interface OpenAIDiningVenue {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
  venue_type: string[];
  cuisine_type: string[];
  price_range: string;
  serves_breakfast: boolean;
  serves_lunch: boolean;
  serves_dinner: boolean;
  serves_drinks: boolean;
  has_full_bar: boolean;
  ambiance: string[];
  features: string[];
  is_on_mountain: boolean;
  mountain_location: string;
  is_ski_in_ski_out: boolean;
  hours_notes: string;
}
```

## Dependencies

- Zod for runtime validation

## Effort

Small (1-2 hours)
