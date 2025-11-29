// Types based on our data model

export type PassAffiliation = 'epic' | 'ikon' | 'indy' | 'local';

// Generic item with name and URL (for nearby places, base areas, etc.)
export interface NamedItem {
  name: string;
  url?: string;
}

// Collection of items with count
export interface ItemCollection {
  count: number;
  items: NamedItem[];
}

export interface ResortImage {
  url: string;
  alt: string;
  priority: number; // Lower numbers display first (1 = highest priority)
  isCardImage: boolean; // Shows on the dashboard/listing card
  isHeroImage: boolean; // Large image for resort detail page
}

export interface Resort {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  isActive: boolean; // Whether the resort is visible in the UI
  isLost: boolean; // false = currently operating, true = non-operational/closed permanently

  // Location
  location: {
    lat: number;
    lng: number;
  };
  nearestCity: string;
  distanceFromDenver: number; // miles
  driveTimeFromDenver: number; // minutes

  // Stats
  stats: {
    skiableAcres: number;
    liftsCount: number;
    runsCount: number;
    verticalDrop: number; // feet
    baseElevation: number; // feet
    summitElevation: number; // feet
    avgAnnualSnowfall: number; // inches
  };

  // Terrain breakdown
  terrain: {
    beginner: number; // percentage
    intermediate: number;
    advanced: number;
    expert: number;
  };

  // Current conditions
  conditions: {
    snowfall24h: number; // inches
    snowfall72h: number; // inches
    baseDepth: number; // inches
    terrainOpen: number; // percentage
    liftsOpen: number; // count
    status: 'open' | 'closed' | 'opening-soon';
  };

  // Weather forecast
  weather?: {
    current: {
      temp: number; // fahrenheit
      condition: string;
      windSpeed: number; // mph
      humidity: number; // percentage
    };
    forecast: Array<{
      day: string;
      high: number;
      low: number;
      condition: string;
      snowChance: number; // percentage
    }>;
  };

  // Pass information
  passAffiliations: PassAffiliation[];

  // Ratings
  rating: number; // 1-5
  reviewCount: number;

  // Images
  heroImage: string; // @deprecated - Use images array with isHeroImage flag instead
  images?: ResortImage[];
  trailMapUrl?: string;

  // Website
  websiteUrl?: string;

  // GCS Asset Location (for resorts with cloud-hosted assets)
  assetLocation?: {
    country: string; // e.g., 'us'
    state: string; // e.g., 'colorado'
    slug: string; // matches resort slug
  };
  hasGcsAssets?: boolean; // true if assets are hosted on GCS

  // Social Media
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    x?: string; // formerly Twitter
  };

  // Features
  features: {
    hasPark: boolean;
    hasHalfpipe: boolean;
    hasNightSkiing: boolean;
    hasBackcountryAccess: boolean;
    hasSpaVillage: boolean;
  };

  // Tags for AI/filtering
  tags: string[];

  // Base areas and high-speed lifts
  baseAreas?: ItemCollection;
  highSpeedLifts?: ItemCollection;

  // Nearby amenities (within 1 mile)
  nearby?: {
    bars?: ItemCollection;
    restaurants?: ItemCollection;
    skiShops?: ItemCollection;
    shops?: ItemCollection;
    groceryStores?: ItemCollection;
    hotels?: ItemCollection;
    motels?: ItemCollection;
  };
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  filter: (resort: Resort) => boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: number; // minutes
  image: string;
  publishedAt: string;
}
