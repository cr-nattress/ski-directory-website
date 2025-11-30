'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Resort } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Snowflake, MapPin, Star, ChevronRight, ChevronDown, Mountain, Thermometer } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PassBadge } from './PassBadge';

interface DirectoryListProps {
  resorts: Resort[];
}

export function DirectoryList({ resorts }: DirectoryListProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const getTerrainBarColor = (percent: number) => {
    if (percent >= 90) return 'bg-success-green';
    if (percent >= 70) return 'bg-ski-blue';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const toggleExpand = (e: React.MouseEvent, resortId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCard(expandedCard === resortId ? null : resortId);
  };

  return (
    <div className="space-y-4" role="list" aria-label="Resort directory">
      {resorts.map((resort) => {
        const hasSignificantSnow = resort.conditions.snowfall24h >= 6;
        const isExpanded = expandedCard === resort.id;

        return (
          <div
            key={resort.id}
            role="listitem"
            className={cn(
              'bg-white rounded-lg border border-gray-200 overflow-hidden',
              'transition-all',
              hasSignificantSnow && 'bg-powder-blue/5 border-powder-blue/30',
              isExpanded && 'shadow-md'
            )}
          >
            <Link
              href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
              className={cn(
                'block p-4',
                'hover:bg-gray-50 transition-colors'
              )}
            >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{resort.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={resort.conditions.status} isLost={resort.isLost} />
                  <div className="flex gap-1">
                    {resort.passAffiliations.map((pass) => (
                      <PassBadge key={pass} pass={pass} size="xs" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-700">{resort.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              {/* 24h Snow */}
              <div>
                <div className="text-xs text-gray-500 mb-0.5">24h Snow</div>
                <div
                  className={cn(
                    'font-semibold text-sm flex items-center gap-1',
                    hasSignificantSnow ? 'text-ski-blue' : 'text-gray-700'
                  )}
                >
                  {resort.conditions.snowfall24h > 0 && (
                    <Snowflake className="w-3 h-3" />
                  )}
                  {resort.conditions.snowfall24h > 0
                    ? `${resort.conditions.snowfall24h}"`
                    : '—'}
                </div>
              </div>

              {/* Base */}
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Base</div>
                <div className="font-semibold text-sm text-gray-700">
                  {resort.conditions.baseDepth}&quot;
                </div>
              </div>

              {/* Acres */}
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Acres</div>
                <div className="font-semibold text-sm text-gray-700">
                  {resort.stats.skiableAcres.toLocaleString()}
                </div>
              </div>

              {/* Vertical */}
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Vertical</div>
                <div className="font-semibold text-sm text-gray-700">
                  {resort.stats.verticalDrop.toLocaleString()}&apos;
                </div>
              </div>
            </div>

            {/* Terrain Open Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Terrain Open</span>
                <span className="font-medium text-gray-700">
                  {resort.conditions.terrainOpen}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    getTerrainBarColor(resort.conditions.terrainOpen)
                  )}
                  style={{ width: `${resort.conditions.terrainOpen}%` }}
                />
              </div>
            </div>

            {/* Footer Row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{resort.distanceFromMajorCity} mi from {resort.majorCityName}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
            </div>
            </Link>

            {/* Expand Button */}
            <div className="px-4 pb-3">
              <button
                onClick={(e) => toggleExpand(e, resort.id)}
                className={cn(
                  'w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900',
                  'flex items-center justify-center gap-1',
                  'rounded-md hover:bg-gray-100 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ski-blue focus:ring-offset-2'
                )}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Hide' : 'Show'} more details for ${resort.name}`}
              >
                {isExpanded ? 'Show less' : 'Show more'}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  {/* 72h Snowfall */}
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-gray-500">72h Snowfall</div>
                      <div className="font-medium text-gray-900">{resort.conditions.snowfall72h}&quot;</div>
                    </div>
                  </div>

                  {/* Lifts Open */}
                  <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-gray-500">Lifts Open</div>
                      <div className="font-medium text-gray-900">
                        {resort.conditions.liftsOpen} / {resort.stats.liftsCount}
                      </div>
                    </div>
                  </div>

                  {/* Total Runs */}
                  <div className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-gray-500">Total Runs</div>
                      <div className="font-medium text-gray-900">{resort.stats.runsCount}</div>
                    </div>
                  </div>

                  {/* Elevation */}
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-gray-500">Summit / Base</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {resort.stats.summitElevation.toLocaleString()}&apos; / {resort.stats.baseElevation.toLocaleString()}&apos;
                      </div>
                    </div>
                  </div>

                  {/* Annual Snowfall */}
                  <div className="flex items-center gap-2 col-span-2">
                    <Snowflake className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-gray-500">Avg Annual Snow</div>
                      <div className="font-medium text-gray-900">{resort.stats.avgAnnualSnowfall}&quot;</div>
                    </div>
                  </div>
                </div>

                {/* Terrain Breakdown */}
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2">Terrain Breakdown</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-600">{resort.terrain.beginner}% Beginner</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-600">{resort.terrain.intermediate}% Intermediate</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-600">{resort.terrain.advanced}% Advanced</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-600">{resort.terrain.expert}% Expert</span>
                    </span>
                  </div>
                </div>

                {/* View Resort Link */}
                <Link
                  href={`/${resort.countryCode}/${resort.stateCode}/${resort.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-ski-blue hover:underline font-medium text-sm focus:outline-none focus:ring-2 focus:ring-ski-blue focus:ring-offset-2 rounded"
                >
                  View full resort details
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
