'use client';

import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { TrailMapCard } from './TrailMapCard';
import { FeatureFlag } from '@/components/FeatureFlag';
import { SkiShopsAccordionContent, useSkiShopsExist } from './SkiShopsAccordion';
import { DiningVenuesAccordionContent, useDiningVenuesExist } from './DiningVenuesAccordion';
import { LocationMapCardWrapper } from './LocationMapCardWrapper';
import { NearbyServicesCard } from './NearbyServicesCard';
import type { Resort } from '@/lib/types';

interface MobileResortSectionsProps {
  resort: Resort;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-semibold text-gray-900 text-sm">{value}</div>
    </div>
  );
}

export function MobileResortSections({ resort }: MobileResortSectionsProps) {
  const hasSkiShops = useSkiShopsExist(resort);
  const hasDiningVenues = useDiningVenuesExist(resort);

  return (
    <div className="lg:hidden mt-8">
      <Accordion>
        {/* Overview - Open by default */}
        <AccordionItem title="Overview" defaultOpen id="overview">
          <p className="text-gray-700 leading-relaxed">
            {resort.description}
          </p>
        </AccordionItem>

        {/* Mountain Stats */}
        <AccordionItem title="Mountain Stats" id="stats">
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              label="Vertical"
              value={`${resort.stats.verticalDrop.toLocaleString()}'`}
            />
            <StatCard
              label="Summit"
              value={`${resort.stats.summitElevation.toLocaleString()}'`}
            />
            <StatCard
              label="Base"
              value={`${resort.stats.baseElevation.toLocaleString()}'`}
            />
            <StatCard
              label="Acres"
              value={resort.stats.skiableAcres.toLocaleString()}
            />
            <StatCard
              label="Snowfall"
              value={`${resort.stats.avgAnnualSnowfall}"/yr`}
            />
            <StatCard
              label="Runs"
              value={resort.stats.runsCount.toString()}
            />
            {!(resort.isLost && resort.stats.liftsCount === 0) && (
              <StatCard
                label="Total Lifts"
                value={resort.stats.liftsCount.toString()}
              />
            )}
            {resort.highSpeedLifts?.count != null && resort.highSpeedLifts.count > 0 && (
              <StatCard
                label="High-Speed"
                value={resort.highSpeedLifts.count.toString()}
              />
            )}
            {resort.baseAreas?.count != null && resort.baseAreas.count > 0 && (
              <StatCard
                label="Base Areas"
                value={resort.baseAreas.count.toString()}
              />
            )}
          </div>
        </AccordionItem>

        {/* Terrain & Conditions - Only for active resorts */}
        {!resort.isLost && (
          <AccordionItem title="Terrain & Conditions" id="terrain">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Terrain Breakdown</p>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <div className="text-green-600 font-semibold">{resort.terrain.beginner}%</div>
                    <div className="text-xs text-gray-500">Beginner</div>
                  </div>
                  <div>
                    <div className="text-blue-600 font-semibold">{resort.terrain.intermediate}%</div>
                    <div className="text-xs text-gray-500">Intermediate</div>
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">{resort.terrain.advanced}%</div>
                    <div className="text-xs text-gray-500">Advanced</div>
                  </div>
                  <div>
                    <div className="text-gray-900 font-semibold">{resort.terrain.expert}%</div>
                    <div className="text-xs text-gray-500">Expert</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">New Snow (24h)</span>
                  <span className="font-semibold">{resort.conditions.snowfall24h}&quot;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Base Depth</span>
                  <span className="font-semibold">{resort.conditions.baseDepth}&quot;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Terrain Open</span>
                  <span className="font-semibold">{resort.conditions.terrainOpen}%</span>
                </div>
              </div>
            </div>
          </AccordionItem>
        )}

        {/* Ski Shops - Only show if data exists */}
        {hasSkiShops && (
          <FeatureFlag name="skiShopsCard">
            <AccordionItem title="Ski Shops" id="ski-shops">
              <SkiShopsAccordionContent resort={resort} />
            </AccordionItem>
          </FeatureFlag>
        )}

        {/* Dining Venues - Only show if data exists */}
        {hasDiningVenues && (
          <FeatureFlag name="diningVenuesCard">
            <AccordionItem title="Dining" id="dining">
              <DiningVenuesAccordionContent resort={resort} />
            </AccordionItem>
          </FeatureFlag>
        )}

        {/* Trail Map */}
        <FeatureFlag name="trailMapCard">
          <AccordionItem title="Trail Map" id="trail-map">
            <TrailMapCard resort={resort} />
          </AccordionItem>
        </FeatureFlag>

        {/* Features & Amenities */}
        {(resort.nearby?.restaurants?.count || resort.nearby?.bars?.count || resort.nearby?.hotels?.count) && (
          <AccordionItem title="Nearby Amenities" id="amenities">
            <div className="grid grid-cols-3 gap-2">
              {resort.nearby?.restaurants?.count != null && resort.nearby.restaurants.count > 0 && (
                <StatCard
                  label="Restaurants"
                  value={resort.nearby.restaurants.count.toString()}
                />
              )}
              {resort.nearby?.bars?.count != null && resort.nearby.bars.count > 0 && (
                <StatCard
                  label="Bars"
                  value={resort.nearby.bars.count.toString()}
                />
              )}
              {resort.nearby?.hotels?.count != null && resort.nearby.hotels.count > 0 && (
                <StatCard
                  label="Hotels"
                  value={resort.nearby.hotels.count.toString()}
                />
              )}
            </div>
          </AccordionItem>
        )}
      </Accordion>

      {/* Location Map - Mobile */}
      <FeatureFlag name="locationMapCard">
        <div className="mt-6">
          <LocationMapCardWrapper resort={resort} />
        </div>
      </FeatureFlag>

      {/* Nearby Services (Shops & Dining) - Mobile */}
      <FeatureFlag name="nearbyServicesCard">
        <div className="mt-6">
          <NearbyServicesCard resort={resort} />
        </div>
      </FeatureFlag>
    </div>
  );
}
