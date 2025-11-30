'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ViewToggle } from './ViewToggle';
import { ResortMapViewWrapper } from './ResortMapViewWrapper';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { categories } from '@/lib/data/categories';
import { useAllResorts } from '@/lib/hooks';
import { useInfiniteResorts } from '@/lib/hooks/useInfiniteResorts';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';
import { ResortCard } from './ResortCard';
import { CategoryChips } from './CategoryChips';
import { LoadingMore } from './LoadingMore';
import { cn } from '@/lib/utils';
import { featureFlags } from '@/lib/config/feature-flags';
import { paginationConfig } from '@/lib/config/pagination';

export function ResortSection() {
  const { mode, setMode, isHydrated } = useViewMode('cards');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Feature flag determines which data loading approach to use
  const useInfiniteScrollMode = featureFlags.infiniteScroll;

  // Legacy: Load all resorts at once (when infinite scroll disabled)
  const legacyData = useAllResorts();

  // New: Infinite scroll pagination
  const infiniteData = useInfiniteResorts({
    pageSize: paginationConfig.landing.initialPageSize,
    enabled: useInfiniteScrollMode,
  });

  // Choose data source based on feature flag
  const resorts = useInfiniteScrollMode ? infiniteData.resorts : legacyData.resorts;
  const isLoading = useInfiniteScrollMode ? infiniteData.isLoading : legacyData.isLoading;
  const error = useInfiniteScrollMode ? infiniteData.error : legacyData.error;

  // Infinite scroll specific state
  const { isLoadingMore, hasMore, totalCount, loadMore } = infiniteData;

  // Filter resorts by category (client-side for both modes)
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

  // Load more callback for intersection observer
  const handleLoadMore = useCallback(() => {
    if (useInfiniteScrollMode && hasMore && !isLoadingMore && !selectedCategory) {
      loadMore();
    }
  }, [useInfiniteScrollMode, hasMore, isLoadingMore, selectedCategory, loadMore]);

  // Intersection observer for infinite scroll trigger
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: `${paginationConfig.landing.scrollThreshold}px`,
    enabled: useInfiniteScrollMode && hasMore && !isLoadingMore && !selectedCategory,
  });

  // Trigger load when sentinel becomes visible
  useEffect(() => {
    if (isIntersecting) {
      handleLoadMore();
    }
  }, [isIntersecting, handleLoadMore]);

  // Display count - for infinite scroll, show total if available
  const displayCount = useInfiniteScrollMode && !selectedCategory
    ? totalCount || filteredResorts.length
    : filteredResorts.length;

  // Determine if we should show "load more" UI
  const showLoadMoreUI = useInfiniteScrollMode && !selectedCategory && mode === 'cards';

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
                  {selectedCategory ? (
                    // When filtering, show filtered count
                    <>
                      {filteredResorts.length} resort{filteredResorts.length !== 1 ? 's' : ''} found
                    </>
                  ) : useInfiniteScrollMode ? (
                    // Infinite scroll: show loaded of total
                    <>
                      Showing {filteredResorts.length} of {displayCount} resort{displayCount !== 1 ? 's' : ''}
                    </>
                  ) : (
                    // Legacy mode: just show total
                    <>
                      {filteredResorts.length} resort{filteredResorts.length !== 1 ? 's' : ''} found
                    </>
                  )}
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
                {/* Loading state - initial load */}
                {isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(useInfiniteScrollMode ? paginationConfig.landing.initialPageSize : 8)].map((_, i) => (
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
                    {useInfiniteScrollMode && (
                      <button
                        onClick={() => infiniteData.reset()}
                        className="px-4 py-2 bg-ski-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry
                      </button>
                    )}
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

                    {/* Infinite scroll: Loading more indicator and sentinel */}
                    {showLoadMoreUI && (
                      <>
                        <LoadingMore
                          isLoading={isLoadingMore}
                          hasMore={hasMore}
                          loadedCount={filteredResorts.length}
                          totalCount={totalCount}
                        />

                        {/* Invisible sentinel element to trigger loading - always rendered when showLoadMoreUI */}
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
