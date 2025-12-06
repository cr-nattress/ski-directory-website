# Story 37.9: Frontend Types and Helpers

## Description

Create TypeScript types and helper functions for the frontend to consume dining venue data.

## Acceptance Criteria

- [ ] DiningVenue type definition for frontend
- [ ] API response types
- [ ] Filter option types
- [ ] Helper functions for formatting (price, hours, etc.)
- [ ] Icon mapping for venue types and features
- [ ] Color schemes for venue categories

## Type Definitions

```typescript
// lib/types/dining.ts

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

export interface DiningVenue {
  id: string;
  name: string;
  slug: string;
  description: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  website_url: string;
  venue_type: VenueType[];
  cuisine_type: CuisineType[];
  price_range: PriceRange;
  serves_breakfast: boolean;
  serves_lunch: boolean;
  serves_dinner: boolean;
  serves_drinks: boolean;
  has_full_bar: boolean;
  ambiance: Ambiance[];
  features: VenueFeature[];
  is_on_mountain: boolean;
  mountain_location: MountainLocation;
  is_ski_in_ski_out: boolean;
  hours_notes: string;
  distance_miles: number;
  drive_time_minutes: number | null;
}

export interface DiningFilters {
  venueType?: VenueType[];
  cuisineType?: CuisineType[];
  priceRange?: PriceRange[];
  isOnMountain?: boolean;
  isSkiInSkiOut?: boolean;
}

export interface DiningAPIResponse {
  venues: DiningVenue[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    venueTypes: VenueType[];
    cuisineTypes: CuisineType[];
    priceRanges: PriceRange[];
  };
}
```

## Helper Functions

```typescript
// lib/utils/dining-helpers.ts

import { VenueType, CuisineType, VenueFeature, PriceRange, MountainLocation } from '@/lib/types/dining';

// Display labels
export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  restaurant: 'Restaurant',
  bar: 'Bar',
  brewery: 'Brewery',
  cafe: 'Cafe',
  food_truck: 'Food Truck',
  lodge_dining: 'Lodge Dining',
};

export const CUISINE_TYPE_LABELS: Record<CuisineType, string> = {
  american: 'American',
  italian: 'Italian',
  mexican: 'Mexican',
  asian: 'Asian',
  pizza: 'Pizza',
  burgers: 'Burgers',
  seafood: 'Seafood',
  steakhouse: 'Steakhouse',
  bbq: 'BBQ',
  pub_food: 'Pub Food',
  fine_dining: 'Fine Dining',
  deli: 'Deli',
  sushi: 'Sushi',
  thai: 'Thai',
  indian: 'Indian',
  french: 'French',
  mediterranean: 'Mediterranean',
};

export const MOUNTAIN_LOCATION_LABELS: Record<MountainLocation, string> = {
  base: 'Base Area',
  mid_mountain: 'Mid-Mountain',
  summit: 'Summit',
  village: 'Village',
  off_mountain: 'Off Mountain',
};

// Price range formatting
export function formatPriceRange(price: PriceRange): string {
  const descriptions: Record<PriceRange, string> = {
    '$': 'Budget-friendly',
    '$$': 'Moderate',
    '$$$': 'Upscale',
    '$$$$': 'Fine Dining',
  };
  return descriptions[price];
}

// Distance formatting
export function formatDistance(miles: number): string {
  if (miles < 0.1) return 'On-site';
  if (miles < 1) return `${Math.round(miles * 5280)} ft`;
  return `${miles.toFixed(1)} mi`;
}

// Drive time formatting
export function formatDriveTime(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Meal availability
export function getMealTypes(venue: DiningVenue): string[] {
  const meals: string[] = [];
  if (venue.serves_breakfast) meals.push('Breakfast');
  if (venue.serves_lunch) meals.push('Lunch');
  if (venue.serves_dinner) meals.push('Dinner');
  if (venue.serves_drinks) meals.push('Drinks');
  return meals;
}

// Phone formatting
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return phone;
}

// Google Maps directions URL
export function getDirectionsUrl(venue: DiningVenue): string {
  const address = encodeURIComponent(
    `${venue.name}, ${venue.address_line1}, ${venue.city}, ${venue.state} ${venue.postal_code}`
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
}

// Icon mapping for venue types
export const VENUE_TYPE_ICONS: Record<VenueType, string> = {
  restaurant: 'utensils',
  bar: 'glass-martini',
  brewery: 'beer',
  cafe: 'coffee',
  food_truck: 'truck',
  lodge_dining: 'mountain',
};

// Color schemes for map pins
export const VENUE_TYPE_COLORS: Record<VenueType, string> = {
  restaurant: '#e74c3c',  // Red
  bar: '#9b59b6',         // Purple
  brewery: '#f39c12',     // Orange
  cafe: '#3498db',        // Blue
  food_truck: '#2ecc71',  // Green
  lodge_dining: '#1abc9c', // Teal
};
```

## Effort

Small (1-2 hours)
