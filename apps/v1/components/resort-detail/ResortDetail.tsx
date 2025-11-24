import { Resort } from '@/lib/mock-data';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from './Breadcrumb';
import { ResortHero } from './ResortHero';
import { ResortStructuredData } from './ResortStructuredData';
import { SocialMediaCard } from './SocialMediaCard';
import { LocationMapCardWrapper } from './LocationMapCardWrapper';
import { TrailMapCard } from './TrailMapCard';
import { WeatherForecastCard } from './WeatherForecastCard';

interface ResortDetailProps {
  resort: Resort;
}

export function ResortDetail({ resort }: ResortDetailProps) {
  return (
    <div className="min-h-screen bg-white">
      <ResortStructuredData resort={resort} />

      <Header variant="solid" />

      <Breadcrumb
        items={[
          { label: 'Colorado', href: '/' },
          { label: resort.name, href: `/colorado/${resort.slug}` },
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
                <h2 className="text-2xl font-semibold mb-6">Mountain Stats</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard
                    icon="📏"
                    label="Vertical Drop"
                    value={`${resort.stats.verticalDrop.toLocaleString()} ft`}
                  />
                  <StatCard
                    icon="⛰️"
                    label="Summit Elevation"
                    value={`${resort.stats.summitElevation.toLocaleString()} ft`}
                  />
                  <StatCard
                    icon="🏔️"
                    label="Skiable Acres"
                    value={resort.stats.skiableAcres.toLocaleString()}
                  />
                  <StatCard
                    icon="❄️"
                    label="Avg Annual Snowfall"
                    value={`${resort.stats.avgAnnualSnowfall}"`}
                  />
                  <StatCard
                    icon="🎿"
                    label="Runs"
                    value={resort.stats.runsCount.toString()}
                  />
                  <StatCard
                    icon="🚡"
                    label="Lifts"
                    value={resort.stats.liftsCount.toString()}
                  />
                  <StatCard
                    icon="🏃"
                    label="Base Elevation"
                    value={`${resort.stats.baseElevation.toLocaleString()} ft`}
                  />
                  <StatCard
                    icon="🌨️"
                    label="24h Snowfall"
                    value={`${resort.conditions.snowfall24h}"`}
                  />
                </div>
              </section>

              {/* Terrain Breakdown */}
              <section className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-semibold mb-6">Terrain Breakdown</h2>
                <div className="space-y-3">
                  <TerrainBar
                    label="Beginner"
                    percentage={resort.terrain.beginner}
                    color="bg-green-500"
                  />
                  <TerrainBar
                    label="Intermediate"
                    percentage={resort.terrain.intermediate}
                    color="bg-blue-500"
                  />
                  <TerrainBar
                    label="Advanced"
                    percentage={resort.terrain.advanced}
                    color="bg-orange-500"
                  />
                  <TerrainBar
                    label="Expert"
                    percentage={resort.terrain.expert}
                    color="bg-red-600"
                  />
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
              {/* Action Card */}
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
                    <p className="text-sm text-gray-600 mb-2">Distance from Denver</p>
                    <p className="font-semibold">{resort.distanceFromDenver} mi • {resort.driveTimeFromDenver} min drive</p>
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

              {/* Weather Forecast Card */}
              <WeatherForecastCard resort={resort} />

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
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function TerrainBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
