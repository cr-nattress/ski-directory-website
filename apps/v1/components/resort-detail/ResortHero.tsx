import { Resort } from '@/lib/mock-data';
import { PhotoGallery } from './PhotoGallery';
import { Star, ExternalLink } from 'lucide-react';

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

        {resort.websiteUrl && (
          <a
            href={resort.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-ski-blue hover:text-blue-700 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visit Official Website</span>
          </a>
        )}

        {/* Quick Stats Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {/* Lost ski area indicator */}
          {resort.isLost && (
            <>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                Former Ski Area
              </span>
              <span className="text-gray-300">·</span>
            </>
          )}

          {/* Rating - hidden for lost ski areas */}
          {!resort.isLost && (
            <>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{resort.rating}</span>
                <span className="text-gray-600">
                  ({resort.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
              <span className="text-gray-300">·</span>
            </>
          )}

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

          {/* Terrain Distribution - hidden for lost ski areas */}
          {!resort.isLost && (
            <span className="text-gray-700">
              Beginner {resort.terrain.beginner}% · Intermediate{' '}
              {resort.terrain.intermediate}% · Advanced {resort.terrain.advanced}%
            </span>
          )}
        </div>

        {/* Elevation */}
        <div className="text-sm text-gray-600">
          Base {resort.stats.baseElevation.toLocaleString()} ft · Summit{' '}
          {resort.stats.summitElevation.toLocaleString()} ft
        </div>
      </div>

      {/* Photo Gallery */}
      <PhotoGallery resort={resort} />

      {/* Live Conditions Badge - hidden for lost ski areas */}
      {!resort.isLost && resort.conditions.snowfall24h > 0 && (
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
