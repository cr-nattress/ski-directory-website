'use client';

import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import {
  SkiShop,
  SkiShopsApiResponse,
  sortShopsByProximity,
} from '@/lib/types/ski-shop';
import { SkiShopsList, SkiShopsListSkeleton } from './SkiShopsList';
import type { Resort } from '@/lib/types';

interface SkiShopsAccordionContentProps {
  resort: Resort;
}

/**
 * Ski shops content for mobile accordion
 * Fetches data from Supabase via API route
 */
export function SkiShopsAccordionContent({
  resort,
}: SkiShopsAccordionContentProps) {
  const [shops, setShops] = useState<SkiShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShops() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/ski-shops`);

        if (!response.ok) {
          if (response.status === 404) {
            // No ski shops data for this resort
            setShops([]);
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data: SkiShopsApiResponse = await response.json();
        setShops(sortShopsByProximity(data.shops || []));
      } catch (err) {
        console.error('Failed to fetch ski shops:', err);
        setError('Failed to load ski shops');
      } finally {
        setIsLoading(false);
      }
    }

    fetchShops();
  }, [resort.slug]);

  if (isLoading) {
    return (
      <div className="px-1">
        <SkiShopsListSkeleton count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        {error}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No ski shops found nearby</p>
      </div>
    );
  }

  return (
    <div className="px-1">
      <SkiShopsList
        shops={shops}
        resortName={resort.name}
        initialCount={3}
        showServiceSummary={true}
        enableFiltering={true}
        variant="full"
      />
    </div>
  );
}

interface SkiShopsAccordionHeaderProps {
  resort: Resort;
}

/**
 * Header for the accordion section
 * Shows shop count when data is loaded
 */
export function SkiShopsAccordionHeader({
  resort,
}: SkiShopsAccordionHeaderProps) {
  const [shopCount, setShopCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/ski-shops`);

        if (response.ok) {
          const data: SkiShopsApiResponse = await response.json();
          setShopCount(data.count || 0);
        }
      } catch {
        // Silently fail - will just not show count
      }
    }

    fetchCount();
  }, [resort.slug]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-gray-500" />
        <span>Ski Shops</span>
      </div>
      {shopCount !== null && shopCount > 0 && (
        <span className="text-sm text-gray-500">{shopCount} nearby</span>
      )}
    </div>
  );
}

/**
 * Check if ski shops data exists for a resort
 * Used to conditionally render the accordion section
 */
export function useSkiShopsExist(resort: Resort): boolean {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/ski-shops`);
        if (response.ok) {
          const data: SkiShopsApiResponse = await response.json();
          setExists(data.count > 0);
        } else {
          setExists(false);
        }
      } catch {
        setExists(false);
      }
    }

    check();
  }, [resort.slug]);

  return exists;
}

export default SkiShopsAccordionContent;
