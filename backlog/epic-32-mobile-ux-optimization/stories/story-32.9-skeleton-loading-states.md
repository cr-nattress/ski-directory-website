# Story 32.9: Implement Consistent Skeleton Loading States

## Priority: Low

## Context

Some components have loading states (e.g., `Hero.tsx:147-151`) but the implementation is inconsistent across the app. Consistent skeleton UI improves perceived performance and prevents layout shift during data loading.

## Current State

**Existing Skeleton:**
- Hero stats: Simple pulse placeholders
- No skeleton for resort cards
- No skeleton for directory items
- No skeleton for resort detail sections

**Issues:**
- Inconsistent loading experience
- Layout shift when data loads
- Users may think content is missing

## Requirements

1. Create reusable skeleton components
2. Apply to resort cards in grid view
3. Apply to directory list items
4. Apply to resort detail page sections
5. Match skeleton dimensions to actual content
6. Use consistent pulse animation

## Implementation

### 1. Create Base Skeleton Component

```tsx
// components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rectangular' && 'rounded-md',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}
```

### 2. Resort Card Skeleton

```tsx
// components/skeletons/ResortCardSkeleton.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export function ResortCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image placeholder */}
      <Skeleton className="aspect-[4/3] w-full" />

      <div className="p-4 space-y-3">
        {/* Badge row */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Location */}
        <Skeleton className="h-4 w-1/2" />

        {/* Stats row */}
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton variant="circular" className="h-4 w-4" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}
```

### 3. Resort Grid Skeleton

```tsx
// components/skeletons/ResortGridSkeleton.tsx
import { ResortCardSkeleton } from './ResortCardSkeleton';

interface ResortGridSkeletonProps {
  count?: number;
}

export function ResortGridSkeleton({ count = 6 }: ResortGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ResortCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 4. Directory List Item Skeleton

```tsx
// components/skeletons/DirectoryItemSkeleton.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export function DirectoryItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          {/* Resort name */}
          <Skeleton className="h-5 w-48" />
          {/* Location */}
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Expand button */}
        <Skeleton variant="circular" className="h-8 w-8 ml-4" />
      </div>
    </div>
  );
}

export function DirectoryListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <DirectoryItemSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 5. Resort Detail Skeleton

```tsx
// components/skeletons/ResortDetailSkeleton.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export function ResortDetailSkeleton() {
  return (
    <div className="container-custom py-8 space-y-6">
      {/* Title */}
      <Skeleton className="h-10 w-64" />

      {/* Tagline */}
      <Skeleton className="h-6 w-96" />

      {/* Quick stats */}
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-28" />
      </div>

      {/* Photo gallery */}
      <Skeleton className="h-64 sm:h-80 w-full rounded-xl" />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
```

### 6. Usage in Components

```tsx
// components/ResortGrid.tsx
import { ResortGridSkeleton } from '@/components/skeletons/ResortGridSkeleton';

export function ResortGrid() {
  const { resorts, isLoading } = useResorts();

  if (isLoading) {
    return <ResortGridSkeleton count={6} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {resorts.map((resort) => (
        <ResortCard key={resort.id} resort={resort} />
      ))}
    </div>
  );
}
```

## Design Specifications

- **Animation:** `animate-pulse` (Tailwind default)
- **Background color:** `bg-gray-200`
- **Border radius:** Match actual component shapes
- **Dimensions:** Match actual content sizes closely

## Skeleton Component Checklist

| Component | Skeleton Created | Integrated |
|-----------|------------------|------------|
| ResortCard | [ ] | [ ] |
| ResortGrid | [ ] | [ ] |
| DirectoryItem | [ ] | [ ] |
| DirectoryList | [ ] | [ ] |
| ResortDetail | [ ] | [ ] |
| Hero stats | [x] (exists) | [x] |

## Acceptance Criteria

- [ ] Skeleton components created for all major data views
- [ ] Skeletons match actual component dimensions
- [ ] Consistent pulse animation across all skeletons
- [ ] No layout shift when data loads
- [ ] Loading states feel instant (skeleton shows immediately)
- [ ] Works on both mobile and desktop viewports

## Testing

1. Throttle network in DevTools
2. Verify skeletons appear on initial load
3. Check skeleton dimensions match actual content
4. Verify smooth transition from skeleton to content
5. Test with slow 3G to ensure no layout shift
6. Verify pulse animation is smooth (60fps)

## Effort: Small (< 2 hours)
