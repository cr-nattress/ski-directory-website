# Story 3.2: Add Zustand Devtools and Persistence Middleware

## Description
Enhance the Zustand store with devtools for debugging and ensure persistence middleware is properly configured.

## Acceptance Criteria
- [ ] Zustand devtools enabled in development
- [ ] Store state visible in Redux DevTools
- [ ] Persistence working correctly
- [ ] No impact on production bundle

## Technical Details

### Files to Update

**`shared/state/uiStore.ts`**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

export type ViewMode = 'cards' | 'map';

interface UIState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isHydrated: boolean;
  setHydrated: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        viewMode: 'cards',
        setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),

        isHydrated: false,
        setHydrated: () => set({ isHydrated: true }, false, 'setHydrated'),
      }),
      {
        name: 'ski-directory-ui',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ viewMode: state.viewMode }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated();
        },
      }
    ),
    {
      name: 'UIStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
```

### Install Redux DevTools Extension
Users need the browser extension to see Zustand state:
- Chrome: Redux DevTools Extension
- Firefox: Redux DevTools Add-on

## Usage in DevTools
1. Open Redux DevTools in browser
2. Select "UIStore" from dropdown
3. View state changes in real-time
4. Time-travel debugging available

## Testing
- [ ] DevTools shows UIStore in development
- [ ] State changes appear with action names
- [ ] Devtools disabled in production
- [ ] Persistence still works with devtools wrapper

## Estimate
Small (30 minutes)
