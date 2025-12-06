/**
 * Social Media Links Directory Types
 * Data model for ski-related social media profiles and channels
 */

export type SocialPlatform =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'reddit'
  | 'twitter'
  | 'discord'
  | 'forum';

export type SocialRegion =
  | 'colorado'
  | 'us'
  | 'north-america'
  | 'europe'
  | 'japan'
  | 'global';

export type SocialTopic =
  | 'instruction'
  | 'trip-vlog'
  | 'gear'
  | 'resort-official'
  | 'news'
  | 'meme'
  | 'backcountry'
  | 'safety'
  | 'race'
  | 'park'
  | 'family'
  | 'beginner-focus'
  | 'community';

export type SkillLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type ContentFormat =
  | 'short-form'
  | 'long-form'
  | 'live'
  | 'community';

export interface SocialLink {
  id: string;
  name: string;
  platform: SocialPlatform;
  handle: string;
  url: string;
  description: string;
  topics: SocialTopic[];
  regions: SocialRegion[];
  skillLevels: SkillLevel[];
  formats: ContentFormat[];
  isOfficial: boolean;
  isCommunity: boolean;
  metricsLabel?: string;
  priority: number;
  isFeatured?: boolean;
  relatedResortIds?: string[];
}

// Display labels for platforms
export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  reddit: 'Reddit',
  twitter: 'X / Twitter',
  discord: 'Discord',
  forum: 'Forum',
};

// Platform brand colors
export const SOCIAL_PLATFORM_COLORS: Record<SocialPlatform, string> = {
  youtube: '#FF0000',
  instagram: '#E4405F',
  tiktok: '#000000',
  facebook: '#1877F2',
  reddit: '#FF4500',
  twitter: '#000000',
  discord: '#5865F2',
  forum: '#6B7280',
};

// Platform background colors (lighter variants for badges)
export const SOCIAL_PLATFORM_BG_COLORS: Record<SocialPlatform, string> = {
  youtube: 'bg-red-100 text-red-700',
  instagram: 'bg-pink-100 text-pink-700',
  tiktok: 'bg-gray-900 text-white',
  facebook: 'bg-blue-100 text-blue-700',
  reddit: 'bg-orange-100 text-orange-700',
  twitter: 'bg-gray-100 text-gray-900',
  discord: 'bg-indigo-100 text-indigo-700',
  forum: 'bg-gray-100 text-gray-600',
};

// Display labels for topics
export const SOCIAL_TOPIC_LABELS: Record<SocialTopic, string> = {
  instruction: 'Instruction & Technique',
  'trip-vlog': 'Trip Reports & Vlogs',
  gear: 'Gear & Reviews',
  'resort-official': 'Resort & Official',
  news: 'News & Commentary',
  meme: 'Memes & Culture',
  backcountry: 'Backcountry & Touring',
  safety: 'Safety & Education',
  race: 'Racing',
  park: 'Park & Freestyle',
  family: 'Family & Kids',
  'beginner-focus': 'Beginner Focused',
  community: 'Communities & Groups',
};

// Display labels for regions
export const SOCIAL_REGION_LABELS: Record<SocialRegion, string> = {
  colorado: 'Colorado',
  us: 'United States',
  'north-america': 'North America',
  europe: 'Europe',
  japan: 'Japan',
  global: 'Global',
};

// Display labels for skill levels
export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

// Display labels for content formats
export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  'short-form': 'Short Form',
  'long-form': 'Long Form',
  live: 'Live',
  community: 'Community',
};

// Topic display order for grouping
export const SOCIAL_TOPIC_ORDER: SocialTopic[] = [
  'instruction',
  'trip-vlog',
  'gear',
  'resort-official',
  'backcountry',
  'safety',
  'news',
  'meme',
  'park',
  'race',
  'family',
  'beginner-focus',
  'community',
];

// Platform display order
export const SOCIAL_PLATFORM_ORDER: SocialPlatform[] = [
  'youtube',
  'instagram',
  'tiktok',
  'facebook',
  'reddit',
  'twitter',
  'discord',
  'forum',
];
