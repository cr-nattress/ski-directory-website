# Story 35.3: SkiShopCard Component (Mobile-First)

## Priority: High

## Phase: UI

## Context

Create the core `SkiShopCard` component that displays individual ski shop information. This is a mobile-first design with prominent action buttons for calling and getting directions.

## Requirements

1. Mobile-first responsive design
2. Prominent Call and Directions buttons (44px+ touch targets)
3. On-mountain badge highlighting
4. Service type badges
5. Distance display
6. Compact variant for desktop sidebar

## Implementation

### File: `apps/v1/components/resort-detail/SkiShopCard.tsx`

```tsx
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
import { cn } from '@/lib/utils';

export function SkiShopCard({
  shop,
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
```

### Mobile Wireframe Reference

```
┌─────────────────────────────────────┐
│ 🏔️ ON MOUNTAIN                      │
│ Vail Mountain Rental       0.0 mi  │
│                                     │
│ Ski & snowboard rentals, boot      │
│ fitting, and equipment storage     │
│                                     │
│ [Rental] [Retail]                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │    📞 Call Now  970-555-0123    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │       🗺️ Get Directions         │ │
│ └─────────────────────────────────┘ │
│          🔗 Visit Website           │
└─────────────────────────────────────┘
```

### Desktop Compact Wireframe

```
┌─────────────────────────────────┐
│ 🏔️ Vail Mtn Rental     on-mtn  │
│    Rental • Retail              │
│    📞 970-555-0123              │
├─────────────────────────────────┤
│ Black Tie Rentals      2.6 mi  │
│    Rental                       │
│    📞 970-555-0456              │
└─────────────────────────────────┘
```

## Styling Details

| Element | Mobile | Desktop |
|---------|--------|---------|
| Card padding | p-4 | p-4 |
| Touch targets | min-h-[44px] | min-h-[44px] |
| Call button | Full width, prominent | Full width |
| Directions button | Full width, secondary | Full width |
| Service badges | Wrap naturally | Inline |
| Description | 2-line clamp | 2-line clamp |

## Acceptance Criteria

- [ ] Full variant displays all shop details
- [ ] Compact variant for sidebar use
- [ ] Call button uses `tel:` link
- [ ] Directions opens Google Maps in new tab
- [ ] Website link opens in new tab
- [ ] On-mountain badge prominently displayed
- [ ] All touch targets >= 44px height
- [ ] Responsive typography and spacing

## Testing

1. Test on mobile viewport (375px)
2. Test Call button triggers phone dialer
3. Test Directions opens maps app
4. Test with shop missing phone/website
5. Test with long shop name (truncation)

## Effort: Medium (2-3 hours)
