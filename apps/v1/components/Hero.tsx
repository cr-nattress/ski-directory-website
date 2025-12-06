'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useAllResorts } from '@/lib/hooks';
import { featureFlags } from '@/lib/config/feature-flags';

// Lazy load SearchModal - only shown on mobile when user clicks
const SearchModal = dynamic(() => import('./SearchModal').then(mod => mod.SearchModal), {
  ssr: false,
});

export function Hero() {
  const [whereValue, setWhereValue] = useState('');
  const [whenValue, setWhenValue] = useState('');
  const [whoValue, setWhoValue] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const { resorts } = useAllResorts();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', { whereValue, whenValue, whoValue });
    // TODO: Implement search functionality
  };

  return (
    <section className="relative h-[357px] md:h-[490px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/steamboat-town-mtn.jpg"
          alt="Scenic ski resort mountain with snow-covered slopes"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center px-4">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 text-balance">
          Every Resort, One Place
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
          Conditions, terrain, trail maps, and pass info at a glance. Decide fast, ride sooner.
        </p>

        {/* Mobile Search Trigger - Only on mobile */}
        {featureFlags.heroSearchForm && (
          <button
            onClick={() => setSearchModalOpen(true)}
            className="md:hidden w-full max-w-md mx-auto mt-8 bg-white rounded-full px-6 py-4 min-h-[56px] flex items-center gap-3 shadow-2xl hover:shadow-xl transition-shadow"
          >
            <Search className="w-5 h-5 text-ski-blue flex-shrink-0" aria-hidden="true" />
            <span className="text-gray-500">Search resorts...</span>
          </button>
        )}

        {/* Desktop Search Form - Hidden on mobile */}
        {featureFlags.heroSearchForm && (
          <form
            onSubmit={handleSearch}
            className="hidden md:flex mt-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-2 gap-2"
          >
            {/* Where */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <MapPin className="w-5 h-5 text-ski-blue flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 text-left">
                <label
                  htmlFor="where"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Where?
                </label>
                <select
                  id="where"
                  value={whereValue}
                  onChange={(e) => setWhereValue(e.target.value)}
                  className="w-full text-sm text-gray-900 border-none outline-none focus:ring-0 p-0 bg-transparent"
                >
                  <option value="">All Resorts</option>
                  {resorts.map((resort) => (
                    <option key={resort.id} value={resort.slug}>
                      {resort.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200" />

            {/* When */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="w-5 h-5 text-ski-blue flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 text-left">
                <label
                  htmlFor="when"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  When?
                </label>
                <select
                  id="when"
                  value={whenValue}
                  onChange={(e) => setWhenValue(e.target.value)}
                  className="w-full text-sm text-gray-900 border-none outline-none focus:ring-0 p-0 bg-transparent"
                >
                  <option value="">Flexible</option>
                  <option value="this-weekend">This weekend</option>
                  <option value="next-week">Next week</option>
                  <option value="specific">Specific dates...</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200" />

            {/* Who */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-ski-blue flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 text-left">
                <label
                  htmlFor="who"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Who?
                </label>
                <select
                  id="who"
                  value={whoValue}
                  onChange={(e) => setWhoValue(e.target.value)}
                  className="w-full text-sm text-gray-900 border-none outline-none focus:ring-0 p-0 bg-transparent"
                >
                  <option value="">Any skill level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-ski-blue text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold whitespace-nowrap"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              Search Resorts
            </button>
          </form>
        )}

        {/* Mobile Search Modal */}
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          initialFilters={{ where: whereValue, when: whenValue, who: whoValue }}
          onSearch={(filters) => {
            setWhereValue(filters.where);
            setWhenValue(filters.when);
            setWhoValue(filters.who);
            console.log('Search:', filters);
          }}
        />
      </div>
    </section>
  );
}
