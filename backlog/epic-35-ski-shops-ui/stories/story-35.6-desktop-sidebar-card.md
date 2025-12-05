# Story 35.6: Desktop Sidebar Card

## Priority: Medium

## Phase: Desktop

## Context

Create a compact ski shops card for the desktop sidebar (right column). This provides quick access to nearby shops without taking significant screen real estate.

## Requirements

1. Compact card matching SocialMediaCard/LocationMapCard style
2. Show service summary badges
3. Display top 3 shops in compact format
4. "See All Shops" link to expand or scroll to full section
5. Feature flagged for gradual rollout

## Implementation

### File: `apps/v1/components/resort-detail/SkiShopsCard.tsx`

```tsx
'use client';

import { Store, ChevronRight, Phone, Mountain } from 'lucide-react';
import {
  SkiShop,
  calculateServicesSummary,
  formatPhone,
  getTelLink,
  getShopTypeLabel,
} from '@/lib/types/ski-shop';
import { cn } from '@/lib/utils';

interface SkiShopsCardProps {
  shops: SkiShop[];
  resortName: string;
  onViewAll?: () => void;
  className?: string;
}

export function SkiShopsCard({
  shops,
  resortName,
  onViewAll,
  className,
}: SkiShopsCardProps) {
  // Don't render if no shops
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
          onClick={onViewAll}
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
                title="On Mountain"
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
```

### Update: `apps/v1/components/resort-detail/ResortDetail.tsx`

Add SkiShopsCard to desktop right column:

```tsx
// Add to imports
import { SkiShopsCard } from './SkiShopsCard';

// In the desktop right column section, add after SocialMediaCard:
<FeatureFlag name="skiShopsCard">
  {skiShops && skiShops.length > 0 && (
    <SkiShopsCard
      shops={skiShops}
      resortName={resort.name}
      onViewAll={() => {
        // Scroll to full section or open modal
        document.getElementById('ski-shops-section')?.scrollIntoView({
          behavior: 'smooth',
        });
      }}
    />
  )}
</FeatureFlag>
```

### Add Feature Flag

Update feature flags configuration to include:

```typescript
skiShopsCard: true, // or false for gradual rollout
```

### Wireframe

```
┌─────────────────────────────────┐
│ 🏪 Nearby Ski Shops        (10) │
├─────────────────────────────────┤
│ [7 Rental] [5 Retail] [4 Tune] │
├─────────────────────────────────┤
│ 🏔️ Vail Mtn Rental     on-mtn  │
│    Rental • Retail              │
│    📞 970-555-0123              │
├─────────────────────────────────┤
│ Black Tie Rentals      2.6 mi  │
│    Rental                       │
│    📞 970-555-0456              │
├─────────────────────────────────┤
│ Vail Sports            2.3 mi  │
│    Rental • Retail • Repair     │
│    📞 970-555-0789              │
├─────────────────────────────────┤
│     See All 10 Shops  →         │
└─────────────────────────────────┘
```

### Card Dimensions

| Element | Size |
|---------|------|
| Card width | Full column (lg:col-span-4) |
| Header padding | px-6 py-4 |
| Row padding | px-6 py-3 |
| Icon size | w-5 h-5 (header), w-3.5 h-3.5 (rows) |
| Font size | text-sm (names), text-xs (details) |

## Acceptance Criteria

- [ ] Card displays in desktop sidebar
- [ ] Service summary badges shown
- [ ] Top 3 shops displayed in compact format
- [ ] Phone numbers are clickable tel: links
- [ ] "See All" button shows when > 3 shops
- [ ] Feature flagged for controlled rollout
- [ ] Hidden when no shops available
- [ ] Matches existing sidebar card styling

## Testing

1. View desktop resort page with ski shops
2. Verify card appears in right column
3. Test phone link functionality
4. Test "See All" scrolls to section
5. Test with feature flag disabled

## Dependencies

- Story 35.1: TypeScript types
- Story 35.2: GCS data service

## Effort: Small (1-2 hours)
