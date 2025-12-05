'use client';

import { Phone, MapPin, ExternalLink, Mountain } from 'lucide-react';
import {
  SkiShop,
  SkiShopCardProps,
  formatPhone,
  getTelLink,
  getDirectionsLink,
  getShopTypeLabel,
} from '@/lib/types/ski-shop';
import {
  trackSkiShopCall,
  trackSkiShopDirections,
  trackSkiShopWebsite,
} from '@/lib/analytics/ski-shop-analytics';
import { cn } from '@/lib/utils';

export function SkiShopCard({
  shop,
  resortName,
  variant = 'full',
  showActions = true,
}: SkiShopCardProps) {
  const telLink = getTelLink(shop.phone);
  const directionsLink = getDirectionsLink(shop);
  const formattedPhone = formatPhone(shop.phone);

  if (variant === 'compact') {
    return <CompactShopCard shop={shop} />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Header: Name + On-Mountain Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {shop.is_on_mountain && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-ski-blue text-white text-xs font-semibold rounded mb-1">
              <Mountain className="w-3 h-3" />
              ON MOUNTAIN
            </div>
          )}
          <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
        </div>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {shop.distance_miles.toFixed(1)} mi
        </div>
      </div>

      {/* Description */}
      {shop.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{shop.description}</p>
      )}

      {/* Service Badges */}
      <div className="flex flex-wrap gap-1.5">
        {shop.shop_type.map((type) => (
          <span
            key={type}
            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded"
          >
            {getShopTypeLabel(type)}
          </span>
        ))}
      </div>

      {/* Action Buttons - Mobile Optimized */}
      {showActions && (
        <div className="space-y-2 pt-1">
          {/* Call Button - Full Width on Mobile */}
          {telLink && (
            <a
              href={telLink}
              onClick={() => {
                if (resortName) {
                  trackSkiShopCall(shop.name, resortName, shop.distance_miles);
                }
              }}
              className={cn(
                'flex items-center justify-center gap-2 w-full',
                'bg-ski-blue text-white font-medium',
                'py-3 px-4 rounded-lg',
                'hover:bg-blue-700 active:bg-blue-800',
                'transition-colors',
                'min-h-[44px]' // Touch target
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
                trackSkiShopDirections(shop.name, resortName, shop.distance_miles);
              }
            }}
            className={cn(
              'flex items-center justify-center gap-2 w-full',
              'bg-gray-100 text-gray-700 font-medium',
              'py-3 px-4 rounded-lg',
              'hover:bg-gray-200 active:bg-gray-300',
              'transition-colors',
              'min-h-[44px]' // Touch target
            )}
          >
            <MapPin className="w-4 h-4" />
            <span>Get Directions</span>
          </a>

          {/* Website Link - Inline */}
          {shop.website_url && (
            <a
              href={shop.website_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (resortName && shop.website_url) {
                  trackSkiShopWebsite(shop.name, resortName, shop.website_url);
                }
              }}
              className={cn(
                'flex items-center justify-center gap-1',
                'text-sm text-ski-blue hover:underline',
                'py-2',
                'min-h-[44px]' // Touch target
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
function CompactShopCard({ shop }: { shop: SkiShop }) {
  const formattedPhone = formatPhone(shop.phone);
  const telLink = getTelLink(shop.phone);

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {shop.is_on_mountain && (
              <Mountain className="w-3.5 h-3.5 text-ski-blue flex-shrink-0" />
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
              className="text-xs text-ski-blue hover:underline mt-0.5 inline-block"
            >
              {formattedPhone}
            </a>
          )}
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap">
          {shop.is_on_mountain ? 'on-mtn' : `${shop.distance_miles.toFixed(1)} mi`}
        </div>
      </div>
    </div>
  );
}

export default SkiShopCard;
