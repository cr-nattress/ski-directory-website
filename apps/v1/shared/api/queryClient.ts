import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for TanStack Query.
 *
 * Configuration:
 * - staleTime: 2 minutes - data is considered fresh for this duration
 * - gcTime: 5 minutes - keep unused data in cache for quick re-access
 * - retry: 1 - retry failed requests once before showing error
 * - refetchOnWindowFocus: true - refetch stale data when user returns to tab
 * - refetchOnMount: false - don't refetch if data is still fresh
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 2 minutes
        staleTime: 2 * 60 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests once
        retry: 1,
        // Refetch on window focus for fresh data
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
    },
  });
}

// Singleton for client-side usage
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return createQueryClient();
  }

  // Browser: reuse the same query client
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
