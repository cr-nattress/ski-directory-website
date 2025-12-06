/**
 * @module PaginationConfig
 * @purpose Centralized pagination settings for the application
 * @context Used by hooks and components that need page sizes
 *
 * @decision
 * Values configurable via environment variables to allow deployment-time
 * tuning without code changes. Defaults optimized for typical viewport sizes.
 *
 * @example
 * import { paginationConfig } from '@shared/config';
 * const pageSize = paginationConfig.landing.initialPageSize; // 12
 */

export const paginationConfig = {
  // ============================================
  // Landing Page Settings
  // ============================================
  landing: {
    /** Number of resorts to load initially */
    initialPageSize: parseInt(
      process.env.NEXT_PUBLIC_LANDING_PAGE_SIZE || '12',
      10
    ),

    /** Number of resorts to load on each subsequent fetch */
    loadMoreSize: parseInt(
      process.env.NEXT_PUBLIC_LOAD_MORE_SIZE || '12',
      10
    ),

    /** Pixels before bottom of container to trigger next load */
    scrollThreshold: 200,
  },

  // ============================================
  // Directory Page Settings
  // ============================================
  directory: {
    /** Number of resorts per page on directory */
    pageSize: 24,
  },

  // ============================================
  // Search Results Settings
  // ============================================
  search: {
    /** Number of results to show in search dropdown */
    suggestionLimit: 5,

    /** Number of results per page on search results page */
    pageSize: 20,
  },
} as const;

/**
 * Type representing pagination config sections
 */
export type PaginationConfigSection = keyof typeof paginationConfig;
