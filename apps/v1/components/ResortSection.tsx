'use client';

import { useState, useMemo } from 'react';
import { ViewToggle, ViewMode } from './ViewToggle';
import { ResortMapViewWrapper } from './ResortMapViewWrapper';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { categories } from '@/lib/data/categories';
import { useAllResorts } from '@/lib/hooks';
import { ResortCard } from './ResortCard';
import { CategoryChips } from './CategoryChips';
import { cn } from '@/lib/utils';

export function ResortSection() {
  const { mode, setMode, isHydrated } = useViewMode('cards');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { resorts, isLoading, error } = useAllResorts();

  const filteredResorts = useMemo(() => {
    if (!selectedCategory) {
      return resorts;
    }

    const category = categories.find((c) => c.id === selectedCategory);
    if (!category) {
      return resorts;
    }

    return resorts.filter(category.filter);
  }, [selectedCategory, resorts]);

  return (
    <>
      {/* Category Chips - only show in cards mode */}
      {mode === 'cards' && (
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      <section className="py-12 bg-bg-light">
        <div className="container-custom">
          {/* Header with View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
                {mode === 'cards' && selectedCategory
                  ? `${categories.find((c) => c.id === selectedCategory)?.icon} ${categories.find((c) => c.id === selectedCategory)?.label} Resorts`
                  : '🗺️ All Ski Resorts'}
              </h2>
              {mode === 'cards' && !isLoading && (
                <p className="text-gray-600 mt-2">
                  {filteredResorts.length} resort{filteredResorts.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            {/* View Toggle - only show after hydration to prevent flash */}
            {isHydrated && (
              <ViewToggle value={mode} onChange={setMode} />
            )}
          </div>

          {/* View content with transition */}
          <div
            className={cn(
              'transition-opacity duration-300',
              !isHydrated && 'opacity-0'
            )}
          >
            {mode === 'cards' ? (
              <>
                {/* Loading state */}
                {isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-[420px] bg-gray-100 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="text-center py-12">
                    <p className="text-red-500">
                      Failed to load resorts. Please try again.
                    </p>
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && filteredResorts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No resorts found matching your criteria.</p>
                  </div>
                )}

                {/* Resort grid */}
                {!isLoading && !error && filteredResorts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResorts.map((resort) => (
                      <ResortCard key={resort.id} resort={resort} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <ResortMapViewWrapper />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
