import type { Resort } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResortHeaderStatsProps {
  resort: Resort;
  className?: string;
}

/**
 * ResortHeaderStats - Consolidated stats display for resort headers (Epic 38)
 *
 * Displays key resort metrics in a clean, scannable format:
 * - Trail difficulty breakdown with visual bar
 * - Elevation stats (summit, base, vertical)
 * - Key metrics (acres, runs, lifts, snowfall)
 */
export function ResortHeaderStats({ resort, className }: ResortHeaderStatsProps) {
  const { terrain, stats } = resort;

  // Calculate total for stacked bar (should be 100, but normalize just in case)
  const terrainTotal = terrain.beginner + terrain.intermediate + terrain.advanced + terrain.expert;

  // Skip rendering for lost ski areas
  if (resort.isLost) {
    return null;
  }

  return (
    <div className={cn('bg-gray-50 rounded-lg p-4 sm:p-5', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Trail Difficulty Section */}
        <div className="sm:col-span-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Trail Difficulty
          </h3>

          {/* Stacked Bar */}
          <div className="h-3 rounded-full overflow-hidden flex mb-2" role="img" aria-label={`Trail difficulty: ${terrain.beginner}% beginner, ${terrain.intermediate}% intermediate, ${terrain.advanced}% advanced, ${terrain.expert}% expert`}>
            {terrain.beginner > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${(terrain.beginner / terrainTotal) * 100}%` }}
                title={`Beginner: ${terrain.beginner}%`}
              />
            )}
            {terrain.intermediate > 0 && (
              <div
                className="bg-blue-500"
                style={{ width: `${(terrain.intermediate / terrainTotal) * 100}%` }}
                title={`Intermediate: ${terrain.intermediate}%`}
              />
            )}
            {terrain.advanced > 0 && (
              <div
                className="bg-gray-800"
                style={{ width: `${(terrain.advanced / terrainTotal) * 100}%` }}
                title={`Advanced: ${terrain.advanced}%`}
              />
            )}
            {terrain.expert > 0 && (
              <div
                className="bg-gray-900"
                style={{ width: `${(terrain.expert / terrainTotal) * 100}%` }}
                title={`Expert: ${terrain.expert}%`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {terrain.beginner}%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-blue-500" />
              {terrain.intermediate}%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rotate-45 bg-gray-800" />
              {terrain.advanced}%
            </span>
            {terrain.expert > 0 && (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rotate-45 bg-gray-900" />
                {terrain.expert}%
              </span>
            )}
          </div>
        </div>

        {/* Elevation Section */}
        <div className="sm:col-span-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Elevation
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.summitElevation.toLocaleString()}&apos;
              </div>
              <div className="text-xs text-gray-500">Summit</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.baseElevation.toLocaleString()}&apos;
              </div>
              <div className="text-xs text-gray-500">Base</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-sky-600">
                {stats.verticalDrop.toLocaleString()}&apos;
              </div>
              <div className="text-xs text-gray-500">Vertical</div>
            </div>
          </div>
        </div>

        {/* Key Stats Section */}
        <div className="sm:col-span-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Key Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.skiableAcres.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Acres</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.runsCount}
              </div>
              <div className="text-xs text-gray-500">Runs</div>
            </div>
            {stats.liftsCount > 0 && (
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats.liftsCount}
                </div>
                <div className="text-xs text-gray-500">Lifts</div>
              </div>
            )}
            {stats.avgAnnualSnowfall > 0 && (
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {stats.avgAnnualSnowfall}&quot;
                </div>
                <div className="text-xs text-gray-500">Snow/yr</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
