'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Users, Search } from 'lucide-react';
import { useAllResorts } from '@shared/api';
import { trackSearch, trackFilterSelection } from '@/lib/analytics';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  where: string;
  when: string;
  who: string;
}

export function SearchModal({ isOpen, onClose, initialFilters, onSearch }: SearchModalProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    where: initialFilters?.where || '',
    when: initialFilters?.when || '',
    who: initialFilters?.who || '',
  });

  const { resorts } = useAllResorts();

  // Update filters when initial values change
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

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
    // Track the search with filter info
    const searchQuery = [
      filters.where && `where:${filters.where}`,
      filters.when && `when:${filters.when}`,
      filters.who && `who:${filters.who}`,
    ].filter(Boolean).join(',') || 'all';
    trackSearch(searchQuery, resorts.length);
    onSearch(filters);
    onClose();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (value) {
      trackFilterSelection(filterType, value);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 id="search-modal-title" className="text-lg font-semibold">
          Find a Resort
        </h2>
        <button
          onClick={onClose}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close search"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Where Section */}
        <div className="space-y-2">
          <label htmlFor="modal-where" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="w-4 h-4 text-ski-blue" aria-hidden="true" />
            Where do you want to ski?
          </label>
          <select
            id="modal-where"
            value={filters.where}
            onChange={(e) => {
              handleFilterChange('where', e.target.value);
              setFilters({ ...filters, where: e.target.value });
            }}
            className="w-full px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-ski-blue focus:border-ski-blue"
          >
            <option value="">All Resorts</option>
            {resorts.map((resort) => (
              <option key={resort.id} value={resort.slug}>
                {resort.name}
              </option>
            ))}
          </select>
        </div>

        {/* When Section */}
        <div className="space-y-2">
          <label htmlFor="modal-when" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="w-4 h-4 text-ski-blue" aria-hidden="true" />
            When are you going?
          </label>
          <select
            id="modal-when"
            value={filters.when}
            onChange={(e) => {
              handleFilterChange('when', e.target.value);
              setFilters({ ...filters, when: e.target.value });
            }}
            className="w-full px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-ski-blue focus:border-ski-blue"
          >
            <option value="">Flexible dates</option>
            <option value="this-weekend">This weekend</option>
            <option value="next-week">Next week</option>
            <option value="specific">Specific dates...</option>
          </select>
        </div>

        {/* Who Section */}
        <div className="space-y-2">
          <label htmlFor="modal-who" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Users className="w-4 h-4 text-ski-blue" aria-hidden="true" />
            What&apos;s your skill level?
          </label>
          <select
            id="modal-who"
            value={filters.who}
            onChange={(e) => {
              handleFilterChange('who', e.target.value);
              setFilters({ ...filters, who: e.target.value });
            }}
            className="w-full px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-ski-blue focus:border-ski-blue"
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
          className="w-full bg-ski-blue text-white py-4 min-h-[56px] rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
          Search Resorts
        </button>
      </form>
    </div>
  );
}
