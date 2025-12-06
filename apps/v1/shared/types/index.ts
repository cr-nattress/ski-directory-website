/**
 * @module Shared Types
 * @purpose Centralized type exports for the ski resort directory
 * @context Imported throughout the application for type safety
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

// Liftie (real-time conditions) types
export type {
  LiftStatus,
  LiftStats,
  LiftStatsWithPercentage,
  LiftieSummary,
  LiftieLifts,
  LiftieWeather,
  LiftieWebcam,
  LiftieWebcams,
  LiftieResortData,
  ResortConditions,
} from './liftie';

export {
  getTotalLifts,
  getLiftStatusColor,
  getLiftStatusBgColor,
  getLiftStatusStyle,
  getWeatherIconClass,
  isConditionsStale,
  formatUpdatedAgo,
} from './liftie';

// Wikipedia types
export type {
  WikipediaMediaItem,
  WikipediaInfobox,
  WikipediaResortData,
} from './wikipedia';

export {
  getBestImageUrl,
  getPrimaryImage,
  getPrimaryImageUrl,
} from './wikipedia';

// Dining types
export type {
  VenueType,
  CuisineType,
  PriceRange,
  Ambiance,
  VenueFeature,
  MountainLocation,
  DiningVenue,
  DiningApiResponse,
  VenueTypeSummary,
  DiningVenueCardProps,
  DiningListProps,
} from './dining';

export {
  formatPhone,
  getTelLink,
  getDirectionsLink,
  calculateVenueTypeSummary,
  getVenueTypeLabel,
  getCuisineTypeLabel,
  getAmbianceLabel,
  getFeatureLabel,
  getMealTypes,
  formatPriceRange,
  getPriceRangeDescription,
  formatDistance,
  formatDriveTime,
  sortVenuesByProximity,
  VENUE_TYPE_COLORS,
  getVenueColor,
} from './dining';

// Ski Shop types
export type {
  ShopType,
  ShopService,
  SkiShop,
  SkiShopsApiResponse,
  ShopServicesSummary,
  SkiShopCardProps,
  SkiShopsListProps,
} from './ski-shop';

export {
  formatPhone as formatShopPhone,
  getTelLink as getShopTelLink,
  getDirectionsLink as getShopDirectionsLink,
  calculateServicesSummary,
  getShopTypeLabel,
  getServiceLabel,
  sortShopsByProximity,
} from './ski-shop';
