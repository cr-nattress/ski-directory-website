/**
 * Dining venue types for resort detail UI
 * Matches Supabase API response from /api/resorts/[slug]/dining
 */

// Venue type categories
export type VenueType = 'restaurant' | 'bar' | 'brewery' | 'cafe' | 'food_truck' | 'lodge_dining';

// Cuisine types
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

// Price range
export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

// Ambiance types
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

// Venue features
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

// Mountain location
export type MountainLocation = 'base' | 'mid_mountain' | 'summit' | 'village';

/**
 * Individual dining venue from Supabase API
 */
export interface DiningVenue {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  postal_code: string;
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
  distance_miles: number;
  drive_time_minutes: number | null;
  proximity_label: string;
  verified: boolean;
}

/**
 * API response from /api/resorts/[slug]/dining
 */
export interface DiningApiResponse {
  resort_slug: string;
  count: number;
  offset: number;
  limit: number;
  venues: DiningVenue[];
}

/**
 * Summary of venue types (for badge display)
 */
export interface VenueTypeSummary {
  restaurant: number;
  bar: number;
  brewery: number;
  cafe: number;
  food_truck: number;
  lodge_dining: number;
  total: number;
}

/**
 * Props for dining venue UI components
 */
export interface DiningVenueCardProps {
  venue: DiningVenue;
  resortName?: string;
  variant?: 'full' | 'compact';
  showActions?: boolean;
}

export interface DiningListProps {
  venues: DiningVenue[];
  resortName?: string;
  initialCount?: number;
  showTypeSummary?: boolean;
  enableFiltering?: boolean;
  variant?: 'full' | 'compact';
  className?: string;
}

// Helper functions

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Generate tel: link for phone number
 */
export function getTelLink(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return `tel:+1${digits.slice(-10)}`;
}

/**
 * Generate Google Maps directions link
 */
export function getDirectionsLink(venue: DiningVenue): string {
  const query = encodeURIComponent(
    `${venue.name}, ${venue.address}, ${venue.city}, ${venue.state}`
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

/**
 * Calculate venue type summary from venues array
 */
export function calculateVenueTypeSummary(venues: DiningVenue[]): VenueTypeSummary {
  const summary: VenueTypeSummary = {
    restaurant: 0,
    bar: 0,
    brewery: 0,
    cafe: 0,
    food_truck: 0,
    lodge_dining: 0,
    total: venues.length,
  };

  for (const venue of venues) {
    if (venue.venue_type.includes('restaurant')) summary.restaurant++;
    if (venue.venue_type.includes('bar')) summary.bar++;
    if (venue.venue_type.includes('brewery')) summary.brewery++;
    if (venue.venue_type.includes('cafe')) summary.cafe++;
    if (venue.venue_type.includes('food_truck')) summary.food_truck++;
    if (venue.venue_type.includes('lodge_dining')) summary.lodge_dining++;
  }

  return summary;
}

/**
 * Get human-readable label for venue type
 */
export function getVenueTypeLabel(type: VenueType): string {
  const labels: Record<VenueType, string> = {
    restaurant: 'Restaurant',
    bar: 'Bar',
    brewery: 'Brewery',
    cafe: 'Cafe',
    food_truck: 'Food Truck',
    lodge_dining: 'Lodge Dining',
  };
  return labels[type] || type;
}

/**
 * Get human-readable label for cuisine type
 */
export function getCuisineTypeLabel(type: CuisineType): string {
  const labels: Record<CuisineType, string> = {
    american: 'American',
    italian: 'Italian',
    mexican: 'Mexican',
    asian: 'Asian',
    japanese: 'Japanese',
    chinese: 'Chinese',
    thai: 'Thai',
    indian: 'Indian',
    french: 'French',
    mediterranean: 'Mediterranean',
    pizza: 'Pizza',
    burgers: 'Burgers',
    seafood: 'Seafood',
    steakhouse: 'Steakhouse',
    bbq: 'BBQ',
    pub_food: 'Pub Food',
    deli: 'Deli',
    bakery: 'Bakery',
    coffee: 'Coffee',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    international: 'International',
  };
  return labels[type] || type;
}

/**
 * Get human-readable label for ambiance
 */
export function getAmbianceLabel(ambiance: Ambiance): string {
  const labels: Record<Ambiance, string> = {
    casual: 'Casual',
    upscale: 'Upscale',
    family_friendly: 'Family Friendly',
    apres_ski: 'Apres Ski',
    fine_dining: 'Fine Dining',
    sports_bar: 'Sports Bar',
    romantic: 'Romantic',
    lively: 'Lively',
    cozy: 'Cozy',
  };
  return labels[ambiance] || ambiance;
}

/**
 * Get human-readable label for feature
 */
export function getFeatureLabel(feature: VenueFeature): string {
  const labels: Record<VenueFeature, string> = {
    outdoor_seating: 'Outdoor Seating',
    fireplace: 'Fireplace',
    live_music: 'Live Music',
    sports_tv: 'Sports TV',
    reservations_required: 'Reservations Required',
    happy_hour: 'Happy Hour',
    dog_friendly: 'Dog Friendly',
    takeout: 'Takeout',
    delivery: 'Delivery',
    private_events: 'Private Events',
    craft_cocktails: 'Craft Cocktails',
    local_beer: 'Local Beer',
  };
  return labels[feature] || feature;
}

/**
 * Get meal types served as array
 */
export function getMealTypes(venue: DiningVenue): string[] {
  const meals: string[] = [];
  if (venue.serves_breakfast) meals.push('Breakfast');
  if (venue.serves_lunch) meals.push('Lunch');
  if (venue.serves_dinner) meals.push('Dinner');
  return meals;
}

/**
 * Format price range with dollar signs
 */
export function formatPriceRange(priceRange: PriceRange): string {
  return priceRange;
}

/**
 * Get price range description
 */
export function getPriceRangeDescription(priceRange: PriceRange): string {
  const descriptions: Record<PriceRange, string> = {
    $: 'Budget-friendly',
    $$: 'Moderate',
    $$$: 'Upscale',
    $$$$: 'Fine Dining',
  };
  return descriptions[priceRange] || priceRange;
}

/**
 * Format distance in miles
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi';
  if (miles < 1) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/**
 * Format drive time in minutes
 */
export function formatDriveTime(minutes: number | null): string | null {
  if (!minutes) return null;
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Sort venues: on-mountain first, ski-in/out second, then by distance
 */
export function sortVenuesByProximity(venues: DiningVenue[]): DiningVenue[] {
  return [...venues].sort((a, b) => {
    // On-mountain venues first
    if (a.is_on_mountain && !b.is_on_mountain) return -1;
    if (!a.is_on_mountain && b.is_on_mountain) return 1;
    // Ski-in/ski-out second
    if (a.is_ski_in_ski_out && !b.is_ski_in_ski_out) return -1;
    if (!a.is_ski_in_ski_out && b.is_ski_in_ski_out) return 1;
    // Then by distance
    return a.distance_miles - b.distance_miles;
  });
}

/**
 * Color mapping for venue types (for map pins)
 */
export const VENUE_TYPE_COLORS: Record<VenueType, string> = {
  restaurant: '#e74c3c', // Red
  bar: '#9b59b6', // Purple
  brewery: '#f39c12', // Orange
  cafe: '#3498db', // Blue
  food_truck: '#2ecc71', // Green
  lodge_dining: '#1abc9c', // Teal
};

/**
 * Get color for venue based on primary type
 */
export function getVenueColor(venueTypes: VenueType[]): string {
  // Priority order for mixed-type venues
  const priority: VenueType[] = ['lodge_dining', 'brewery', 'bar', 'restaurant', 'cafe', 'food_truck'];
  for (const type of priority) {
    if (venueTypes.includes(type)) {
      return VENUE_TYPE_COLORS[type];
    }
  }
  return VENUE_TYPE_COLORS.restaurant;
}
