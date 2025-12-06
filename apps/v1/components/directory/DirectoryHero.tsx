import { Mountain } from 'lucide-react';

interface DirectoryHeroProps {
  resortCount: number;
  totalResorts?: number;
  stateName?: string | null;
  countryName?: string | null;
}

export function DirectoryHero({
  resortCount,
  totalResorts,
  stateName,
  countryName,
}: DirectoryHeroProps) {
  // Determine the title and description based on filters
  const isFiltered = stateName || countryName;

  const title = stateName
    ? `${stateName} Ski Resorts`
    : countryName
    ? `${countryName} Ski Resorts`
    : 'Resorts';

  const description = stateName
    ? `Explore all ${resortCount} ski resorts in ${stateName}. Sort by snow conditions, terrain, size, or distance to find your perfect mountain.`
    : countryName
    ? `Explore all ${resortCount} ski resorts in ${countryName}. Sort by snow conditions, terrain, size, or distance to find your perfect mountain.`
    : `Compare all ${resortCount} ski resorts at a glance. Sort by snow conditions, terrain, size, or distance to find your perfect mountain.`;

  return (
    <div className="bg-gradient-to-b from-ski-blue/5 to-white border-b border-gray-100">
      <div className="container-custom py-4 md:py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-ski-blue/10 rounded-lg">
            <Mountain className="w-6 h-6 text-ski-blue" />
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {title}
        </h1>
        <p className="hidden md:block text-gray-600 text-lg max-w-2xl mb-4">{description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">{resortCount}</span> resorts
          </span>
          {isFiltered && totalResorts && totalResorts !== resortCount && (
            <>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5">
                of <span className="font-semibold text-gray-900">{totalResorts}</span> total
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
