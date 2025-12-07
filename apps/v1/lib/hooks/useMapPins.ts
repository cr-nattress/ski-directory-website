/**
 * @module useMapPins
 * @deprecated Use `useMapPins` from `@shared/api` instead.
 * This module is kept for backwards compatibility and will be removed in a future version.
 *
 * @example
 * // Old (deprecated):
 * import { useMapPins } from '@/lib/hooks/useMapPins';
 *
 * // New (preferred):
 * import { useMapPins } from '@shared/api';
 */
'use client';

// Re-export from the new TanStack Query-based implementation
export { useMapPins } from '@shared/api';
