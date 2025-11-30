// Resort Hooks - React hooks for fetching resort data
// These hooks simulate API behavior and will work seamlessly when
// connected to a real backend.

export { useResort, useResortById } from './useResort';
export {
  useResorts,
  useAllResorts,
  useFeaturedResorts,
  useNearbyResorts,
  useResortsByPass,
} from './useResorts';
export { useResortSearch, useInstantResortSearch } from './useResortSearch';
export { useRegionalStats } from './useRegionalStats';
export { useEventBanner } from './useEventBanner';
export { useMapPins } from './useMapPins';
export { useViewMode } from './useViewMode';
export type { ViewMode } from './useViewMode';
export {
  useImpressionTracking,
  useClickTracking,
  useResortTracking,
} from './useImpressionTracking';

// Re-export types for convenience
export type {
  Resort,
  ResortImage,
  ResortFilters,
  ResortQueryOptions,
  ResortSortBy,
  SortOrder,
  UseResortResult,
  UseResortsResult,
  UseResortSearchResult,
  UseRegionalStatsResult,
  RegionalStats,
  // Alert types
  AlertType,
  AlertPriority,
  AlertSource,
  EventAlert,
  UseEventBannerResult,
} from '../api/types';
