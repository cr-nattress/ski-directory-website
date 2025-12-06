'use client';

import { useEffect, useState } from 'react';
import { Store, Utensils, ChevronRight, Phone, Mountain, Wine, Beer, Coffee, MapPin } from 'lucide-react';
import {
  SkiShop,
  SkiShopsApiResponse,
  calculateServicesSummary,
  formatPhone as formatShopPhone,
  getTelLink as getShopTelLink,
  getShopTypeLabel,
  sortShopsByProximity,
} from '@/lib/types/ski-shop';
import {
  DiningVenue,
  DiningApiResponse,
  calculateVenueTypeSummary,
  formatPhone as formatVenuePhone,
  getTelLink as getVenueTelLink,
  getVenueTypeLabel,
  sortVenuesByProximity,
  VenueType,
} from '@/lib/types/dining';
import type { Resort } from '@/lib/types';
import { cn } from '@/lib/utils';

type TabType = 'shops' | 'dining';

interface NearbyServicesCardProps {
  resort: Resort;
  className?: string;
  defaultTab?: TabType;
  /** Use 'minimal' inside accordion to remove card border/shadow */
  variant?: 'card' | 'minimal';
}

function getVenueIcon(venueTypes: VenueType[]) {
  if (venueTypes.includes('bar')) return Wine;
  if (venueTypes.includes('brewery')) return Beer;
  if (venueTypes.includes('cafe')) return Coffee;
  return Utensils;
}

/**
 * Story 37.17: Consolidated nearby services card with tabbed toggle
 * Combines ski shops and dining venues in a single card with tab navigation
 */
export function NearbyServicesCard({
  resort,
  className,
  defaultTab = 'dining',
  variant = 'card',
}: NearbyServicesCardProps) {
  const isMinimal = variant === 'minimal';
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [shops, setShops] = useState<SkiShop[]>([]);
  const [venues, setVenues] = useState<DiningVenue[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);

  // Fetch ski shops
  useEffect(() => {
    async function fetchShops() {
      try {
        const response = await fetch(`/api/resorts/${resort.slug}/ski-shops`);
        if (response.ok) {
          const data: SkiShopsApiResponse = await response.json();
          setShops(sortShopsByProximity(data.shops || []));
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoadingShops(false);
      }
    }
    fetchShops();
  }, [resort.slug]);

  // Fetch dining venues
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
        setIsLoadingVenues(false);
      }
    }
    fetchVenues();
  }, [resort.slug]);

  const isLoading = isLoadingShops || isLoadingVenues;
  const hasShops = shops.length > 0;
  const hasVenues = venues.length > 0;

  // If only one type of data exists, default to that tab
  // This useEffect must be called before any conditional returns
  useEffect(() => {
    if (!isLoading) {
      if (!hasVenues && hasShops) {
        setActiveTab('shops');
      } else if (!hasShops && hasVenues) {
        setActiveTab('dining');
      }
    }
  }, [isLoading, hasShops, hasVenues]);

  const shopsSummary = calculateServicesSummary(shops);
  const venuesSummary = calculateVenueTypeSummary(venues);

  // Don't render if no data at all
  if (!isLoading && !hasShops && !hasVenues) {
    return null;
  }

  return (
    <div
      className={cn(
        'overflow-hidden',
        !isMinimal && 'bg-white border border-gray-200 rounded-lg shadow-md',
        className
      )}
    >
      {/* Header with Toggle - hide header in minimal mode (accordion provides title) */}
      <div className={cn('px-4 py-3', !isMinimal && 'border-b border-gray-100')}>
        {!isMinimal && (
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Nearby</h3>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <TabButton
            active={activeTab === 'dining'}
            onClick={() => setActiveTab('dining')}
            icon={<Utensils className="w-4 h-4" />}
            label="Dining"
            count={venues.length}
            disabled={!hasVenues && !isLoadingVenues}
            color="orange"
          />
          <TabButton
            active={activeTab === 'shops'}
            onClick={() => setActiveTab('shops')}
            icon={<Store className="w-4 h-4" />}
            label="Shops"
            count={shops.length}
            disabled={!hasShops && !isLoadingShops}
            color="blue"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="px-6 py-8 text-center text-gray-500 text-sm">
          Loading...
        </div>
      )}

      {/* Shops Tab Content */}
      {!isLoading && activeTab === 'shops' && hasShops && (
        <>
          {/* Service Summary */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {shopsSummary.rental > 0 && (
                <Badge count={shopsSummary.rental} label="Rental" />
              )}
              {shopsSummary.retail > 0 && (
                <Badge count={shopsSummary.retail} label="Retail" />
              )}
              {shopsSummary.repair > 0 && (
                <Badge count={shopsSummary.repair} label="Tune" />
              )}
            </div>
          </div>

          {/* Shop List */}
          <div className="divide-y divide-gray-100">
            {shops.slice(0, 4).map((shop) => (
              <ShopRow key={shop.slug} shop={shop} />
            ))}
          </div>

          {/* See All Link */}
          {shops.length > 4 && (
            <SeeAllButton
              count={shops.length}
              label="Shops"
              targetId="ski-shops"
              color="blue"
            />
          )}
        </>
      )}

      {/* Dining Tab Content */}
      {!isLoading && activeTab === 'dining' && hasVenues && (
        <>
          {/* Venue Type Summary */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {venuesSummary.restaurant > 0 && (
                <Badge count={venuesSummary.restaurant} label="Restaurant" />
              )}
              {venuesSummary.bar > 0 && (
                <Badge count={venuesSummary.bar} label="Bar" />
              )}
              {venuesSummary.brewery > 0 && (
                <Badge count={venuesSummary.brewery} label="Brewery" />
              )}
              {venuesSummary.cafe > 0 && (
                <Badge count={venuesSummary.cafe} label="Cafe" />
              )}
              {venuesSummary.lodge_dining > 0 && (
                <Badge count={venuesSummary.lodge_dining} label="Lodge" />
              )}
            </div>
          </div>

          {/* Venue List */}
          <div className="divide-y divide-gray-100">
            {venues.slice(0, 4).map((venue) => (
              <VenueRow key={venue.slug} venue={venue} />
            ))}
          </div>

          {/* See All Link */}
          {venues.length > 4 && (
            <SeeAllButton
              count={venues.length}
              label="Venues"
              targetId="dining"
              color="orange"
            />
          )}
        </>
      )}

      {/* Empty State for Tab */}
      {!isLoading && activeTab === 'shops' && !hasShops && (
        <div className="px-6 py-8 text-center text-gray-500 text-sm">
          No ski shops found nearby
        </div>
      )}
      {!isLoading && activeTab === 'dining' && !hasVenues && (
        <div className="px-6 py-8 text-center text-gray-500 text-sm">
          No dining venues found nearby
        </div>
      )}
    </div>
  );
}

/**
 * Tab button component
 */
function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
  disabled,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  disabled: boolean;
  color: 'blue' | 'orange';
}) {
  const activeColor = color === 'blue' ? 'text-ski-blue' : 'text-orange-600';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all',
        active
          ? `bg-white shadow-sm ${activeColor}`
          : 'text-gray-500 hover:text-gray-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded-full',
          active ? 'bg-gray-100' : 'bg-gray-200'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Shop row component
 */
function ShopRow({ shop }: { shop: SkiShop }) {
  const telLink = getShopTelLink(shop.phone);
  const formattedPhone = formatShopPhone(shop.phone);

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {shop.is_on_mountain && (
              <Mountain
                className="w-3.5 h-3.5 text-ski-blue flex-shrink-0"
                aria-label="On Mountain"
              />
            )}
            <span className="font-medium text-gray-900 text-sm truncate">
              {shop.name}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {shop.shop_type.map(getShopTypeLabel).join(' • ')}
          </div>
          {formattedPhone && telLink && (
            <a
              href={telLink}
              className="inline-flex items-center gap-1 text-xs text-ski-blue hover:underline mt-1"
            >
              <Phone className="w-3 h-3" />
              {formattedPhone}
            </a>
          )}
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap pt-0.5">
          {shop.is_on_mountain ? (
            <span className="text-ski-blue font-medium">on-mtn</span>
          ) : (
            `${shop.distance_miles.toFixed(1)} mi`
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Venue row component
 */
function VenueRow({ venue }: { venue: DiningVenue }) {
  const telLink = getVenueTelLink(venue.phone);
  const formattedPhone = formatVenuePhone(venue.phone);

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-2">
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
 * Badge component for summaries
 */
function Badge({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded text-xs">
      <span className="font-semibold mr-1">{count}</span>
      {label}
    </span>
  );
}

/**
 * See All button component
 * Scrolls to target accordion and expands it if collapsed
 */
function SeeAllButton({
  count,
  label,
  targetId,
  color,
}: {
  count: number;
  label: string;
  targetId: string;
  color: 'blue' | 'orange';
}) {
  const textColor = color === 'blue' ? 'text-ski-blue' : 'text-orange-600';

  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    // Find the accordion button inside the target element
    const accordionButton = targetElement.querySelector('button[aria-expanded]');
    if (accordionButton) {
      const isExpanded = accordionButton.getAttribute('aria-expanded') === 'true';
      // Expand the accordion if it's collapsed
      if (!isExpanded) {
        (accordionButton as HTMLButtonElement).click();
      }
    }

    // Scroll to the target after a brief delay to allow accordion to expand
    setTimeout(() => {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full px-4 py-3 flex items-center justify-center gap-1',
        `text-sm ${textColor} font-medium`,
        'hover:bg-gray-50 transition-colors',
        'border-t border-gray-100'
      )}
    >
      <span>See All {count} {label}</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

export default NearbyServicesCard;
