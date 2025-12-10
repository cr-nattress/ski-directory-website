'use client';

/**
 * @module MapSection
 * @purpose Standalone map section for the landing page when mapFirstLayout is enabled
 * @context Used in app/page.tsx when feature flag mapFirstLayout is true
 *
 * @pattern Client component with shared Zustand state
 *
 * @exports
 * - MapSection: Standalone map section component
 *
 * @decision
 * This component is separate from IntelligentResortSection to allow
 * flexible positioning via feature flags. When mapFirstLayout is enabled,
 * this section appears directly below the Hero.
 */

import { ResortMapViewWrapper } from './ResortMapViewWrapper';
import { useMapPins } from '@shared/api';
import { cn } from '@/lib/utils';

/**
 * Standalone Map Section
 *
 * Displays the interactive resort map as a prominent section
 * directly below the hero when mapFirstLayout flag is enabled.
 */
export function MapSection() {
  const { pins, isLoading } = useMapPins();

  return (
    <section id="map-section" className="py-8 bg-bg-light">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
            Explore the Map
          </h2>
          <p className={cn(
            'text-gray-600 mt-2 transition-opacity duration-300',
            isLoading && 'opacity-0'
          )}>
            {pins.length} resort{pins.length !== 1 ? 's' : ''} across North America
          </p>
        </div>

        {/* Map */}
        <ResortMapViewWrapper />
      </div>
    </section>
  );
}
