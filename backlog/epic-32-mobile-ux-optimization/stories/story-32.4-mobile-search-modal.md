# Story 32.4: Simplify Hero Search for Mobile

## Priority: Medium

## Context

The hero search form (`components/Hero.tsx`) displays 3 dropdown fields + a search button that stack vertically on mobile. This takes significant vertical space and requires multiple interactions. A mobile-optimized pattern would show a single search trigger that opens a full-screen modal.

## Current State

**Location:** `apps/v1/components/Hero.tsx:46-142`

**Current Mobile Behavior:**
- Three dropdowns (Where, When, Who) stack vertically
- Each dropdown takes full width
- Search button at bottom
- Total height: ~300px on mobile
- Form is always visible, taking hero space

## Requirements

1. On mobile: Show single "Search resorts" input/button
2. Tapping opens full-screen search modal
3. Modal contains all filter options with better mobile UX
4. Desktop behavior unchanged (inline form)
5. Modal should be accessible (focus trap, escape to close)

## Implementation

### 1. Create Search Modal Component

```tsx
// components/SearchModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Calendar, Users, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  where: string;
  when: string;
  who: string;
}

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    where: '',
    when: '',
    who: '',
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 id="search-modal-title" className="text-lg font-semibold">
          Find a Resort
        </h2>
        <button
          onClick={onClose}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Where Section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="w-4 h-4 text-ski-blue" />
            Where do you want to ski?
          </label>
          <select
            value={filters.where}
            onChange={(e) => setFilters({ ...filters, where: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-ski-blue focus:border-ski-blue"
          >
            <option value="">All Resorts</option>
            {/* Resort options */}
          </select>
        </div>

        {/* When Section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="w-4 h-4 text-ski-blue" />
            When are you going?
          </label>
          <select
            value={filters.when}
            onChange={(e) => setFilters({ ...filters, when: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-ski-blue focus:border-ski-blue"
          >
            <option value="">Flexible dates</option>
            <option value="this-weekend">This weekend</option>
            <option value="next-week">Next week</option>
            <option value="specific">Specific dates...</option>
          </select>
        </div>

        {/* Who Section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Users className="w-4 h-4 text-ski-blue" />
            What&apos;s your skill level?
          </label>
          <select
            value={filters.who}
            onChange={(e) => setFilters({ ...filters, who: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-ski-blue focus:border-ski-blue"
          >
            <option value="">Any skill level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full bg-ski-blue text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Search className="w-5 h-5" />
          Search Resorts
        </button>
      </form>
    </div>
  );
}
```

### 2. Update Hero Component

```tsx
// components/Hero.tsx
export function Hero() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  // ... existing state

  return (
    <section className="relative h-[420px] md:h-[490px] ...">
      {/* ... background and content ... */}

      {/* Mobile Search Trigger - Only on mobile */}
      <button
        onClick={() => setSearchModalOpen(true)}
        className="md:hidden w-full max-w-md mx-auto mt-8 bg-white rounded-full px-6 py-4 flex items-center gap-3 shadow-2xl"
      >
        <Search className="w-5 h-5 text-ski-blue" />
        <span className="text-gray-500">Search resorts...</span>
      </button>

      {/* Desktop Search Form - Hidden on mobile */}
      {featureFlags.heroSearchForm && (
        <form className="hidden md:flex mt-8 max-w-4xl mx-auto ...">
          {/* existing form content */}
        </form>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearch={(filters) => console.log('Search:', filters)}
      />

      {/* ... stats ... */}
    </section>
  );
}
```

## Design Specifications

### Mobile Search Trigger
- Pill-shaped button with search icon
- White background, subtle shadow
- Full width (max 400px)
- Height: 56px for prominent touch target

### Search Modal
- Full-screen white overlay
- Sticky header with title and close button
- Large, touch-friendly form inputs (48px height)
- Clear section labels with icons
- Full-width primary search button

## Acceptance Criteria

- [ ] Mobile: Single search trigger button visible
- [ ] Mobile: Tapping trigger opens full-screen modal
- [ ] Modal has all filter options (where, when, who)
- [ ] Modal closes on X button, escape key, or search
- [ ] Desktop: Original inline form unchanged
- [ ] Body scroll locked when modal open
- [ ] Focus trapped within modal when open
- [ ] Form values persist during session

## Testing

1. Mobile viewport: Verify search trigger appears
2. Desktop viewport: Verify inline form appears
3. Open modal and verify all filters work
4. Test escape key closes modal
5. Test focus remains trapped in modal
6. Verify body doesn't scroll when modal open
7. Test with screen reader for accessibility

## Effort: Large (4-8 hours)
