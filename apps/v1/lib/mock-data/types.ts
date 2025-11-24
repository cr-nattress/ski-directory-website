// Types based on our data model

export type PassAffiliation = 'epic' | 'ikon' | 'indy' | 'local';

export interface Resort {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;

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
  heroImage: string;
  images?: string[];
  trailMapUrl?: string;

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
