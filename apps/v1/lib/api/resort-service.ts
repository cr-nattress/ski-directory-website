/**
 * Resort API Service
 *
 * This service simulates API calls to a backend. When you're ready to connect
 * to a real API, replace the implementation of each method with actual fetch calls.
 *
 * Example real API implementation:
 * ```
 * async getResortBySlug(slug: string): Promise<ApiResponse<Resort>> {
 *   const response = await fetch(`${API_BASE_URL}/resorts/${slug}`);
 *   return response.json();
 * }
 * ```
 */

import { mockResorts } from '../mock-data/resorts';
import { Resort } from '../mock-data/types';
import {
  ApiResponse,
  PaginatedResponse,
  ResortFilters,
  ResortSortBy,
  SortOrder,
  ResortQueryOptions,
  RegionalStats,
} from './types';

// Simulated network delay (ms) - set to 0 for instant responses
const SIMULATED_DELAY = 300;

// Helper to simulate network latency
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to get only active resorts
function getActiveResorts(): Resort[] {
  return mockResorts.filter((r) => r.isActive);
}

// Helper to simulate random failures (for testing error handling)
// Set to 0 to disable, or a value like 0.1 for 10% failure rate
const FAILURE_RATE = 0;

function shouldFail(): boolean {
  return Math.random() < FAILURE_RATE;
}

class ResortService {
  /**
   * GET /api/resorts/:slug
   * Fetch a single resort by its slug
   */
  async getResortBySlug(slug: string): Promise<ApiResponse<Resort | null>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: null,
        status: 'error',
        message: 'Failed to fetch resort. Please try again.',
      };
    }

    const resort = mockResorts.find((r) => r.slug === slug) || null;

    if (!resort) {
      return {
        data: null,
        status: 'error',
        message: `Resort with slug "${slug}" not found.`,
      };
    }

    return {
      data: resort,
      status: 'success',
    };
  }

  /**
   * GET /api/resorts/:id
   * Fetch a single resort by its ID
   */
  async getResortById(id: string): Promise<ApiResponse<Resort | null>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: null,
        status: 'error',
        message: 'Failed to fetch resort. Please try again.',
      };
    }

    const resort = mockResorts.find((r) => r.id === id) || null;

    if (!resort) {
      return {
        data: null,
        status: 'error',
        message: `Resort with ID "${id}" not found.`,
      };
    }

    return {
      data: resort,
      status: 'success',
    };
  }

  /**
   * GET /api/resorts
   * Fetch all resorts with optional filtering, sorting, and pagination
   */
  async getResorts(options: ResortQueryOptions = {}): Promise<PaginatedResponse<Resort>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        status: 'error',
        message: 'Failed to fetch resorts. Please try again.',
      };
    }

    const {
      filters = {},
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      pageSize = 10,
    } = options;

    // Apply filters (start with only active resorts)
    let filtered = this.applyFilters(getActiveResorts(), filters);

    // Apply sorting
    filtered = this.applySorting(filtered, sortBy, sortOrder);

    // Calculate pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      status: 'success',
    };
  }

  /**
   * GET /api/resorts/all
   * Fetch all active resorts without pagination (useful for dropdowns, maps, etc.)
   */
  async getAllResorts(): Promise<ApiResponse<Resort[]>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: [],
        status: 'error',
        message: 'Failed to fetch resorts. Please try again.',
      };
    }

    return {
      data: getActiveResorts(),
      status: 'success',
    };
  }

  /**
   * GET /api/resorts/search?q=:query
   * Search resorts by name, description, or location
   */
  async searchResorts(query: string): Promise<ApiResponse<Resort[]>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: [],
        status: 'error',
        message: 'Search failed. Please try again.',
      };
    }

    if (!query || query.trim().length === 0) {
      return {
        data: [],
        status: 'success',
      };
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = getActiveResorts().filter(
      (resort) =>
        resort.name.toLowerCase().includes(normalizedQuery) ||
        resort.description.toLowerCase().includes(normalizedQuery) ||
        resort.nearestCity.toLowerCase().includes(normalizedQuery) ||
        resort.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );

    return {
      data: results,
      status: 'success',
    };
  }

  /**
   * GET /api/resorts/stats
   * Get regional statistics for all resorts
   */
  async getRegionalStats(): Promise<ApiResponse<RegionalStats>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: {
          totalResorts: 0,
          openResorts: 0,
          avgSnowfall24h: 0,
          avgAnnualSnowfall: 0,
        },
        status: 'error',
        message: 'Failed to fetch statistics. Please try again.',
      };
    }

    const activeResorts = getActiveResorts();
    const totalResorts = activeResorts.length;
    const openResorts = activeResorts.filter((r) => r.conditions.status === 'open').length;
    const avgSnowfall24h =
      activeResorts.reduce((sum, r) => sum + r.conditions.snowfall24h, 0) / totalResorts;
    const avgAnnualSnowfall =
      activeResorts.reduce((sum, r) => sum + r.stats.avgAnnualSnowfall, 0) / totalResorts;

    return {
      data: {
        totalResorts,
        openResorts,
        avgSnowfall24h: Math.round(avgSnowfall24h),
        avgAnnualSnowfall: Math.round(avgAnnualSnowfall),
      },
      status: 'success',
    };
  }

  /**
   * GET /api/resorts/featured
   * Get featured resorts (e.g., highest rated, most snow, etc.)
   */
  async getFeaturedResorts(limit: number = 3): Promise<ApiResponse<Resort[]>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: [],
        status: 'error',
        message: 'Failed to fetch featured resorts. Please try again.',
      };
    }

    // Get top-rated active resorts with recent snowfall
    const featured = getActiveResorts()
      .sort((a, b) => {
        // Sort by rating first, then by recent snowfall
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.conditions.snowfall24h - a.conditions.snowfall24h;
      })
      .slice(0, limit);

    return {
      data: featured,
      status: 'success',
    };
  }

  /**
   * GET /api/resorts/nearby?lat=:lat&lng=:lng&radius=:radius
   * Get resorts within a radius of a location (simplified using distance from Denver)
   */
  async getNearbyResorts(maxDistance: number): Promise<ApiResponse<Resort[]>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: [],
        status: 'error',
        message: 'Failed to fetch nearby resorts. Please try again.',
      };
    }

    const nearby = getActiveResorts()
      .filter((r) => r.distanceFromDenver <= maxDistance)
      .sort((a, b) => a.distanceFromDenver - b.distanceFromDenver);

    return {
      data: nearby,
      status: 'success',
    };
  }

  /**
   * GET /api/resorts/by-pass/:passType
   * Get resorts by pass affiliation
   */
  async getResortsByPass(passType: string): Promise<ApiResponse<Resort[]>> {
    await delay(SIMULATED_DELAY);

    if (shouldFail()) {
      return {
        data: [],
        status: 'error',
        message: 'Failed to fetch resorts. Please try again.',
      };
    }

    const resorts = getActiveResorts().filter((r) =>
      r.passAffiliations.includes(passType as any)
    );

    return {
      data: resorts,
      status: 'success',
    };
  }

  // Private helper methods

  private applyFilters(resorts: Resort[], filters: ResortFilters): Resort[] {
    let filtered = [...resorts];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (resort) =>
          resort.name.toLowerCase().includes(query) ||
          resort.description.toLowerCase().includes(query) ||
          resort.nearestCity.toLowerCase().includes(query)
      );
    }

    if (filters.passAffiliation && filters.passAffiliation.length > 0) {
      filtered = filtered.filter((resort) =>
        filters.passAffiliation!.some((pass) =>
          resort.passAffiliations.includes(pass as any)
        )
      );
    }

    if (filters.maxDistance !== undefined) {
      filtered = filtered.filter(
        (resort) => resort.distanceFromDenver <= filters.maxDistance!
      );
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter((resort) => resort.rating >= filters.minRating!);
    }

    if (filters.status) {
      filtered = filtered.filter((resort) => resort.conditions.status === filters.status);
    }

    if (filters.features) {
      const { features } = filters;
      if (features.hasPark !== undefined) {
        filtered = filtered.filter((r) => r.features.hasPark === features.hasPark);
      }
      if (features.hasHalfpipe !== undefined) {
        filtered = filtered.filter((r) => r.features.hasHalfpipe === features.hasHalfpipe);
      }
      if (features.hasNightSkiing !== undefined) {
        filtered = filtered.filter((r) => r.features.hasNightSkiing === features.hasNightSkiing);
      }
      if (features.hasBackcountryAccess !== undefined) {
        filtered = filtered.filter(
          (r) => r.features.hasBackcountryAccess === features.hasBackcountryAccess
        );
      }
      if (features.hasSpaVillage !== undefined) {
        filtered = filtered.filter((r) => r.features.hasSpaVillage === features.hasSpaVillage);
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((resort) =>
        filters.tags!.some((tag) => resort.tags.includes(tag))
      );
    }

    return filtered;
  }

  private applySorting(
    resorts: Resort[],
    sortBy: ResortSortBy,
    sortOrder: SortOrder
  ): Resort[] {
    const sorted = [...resorts];
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    switch (sortBy) {
      case 'distance':
        return sorted.sort(
          (a, b) => multiplier * (a.distanceFromDenver - b.distanceFromDenver)
        );
      case 'rating':
        return sorted.sort((a, b) => multiplier * (a.rating - b.rating));
      case 'snow':
        return sorted.sort(
          (a, b) => multiplier * (a.conditions.snowfall24h - b.conditions.snowfall24h)
        );
      case 'reviewCount':
        return sorted.sort((a, b) => multiplier * (a.reviewCount - b.reviewCount));
      case 'name':
      default:
        return sorted.sort((a, b) => multiplier * a.name.localeCompare(b.name));
    }
  }
}

// Export singleton instance
export const resortService = new ResortService();
