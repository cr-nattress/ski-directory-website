/**
 * Shared state module - Zustand stores
 *
 * @example
 * import { useViewMode, useSetViewMode } from '@shared/state';
 *
 * function ViewToggle() {
 *   const mode = useViewMode();
 *   const setMode = useSetViewMode();
 *   return <button onClick={() => setMode(mode === 'cards' ? 'map' : 'cards')}>Toggle</button>;
 * }
 */

export {
  useUIStore,
  useViewMode,
  useSetViewMode,
  useIsHydrated,
} from './uiStore';

export type { ViewMode } from './uiStore';
