'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Resort } from '@/lib/types';
import { getCardImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils/resort-images';
import { MapPin, Mountain } from 'lucide-react';
import { trackResortClick } from '@/lib/analytics';
import { getStateName } from '@/lib/data/geo-mappings';

interface RelatedResortsData {
  nearbyResorts: Resort[];
  stateResorts: Resort[];
}

interface RelatedResortsAccordionContentProps {
  resort: Resort;
}

/**
 * Client-side content for related resorts accordion
 * Fetches nearby and state resorts via API
 */
export function RelatedResortsAccordionContent({ resort }: RelatedResortsAccordionContentProps) {
  const [data, setData] = useState<RelatedResortsData | null>(null);
  const [loading, setLoading] = useState(true);

  const stateName = resort.stateCode ? getStateName(resort.stateCode) : '';

  useEffect(() => {
    async function fetchRelatedResorts() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/related`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedResorts();
  }, [resort.slug]);

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-500">
        Loading related resorts...
      </div>
    );
  }

  if (!data || (data.nearbyResorts.length === 0 && data.stateResorts.length === 0)) {
    return (
      <div className="text-gray-500 text-sm">
        No related resorts found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.nearbyResorts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Nearby Resorts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.nearbyResorts.map((relatedResort) => (
              <RelatedResortCard key={relatedResort.id} resort={relatedResort} />
            ))}
          </div>
        </div>
      )}
      {data.stateResorts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            More in {stateName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.stateResorts.map((relatedResort) => (
              <RelatedResortCard key={relatedResort.id} resort={relatedResort} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelatedResortCard({ resort }: { resort: Resort }) {
  return (
    <Link
      href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
      className="group flex bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      onClick={() => trackResortClick(resort.name, 'related')}
    >
      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100">
        <Image
          src={getCardImageUrl(resort) || PLACEHOLDER_IMAGE}
          alt={resort.name}
          fill
          className="object-cover"
          sizes="80px"
          unoptimized
        />
      </div>
      <div className="p-2 flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-900 group-hover:text-ski-blue transition-colors truncate">
          {resort.name}
        </h4>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{resort.nearestCity}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <Mountain className="w-3 h-3 flex-shrink-0" />
          <span>{resort.stats.skiableAcres.toLocaleString()} acres</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Hook to check if related resorts exist
 */
export function useRelatedResortsExist(resort: Resort): boolean {
  const [hasRelated, setHasRelated] = useState(false);

  useEffect(() => {
    async function checkRelated() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/related`);
        if (response.ok) {
          const data = await response.json();
          setHasRelated(
            (data.nearbyResorts?.length > 0) || (data.stateResorts?.length > 0)
          );
        }
      } catch {
        // Silently fail
      }
    }

    checkRelated();
  }, [resort.slug]);

  return hasRelated;
}
