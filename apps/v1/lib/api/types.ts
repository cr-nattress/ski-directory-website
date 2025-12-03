/**
 * @module APITypes
 * @purpose Type definitions for the API layer
 * @context Shared types for requests, responses, filters, and hook results
 *
 * @exports
 * - Response types: ApiResponse, PaginatedResponse
 * - Filter types: ResortFilters, ResortQueryOptions
 * - Sort types: ResortSortBy, SortOrder
 * - Hook result types: UseResortResult, UseResortsResult, etc.
 * - Alert types: EventAlert, AlertType, AlertPriority
 */

import { Resort, ResortImage } from '@/lib/types';

// ============================================
// API Response Types
// ============================================

/**
 * Standard API response wrapper
 * @template T - The data type being returned
 */
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

/**
 * Paginated API response with navigation metadata
 * @template T - The data item type
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  status: 'success' | 'error';
  message?: string;
}

// ============================================
// Filter and Sort Types
// ============================================

/**
 * Filter options for resort queries
 * All filters are optional and combine with AND logic
 */
export interface ResortFilters {
  search?: string;
  passAffiliation?: string[];
  maxDistance?: number;
  minRating?: number;
  status?: 'open' | 'closed' | 'opening-soon';
  features?: {
    hasPark?: boolean;
    hasHalfpipe?: boolean;
    hasNightSkiing?: boolean;
    hasBackcountryAccess?: boolean;
    hasSpaVillage?: boolean;
  };
  tags?: string[];
}

/** Available sort fields for resort queries */
export type ResortSortBy = 'name' | 'distance' | 'rating' | 'snow' | 'reviewCount';

/** Sort direction */
export type SortOrder = 'asc' | 'desc';

/**
 * Combined query options for fetching resorts
 * Used by getResorts() and useResorts() hook
 */
export interface ResortQueryOptions {
  filters?: ResortFilters;
  sortBy?: ResortSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

// ============================================
// Hook Return Types
// ============================================

/**
 * Return type for useResort() hook
 * Provides single resort data with loading/error states
 */
export interface UseResortResult {
  resort: Resort | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Return type for useResorts() hook
 * Provides paginated resort list with loading/error states
 */
export interface UseResortsResult {
  resorts: Resort[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginatedResponse<Resort>['pagination'] | null;
  refetch: () => Promise<void>;
}

/**
 * Return type for useResortSearch() hook
 * Provides search results with imperative search function
 */
export interface UseResortSearchResult {
  results: Resort[];
  isLoading: boolean;
  error: Error | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

// ============================================
// Regional Statistics Types
// ============================================

/**
 * Aggregate statistics for all resorts in a region
 * Used in dashboard/overview displays
 */
export interface RegionalStats {
  totalResorts: number;
  openResorts: number;
  avgSnowfall24h: number;
  avgAnnualSnowfall: number;
}

/** Return type for useRegionalStats() hook */
export interface UseRegionalStatsResult {
  stats: RegionalStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Re-export types for convenience
export type { Resort, ResortImage };

// ============================================
// Alert System Types
// ============================================

/** Type of alert banner content */
export type AlertType = 'info' | 'snow-report' | 'weather' | 'safety' | 'system';

/** Alert urgency level - affects styling and display priority */
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

/** Origin of the alert data */
export type AlertSource = 'manual' | 'weather-api' | 'snow-api' | 'nws-api' | 'system';

/**
 * Event alert for the global banner system
 * Displays snow reports, weather warnings, and system messages
 *
 * @sideeffects
 * - Stored in localStorage when dismissed
 * - May trigger analytics events
 */
export interface EventAlert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  source: AlertSource;

  // Content
  title: string;
  message: string;

  // Optional link
  linkText?: string;
  linkUrl?: string;

  // Targeting (optional - for resort-specific alerts)
  resortSlug?: string; // null = global, specific = resort-only

  // Timing
  startsAt: string; // ISO date string
  expiresAt: string; // ISO date string

  // Behavior
  isDismissible: boolean;
  isPersistent: boolean; // If true, shows even after dismiss until expires

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/** API response for alert queries */
export interface AlertApiResponse {
  data: EventAlert[];
  status: 'success' | 'error';
  message?: string;
}

/** Return type for useEventBanner() hook */
export interface UseEventBannerResult {
  alerts: EventAlert[];
  activeAlert: EventAlert | null;
  isLoading: boolean;
  error: Error | null;
  dismissAlert: (alertId: string) => void;
  refetch: () => Promise<void>;
}
