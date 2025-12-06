import type { Resort } from '@/lib/types';
import { PhotoGallery } from './PhotoGallery';
import { ResortHeaderStats } from './ResortHeaderStats';
import { FeatureFlag } from '@/components/FeatureFlag';
import { cn } from '@/lib/utils';

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

        {/* Pass Types and Website Chips */}
        <div className="flex flex-wrap gap-2">
          {/* Lost ski area indicator */}
          {resort.isLost && (
            <span className="inline-flex items-center gap-1.5 bg-gray-500 text-white px-3 py-1 rounded text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Former Ski Area
            </span>
          )}

          {/* Pass Type Chips */}
          {resort.passAffiliations.map((pass) => (
            <span
              key={pass}
              className={cn(
                'text-xs px-3 py-1 rounded text-white font-medium',
                pass === 'epic' && 'bg-red-600',
                pass === 'ikon' && 'bg-orange-500',
                pass === 'indy' && 'bg-violet-500',
                pass === 'mountain-collective' && 'bg-emerald-600',
                pass === 'powder-alliance' && 'bg-cyan-600',
                pass === 'ny-ski3' && 'bg-blue-600',
                pass === 'rcr-rockies' && 'bg-violet-600',
                pass === 'lest-go' && 'bg-pink-600',
                pass === 'local' && 'bg-neutral-600'
              )}
            >
              {pass === 'mountain-collective' ? 'Mtn Collective' :
               pass === 'powder-alliance' ? 'Powder Alliance' :
               pass === 'ny-ski3' ? 'NY SKI3' :
               pass === 'rcr-rockies' ? 'RCR Rockies' :
               pass === 'lest-go' ? "L'EST GO" :
               pass.charAt(0).toUpperCase() + pass.slice(1)}
            </span>
          ))}

          {/* Website Chip */}
          {resort.websiteUrl && (
            <a
              href={resort.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 rounded bg-sky-600 hover:bg-sky-700 transition-colors inline-flex items-center gap-1.5"
              style={{ color: 'white' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span style={{ color: 'white' }}>Website</span>
            </a>
          )}
        </div>

      </div>

      {/* Consolidated Header Stats - Epic 38 */}
      <FeatureFlag name="resortHeaderStats">
        <ResortHeaderStats resort={resort} className="mt-4" />
      </FeatureFlag>

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
