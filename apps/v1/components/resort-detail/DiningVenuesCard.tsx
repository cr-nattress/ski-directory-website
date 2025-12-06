'use client';

import { useEffect, useState } from 'react';
import { Utensils, ChevronRight, Phone, Mountain, Wine, Beer, Coffee } from 'lucide-react';
import {
  DiningVenue,
  DiningApiResponse,
  calculateVenueTypeSummary,
  formatPhone,
  getTelLink,
  getVenueTypeLabel,
  sortVenuesByProximity,
  VenueType,
} from '@/lib/types/dining';
import type { Resort } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DiningVenuesCardProps {
  resort: Resort;
  className?: string;
}

function getVenueIcon(venueTypes: VenueType[]) {
  if (venueTypes.includes('bar')) return Wine;
  if (venueTypes.includes('brewery')) return Beer;
  if (venueTypes.includes('cafe')) return Coffee;
  return Utensils;
}

/**
 * Compact dining venues card for desktop sidebar
 * Shows venue type summary and top 3 venues with "See All" link
 * Fetches data from Supabase via API route
 */
export function DiningVenuesCard({
  resort,
  className,
}: DiningVenuesCardProps) {
  const [venues, setVenues] = useState<DiningVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/dining`);

        if (response.ok) {
          const data: DiningApiResponse = await response.json();
          setVenues(sortVenuesByProximity(data.venues || []));
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    }

    fetchVenues();
  }, [resort.slug]);

  // Don't render if loading or no venues
  if (isLoading) {
    return null; // Could show skeleton here
  }

  if (!venues || venues.length === 0) {
    return null;
  }

  const summary = calculateVenueTypeSummary(venues);
  const topVenues = venues.slice(0, 3);
  const hasMore = venues.length > 3;

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Nearby Dining</h3>
          </div>
          <span className="text-sm text-gray-500">({venues.length})</span>
        </div>
      </div>

      {/* Venue Type Summary */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {summary.restaurant > 0 && (
            <TypeBadge count={summary.restaurant} label="Restaurant" />
          )}
          {summary.bar > 0 && (
            <TypeBadge count={summary.bar} label="Bar" />
          )}
          {summary.brewery > 0 && (
            <TypeBadge count={summary.brewery} label="Brewery" />
          )}
          {summary.cafe > 0 && (
            <TypeBadge count={summary.cafe} label="Cafe" />
          )}
          {summary.lodge_dining > 0 && (
            <TypeBadge count={summary.lodge_dining} label="Lodge" />
          )}
        </div>
      </div>

      {/* Venue List */}
      <div className="divide-y divide-gray-100">
        {topVenues.map((venue) => (
          <CompactVenueRow key={venue.slug} venue={venue} />
        ))}
      </div>

      {/* See All Link */}
      {hasMore && (
        <button
          onClick={() => {
            // Scroll to dining section (on mobile accordion)
            document.getElementById('dining')?.scrollIntoView({
              behavior: 'smooth',
            });
          }}
          className={cn(
            'w-full px-6 py-3 flex items-center justify-center gap-1',
            'text-sm text-orange-600 font-medium',
            'hover:bg-gray-50 transition-colors',
            'border-t border-gray-100'
          )}
        >
          <span>See All {venues.length} Venues</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Compact venue row for sidebar card
 */
function CompactVenueRow({ venue }: { venue: DiningVenue }) {
  const telLink = getTelLink(venue.phone);
  const formattedPhone = formatPhone(venue.phone);
  const VenueIcon = getVenueIcon(venue.venue_type);

  return (
    <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        {/* Venue Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {venue.is_on_mountain && (
              <Mountain
                className="w-3.5 h-3.5 text-ski-blue flex-shrink-0"
                aria-label="On Mountain"
              />
            )}
            <span className="font-medium text-gray-900 text-sm truncate">
              {venue.name}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            <span className="font-medium text-gray-600">{venue.price_range}</span>
            {' • '}
            {venue.venue_type.map(getVenueTypeLabel).join(' • ')}
          </div>
          {formattedPhone && telLink && (
            <a
              href={telLink}
              className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline mt-1"
            >
              <Phone className="w-3 h-3" />
              {formattedPhone}
            </a>
          )}
        </div>

        {/* Distance */}
        <div className="text-xs text-gray-500 whitespace-nowrap pt-0.5">
          {venue.is_on_mountain ? (
            <span className="text-ski-blue font-medium">on-mtn</span>
          ) : (
            `${venue.distance_miles.toFixed(1)} mi`
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Small venue type count badge
 */
function TypeBadge({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded text-xs">
      <span className="font-semibold mr-1">{count}</span>
      {label}
    </span>
  );
}

export default DiningVenuesCard;
