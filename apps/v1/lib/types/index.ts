/**
 * Centralized Type Exports
 * All shared types for the ski resort directory
 */

// Resort types
export type {
  PassAffiliation,
  NamedItem,
  ItemCollection,
  ResortImage,
  Resort,
} from './resort';

// Map types
export type { ResortMapPin } from './map';

// Category types
export type { Category } from './category';

// Article types
export type { Article } from './article';

// Ski Links types
export type {
  SkiLinkType,
  SkiLinkRegion,
  SkiLinkAudience,
  SkiLink,
} from './ski-links';

export {
  SKI_LINK_TYPE_LABELS,
  SKI_LINK_REGION_LABELS,
  SKI_LINK_AUDIENCE_LABELS,
  SKI_LINK_TYPE_ORDER,
} from './ski-links';

// Social Links types
export type {
  SocialPlatform,
  SocialRegion,
  SocialTopic,
  SkillLevel,
  ContentFormat,
  SocialLink,
} from './social-links';

export {
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORM_COLORS,
  SOCIAL_PLATFORM_BG_COLORS,
  SOCIAL_TOPIC_LABELS,
  SOCIAL_REGION_LABELS,
  SKILL_LEVEL_LABELS,
  CONTENT_FORMAT_LABELS,
  SOCIAL_TOPIC_ORDER,
  SOCIAL_PLATFORM_ORDER,
} from './social-links';
