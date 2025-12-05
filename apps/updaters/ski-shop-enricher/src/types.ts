export interface Resort {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  nearest_city: string;
  state: string;
  state_name: string;
  asset_path: string | null; // GCS path: e.g., "us/colorado/vail"
}

export interface SkiShop {
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
  shop_type: ShopType[];
  services: ShopService[];
  source: 'openai' | 'manual' | 'google_places';
  verified: boolean;
  is_active: boolean;
}

export type ShopType = 'rental' | 'retail' | 'repair' | 'demo';

export type ShopService =
  | 'ski_rental'
  | 'snowboard_rental'
  | 'boot_fitting'
  | 'tuning'
  | 'waxing'
  | 'repairs'
  | 'lessons';

export interface ResortSkiShop {
  resort_id: string;
  ski_shop_id: string;
  distance_miles: number;
  drive_time_minutes?: number;
  is_on_mountain: boolean;
  is_preferred: boolean;
}

export interface EnrichmentResult {
  resort_id: string;
  resort_name: string;
  status: 'success' | 'partial' | 'failed' | 'no_results';
  shops_found: number;
  shops_created: number;
  shops_updated: number;
  shops_linked: number;
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
  shops_found: number;
  shops_created: number;
  shops_updated: number;
  shops_linked: number;
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

export interface OpenAISkiShopResponse {
  shops: Array<{
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
    shop_type: string[];
    services: string[];
    is_on_mountain: boolean;
  }>;
}
