'use client';

import { useEffect, useState } from 'react';
import { Utensils } from 'lucide-react';
import {
  DiningVenue,
  DiningApiResponse,
  sortVenuesByProximity,
} from '@/lib/types/dining';
import { DiningVenuesList, DiningVenuesListSkeleton } from './DiningVenuesList';
import type { Resort } from '@/lib/types';

interface DiningVenuesAccordionContentProps {
  resort: Resort;
}

/**
 * Dining venues content for mobile accordion
 * Fetches data from Supabase via API route
 */
export function DiningVenuesAccordionContent({
  resort,
}: DiningVenuesAccordionContentProps) {
  const [venues, setVenues] = useState<DiningVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/dining`);

        if (!response.ok) {
          if (response.status === 404) {
            // No dining data for this resort
            setVenues([]);
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data: DiningApiResponse = await response.json();
        setVenues(sortVenuesByProximity(data.venues || []));
      } catch (err) {
        console.error('Failed to fetch dining venues:', err);
        setError('Failed to load dining venues');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVenues();
  }, [resort.slug]);

  if (isLoading) {
    return (
      <div className="px-1">
        <DiningVenuesListSkeleton count={2} />
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

  if (venues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No dining venues found nearby</p>
      </div>
    );
  }

  return (
    <div className="px-1">
      <DiningVenuesList
        venues={venues}
        resortName={resort.name}
        initialCount={3}
        showTypeSummary={true}
        enableFiltering={true}
        variant="full"
      />
    </div>
  );
}

interface DiningVenuesAccordionHeaderProps {
  resort: Resort;
}

/**
 * Header for the accordion section
 * Shows venue count when data is loaded
 */
export function DiningVenuesAccordionHeader({
  resort,
}: DiningVenuesAccordionHeaderProps) {
  const [venueCount, setVenueCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/dining`);

        if (response.ok) {
          const data: DiningApiResponse = await response.json();
          setVenueCount(data.count || 0);
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
        <Utensils className="w-5 h-5 text-gray-500" />
        <span>Dining</span>
      </div>
      {venueCount !== null && venueCount > 0 && (
        <span className="text-sm text-gray-500">{venueCount} nearby</span>
      )}
    </div>
  );
}

/**
 * Check if dining data exists for a resort
 * Used to conditionally render the accordion section
 */
export function useDiningVenuesExist(resort: Resort): boolean {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/dining`);
        if (response.ok) {
          const data: DiningApiResponse = await response.json();
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

export default DiningVenuesAccordionContent;
