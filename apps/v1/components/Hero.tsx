'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useRegionalStats, useAllResorts } from '@/lib/hooks';

export function Hero() {
  const [whereValue, setWhereValue] = useState('');
  const [whenValue, setWhenValue] = useState('');
  const [whoValue, setWhoValue] = useState('');

  const { stats, isLoading } = useRegionalStats();
  const { resorts } = useAllResorts();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search:', { whereValue, whenValue, whoValue });
    // TODO: Implement search functionality
  };

  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/steamboat-town-mtn.jpg)',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center px-4">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 text-balance">
          Find your perfect ski resort
        </h1>

        {/* Search Widget */}
        <form
          onSubmit={handleSearch}
          className="mt-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2"
        >
          {/* Where */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <MapPin className="w-5 h-5 text-ski-blue flex-shrink-0" />
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
                <option value="">All Colorado Resorts</option>
                {resorts.map((resort) => (
                  <option key={resort.id} value={resort.slug}>
                    {resort.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200" />

          {/* When */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-5 h-5 text-ski-blue flex-shrink-0" />
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
          <div className="hidden md:block w-px bg-gray-200" />

          {/* Who */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-5 h-5 text-ski-blue flex-shrink-0" />
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
            <Search className="w-5 h-5" />
            <span className="hidden md:inline">Search Resorts</span>
            <span className="md:hidden">Search</span>
          </button>
        </form>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-white text-sm">
          {isLoading ? (
            <div className="flex items-center gap-8">
              <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-28 bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
            </div>
          ) : stats ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats.totalResorts}</span>
                <span className="opacity-90">world-class resorts</span>
              </div>
              <div className="hidden md:block w-1 h-1 rounded-full bg-white/50" />
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats.avgAnnualSnowfall}&quot;</span>
                <span className="opacity-90">avg snowfall</span>
              </div>
              <div className="hidden md:block w-1 h-1 rounded-full bg-white/50" />
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats.openResorts}</span>
                <span className="opacity-90">open today</span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
