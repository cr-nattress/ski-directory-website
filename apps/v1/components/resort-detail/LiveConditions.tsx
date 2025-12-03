'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  getLiftStatusColor,
  getLiftStatusBgColor,
  formatUpdatedAgo,
  isConditionsStale,
} from '@/lib/types/liftie';
import type { ResortConditionsRow } from '@/types/supabase';

interface LiveConditionsProps {
  conditions: ResortConditionsRow | null;
  className?: string;
}

export function LiveConditions({ conditions, className }: LiveConditionsProps) {
  const [showFullForecast, setShowFullForecast] = useState(false);

  if (!conditions) {
    return null;
  }

  const { has_lifts, has_weather } = conditions;

  // Don't render if no data available
  if (!has_lifts && !has_weather) {
    return null;
  }

  const isStale = isConditionsStale(conditions.updated_at);
  const updatedText = formatUpdatedAgo(conditions.updated_at);

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Live Conditions</h3>
        <div className={cn(
          'text-xs',
          isStale ? 'text-amber-600' : 'text-neutral-500'
        )}>
          {isStale && (
            <span className="inline-flex items-center mr-1">
              <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </span>
          )}
          Updated {updatedText}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Lift Status */}
        {has_lifts && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Lifts Open</span>
              <span className={cn(
                'text-lg font-bold',
                getLiftStatusColor(conditions.lifts_percentage)
              )}>
                {conditions.lifts_open}/{conditions.lifts_total}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  getLiftStatusBgColor(conditions.lifts_percentage)
                )}
                style={{ width: `${conditions.lifts_percentage}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-neutral-500 text-right">
              {conditions.lifts_percentage.toFixed(0)}% open
            </div>
          </div>
        )}

        {/* Weather */}
        {has_weather && conditions.weather_condition && (
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WeatherIcon icons={conditions.weather_icon} />
                <span className="text-sm font-medium text-neutral-700">
                  {conditions.weather_condition}
                </span>
              </div>
              {conditions.weather_high !== null && (
                <span className="text-lg font-bold text-neutral-900">
                  {conditions.weather_high}°F
                </span>
              )}
            </div>

            {/* Full forecast (collapsible) */}
            {conditions.weather_text && (
              <div className="mt-2">
                <button
                  onClick={() => setShowFullForecast(!showFullForecast)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>{showFullForecast ? 'Hide' : 'Show'} full forecast</span>
                  <svg
                    className={cn(
                      'w-3 h-3 transition-transform',
                      showFullForecast && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showFullForecast && (
                  <p className="mt-2 text-sm text-neutral-600 bg-neutral-50 p-3 rounded">
                    {conditions.weather_text}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Webcams indicator */}
        {conditions.has_webcams && (
          <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{conditions.webcams?.length || 0} webcam{(conditions.webcams?.length || 0) !== 1 ? 's' : ''} available</span>
          </div>
        )}
      </div>

      {/* Source attribution */}
      <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
        Data from <a href="https://liftie.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Liftie.info</a>
      </div>
    </div>
  );
}

/**
 * Weather icon component
 * Maps Liftie icon classes to visual representation
 */
function WeatherIcon({ icons }: { icons: string[] }) {
  // Simple icon mapping based on common Liftie classes
  const iconStr = icons.join(' ').toLowerCase();

  let emoji = '🌤️'; // default
  if (iconStr.includes('snowy') || iconStr.includes('snow')) {
    emoji = '❄️';
  } else if (iconStr.includes('rainy') || iconStr.includes('rain')) {
    emoji = '🌧️';
  } else if (iconStr.includes('cloudy') || iconStr.includes('cloud')) {
    emoji = '☁️';
  } else if (iconStr.includes('sunny') || iconStr.includes('sun')) {
    emoji = '☀️';
  } else if (iconStr.includes('partly')) {
    emoji = '⛅';
  }

  return <span className="text-xl">{emoji}</span>;
}
