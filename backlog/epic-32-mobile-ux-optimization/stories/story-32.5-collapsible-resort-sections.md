# Story 32.5: Add Collapsible Sections to Resort Detail

## Priority: Medium

## Context

The resort detail page contains extensive information (stats, terrain, conditions, description, features) that creates a very long scroll on mobile devices. Collapsible accordion sections allow users to focus on relevant content while reducing cognitive load.

## Current State

**Location:** `apps/v1/components/resort-detail/ResortDetail.tsx`

**Current Behavior:**
- All content sections displayed fully expanded
- Long vertical scroll required on mobile
- No way to collapse less-relevant sections
- Users may miss important content due to scroll fatigue

## Requirements

1. Group related content into collapsible accordion sections
2. Default: First section expanded, others collapsed
3. Allow multiple sections open simultaneously
4. Smooth expand/collapse animations
5. Desktop: Consider keeping all sections expanded
6. Preserve deep linking to sections via URL hash

## Implementation

### 1. Create Accordion Component

```tsx
// components/ui/Accordion.tsx
'use client';

import { useState, useId, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  id?: string;
}

export function AccordionItem({ title, defaultOpen = false, children, id }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const headerId = useId();

  return (
    <div className="border-b border-gray-200" id={id}>
      <button
        id={headerId}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 text-left min-h-[56px]"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[2000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn('divide-y divide-gray-200', className)}>
      {children}
    </div>
  );
}
```

### 2. Create Mobile Resort Sections Component

```tsx
// components/resort-detail/MobileResortSections.tsx
'use client';

import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { MountainStats } from './MountainStats';
import { TerrainConditions } from './TerrainConditions';
import { ResortDescription } from './ResortDescription';
import { ResortFeatures } from './ResortFeatures';
import type { Resort } from '@/lib/types';

interface MobileResortSectionsProps {
  resort: Resort;
}

export function MobileResortSections({ resort }: MobileResortSectionsProps) {
  return (
    <div className="lg:hidden">
      <Accordion>
        <AccordionItem title="Mountain Stats" defaultOpen id="stats">
          <MountainStats stats={resort.stats} />
        </AccordionItem>

        {!resort.isLost && (
          <AccordionItem title="Terrain & Conditions" id="terrain">
            <TerrainConditions
              terrain={resort.terrain}
              conditions={resort.conditions}
            />
          </AccordionItem>
        )}

        <AccordionItem title="About" id="about">
          <ResortDescription description={resort.description} />
        </AccordionItem>

        <AccordionItem title="Features & Amenities" id="features">
          <ResortFeatures features={resort.features} tags={resort.tags} />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
```

### 3. Update ResortDetail Layout

```tsx
// components/resort-detail/ResortDetail.tsx
export function ResortDetail({ resort }: ResortDetailProps) {
  return (
    <div className="container-custom py-8">
      <ResortHero resort={resort} />

      {/* Mobile: Accordion sections */}
      <MobileResortSections resort={resort} />

      {/* Desktop: Original expanded layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8 mt-8">
        <div className="lg:col-span-8">
          {/* Main content */}
        </div>
        <div className="lg:col-span-4">
          {/* Sidebar */}
        </div>
      </div>
    </div>
  );
}
```

### 4. Add URL Hash Support (Optional)

```tsx
// Auto-open section based on URL hash
useEffect(() => {
  const hash = window.location.hash.slice(1);
  if (hash) {
    setOpenSections(prev => new Set([...prev, hash]));
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
  }
}, []);
```

## Section Groupings

| Section | Contents | Default State |
|---------|----------|---------------|
| Mountain Stats | Elevation, vertical, acres, lifts, runs | **Open** |
| Terrain & Conditions | Terrain %, snow report, status | Closed |
| About | Description, history | Closed |
| Features & Amenities | Park, halfpipe, night skiing, etc. | Closed |

## Design Specifications

- **Header height:** 56px minimum (touch-friendly)
- **Chevron animation:** 200ms rotation
- **Content transition:** 200ms max-height animation
- **Border:** Light gray between sections
- **Typography:** 18px semibold for section titles

## Acceptance Criteria

- [ ] Mobile: Content organized into collapsible sections
- [ ] First section (Mountain Stats) open by default
- [ ] Smooth expand/collapse animations
- [ ] Multiple sections can be open simultaneously
- [ ] Desktop: Original expanded layout preserved
- [ ] Touch targets meet 44px minimum
- [ ] Accessible: ARIA expanded/controls attributes
- [ ] Optional: URL hash opens corresponding section

## Testing

1. Mobile viewport: Verify accordion appears
2. Tap section headers to expand/collapse
3. Verify animations are smooth
4. Desktop: Verify original layout unchanged
5. Test with screen reader for accessibility
6. Optional: Test hash-based deep linking

## Effort: Medium (2-4 hours)
