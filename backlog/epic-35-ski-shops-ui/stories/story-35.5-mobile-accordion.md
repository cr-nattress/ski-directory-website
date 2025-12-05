# Story 35.5: Mobile Accordion Integration

## Priority: High

## Phase: Mobile

## Context

Integrate the ski shops display into the existing `MobileResortSections` accordion component. This adds a new "Ski Shops" accordion section that appears on mobile viewports.

## Requirements

1. Add ski shops section to mobile accordion
2. Fetch data server-side and pass to accordion
3. Position appropriately (after Terrain & Conditions)
4. Only show if resort has ski shops
5. Match existing accordion styling

## Implementation

### Create: `apps/v1/components/resort-detail/SkiShopsAccordion.tsx`

```tsx
'use client';

import { Store } from 'lucide-react';
import { SkiShop, calculateServicesSummary } from '@/lib/types/ski-shop';
import { SkiShopsList } from './SkiShopsList';

interface SkiShopsAccordionProps {
  shops: SkiShop[];
}

/**
 * Ski shops content for mobile accordion
 * Wrapper to be used within MobileResortSections
 */
export function SkiShopsAccordionContent({ shops }: SkiShopsAccordionProps) {
  if (!shops || shops.length === 0) {
    return null;
  }

  return (
    <div className="px-1">
      <SkiShopsList
        shops={shops}
        initialCount={3}
        showServiceSummary={true}
        variant="full"
      />
    </div>
  );
}

/**
 * Header for the accordion section
 */
export function SkiShopsAccordionHeader({ shops }: { shops: SkiShop[] }) {
  const summary = calculateServicesSummary(shops);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-gray-500" />
        <span>Ski Shops</span>
      </div>
      <span className="text-sm text-gray-500">{shops.length} nearby</span>
    </div>
  );
}

export default SkiShopsAccordionContent;
```

### Update: `apps/v1/components/resort-detail/MobileResortSections.tsx`

Add ski shops section to the existing accordion:

```tsx
// Add to imports
import { SkiShopsAccordionContent, SkiShopsAccordionHeader } from './SkiShopsAccordion';
import { SkiShop } from '@/lib/types/ski-shop';

// Update props interface
interface MobileResortSectionsProps {
  resort: Resort;
  skiShops?: SkiShop[]; // Add this prop
}

// In the component, add a new accordion item after Terrain & Conditions:
{skiShops && skiShops.length > 0 && (
  <AccordionItem value="ski-shops">
    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
      <SkiShopsAccordionHeader shops={skiShops} />
    </AccordionTrigger>
    <AccordionContent className="px-4 pb-4">
      <SkiShopsAccordionContent shops={skiShops} />
    </AccordionContent>
  </AccordionItem>
)}
```

### Update: `apps/v1/components/resort-detail/ResortDetail.tsx`

Fetch ski shops and pass to mobile sections:

```tsx
// Add to imports
import { getSkiShops } from '@/lib/services/ski-shops-service';
import { SkiShop } from '@/lib/types/ski-shop';

// Update ResortDetail to be async and fetch ski shops
export async function ResortDetail({ resort }: ResortDetailProps) {
  // Fetch ski shops from GCS
  const skiShops = await getSkiShops(resort.assetPath);

  // ... existing code ...

  return (
    <div className="min-h-screen bg-white">
      {/* ... existing code ... */}

      {/* Mobile: Collapsible accordion sections */}
      <MobileResortSections resort={resort} skiShops={skiShops} />

      {/* ... rest of component ... */}
    </div>
  );
}
```

### Alternative: Client-side fetching (if server component change is complex)

If converting to async server component is complex, use client-side fetching:

```tsx
// In MobileResortSections.tsx
'use client';

import { useEffect, useState } from 'react';
import { SkiShop } from '@/lib/types/ski-shop';

export function MobileResortSections({ resort }: MobileResortSectionsProps) {
  const [skiShops, setSkiShops] = useState<SkiShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchShops() {
      if (!resort.assetPath) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://storage.googleapis.com/sda-assets-prod/resorts/${resort.assetPath}/ski-shops.json`
        );
        if (response.ok) {
          const data = await response.json();
          setSkiShops(data.shops || []);
        }
      } catch (error) {
        console.error('Failed to fetch ski shops:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchShops();
  }, [resort.assetPath]);

  // ... render with skiShops state
}
```

### Accordion Section Order

The ski shops section should appear in this order within the accordion:

1. Overview (default open)
2. Mountain Stats
3. Terrain & Conditions (active resorts only)
4. **Ski Shops** (new - if shops exist)
5. Trail Map
6. Nearby Amenities

### Wireframe: Collapsed Accordion

```
┌─────────────────────────────────────┐
│ ▼ Overview                          │
│   Resort description text...        │
├─────────────────────────────────────┤
│ ▶ Mountain Stats                    │
├─────────────────────────────────────┤
│ ▶ Terrain & Conditions              │
├─────────────────────────────────────┤
│ ▶ 🏪 Ski Shops           10 nearby  │  ← NEW
├─────────────────────────────────────┤
│ ▶ Trail Map                         │
├─────────────────────────────────────┤
│ ▶ Nearby Amenities                  │
└─────────────────────────────────────┘
```

### Wireframe: Expanded Ski Shops

```
┌─────────────────────────────────────┐
│ ▶ Terrain & Conditions              │
├─────────────────────────────────────┤
│ ▼ 🏪 Ski Shops           10 nearby  │
│                                     │
│ [7 Rental] [5 Retail] [4 Repair]   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏔️ ON MOUNTAIN                  │ │
│ │ Vail Mountain Rental            │ │
│ │ [📞 Call Now]                   │ │
│ │ [🗺️ Get Directions]            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Black Tie Rentals       2.6 mi │ │
│ │ [📞 Call] [🗺️ Directions]      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Vail Sports             2.3 mi │ │
│ │ [📞 Call] [🗺️ Directions]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    View All 10 Shops  ▼       │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│ ▶ Trail Map                         │
└─────────────────────────────────────┘
```

## Acceptance Criteria

- [ ] Ski shops accordion section added to mobile view
- [ ] Section only appears if shops exist
- [ ] Header shows shop count
- [ ] Content displays SkiShopsList
- [ ] Positioned after Terrain & Conditions
- [ ] Matches existing accordion styling
- [ ] Data fetched server-side (preferred) or client-side

## Testing

1. View resort with ski shops on mobile
2. Verify accordion expands/collapses
3. Verify shops display correctly
4. Test with resort without ski shops (section hidden)
5. Test expand "View All" within accordion

## Dependencies

- Story 35.3: SkiShopCard
- Story 35.4: SkiShopsList
- Existing MobileResortSections component

## Effort: Medium (2-3 hours)
