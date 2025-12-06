'use client';

import { Phone, MapPin, ExternalLink, Mountain, Utensils, Wine, Beer, Coffee } from 'lucide-react';
import {
  DiningVenue,
  DiningVenueCardProps,
  formatPhone,
  getTelLink,
  getDirectionsLink,
  getVenueTypeLabel,
  getCuisineTypeLabel,
  getMealTypes,
  formatDistance,
  VenueType,
} from '@/lib/types/dining';
import {
  trackDiningCall,
  trackDiningDirections,
  trackDiningWebsite,
} from '@/lib/analytics/dining-analytics';
import { cn } from '@/lib/utils';

function getVenueIcon(venueTypes: VenueType[]) {
  if (venueTypes.includes('bar')) return Wine;
  if (venueTypes.includes('brewery')) return Beer;
  if (venueTypes.includes('cafe')) return Coffee;
  return Utensils;
}

export function DiningVenueCard({
  venue,
  resortName,
  variant = 'full',
  showActions = true,
}: DiningVenueCardProps) {
  const telLink = getTelLink(venue.phone);
  const directionsLink = getDirectionsLink(venue);
  const formattedPhone = formatPhone(venue.phone);
  const mealTypes = getMealTypes(venue);
  const VenueIcon = getVenueIcon(venue.venue_type);

  if (variant === 'compact') {
    return <CompactVenueCard venue={venue} />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Header: Name + Badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {venue.is_on_mountain && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-ski-blue text-white text-xs font-semibold rounded">
                <Mountain className="w-3 h-3" />
                ON MOUNTAIN
              </div>
            )}
            {venue.is_ski_in_ski_out && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded">
                SKI-IN/OUT
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <span className="font-medium text-gray-700">{venue.price_range}</span>
            <span>•</span>
            <span>{venue.venue_type.map(getVenueTypeLabel).join(', ')}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {formatDistance(venue.distance_miles)}
        </div>
      </div>

      {/* Description */}
      {venue.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{venue.description}</p>
      )}

      {/* Cuisine & Meal Types */}
      <div className="flex flex-wrap gap-1.5">
        {venue.cuisine_type.slice(0, 3).map((type) => (
          <span
            key={type}
            className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded"
          >
            {getCuisineTypeLabel(type)}
          </span>
        ))}
        {mealTypes.length > 0 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            {mealTypes.join(' • ')}
          </span>
        )}
        {venue.has_full_bar && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
            Full Bar
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="space-y-2 pt-1">
          {/* Call Button */}
          {telLink && (
            <a
              href={telLink}
              onClick={() => {
                if (resortName) {
                  trackDiningCall(venue.name, resortName, venue.distance_miles, venue.venue_type);
                }
              }}
              className={cn(
                'flex items-center justify-center gap-2 w-full',
                'bg-ski-blue text-white font-medium',
                'py-3 px-4 rounded-lg',
                'hover:bg-blue-700 active:bg-blue-800',
                'transition-colors',
                'min-h-[44px]'
              )}
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
              {formattedPhone && (
                <span className="text-blue-100 text-sm hidden sm:inline">
                  {formattedPhone}
                </span>
              )}
            </a>
          )}

          {/* Directions Button */}
          <a
            href={directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (resortName) {
                trackDiningDirections(venue.name, resortName, venue.distance_miles, venue.venue_type);
              }
            }}
            className={cn(
              'flex items-center justify-center gap-2 w-full',
              'bg-gray-100 text-gray-700 font-medium',
              'py-3 px-4 rounded-lg',
              'hover:bg-gray-200 active:bg-gray-300',
              'transition-colors',
              'min-h-[44px]'
            )}
          >
            <MapPin className="w-4 h-4" />
            <span>Get Directions</span>
          </a>

          {/* Website Link */}
          {venue.website_url && (
            <a
              href={venue.website_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (resortName && venue.website_url) {
                  trackDiningWebsite(venue.name, resortName, venue.website_url, venue.venue_type);
                }
              }}
              className={cn(
                'flex items-center justify-center gap-1',
                'text-sm text-ski-blue hover:underline',
                'py-2',
                'min-h-[44px]'
              )}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Website</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact variant for desktop sidebar
 */
function CompactVenueCard({ venue }: { venue: DiningVenue }) {
  const formattedPhone = formatPhone(venue.phone);
  const telLink = getTelLink(venue.phone);
  const VenueIcon = getVenueIcon(venue.venue_type);

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {venue.is_on_mountain && (
              <Mountain className="w-3.5 h-3.5 text-ski-blue flex-shrink-0" />
            )}
            <span className="font-medium text-gray-900 text-sm truncate">
              {venue.name}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            <span className="font-medium text-gray-600">{venue.price_range}</span>
            {' • '}
            {venue.venue_type.map(getVenueTypeLabel).join(', ')}
          </div>
          {formattedPhone && telLink && (
            <a
              href={telLink}
              className="text-xs text-ski-blue hover:underline mt-0.5 inline-block"
            >
              {formattedPhone}
            </a>
          )}
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap">
          {venue.is_on_mountain ? 'on-mtn' : formatDistance(venue.distance_miles)}
        </div>
      </div>
    </div>
  );
}

export default DiningVenueCard;
