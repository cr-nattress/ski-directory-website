/**
 * @module useViewMode
 * @purpose Manage cards/map view toggle with localStorage persistence
 * @context Landing page view mode toggle
 *
 * @sideeffects
 * - Reads from localStorage on mount
 * - Writes to localStorage on mode change
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

/** Available view modes for resort listings */
export type ViewMode = 'cards' | 'map';

const STORAGE_KEY = 'ski-directory-view-mode';

interface UseViewModeResult {
  /** Current view mode */
  mode: ViewMode;
  /** Update view mode (persists to localStorage) */
  setMode: (mode: ViewMode) => void;
  /** True after initial localStorage read - use to prevent hydration mismatch */
  isHydrated: boolean;
}

/**
 * Hook for managing view mode preference with localStorage persistence
 *
 * @param defaultMode - Initial mode before localStorage is read (default: 'cards')
 * @returns View mode state with persistence
 *
 * @decision
 * Return isHydrated flag to allow components to render a skeleton
 * until localStorage is read, preventing hydration mismatches.
 *
 * @example
 * const { mode, setMode, isHydrated } = useViewMode('cards');
 * if (!isHydrated) return <Skeleton />;
 * return mode === 'map' ? <MapView /> : <CardsView />;
 */
export function useViewMode(defaultMode: ViewMode = 'cards'): UseViewModeResult {
  const [mode, setModeState] = useState<ViewMode>(defaultMode);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'cards' || stored === 'map') {
          setModeState(stored);
        }
      } catch {
        // localStorage might be disabled, ignore
      }
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage on change
  const setMode = useCallback((newMode: ViewMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newMode);
      } catch {
        // localStorage might be full or disabled, ignore
      }
    }
  }, []);

  return { mode, setMode, isHydrated };
}
