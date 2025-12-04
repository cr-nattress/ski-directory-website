'use client';

import { cn } from '@/lib/utils';
import { LayoutGrid, Map } from 'lucide-react';
import { useLogger } from '@/lib/hooks/useLogger';
import { trackViewModeChange } from '@/lib/analytics';

export type ViewMode = 'cards' | 'map';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const log = useLogger({ component: 'ViewToggle' });

  const handleModeChange = (newMode: ViewMode) => {
    if (newMode !== value) {
      log.info('View mode changed', {
        previousMode: value,
        newMode,
      });
      trackViewModeChange(newMode);
    }
    onChange(newMode);
  };

  return (
    <div className="flex w-full sm:inline-flex sm:w-auto items-center bg-neutral-100 rounded-lg p-1">
      <button
        onClick={() => handleModeChange('cards')}
        className={cn(
          'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md text-sm font-medium transition-all',
          value === 'cards'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
        )}
        aria-pressed={value === 'cards'}
      >
        <LayoutGrid className="w-4 h-4" aria-hidden="true" />
        Cards
      </button>
      <button
        onClick={() => handleModeChange('map')}
        className={cn(
          'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md text-sm font-medium transition-all',
          value === 'map'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
        )}
        aria-pressed={value === 'map'}
      >
        <Map className="w-4 h-4" aria-hidden="true" />
        Map
      </button>
    </div>
  );
}
