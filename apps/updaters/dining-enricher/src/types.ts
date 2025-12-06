export interface Resort {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  nearest_city: string;
  state: string;
  state_name: string;
  asset_path: string | null;
}

export type VenueType = 'restaurant' | 'bar' | 'brewery' | 'cafe' | 'food_truck' | 'lodge_dining';

export type CuisineType =
  | 'american'
  | 'italian'
  | 'mexican'
  | 'asian'
  | 'japanese'
  | 'chinese'
  | 'thai'
  | 'indian'
  | 'french'
  | 'mediterranean'
  | 'pizza'
  | 'burgers'
  | 'seafood'
  | 'steakhouse'
  | 'bbq'
  | 'pub_food'
  | 'deli'
  | 'bakery'
  | 'coffee'
  | 'vegetarian'
  | 'vegan'
  | 'international';

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export type Ambiance =
  | 'casual'
  | 'upscale'
  | 'family_friendly'
  | 'apres_ski'
  | 'fine_dining'
  | 'sports_bar'
  | 'romantic'
  | 'lively'
  | 'cozy';

export type VenueFeature =
  | 'outdoor_seating'
  | 'fireplace'
  | 'live_music'
  | 'sports_tv'
  | 'reservations_required'
  | 'happy_hour'
  | 'dog_friendly'
  | 'takeout'
  | 'delivery'
  | 'private_events'
  | 'craft_cocktails'
  | 'local_beer';

export type MountainLocation = 'base' | 'mid_mountain' | 'summit' | 'village';

export interface DiningVenue {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
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
  mountain_location: MountainLocation | null;
  is_ski_in_ski_out: boolean;
  hours_notes: string | null;
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

export interface EnrichmentResult {
  resort_id: string;
  resort_name: string;
  status: 'success' | 'partial' | 'failed' | 'no_results';
  venues_found: number;
  venues_created: number;
  venues_updated: number;
  venues_linked: number;
  error?: string;
  duration_ms: number;
  total_cost?: number;
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
  status: string;
  error_message?: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost: number;
  raw_response: unknown;
  started_at: Date;
  completed_at: Date;
  duration_ms: number;
}

export interface OpenAIDiningVenueResponse {
  venues: Array<{
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    phone?: string;
    website_url?: string;
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
    mountain_location?: string;
    is_ski_in_ski_out: boolean;
    hours_notes?: string;
  }>;
}
