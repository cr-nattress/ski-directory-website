# Story 35.1: TypeScript Types for Ski Shop UI

## Priority: High

## Phase: Setup

## Context

Define TypeScript interfaces for ski shop data used throughout the UI components. Types should match the GCS `ski-shops.json` structure while providing a clean API for components.

## Requirements

1. Define `SkiShop` interface matching GCS data
2. Define `ShopType` and `ShopService` union types
3. Define `SkiShopsData` for the full JSON response
4. Export helper type guards and utilities

## Implementation

### File: `apps/v1/lib/types/ski-shop.ts`

```typescript
/**
 * Ski shop types for resort detail UI
 * Matches GCS ski-shops.json schema from Epic 34
 */

// Shop type categories
export type ShopType = 'rental' | 'retail' | 'repair' | 'demo';

// Services offered by shops
export type ShopService =
  | 'ski_rental'
  | 'snowboard_rental'
  | 'boot_fitting'
  | 'tuning'
  | 'waxing'
  | 'repairs'
  | 'lessons';

/**
 * Individual ski shop from GCS JSON
 */
export interface SkiShop {
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: ShopType[];
  services: ShopService[];
  distance_miles: number;
  is_on_mountain: boolean;
}

/**
 * Full ski-shops.json response from GCS
 */
export interface SkiShopsData {
  version: string;
  enriched_at: string;
  model: string;
  resort: {
    id: string;
    name: string;
    slug: string;
    asset_path: string;
  };
  search: {
    radius_miles: number;
    latitude: number;
    longitude: number;
  };
  statistics: {
    shops_found: number;
    shops_valid: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_cost: number;
  };
  shops: SkiShop[];
}

/**
 * Summary of services across all shops (for badge display)
 */
export interface ShopServicesSummary {
  rental: number;
  retail: number;
  repair: number;
  demo: number;
  total: number;
}

/**
 * Props for ski shop UI components
 */
export interface SkiShopCardProps {
  shop: SkiShop;
  variant?: 'full' | 'compact';
  showActions?: boolean;
}

export interface SkiShopsListProps {
  shops: SkiShop[];
  initialCount?: number;
  showServiceSummary?: boolean;
}

// Helper functions

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  // Handle various formats, return consistent xxx-xxx-xxxx
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone; // Return original if can't parse
}

/**
 * Generate tel: link for phone number
 */
export function getTelLink(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return `tel:+1${digits.slice(-10)}`;
}

/**
 * Generate Google Maps directions link
 */
export function getDirectionsLink(shop: SkiShop): string {
  const query = encodeURIComponent(
    `${shop.name}, ${shop.address}, ${shop.city}, ${shop.state} ${shop.postal_code}`
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

/**
 * Calculate service summary from shops array
 */
export function calculateServicesSummary(shops: SkiShop[]): ShopServicesSummary {
  const summary: ShopServicesSummary = {
    rental: 0,
    retail: 0,
    repair: 0,
    demo: 0,
    total: shops.length,
  };

  for (const shop of shops) {
    if (shop.shop_type.includes('rental')) summary.rental++;
    if (shop.shop_type.includes('retail')) summary.retail++;
    if (shop.shop_type.includes('repair')) summary.repair++;
    if (shop.shop_type.includes('demo')) summary.demo++;
  }

  return summary;
}

/**
 * Get human-readable label for shop type
 */
export function getShopTypeLabel(type: ShopType): string {
  const labels: Record<ShopType, string> = {
    rental: 'Rental',
    retail: 'Retail',
    repair: 'Repair & Tune',
    demo: 'Demo',
  };
  return labels[type];
}

/**
 * Get human-readable label for service
 */
export function getServiceLabel(service: ShopService): string {
  const labels: Record<ShopService, string> = {
    ski_rental: 'Ski Rental',
    snowboard_rental: 'Snowboard Rental',
    boot_fitting: 'Boot Fitting',
    tuning: 'Tuning',
    waxing: 'Waxing',
    repairs: 'Repairs',
    lessons: 'Lessons',
  };
  return labels[service];
}

/**
 * Sort shops: on-mountain first, then by distance
 */
export function sortShopsByProximity(shops: SkiShop[]): SkiShop[] {
  return [...shops].sort((a, b) => {
    // On-mountain shops first
    if (a.is_on_mountain && !b.is_on_mountain) return -1;
    if (!a.is_on_mountain && b.is_on_mountain) return 1;
    // Then by distance
    return a.distance_miles - b.distance_miles;
  });
}
```

### Update exports: `apps/v1/lib/types/index.ts`

```typescript
// Add to existing exports
export * from './ski-shop';
```

## Acceptance Criteria

- [ ] `SkiShop` interface matches GCS JSON structure
- [ ] `ShopType` and `ShopService` types defined
- [ ] Helper functions for phone formatting
- [ ] Helper functions for directions links
- [ ] Service summary calculator
- [ ] Sorting utility for proximity
- [ ] Types exported from lib/types

## Testing

1. Import types in a test component
2. Verify GCS JSON response matches types
3. Test helper functions with sample data:
   ```typescript
   formatPhone('9705551234'); // '970-555-1234'
   getTelLink('970-555-1234'); // 'tel:+19705551234'
   getDirectionsLink(shop); // Google Maps URL
   ```

## Effort: Small (1 hour)
