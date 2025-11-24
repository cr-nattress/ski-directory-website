'use client';

import { useState, useMemo } from 'react';
import { mockCategories } from '@/lib/mock-data';
import { useAllResorts, Resort } from '@/lib/hooks';
import { ResortCard } from './ResortCard';
import { CategoryChips } from './CategoryChips';

export function ResortGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { resorts, isLoading, error } = useAllResorts();

  const filteredResorts = useMemo(() => {
    if (!selectedCategory) {
      return resorts;
    }

    const category = mockCategories.find((c) => c.id === selectedCategory);
    if (!category) {
      return resorts;
    }

    return resorts.filter(category.filter);
  }, [selectedCategory, resorts]);

  return (
    <>
      <CategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <section className="py-12 bg-bg-light">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              {selectedCategory
                ? `${mockCategories.find((c) => c.id === selectedCategory)?.label} Resorts`
                : 'All Colorado Resorts'}
            </h2>
            {!isLoading && (
              <p className="text-gray-600 mt-2">
                {filteredResorts.length} resort{filteredResorts.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg mb-4">
                Failed to load resorts. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-ski-blue hover:underline font-medium"
              >
                Refresh page
              </button>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResorts.map((resort: Resort) => (
                <ResortCard key={resort.id} resort={resort} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filteredResorts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No resorts found for this category.
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 text-ski-blue hover:underline font-medium"
              >
                View all resorts
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
