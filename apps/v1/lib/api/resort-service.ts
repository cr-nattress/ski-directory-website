/**
 * Resort API Service
 *
 * This service provides resort data from Supabase.
 * It wraps the Supabase service to provide a consistent interface.
 */

import { Resort, ResortMapPin } from '@/lib/types';
import {
  ApiResponse,
  PaginatedResponse,
  ResortFilters,
  ResortSortBy,
  SortOrder,
  ResortQueryOptions,
  RegionalStats,
} from './types';
import { supabaseResortService } from './supabase-resort-service';

class ResortService {
  /**
   * GET /api/resorts/:slug
   * Fetch a single resort by its slug
   */
  async getResortBySlug(slug: string): Promise<ApiResponse<Resort | null>> {
    return supabaseResortService.getResortBySlug(slug);
  }

  /**
   * GET /api/resorts/:id
   * Fetch a single resort by its ID
   */
  async getResortById(id: string): Promise<ApiResponse<Resort | null>> {
    return supabaseResortService.getResortById(id);
  }

  /**
   * GET /api/resorts
   * Fetch all resorts with optional filtering, sorting, and pagination
   */
  async getResorts(options: ResortQueryOptions = {}): Promise<PaginatedResponse<Resort>> {
    return supabaseResortService.getResorts(options);
  }

  /**
   * GET /api/resorts/all
   * Fetch all active resorts without pagination (useful for dropdowns, maps, etc.)
   */
  async getAllResorts(): Promise<ApiResponse<Resort[]>> {
    return supabaseResortService.getAllResorts();
  }

  /**
   * GET /api/resorts/search?q=:query
   * Search resorts by name, description, or location
   */
  async searchResorts(query: string): Promise<ApiResponse<Resort[]>> {
    return supabaseResortService.searchResorts(query);
  }

  /**
   * GET /api/resorts/stats
   * Get regional statistics for all resorts
   */
  async getRegionalStats(): Promise<ApiResponse<RegionalStats>> {
    return supabaseResortService.getRegionalStats();
  }

  /**
   * GET /api/resorts/featured
   * Get featured resorts (e.g., highest rated, most snow, etc.)
   */
  async getFeaturedResorts(limit: number = 3): Promise<ApiResponse<Resort[]>> {
    return supabaseResortService.getFeaturedResorts(limit);
  }

  /**
   * GET /api/resorts/nearby?lat=:lat&lng=:lng&radius=:radius
   * Get resorts within a radius of a location
   */
  async getNearbyResorts(maxDistance: number): Promise<ApiResponse<Resort[]>> {
    return supabaseResortService.getNearbyResorts(maxDistance);
  }

  /**
   * GET /api/resorts/by-pass/:passType
   * Get resorts by pass affiliation
   */
  async getResortsByPass(passType: string): Promise<ApiResponse<Resort[]>> {
    return supabaseResortService.getResortsByPass(passType);
  }

  /**
   * GET /api/resorts/map-pins
   * Get optimized data for map pin display
   */
  async getMapPins(): Promise<ApiResponse<ResortMapPin[]>> {
    return supabaseResortService.getMapPins();
  }
}

// Export singleton instance
export const resortService = new ResortService();
