/**
 * @module Hooks
 * @purpose React hooks for data fetching and state management
 * @context Client-side hooks for use in 'use client' components
 *
 * @exports
 * - Data fetching: useResort, useResorts, useMapPins, useResortSearch
 * - UI state: useViewMode, useEventBanner
 * - Analytics: useImpressionTracking, useClickTracking, useResortTracking
 * - Utilities: useRegionalStats, useInfiniteResorts, useRankedResorts
 *
 * @pattern
 * All data hooks follow a consistent pattern:
 * - Return { data, isLoading, error, refetch }
 * - Handle loading states internally
 * - Support optional caching (localStorage for map pins, view mode)
 *
 * @sideeffects
 * - Network requests to Supabase
 * - localStorage reads/writes (useMapPins, useViewMode)
 */

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
