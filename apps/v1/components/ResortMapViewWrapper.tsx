'use client';

import dynamic from 'next/dynamic';

const ResortMapView = dynamic(
  () => import('./ResortMapView').then((mod) => ({ default: mod.ResortMapView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] lg:h-[600px] bg-neutral-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-neutral-500">Loading map...</span>
      </div>
    ),
  }
);

export function ResortMapViewWrapper() {
  return <ResortMapView />;
}
