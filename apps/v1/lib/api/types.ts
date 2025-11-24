import { Resort, ResortImage } from '../mock-data/types';

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

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

// Filter and sort options
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

export type ResortSortBy = 'name' | 'distance' | 'rating' | 'snow' | 'reviewCount';
export type SortOrder = 'asc' | 'desc';

export interface ResortQueryOptions {
  filters?: ResortFilters;
  sortBy?: ResortSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

// Hook return types
export interface UseResortResult {
  resort: Resort | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseResortsResult {
  resorts: Resort[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginatedResponse<Resort>['pagination'] | null;
  refetch: () => Promise<void>;
}

export interface UseResortSearchResult {
  results: Resort[];
  isLoading: boolean;
  error: Error | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

// Regional stats type
export interface RegionalStats {
  totalResorts: number;
  openResorts: number;
  avgSnowfall24h: number;
  avgAnnualSnowfall: number;
}

export interface UseRegionalStatsResult {
  stats: RegionalStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Re-export types from mock-data for convenience
export type { Resort, ResortImage };
