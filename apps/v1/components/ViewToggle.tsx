'use client';

import { cn } from '@/lib/utils';
import { LayoutGrid, Map } from 'lucide-react';

export type ViewMode = 'cards' | 'map';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center bg-neutral-100 rounded-lg p-1">
      <button
        onClick={() => onChange('cards')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
          value === 'cards'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
        )}
        aria-pressed={value === 'cards'}
      >
        <LayoutGrid className="w-4 h-4" />
        Cards
      </button>
      <button
        onClick={() => onChange('map')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
          value === 'map'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
        )}
        aria-pressed={value === 'map'}
      >
        <Map className="w-4 h-4" />
        Map
      </button>
    </div>
  );
}
