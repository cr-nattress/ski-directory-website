'use client';

import dynamic from 'next/dynamic';
import { Resort } from '@/lib/types';

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
  return <LocationMapCardDynamic resort={resort} />;
}
