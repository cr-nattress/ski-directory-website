'use client';

import { categories } from '@/lib/data/categories';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryChips({
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="container-custom">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Browse by experience
        </h2>

        <div className="flex flex-wrap gap-3">
          {/* All Resorts chip */}
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all whitespace-nowrap font-medium text-sm',
              selectedCategory === null
                ? 'bg-ski-blue border-ski-blue text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-700 hover:border-ski-blue hover:text-ski-blue'
            )}
          >
            <span>🗺️</span>
            <span>All Resorts</span>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all whitespace-nowrap font-medium text-sm',
                selectedCategory === category.id
                  ? 'bg-ski-blue border-ski-blue text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-ski-blue hover:text-ski-blue'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
