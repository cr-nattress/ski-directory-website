/**
 * Pagination Configuration
 *
 * Centralized settings for pagination across the application.
 * Values can be overridden via environment variables.
 *
 * Usage:
 *   import { paginationConfig } from '@/lib/config/pagination';
 *   const pageSize = paginationConfig.landing.initialPageSize;
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
