'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ViewToggle } from './ViewToggle';
import { ResortMapViewWrapper } from './ResortMapViewWrapper';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { categories } from '@/lib/data/categories';
import { useRankedResorts } from '@/lib/hooks/useRankedResorts';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { ResortCard } from './ResortCard';
import { LoadingMore } from './LoadingMore';
import { DiscoverySections } from './discovery';
import { cn } from '@/lib/utils';
import { paginationConfig } from '@/lib/config/pagination';

/**
 * Intelligent Resort Section
 *
 * A Netflix-style landing page with:
 * 1. Themed discovery sections (Top Destinations, Hidden Gems, etc.)
 * 2. Category filter chips
 * 3. Ranked infinite scroll of all resorts
 *
 * Discovery sections only show when viewing "All" (no category selected).
 */
export function IntelligentResortSection() {
  const { mode, setMode, isHydrated } = useViewMode('map');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Ranked resorts with infinite scroll
  const {
    resorts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    reset,
  } = useRankedResorts({
    pageSize: paginationConfig.landing.initialPageSize,
    enabled: true,
  });

  // Filter resorts by category (client-side)
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

  // Load more callback
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && !selectedCategory) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, selectedCategory, loadMore]);

  // Intersection observer for infinite scroll
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: `${paginationConfig.landing.scrollThreshold}px`,
    enabled: hasMore && !isLoadingMore && !selectedCategory,
  });

  // Trigger load when sentinel is visible
  useEffect(() => {
    if (isIntersecting) {
      handleLoadMore();
    }
  }, [isIntersecting, handleLoadMore]);

  // Show discovery sections when viewing all (no category selected) - visible in both cards and map mode
  const showDiscoverySections = !selectedCategory;

  // Display count
  const displayCount = !selectedCategory
    ? totalCount || filteredResorts.length
    : filteredResorts.length;

  // Show load more UI
  const showLoadMoreUI = !selectedCategory && mode === 'cards';

  return (
    <>
      {/* Discovery Sections - only when viewing "All" in cards mode */}
      {showDiscoverySections && !isLoading && (
        <section className="py-8 bg-white">
          <div className="container-custom">
            <DiscoverySections />
          </div>
        </section>
      )}

      <section className="py-12 bg-bg-light">
        <div className="container-custom">
          {/* Header with View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
                {mode === 'cards' && selectedCategory
                  ? `${categories.find((c) => c.id === selectedCategory)?.icon} ${categories.find((c) => c.id === selectedCategory)?.label} Resorts`
                  : '🗺️ All Ski Resorts'}
              </h2>
              {mode === 'cards' && !isLoading && (
                <p className="text-gray-600 mt-2">
                  {selectedCategory ? (
                    <>
                      {filteredResorts.length} resort{filteredResorts.length !== 1 ? 's' : ''} found
                    </>
                  ) : (
                    <>
                      Showing {filteredResorts.length} of {displayCount} resort{displayCount !== 1 ? 's' : ''}
                    </>
                  )}
                </p>
              )}
            </div>

            {/* View Toggle */}
            {isHydrated && (
              <ViewToggle value={mode} onChange={setMode} />
            )}
          </div>

          {/* Category Chips - centered, smaller size, visible in both cards and map mode */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
              {/* All Resorts chip */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap font-medium text-xs',
                  selectedCategory === null
                    ? 'bg-ski-blue border-ski-blue text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-ski-blue hover:text-ski-blue'
                )}
              >
                <span>🗺️</span>
                <span>All</span>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap font-medium text-xs',
                    selectedCategory === category.id
                      ? 'bg-ski-blue border-ski-blue text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-ski-blue hover:text-ski-blue'
                  )}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
          </div>

          {/* View content */}
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
                    {[...Array(paginationConfig.landing.initialPageSize)].map((_, i) => (
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
                    <p className="text-red-500 mb-4">
                      Failed to load resorts. Please try again.
                    </p>
                    <button
                      onClick={() => reset()}
                      className="px-4 py-2 bg-ski-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
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
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredResorts.map((resort) => (
                        <ResortCard key={resort.id} resort={resort} />
                      ))}
                    </div>

                    {/* Infinite scroll UI */}
                    {showLoadMoreUI && (
                      <>
                        <LoadingMore
                          isLoading={isLoadingMore}
                          hasMore={hasMore}
                          loadedCount={filteredResorts.length}
                          totalCount={totalCount}
                        />

                        {/* Sentinel element */}
                        <div
                          ref={sentinelRef}
                          className="h-4"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </>
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
