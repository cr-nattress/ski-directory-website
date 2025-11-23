'use client';

import { useState, useMemo } from 'react';
import { mockResorts, mockCategories, Resort } from '@/lib/mock-data';
import { ResortCard } from './ResortCard';
import { CategoryChips } from './CategoryChips';

export function ResortGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredResorts = useMemo(() => {
    if (!selectedCategory) {
      return mockResorts;
    }

    const category = mockCategories.find((c) => c.id === selectedCategory);
    if (!category) {
      return mockResorts;
    }

    return mockResorts.filter(category.filter);
  }, [selectedCategory]);

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
            <p className="text-gray-600 mt-2">
              {filteredResorts.length} resort{filteredResorts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResorts.map((resort: Resort) => (
              <ResortCard key={resort.id} resort={resort} />
            ))}
          </div>

          {/* Empty state */}
          {filteredResorts.length === 0 && (
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
