# Story 3.1: Migrate View Mode to Zustand

## Description
Migrate the `useViewMode` hook to use the Zustand UI store created in Story 1.3, ensuring backwards compatibility.

## Acceptance Criteria
- [ ] `useViewMode` hook updated to use Zustand store
- [ ] Existing consumers continue to work without changes
- [ ] localStorage persistence maintained
- [ ] Hydration handling works correctly

## Technical Details

### Files to Update

**`lib/hooks/useViewMode.ts`** - Update to use Zustand
```typescript
/**
 * @module useViewMode
 * @purpose Manage cards/map view toggle with localStorage persistence
 *
 * This hook now uses Zustand for state management but maintains
 * the same API for backwards compatibility.
 */
'use client';

import { useUIStore, useViewMode as useZustandViewMode, useSetViewMode, useIsHydrated } from '@shared/state';

export type { ViewMode } from '@shared/state';

interface UseViewModeResult {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  isHydrated: boolean;
}

/**
 * Hook for managing view mode preference with localStorage persistence.
 *
 * @param defaultMode - Ignored (kept for API compatibility), Zustand handles defaults
 * @returns View mode state with persistence
 *
 * @example
 * const { mode, setMode, isHydrated } = useViewMode();
 * if (!isHydrated) return <Skeleton />;
 * return mode === 'map' ? <MapView /> : <CardsView />;
 */
export function useViewMode(_defaultMode?: ViewMode): UseViewModeResult {
  const mode = useZustandViewMode();
  const setMode = useSetViewMode();
  const isHydrated = useIsHydrated();

  return { mode, setMode, isHydrated };
}
```

### Migration Notes
- The Zustand store (created in Story 1.3) already handles:
  - localStorage persistence via `persist` middleware
  - Hydration with `onRehydrateStorage`
  - Default value ('cards')
- This story just wires the existing hook to use Zustand

## Testing
- [ ] View mode persists across page reloads
- [ ] Toggle between cards/map works
- [ ] No hydration warnings
- [ ] Existing consumers work without changes

## Estimate
Small (30 minutes)
