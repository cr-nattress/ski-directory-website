import type { Resort } from '@/lib/types';
import { PageWrapper } from '@/components/PageWrapper';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from './Breadcrumb';
import { ResortHero } from './ResortHero';
import { ResortStructuredData } from './ResortStructuredData';
import { SocialMediaCard } from './SocialMediaCard';
import { LocationMapCardWrapper } from './LocationMapCardWrapper';
import { TrailMapCard } from './TrailMapCard';
import { WeatherForecastCard } from './WeatherForecastCard';
import { BreadcrumbJsonLd } from '@/components/schema';
import { getStateName, getCountryName } from '@/lib/data/geo-mappings';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://skicolorado.com';

interface ResortDetailProps {
  resort: Resort;
}

export function ResortDetail({ resort }: ResortDetailProps) {
  // Get proper display names for state and country
  const stateName = resort.stateCode ? getStateName(resort.stateCode) : 'Colorado';
  const countryName = resort.countryCode ? getCountryName(resort.countryCode) : 'United States';

  // Breadcrumb data for JSON-LD structured data
  // These URLs point to the filtered directory pages
  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: countryName, url: `${BASE_URL}/directory?country=${resort.countryCode}` },
    { name: stateName, url: `${BASE_URL}/directory?state=${resort.stateCode}` },
    { name: resort.name, url: `${BASE_URL}/${resort.countryCode}/${resort.stateCode}/${resort.slug}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <ResortStructuredData resort={resort} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <PageWrapper headerVariant="solid" resortSlug={resort.slug} />

      <Breadcrumb
        items={[
          { label: countryName, href: `/directory?country=${resort.countryCode}` },
          { label: stateName, href: `/directory?state=${resort.stateCode}` },
          { label: resort.name, href: `/${resort.countryCode}/${resort.stateCode}/${resort.slug}` },
        ]}
      />

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <ResortHero resort={resort} />

            {/* Placeholder for future sections */}
            <div className="space-y-8">
              {/* Overview + Map Split */}
              <section className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">
                  {resort.description}
                </p>
              </section>

              {/* Mountain Stats */}
              <section className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-semibold mb-4">Mountain Stats</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
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
                  {/* Hide lifts count for lost ski areas with 0 lifts */}
                  {!(resort.isLost && resort.stats.liftsCount === 0) && (
                    <StatCard
                      label="Total Lifts"
                      value={resort.stats.liftsCount.toString()}
                    />
                  )}
                  {/* Only show optional stats if they have values */}
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
              </section>

              {/* Trail Map */}
              <section className="border-t border-gray-200 pt-8">
                <TrailMapCard resort={resort} />
              </section>
            </div>
          </div>

          {/* Right Column - Action Rail (Sticky) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-4 space-y-6">
              {/* Action Card - hidden for lost ski areas */}
              {!resort.isLost && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Plan Your Visit</h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Current Conditions</p>
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

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Distance from {resort.majorCityName}</p>
                      <p className="font-semibold">{resort.distanceFromMajorCity} mi • {resort.driveTimeToMajorCity} min drive</p>
                    </div>
                  </div>

                  <button className="w-full bg-ski-blue text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Save Resort
                  </button>

                  <div className="mt-4 flex gap-2">
                    {resort.passAffiliations.map((pass) => (
                      <span
                        key={pass}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pass === 'epic'
                            ? 'bg-epic-red text-white'
                            : pass === 'ikon'
                            ? 'bg-ikon-orange text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {pass.charAt(0).toUpperCase() + pass.slice(1)} Pass
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Weather Forecast Card - hidden for lost ski areas */}
              {!resort.isLost && <WeatherForecastCard resort={resort} />}

              {/* Location Map Card */}
              <LocationMapCardWrapper resort={resort} />

              {/* Social Media Card */}
              <SocialMediaCard resort={resort} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Helper Components
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-semibold text-gray-900 text-sm">{value}</div>
    </div>
  );
}

