# Story 29.11: Extract Inline Helper Components

## Priority: Low

## Context

Some components define helper components inline, causing them to be recreated on each render. While the performance impact is minimal, extracting them improves code organization and enables memoization.

## Current State

**Location:** `apps/v1/components/resort-detail/ResortDetail.tsx:233-239`

**Current Code:**
```typescript
export function ResortDetail({ resort }: ResortDetailProps) {
  // ... component logic

  return (
    <div>
      {/* Uses StatCard defined below */}
    </div>
  );
}

// Defined inside same file but outside component - this is fine
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-semibold text-gray-900 text-sm">{value}</div>
    </div>
  );
}
```

**Note:** The current code already has StatCard outside the component function, which is the correct pattern. This story focuses on any remaining inline definitions and adding memoization.

## Requirements

1. Audit for any components defined inside other components
2. Extract to module level or separate files
3. Add React.memo for pure presentational components
4. Create proper TypeScript interfaces

## Implementation

### Extract and Memoize StatCard

Create `apps/v1/components/resort-detail/StatCard.tsx`:

```typescript
import { memo } from 'react';

interface StatCardProps {
  /** Label shown above the value */
  label: string;
  /** Value to display */
  value: string;
}

/**
 * Small stat card for displaying mountain statistics
 */
export const StatCard = memo(function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="font-semibold text-gray-900 text-sm">
        {value}
      </div>
    </div>
  );
});
```

Update ResortDetail.tsx:
```typescript
import { StatCard } from './StatCard';
```

### Similar Pattern for Other Small Components

If found, apply the same pattern:

1. Create separate file with descriptive name
2. Add proper TypeScript interface for props
3. Wrap with `memo` for pure components
4. Add JSDoc comment describing purpose
5. Import where needed

### Example: PassBadge Component

If pass badge logic is repeated, extract:

```typescript
// components/ui/PassBadge.tsx
import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { PassAffiliation } from '@/lib/types';

interface PassBadgeProps {
  pass: PassAffiliation;
  size?: 'sm' | 'md';
}

const PASS_STYLES: Record<PassAffiliation, string> = {
  epic: 'bg-epic-red text-white',
  ikon: 'bg-ikon-orange text-white',
  indy: 'bg-purple-600 text-white',
  // ...
};

export const PassBadge = memo(function PassBadge({ pass, size = 'sm' }: PassBadgeProps) {
  return (
    <span
      className={cn(
        'rounded font-semibold uppercase',
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        PASS_STYLES[pass] ?? 'bg-gray-200 text-gray-700'
      )}
    >
      {pass}
    </span>
  );
});
```

## Files to Check

1. `components/resort-detail/ResortDetail.tsx` - StatCard
2. `components/ResortCard.tsx` - getPassBadgeStyles, getPassLabel functions
3. `components/ResortMapView.tsx` - createMarkerIcon (already a function)
4. `components/LiveConditions.tsx` - WeatherIcon

## Acceptance Criteria

- [ ] No components defined inside other component functions
- [ ] Helper components in separate files
- [ ] Pure components wrapped with memo
- [ ] Proper TypeScript interfaces for all props
- [ ] JSDoc comments added

## Testing

1. Verify components render correctly after extraction
2. Check React DevTools for memo'd components
3. Run build to ensure no import errors

## Effort: Small (< 2 hours)
