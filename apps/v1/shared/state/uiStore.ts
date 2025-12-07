import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

export type ViewMode = 'cards' | 'map';

interface UIState {
  // View mode for resort listings
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Hydration flag to prevent SSR mismatch
  isHydrated: boolean;
  setHydrated: () => void;
}

/**
 * UI Store for managing client-side preferences.
 *
 * Features:
 * - View mode (cards/map) with localStorage persistence
 * - Hydration handling to prevent SSR mismatches
 * - Devtools integration in development
 */
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
        // Only persist viewMode, not isHydrated
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

// Selector hooks for granular subscriptions (prevents unnecessary re-renders)
export const useViewModeValue = () => useUIStore((state) => state.viewMode);
export const useSetViewMode = () => useUIStore((state) => state.setViewMode);
export const useIsHydrated = () => useUIStore((state) => state.isHydrated);

/**
 * Hook that provides the same interface as the legacy useViewMode hook.
 * Drop-in replacement for @/lib/hooks/useViewMode.
 *
 * @param defaultMode - Ignored (kept for API compatibility)
 * @returns { mode, setMode, isHydrated }
 *
 * @example
 * const { mode, setMode, isHydrated } = useViewMode('cards');
 * if (!isHydrated) return <Skeleton />;
 * return mode === 'map' ? <MapView /> : <CardsView />;
 */
export function useViewMode(_defaultMode?: ViewMode) {
  const mode = useUIStore((state) => state.viewMode);
  const setMode = useUIStore((state) => state.setViewMode);
  const isHydrated = useUIStore((state) => state.isHydrated);

  return { mode, setMode, isHydrated };
}
