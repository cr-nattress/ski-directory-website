/**
 * @module Hooks
 * @purpose React hooks for data fetching and state management
 * @context Client-side hooks for use in 'use client' components
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

// =============================================================================
// Data Fetching - Resort Data
// =============================================================================

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
export { useMapPins } from './useMapPins';
export { useResortConditions } from './useResortConditions';

// =============================================================================
// Data Fetching - Themed Sections
// =============================================================================

export { useThemedResorts } from './useThemedResorts';
export { useRankedResorts } from './useRankedResorts';
export { useInfiniteResorts } from './useInfiniteResorts';

// =============================================================================
// UI State Management
// =============================================================================

export { useViewMode } from './useViewMode';
export type { ViewMode } from './useViewMode';
export { useEventBanner } from './useEventBanner';
export { useFeatureFlag } from './useFeatureFlag';

// =============================================================================
// Analytics & Tracking
// =============================================================================

export {
  useImpressionTracking,
  useClickTracking,
  useResortTracking,
} from './useImpressionTracking';

// =============================================================================
// Utilities
// =============================================================================

export { useIntersectionObserver } from './useIntersectionObserver';
export { useLogger, createLogger } from './useLogger';
export { usePullToRefresh } from './usePullToRefresh';

// =============================================================================
// Type Exports
// =============================================================================

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
