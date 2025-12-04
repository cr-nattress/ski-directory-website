# Story 32.8: Add Horizontal Scroll for Filter Chips

## Priority: Low

## Context

Filter chips for pass types, states, and other attributes can wrap awkwardly on mobile screens, creating uneven rows and visual inconsistency. Horizontal scrolling provides a cleaner mobile pattern while allowing many filter options.

## Current State

- Filters wrap to multiple rows on mobile
- Inconsistent row heights when filters vary in length
- All filters visible but cluttered on small screens
- No clear indication of scrollable content

## Requirements

1. Implement horizontal scrolling for filter chips on mobile
2. Add fade gradients on edges to indicate scrollability
3. Use scroll-snap for smooth chip-to-chip scrolling
4. Allow touch/swipe horizontal scrolling
5. Desktop: Keep current wrapping behavior or convert to horizontal

## Implementation

### 1. Create Horizontal Scroll Container

```tsx
// components/ui/HorizontalScrollChips.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HorizontalScrollChipsProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScrollChips({ children, className }: HorizontalScrollChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const updateFades = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftFade(scrollLeft > 0);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateFades();
    el.addEventListener('scroll', updateFades, { passive: true });
    window.addEventListener('resize', updateFades);

    return () => {
      el.removeEventListener('scroll', updateFades);
      window.removeEventListener('resize', updateFades);
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Left fade gradient */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity',
          showLeftFade ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-2 overflow-x-auto scrollbar-hide',
          '-mx-4 px-4', // Extend to edges, add padding
          'scroll-smooth snap-x snap-mandatory'
        )}
      >
        {children}
      </div>

      {/* Right fade gradient */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity',
          showRightFade ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
```

### 2. Create Filter Chip Component

```tsx
// components/ui/FilterChip.tsx
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  color?: string; // For pass type colors
}

export function FilterChip({ label, isActive, onClick, color }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 snap-start',
        'px-4 py-2 rounded-full text-sm font-medium',
        'min-h-[40px] whitespace-nowrap',
        'transition-colors',
        isActive
          ? 'bg-ski-blue text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
      style={isActive && color ? { backgroundColor: color } : undefined}
    >
      {label}
    </button>
  );
}
```

### 3. Add Scrollbar Hide Utility

```css
/* globals.css */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### 4. Integrate with Filter Components

```tsx
// Example usage in a filter bar
export function FilterBar({ filters, activeFilters, onFilterChange }) {
  return (
    <div className="py-4">
      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden">
        <HorizontalScrollChips>
          <FilterChip
            label="All"
            isActive={activeFilters.length === 0}
            onClick={() => onFilterChange([])}
          />
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              isActive={activeFilters.includes(filter.id)}
              onClick={() => onFilterChange(filter.id)}
              color={filter.color}
            />
          ))}
        </HorizontalScrollChips>
      </div>

      {/* Desktop: Flex wrap */}
      <div className="hidden md:flex flex-wrap gap-2">
        <FilterChip
          label="All"
          isActive={activeFilters.length === 0}
          onClick={() => onFilterChange([])}
        />
        {filters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            isActive={activeFilters.includes(filter.id)}
            onClick={() => onFilterChange(filter.id)}
            color={filter.color}
          />
        ))}
      </div>
    </div>
  );
}
```

### 5. Pass Type Filter Example

```tsx
const passFilters = [
  { id: 'epic', label: 'Epic Pass', color: '#ef4444' },
  { id: 'ikon', label: 'Ikon Pass', color: '#f97316' },
  { id: 'indy', label: 'Indy Pass', color: '#3b82f6' },
  { id: 'local', label: 'Local Pass', color: '#22c55e' },
];
```

## Design Specifications

- **Chip height:** 40px minimum
- **Chip padding:** px-4 py-2
- **Gap between chips:** 8px (gap-2)
- **Scroll snap:** Snap to start of each chip
- **Fade gradients:** 32px (w-8) width, white to transparent
- **Edge padding:** 16px (px-4) to show partial next chip

## Acceptance Criteria

- [ ] Filter chips scroll horizontally on mobile
- [ ] Left/right fade gradients show when scrollable
- [ ] Scroll-snap provides smooth chip-to-chip movement
- [ ] Active filter state clearly visible
- [ ] Desktop: Chips wrap normally (flex-wrap)
- [ ] Touch scrolling feels natural
- [ ] First and last chips have proper edge padding
- [ ] No horizontal page scroll caused by chips

## Testing

1. Mobile: Verify horizontal scroll works
2. Verify fade gradients appear/disappear correctly
3. Test scroll-snap behavior
4. Tap chips to activate filters
5. Desktop: Verify wrapping behavior
6. Test with many filters to ensure scalability
7. Verify no page-level horizontal scroll

## Effort: Small (< 2 hours)
