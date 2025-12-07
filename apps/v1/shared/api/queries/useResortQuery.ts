'use client';

import { useQuery } from '@tanstack/react-query';
import { resortService } from '@/lib/api/resort-service';
import { Resort } from '@/lib/api/types';
import { queryKeys } from '../queryKeys';

interface UseResortQueryOptions {
  enabled?: boolean;
}

/**
 * Query hook for fetching a single resort by slug.
 *
 * @example
 * const { data: resort, isLoading } = useResortQuery('vail');
 *
 * if (isLoading) return <Skeleton />;
 * if (!resort) return <NotFound />;
 * return <ResortDetail resort={resort} />;
 */
export function useResortQuery(
  slug: string | undefined,
  options: UseResortQueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.resorts.detail(slug ?? ''),
    queryFn: async () => {
      if (!slug) return null;

      const response = await resortService.getResortBySlug(slug);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resort');
      }
      return response.data;
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Query hook for fetching a single resort by ID.
 *
 * @example
 * const { data: resort } = useResortByIdQuery('123e4567-e89b-...');
 */
export function useResortByIdQuery(
  id: string | undefined,
  options: UseResortQueryOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['resorts', 'detail', 'id', id] as const,
    queryFn: async () => {
      if (!id) return null;

      const response = await resortService.getResortById(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to fetch resort');
      }
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}
