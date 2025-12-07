# Story 1.3: Create Zustand UI Store

## Description
Install Zustand and create the UI store for managing client-side preferences like view mode, with localStorage persistence.

## Acceptance Criteria
- [ ] Zustand installed as dependency
- [ ] UI store created with view mode state
- [ ] localStorage persistence middleware configured
- [ ] Store exported and accessible from components

## Technical Details

### Dependencies to Install
```bash
npm install zustand
```

### Files to Create

**`shared/state/uiStore.ts`**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ViewMode = 'cards' | 'map';

interface UIState {
  // View mode for resort listings
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Hydration flag to prevent SSR mismatch
  isHydrated: boolean;
  setHydrated: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      viewMode: 'cards',
      setViewMode: (mode) => set({ viewMode: mode }),

      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'ski-directory-ui',
      storage: createJSONStorage(() => localStorage),
      // Only persist viewMode, not isHydrated
      partialize: (state) => ({ viewMode: state.viewMode }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// Selector hooks for granular subscriptions
export const useViewMode = () => useUIStore((state) => state.viewMode);
export const useSetViewMode = () => useUIStore((state) => state.setViewMode);
export const useIsHydrated = () => useUIStore((state) => state.isHydrated);
```

**`shared/state/index.ts`**
```typescript
export { useUIStore, useViewMode, useSetViewMode, useIsHydrated } from './uiStore';
export type { ViewMode } from './uiStore';
```

## Notes
- The `isHydrated` pattern prevents hydration mismatches with SSR
- Selectors (`useViewMode`, etc.) prevent unnecessary re-renders
- Only `viewMode` is persisted to localStorage

## Testing
- [ ] Store persists view mode across page reloads
- [ ] No hydration warnings in console
- [ ] Switching view mode updates localStorage

## Estimate
Small (1 hour)
