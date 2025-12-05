# Story 35.8: Analytics Tracking

## Priority: Low

## Phase: Analytics

## Context

Add analytics tracking for ski shop interactions to measure user engagement and inform future improvements.

## Requirements

1. Track ski shop card views
2. Track Call button clicks
3. Track Directions button clicks
4. Track Website link clicks
5. Track filter usage
6. Track "View All" expansion

## Implementation

### Add tracking functions: `apps/v1/lib/analytics/ski-shop-analytics.ts`

```typescript
/**
 * Analytics tracking for ski shop interactions
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Track when a user clicks the Call button
 */
export function trackSkiShopCall(
  shopName: string,
  resortName: string,
  distance: number
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shop_call', {
      event_category: 'Ski Shops',
      event_label: shopName,
      resort_name: resortName,
      distance_miles: distance,
    });
  }
}

/**
 * Track when a user clicks Get Directions
 */
export function trackSkiShopDirections(
  shopName: string,
  resortName: string,
  distance: number
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shop_directions', {
      event_category: 'Ski Shops',
      event_label: shopName,
      resort_name: resortName,
      distance_miles: distance,
    });
  }
}

/**
 * Track when a user clicks Visit Website
 */
export function trackSkiShopWebsite(
  shopName: string,
  resortName: string,
  websiteUrl: string
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shop_website', {
      event_category: 'Ski Shops',
      event_label: shopName,
      resort_name: resortName,
      destination_url: websiteUrl,
    });
  }
}

/**
 * Track when ski shops section is viewed/expanded
 */
export function trackSkiShopsView(
  resortName: string,
  shopCount: number,
  source: 'accordion' | 'sidebar' | 'section'
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shops_view', {
      event_category: 'Ski Shops',
      event_label: resortName,
      shop_count: shopCount,
      view_source: source,
    });
  }
}

/**
 * Track "View All Shops" expansion
 */
export function trackSkiShopsExpand(
  resortName: string,
  shopCount: number
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shops_expand', {
      event_category: 'Ski Shops',
      event_label: resortName,
      shop_count: shopCount,
    });
  }
}

/**
 * Track filter usage
 */
export function trackSkiShopsFilter(
  resortName: string,
  filterType: string,
  action: 'add' | 'remove'
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ski_shops_filter', {
      event_category: 'Ski Shops',
      event_label: filterType,
      resort_name: resortName,
      filter_action: action,
    });
  }
}
```

### Update components to include tracking

#### SkiShopCard.tsx

```tsx
import {
  trackSkiShopCall,
  trackSkiShopDirections,
  trackSkiShopWebsite,
} from '@/lib/analytics/ski-shop-analytics';

// Add resortName prop
interface SkiShopCardProps {
  shop: SkiShop;
  resortName?: string;
  variant?: 'full' | 'compact';
  showActions?: boolean;
}

// In Call button:
<a
  href={telLink}
  onClick={() => {
    if (resortName) {
      trackSkiShopCall(shop.name, resortName, shop.distance_miles);
    }
  }}
  // ... rest of props
>

// In Directions button:
<a
  href={directionsLink}
  onClick={() => {
    if (resortName) {
      trackSkiShopDirections(shop.name, resortName, shop.distance_miles);
    }
  }}
  // ... rest of props
>

// In Website link:
<a
  href={shop.website_url}
  onClick={() => {
    if (resortName && shop.website_url) {
      trackSkiShopWebsite(shop.name, resortName, shop.website_url);
    }
  }}
  // ... rest of props
>
```

#### SkiShopsList.tsx

```tsx
import {
  trackSkiShopsExpand,
  trackSkiShopsFilter,
} from '@/lib/analytics/ski-shop-analytics';

// Add resortName prop
interface SkiShopsListProps {
  shops: SkiShop[];
  resortName?: string;
  // ... other props
}

// In expand button:
<button
  onClick={() => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && resortName) {
      trackSkiShopsExpand(resortName, filteredShops.length);
    }
  }}
>

// In filter toggle:
const toggleFilter = (type: ShopType) => {
  const isRemoving = activeFilters.includes(type);
  setActiveFilters((prev) =>
    isRemoving ? prev.filter((t) => t !== type) : [...prev, type]
  );
  if (resortName) {
    trackSkiShopsFilter(resortName, type, isRemoving ? 'remove' : 'add');
  }
};
```

### GA4 Custom Events Reference

| Event Name | Parameters | Trigger |
|------------|------------|---------|
| `ski_shop_call` | shop_name, resort_name, distance_miles | Call button click |
| `ski_shop_directions` | shop_name, resort_name, distance_miles | Directions click |
| `ski_shop_website` | shop_name, resort_name, destination_url | Website link click |
| `ski_shops_view` | resort_name, shop_count, view_source | Section viewed |
| `ski_shops_expand` | resort_name, shop_count | View All clicked |
| `ski_shops_filter` | resort_name, filter_type, filter_action | Filter toggled |

### GA4 Dashboard Suggestions

Create custom reports for:
1. **Top Shops by Calls** - Which shops get most phone calls
2. **Shops by Directions Requests** - Navigation engagement
3. **Resort Ski Shop Engagement** - Which resorts have active shop sections
4. **Filter Usage** - Which service types are most searched

## Acceptance Criteria

- [ ] Call clicks tracked with shop and resort info
- [ ] Directions clicks tracked with distance
- [ ] Website clicks tracked with destination URL
- [ ] View All expansion tracked
- [ ] Filter usage tracked (add/remove)
- [ ] Events appear in GA4 real-time view
- [ ] No tracking errors in console

## Testing

1. Open browser dev tools Network tab
2. Click Call button - verify gtag request
3. Click Directions - verify gtag request
4. Click View All - verify gtag request
5. Toggle filter - verify gtag request
6. Check GA4 real-time events

## Effort: Small (1-2 hours)
