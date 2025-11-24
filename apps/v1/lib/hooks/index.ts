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
} from '../api/types';
