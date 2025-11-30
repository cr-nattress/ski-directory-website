'use client';

import { useState, useEffect, useCallback } from 'react';

export type ViewMode = 'cards' | 'map';

const STORAGE_KEY = 'ski-directory-view-mode';

interface UseViewModeResult {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  isHydrated: boolean;
}

/**
 * Hook for managing view mode preference with localStorage persistence
 * Returns isHydrated to prevent hydration mismatches
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
