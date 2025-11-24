import { Resort } from '@/lib/mock-data';
import { PhotoGallery } from './PhotoGallery';
import { Star } from 'lucide-react';

interface ResortHeroProps {
  resort: Resort;
}

export function ResortHero({ resort }: ResortHeroProps) {
  return (
    <div className="space-y-6">
      {/* Resort Identity */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          {resort.name}
        </h1>

        {resort.tagline && (
          <p className="text-xl text-gray-600">{resort.tagline}</p>
        )}

        {/* Quick Stats Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{resort.rating}</span>
            <span className="text-gray-600">
              ({resort.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <span className="text-gray-300">·</span>

          {/* Pass Type */}
          {resort.passAffiliations.length > 0 && (
            <>
              <span className="font-medium text-gray-700">
                {resort.passAffiliations
                  .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                  .join(', ')}{' '}
                Pass
              </span>
              <span className="text-gray-300">·</span>
            </>
          )}

          {/* Terrain Distribution */}
          <span className="text-gray-700">
            Beginner {resort.terrain.beginner}% · Intermediate{' '}
            {resort.terrain.intermediate}% · Advanced {resort.terrain.advanced}%
          </span>
        </div>

        {/* Elevation */}
        <div className="text-sm text-gray-600">
          Base {resort.stats.baseElevation.toLocaleString()} ft · Summit{' '}
          {resort.stats.summitElevation.toLocaleString()} ft
        </div>
      </div>

      {/* Photo Gallery */}
      <PhotoGallery resort={resort} />

      {/* Live Conditions Badge */}
      {resort.conditions.snowfall24h > 0 && (
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-2xl">❄️</span>
          <div className="text-sm">
            <span className="font-semibold text-blue-900">
              {resort.conditions.snowfall24h}&quot; new overnight
            </span>
            <span className="text-blue-700 ml-2">
              · {resort.conditions.baseDepth}&quot; base
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
