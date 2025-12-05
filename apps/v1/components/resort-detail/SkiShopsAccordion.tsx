'use client';

import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import {
  SkiShop,
  SkiShopsData,
  sortShopsByProximity,
} from '@/lib/types/ski-shop';
import { SkiShopsList, SkiShopsListSkeleton } from './SkiShopsList';
import type { Resort } from '@/lib/types';

interface SkiShopsAccordionContentProps {
  resort: Resort;
}

/**
 * Helper to construct asset path from resort data
 */
function getAssetPath(resort: Resort): string | null {
  if (resort.assetLocation) {
    return `${resort.assetLocation.country}/${resort.assetLocation.state}/${resort.assetLocation.slug}`;
  }
  if (resort.countryCode && resort.stateCode && resort.slug) {
    return `${resort.countryCode}/${resort.stateCode}/${resort.slug}`;
  }
  return null;
}

const GCS_BASE_URL = 'https://storage.googleapis.com/sda-assets-prod';

/**
 * Ski shops content for mobile accordion
 * Fetches data client-side to avoid making ResortDetail async
 */
export function SkiShopsAccordionContent({
  resort,
}: SkiShopsAccordionContentProps) {
  const [shops, setShops] = useState<SkiShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetPath = getAssetPath(resort);

  useEffect(() => {
    async function fetchShops() {
      if (!assetPath) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${GCS_BASE_URL}/resorts/${assetPath}/ski-shops.json`
        );

        if (!response.ok) {
          if (response.status === 404) {
            // No ski shops data for this resort
            setShops([]);
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data: SkiShopsData = await response.json();
        setShops(sortShopsByProximity(data.shops || []));
      } catch (err) {
        console.error('Failed to fetch ski shops:', err);
        setError('Failed to load ski shops');
      } finally {
        setIsLoading(false);
      }
    }

    fetchShops();
  }, [assetPath]);

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
  const assetPath = getAssetPath(resort);

  useEffect(() => {
    async function fetchCount() {
      if (!assetPath) return;

      try {
        const response = await fetch(
          `${GCS_BASE_URL}/resorts/${assetPath}/ski-shops.json`
        );

        if (response.ok) {
          const data: SkiShopsData = await response.json();
          setShopCount(data.shops?.length || 0);
        }
      } catch {
        // Silently fail - will just not show count
      }
    }

    fetchCount();
  }, [assetPath]);

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
  const assetPath = getAssetPath(resort);

  useEffect(() => {
    async function check() {
      if (!assetPath) {
        setExists(false);
        return;
      }

      try {
        const response = await fetch(
          `${GCS_BASE_URL}/resorts/${assetPath}/ski-shops.json`,
          { method: 'HEAD' }
        );
        setExists(response.ok);
      } catch {
        setExists(false);
      }
    }

    check();
  }, [assetPath]);

  return exists;
}

export default SkiShopsAccordionContent;
