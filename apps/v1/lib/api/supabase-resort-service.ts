/**
 * Supabase Resort API Service
 *
 * This service fetches resort data from Supabase and converts it to the
 * frontend Resort type using the adapter. It implements the same interface
 * as the mock data service for seamless migration.
 */

import { supabase } from "@/lib/supabase";
import type { ResortFull } from "@/types/supabase";
import { adaptResortFromSupabase, adaptResortsFromSupabase } from "./supabase-resort-adapter";
import type { Resort, ResortMapPin, PassAffiliation } from "@/lib/types";
import type {
  ApiResponse,
  PaginatedResponse,
  ResortFilters,
  ResortSortBy,
  SortOrder,
  ResortQueryOptions,
  RegionalStats,
} from "./types";
import { createLogger } from "@/lib/hooks/useLogger";

// Create a logger for this service
const log = createLogger('SupabaseResortService');

class SupabaseResortService {
  /**
   * GET /api/resorts/:slug
   * Fetch a single resort by its slug
   */
  async getResortBySlug(slug: string): Promise<ApiResponse<Resort | null>> {
    log.info('Fetching resort by slug', { slug });

    const { data, error } = await supabase
      .from("resorts_full")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        log.warn('Resort not found', { slug, errorCode: error.code });
        return {
          data: null,
          status: "error",
          message: `Resort with slug "${slug}" not found.`,
        };
      }
      log.error('Failed to fetch resort by slug', {
        slug,
        errorCode: error.code,
        errorMessage: error.message,
      });
      return {
        data: null,
        status: "error",
        message: error.message || "Failed to fetch resort. Please try again.",
      };
    }

    log.info('Resort fetched successfully', { slug, hasData: !!data });
    return {
      data: adaptResortFromSupabase(data),
      status: "success",
    };
  }

  /**
   * GET /api/resorts/:id
   * Fetch a single resort by its ID
   */
  async getResortById(id: string): Promise<ApiResponse<Resort | null>> {
    const { data, error } = await supabase
      .from("resorts_full")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          data: null,
          status: "error",
          message: `Resort with ID "${id}" not found.`,
        };
      }
      return {
        data: null,
        status: "error",
        message: error.message || "Failed to fetch resort. Please try again.",
      };
    }

    return {
      data: adaptResortFromSupabase(data),
      status: "success",
    };
  }

  /**
   * GET /api/resorts
   * Fetch all resorts with optional filtering, sorting, and pagination
   */
  async getResorts(options: ResortQueryOptions = {}): Promise<PaginatedResponse<Resort>> {
    const {
      filters = {},
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      pageSize = 10,
    } = options;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("resorts_full").select("*", { count: "exact" });

    // Only show active resorts by default
    query = query.eq("is_active", true);

    // Apply filters
    if (filters.search) {
      query = query.textSearch("fts", filters.search, {
        type: "websearch",
        config: "english",
      });
    }

    if (filters.passAffiliation && filters.passAffiliation.length > 0) {
      query = query.overlaps("pass_affiliations", filters.passAffiliation);
    }

    if (filters.status) {
      // Filter by is_open for seasonal open/closed status
      const isOpen = filters.status === "open" || filters.status === "opening-soon";
      query = query.eq("is_open", isOpen);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps("tags", filters.tags);
    }

    // Apply sorting
    const sortColumn = this.mapSortField(sortBy);
    query = query.order(sortColumn, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
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
        status: "error",
        message: error.message || "Failed to fetch resorts. Please try again.",
      };
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: adaptResortsFromSupabase(data || []),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      status: "success",
    };
  }

  /**
   * GET /api/resorts/all
   * Fetch all active resorts without pagination
   */
  async getAllResorts(): Promise<ApiResponse<Resort[]>> {
    const { data, error } = await supabase
      .from("resorts_full")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      return {
        data: [],
        status: "error",
        message: error.message || "Failed to fetch resorts. Please try again.",
      };
    }

    return {
      data: adaptResortsFromSupabase(data || []),
      status: "success",
    };
  }

  /**
   * GET /api/resorts/search?q=:query
   * Search resorts by name, description, or location
   */
  async searchResorts(query: string): Promise<ApiResponse<Resort[]>> {
    if (!query || query.trim().length === 0) {
      return {
        data: [],
        status: "success",
      };
    }

    const { data, error } = await supabase
      .from("resorts_full")
      .select("*")
      .eq("is_active", true)
      .textSearch("fts", query, { type: "websearch", config: "english" })
      .limit(20);

    if (error) {
      return {
        data: [],
        status: "error",
        message: error.message || "Search failed. Please try again.",
      };
    }

    return {
      data: adaptResortsFromSupabase(data || []),
      status: "success",
    };
  }

  /**
   * GET /api/resorts/stats
   * Get regional statistics for all resorts
   */
  async getRegionalStats(): Promise<ApiResponse<RegionalStats>> {
    const { count: totalResorts } = await supabase
      .from("resorts")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const { count: activeResorts } = await supabase
      .from("resorts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    return {
      data: {
        totalResorts: totalResorts || 0,
        openResorts: activeResorts || 0,
        avgSnowfall24h: 0, // Would come from weather API
        avgAnnualSnowfall: 0, // Could calculate from stats JSONB
      },
      status: "success",
    };
  }

  /**
   * GET /api/resorts/featured
   * Get featured resorts (highest rated, etc.)
   */
  async getFeaturedResorts(limit: number = 3): Promise<ApiResponse<Resort[]>> {
    const { data, error } = await supabase
      .from("resorts_full")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .limit(limit);

    if (error) {
      return {
        data: [],
        status: "error",
        message: error.message || "Failed to fetch featured resorts. Please try again.",
      };
    }

    return {
      data: adaptResortsFromSupabase(data || []),
      status: "success",
    };
  }

  /**
   * GET /api/resorts/nearby?maxDistance=:distance
   * Get resorts within a radius (simplified - returns all for now)
   */
  async getNearbyResorts(maxDistance: number): Promise<ApiResponse<Resort[]>> {
    // For now, just return all active resorts
    // Could implement PostGIS distance query if we had a reference point
    const { data, error } = await supabase
      .from("resorts_full")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      return {
        data: [],
        status: "error",
        message: error.message || "Failed to fetch nearby resorts. Please try again.",
      };
    }

    return {
      data: adaptResortsFromSupabase(data || []),
      status: "success",
    };
  }

  /**
   * GET /api/resorts/by-pass/:passType
   * Get resorts by pass affiliation
   */
  async getResortsByPass(passType: string): Promise<ApiResponse<Resort[]>> {
    const { data, error } = await supabase
      .from("resorts_full")
      .select("*")
      .eq("is_active", true)
      .contains("pass_affiliations", [passType])
      .order("name");

    if (error) {
      return {
        data: [],
        status: "error",
        message: error.message || "Failed to fetch resorts. Please try again.",
      };
    }

    return {
      data: adaptResortsFromSupabase(data || []),
      status: "success",
    };
  }

  /**
   * Get resorts by state
   */
  async getResortsByState(stateSlug: string): Promise<ApiResponse<Resort[]>> {
    const { data, error } = await supabase
      .from("resorts_full")
      .select("*")
      .eq("state", stateSlug)
      .eq("is_active", true)
      .order("name");

    if (error) {
      return {
        data: [],
        status: "error",
        message: error.message || "Failed to fetch resorts. Please try again.",
      };
    }

    return {
      data: adaptResortsFromSupabase(data || []),
      status: "success",
    };
  }

  /**
   * Get all resort slugs for static generation
   */
  async getAllResortSlugs(): Promise<string[]> {
    log.info('Fetching all resort slugs');

    const { data, error } = await supabase
      .from("resorts")
      .select("slug")
      .order("slug");

    if (error) {
      log.error('Failed to fetch resort slugs', {
        errorCode: error.code,
        errorMessage: error.message,
      });
      return [];
    }

    const slugs = data?.map((r: { slug: string }) => r.slug) || [];
    log.info('Resort slugs fetched', { count: slugs.length });
    return slugs;
  }

  /**
   * GET /api/resorts/map-pins
   * Fetch optimized data for map pin display
   */
  async getMapPins(): Promise<ApiResponse<ResortMapPin[]>> {
    log.info('Fetching map pins');

    // Query the resorts_map_pins view - using explicit type since view isn't in generated types
    const { data, error } = await supabase
      .from("resorts_map_pins" as any)
      .select("*");

    if (error) {
      log.error('Failed to fetch map pins', {
        errorCode: error.code,
        errorMessage: error.message,
      });
      return {
        data: [],
        status: "error",
        message: error.message || "Failed to fetch map pins. Please try again.",
      };
    }

    // Transform snake_case database fields to camelCase
    // Filter to only include active resorts (exclude lost/defunct)
    const pins: ResortMapPin[] = ((data as any[]) || [])
      .filter((row) => row.is_active === true)
      .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      latitude: row.latitude,
      longitude: row.longitude,
      nearestCity: row.nearest_city || "",
      countryCode: row.country_code || "us",
      stateCode: row.state_code || "",
      passAffiliations: (row.pass_affiliations || []) as PassAffiliation[],
      rating: row.rating || 0,
      status: this.mapStatus(row.is_open ?? false),
      isActive: row.is_active,
      isLost: row.is_lost,
      terrainOpenPercent: row.terrain_open_percent,
      snowfall24h: row.snowfall_24h,
    }));

    return {
      data: pins,
      status: "success",
    };
  }

  // Helper to map database is_open to frontend status type
  private mapStatus(isOpen: boolean): 'open' | 'closed' | 'opening-soon' {
    return isOpen ? 'open' : 'closed';
  }

  // Helper to map frontend sort fields to database columns
  private mapSortField(sortBy: ResortSortBy): string {
    const sortMap: Record<ResortSortBy, string> = {
      name: "name",
      distance: "name", // Would need distance column
      rating: "name", // Would need rating column
      snow: "name", // Would need snowfall column
      reviewCount: "name", // Would need review_count column
    };
    return sortMap[sortBy] || "name";
  }

  /**
   * Fetch resort conditions by resort ID
   */
  async getResortConditions(resortId: string) {
    log.info('Fetching resort conditions', { resortId });

    const { data, error } = await supabase
      .from("resort_conditions")
      .select("*")
      .eq("resort_id", resortId)
      .single();

    if (error && error.code !== "PGRST116") {
      log.error('Failed to fetch conditions', { resortId, error: error.message });
      return null;
    }

    return data;
  }

  /**
   * Fetch resort conditions by slug
   */
  async getResortConditionsBySlug(slug: string) {
    log.info('Fetching resort conditions by slug', { slug });

    // First get the resort ID
    const { data: resort, error: resortError } = await supabase
      .from("resorts")
      .select("id")
      .eq("slug", slug)
      .single<{ id: string }>();

    if (resortError || !resort) {
      log.warn('Resort not found for conditions', { slug });
      return null;
    }

    return this.getResortConditions(resort.id);
  }
}

// Export singleton instance
export const supabaseResortService = new SupabaseResortService();
