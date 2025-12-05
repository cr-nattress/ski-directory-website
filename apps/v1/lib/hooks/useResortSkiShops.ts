'use client';

import useSWR from 'swr';

interface SkiShop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: string[];
  services: string[];
  distance_miles: number;
  is_on_mountain: boolean;
  proximity_label: string;
  verified: boolean;
}

interface UseResortSkiShopsOptions {
  maxDistance?: number;
  types?: string[];
  limit?: number;
}

interface UseResortSkiShopsResult {
  shops: SkiShop[];
  isLoading: boolean;
  error: Error | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useResortSkiShops(
  resortSlug: string,
  options: UseResortSkiShopsOptions = {}
): UseResortSkiShopsResult {
  const { maxDistance = 30, types, limit = 20 } = options;

  const params = new URLSearchParams();
  params.set('maxDistance', maxDistance.toString());
  params.set('limit', limit.toString());
  if (types && types.length > 0) {
    params.set('types', types.join(','));
  }

  const { data, error, isLoading } = useSWR(
    resortSlug ? `/api/resorts/${resortSlug}/ski-shops?${params}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    shops: data?.shops || [],
    isLoading,
    error: error || null,
  };
}
