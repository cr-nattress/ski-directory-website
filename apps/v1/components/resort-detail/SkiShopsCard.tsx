'use client';

import { useEffect, useState } from 'react';
import { Store, ChevronRight, Phone, Mountain } from 'lucide-react';
import {
  SkiShop,
  SkiShopsApiResponse,
  calculateServicesSummary,
  formatPhone,
  getTelLink,
  getShopTypeLabel,
  sortShopsByProximity,
} from '@/lib/types/ski-shop';
import type { Resort } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SkiShopsCardProps {
  resort: Resort;
  className?: string;
}

/**
 * Compact ski shops card for desktop sidebar
 * Shows service summary and top 3 shops with "See All" link
 * Fetches data from Supabase via API route
 */
export function SkiShopsCard({
  resort,
  className,
}: SkiShopsCardProps) {
  const [shops, setShops] = useState<SkiShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      }
    }

    fetchShops();
  }, [resort.slug]);

  // Don't render if loading or no shops
  if (isLoading) {
    return null; // Could show skeleton here
  }

  if (!shops || shops.length === 0) {
    return null;
  }

  const summary = calculateServicesSummary(shops);
  const topShops = shops.slice(0, 3);
  const hasMore = shops.length > 3;

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
            <Store className="w-5 h-5 text-ski-blue" />
            <h3 className="font-semibold text-gray-900">Nearby Ski Shops</h3>
          </div>
          <span className="text-sm text-gray-500">({shops.length})</span>
        </div>
      </div>

      {/* Service Summary */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {summary.rental > 0 && (
            <ServiceBadge count={summary.rental} label="Rental" />
          )}
          {summary.retail > 0 && (
            <ServiceBadge count={summary.retail} label="Retail" />
          )}
          {summary.repair > 0 && (
            <ServiceBadge count={summary.repair} label="Tune" />
          )}
        </div>
      </div>

      {/* Shop List */}
      <div className="divide-y divide-gray-100">
        {topShops.map((shop) => (
          <CompactShopRow key={shop.slug} shop={shop} />
        ))}
      </div>

      {/* See All Link */}
      {hasMore && (
        <button
          onClick={() => {
            // Scroll to ski shops section (on mobile accordion)
            document.getElementById('ski-shops')?.scrollIntoView({
              behavior: 'smooth',
            });
          }}
          className={cn(
            'w-full px-6 py-3 flex items-center justify-center gap-1',
            'text-sm text-ski-blue font-medium',
            'hover:bg-gray-50 transition-colors',
            'border-t border-gray-100'
          )}
        >
          <span>See All {shops.length} Shops</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Compact shop row for sidebar card
 */
function CompactShopRow({ shop }: { shop: SkiShop }) {
  const telLink = getTelLink(shop.phone);
  const formattedPhone = formatPhone(shop.phone);

  return (
    <div className="px-6 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        {/* Shop Info */}
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

        {/* Distance */}
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
 * Small service count badge
 */
function ServiceBadge({ count, label }: { count: number; label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded text-xs">
      <span className="font-semibold mr-1">{count}</span>
      {label}
    </span>
  );
}

export default SkiShopsCard;
