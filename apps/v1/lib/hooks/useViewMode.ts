/**
 * @module useViewMode
 * @deprecated Use `useViewMode` from `@shared/state` instead.
 * This module is kept for backwards compatibility and will be removed in a future version.
 *
 * @example
 * // Old (deprecated):
 * import { useViewMode } from '@/lib/hooks/useViewMode';
 *
 * // New (preferred):
 * import { useViewMode } from '@shared/state';
 */
'use client';

// Re-export from the new Zustand-based implementation
export { useViewMode, type ViewMode } from '@shared/state';
