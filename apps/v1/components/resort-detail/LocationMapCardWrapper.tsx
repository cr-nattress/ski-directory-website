'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Resort } from '@/lib/types';
import { SkiShop, SkiShopsApiResponse, sortShopsByProximity } from '@/lib/types/ski-shop';

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
}

export function LocationMapCardWrapper({ resort }: LocationMapCardWrapperProps) {
  const [skiShops, setSkiShops] = useState<SkiShop[]>([]);

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

    fetchSkiShops();
  }, [resort.slug]);

  return <LocationMapCardDynamic resort={resort} skiShops={skiShops} />;
}
