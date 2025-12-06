'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Resort } from '@/lib/types';
import { SkiShop, SkiShopsApiResponse, sortShopsByProximity } from '@/lib/types/ski-shop';
import { DiningVenue, DiningApiResponse, sortVenuesByProximity } from '@/lib/types/dining';

const LocationMapCardDynamic = dynamic(
  () => import('./LocationMapCard').then((mod) => mod.LocationMapCard),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2">Location</h3>
        <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }
);

interface LocationMapCardWrapperProps {
  resort: Resort;
  /** When true, card fills parent height (for hero alignment) */
  fillHeight?: boolean;
}

export function LocationMapCardWrapper({ resort, fillHeight = false }: LocationMapCardWrapperProps) {
  const [skiShops, setSkiShops] = useState<SkiShop[]>([]);
  const [diningVenues, setDiningVenues] = useState<DiningVenue[]>([]);

  useEffect(() => {
    async function fetchSkiShops() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/ski-shops`);
        if (response.ok) {
          const data: SkiShopsApiResponse = await response.json();
          setSkiShops(sortShopsByProximity(data.shops || []));
        }
      } catch {
        // Silently fail - map will just show without ski shops
      }
    }

    async function fetchDiningVenues() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/dining`);
        if (response.ok) {
          const data: DiningApiResponse = await response.json();
          setDiningVenues(sortVenuesByProximity(data.venues || []));
        }
      } catch {
        // Silently fail - map will just show without dining venues
      }
    }

    fetchSkiShops();
    fetchDiningVenues();
  }, [resort.slug]);

  return (
    <LocationMapCardDynamic
      resort={resort}
      skiShops={skiShops}
      diningVenues={diningVenues}
      fillHeight={fillHeight}
    />
  );
}
