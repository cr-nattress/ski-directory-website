/**
 * @module useThemedResorts
 * @deprecated Use `useThemedResorts` from `@shared/api` instead.
 * This module is kept for backwards compatibility and will be removed in a future version.
 *
 * @example
 * // Old (deprecated):
 * import { useThemedResorts, THEMED_SECTIONS } from '@/lib/hooks/useThemedResorts';
 *
 * // New (preferred):
 * import { useThemedResorts, THEMED_SECTIONS } from '@shared/api';
 */
'use client';

// Re-export from the new TanStack Query-based implementation
export { useThemedResorts, THEMED_SECTIONS } from '@shared/api';
export type { ThemedSections } from '@shared/api';
