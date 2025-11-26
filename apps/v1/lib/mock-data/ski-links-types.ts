/**
 * Ski Links Directory Types
 * Data model for external ski-related website links
 */

export type SkiLinkType =
  | 'resort'
  | 'snow-weather'
  | 'webcam-trailmap'
  | 'trip-planning'
  | 'gear-reviews'
  | 'education'
  | 'community'
  | 'news';

export type SkiLinkRegion =
  | 'colorado'
  | 'us'
  | 'north-america'
  | 'europe'
  | 'japan'
  | 'global';

export type SkiLinkAudience =
  | 'beginner'
  | 'family'
  | 'backcountry'
  | 'park';

export interface SkiLink {
  id: string;
  title: string;
  url: string;
  description: string;
  type: SkiLinkType;
  regions: SkiLinkRegion[];
  audience: SkiLinkAudience[];
  tags: string[];
  isOfficial: boolean;
  isPaid?: boolean; // true = paid, false = freemium, undefined = free
  priority: number; // 1-10, lower = higher placement
  isFeatured?: boolean;
  dateAdded?: string; // ISO date string
}

// Display labels for types
export const SKI_LINK_TYPE_LABELS: Record<SkiLinkType, string> = {
  'resort': 'Resort & Mountain Sites',
  'snow-weather': 'Snow Reports & Weather',
  'webcam-trailmap': 'Webcams & Trail Maps',
  'trip-planning': 'Trip Planning & Lodging',
  'gear-reviews': 'Gear & Reviews',
  'education': 'Lessons, Safety & Education',
  'community': 'Communities & Forums',
  'news': 'News & Editorial',
};

// Display labels for regions
export const SKI_LINK_REGION_LABELS: Record<SkiLinkRegion, string> = {
  'colorado': 'Colorado',
  'us': 'United States',
  'north-america': 'North America',
  'europe': 'Europe',
  'japan': 'Japan',
  'global': 'Global',
};

// Display labels for audience
export const SKI_LINK_AUDIENCE_LABELS: Record<SkiLinkAudience, string> = {
  'beginner': 'Beginner',
  'family': 'Family',
  'backcountry': 'Backcountry',
  'park': 'Park & Freestyle',
};

// Type display order for grouping
export const SKI_LINK_TYPE_ORDER: SkiLinkType[] = [
  'resort',
  'snow-weather',
  'webcam-trailmap',
  'trip-planning',
  'gear-reviews',
  'education',
  'community',
  'news',
];
